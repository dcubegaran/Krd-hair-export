import admin from 'firebase-admin'
import { getFirestore } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'
import { getStorage } from 'firebase-admin/storage'

// Initialize Firebase Admin SDK (only once)
let adminApp: admin.app.App | null = null

const getFirebaseAdmin = () => {
  if (adminApp) {
    return adminApp
  }

  // Check if we're on the server side
  if (typeof window === 'undefined') {
    try {
      // Try to get service account from environment variables
      const serviceAccount = {
        type: "service_account",
        project_id: process.env.FIREBASE_PROJECT_ID || "krd-hair-export",
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL || "firebase-adminsdk-fbsvc@krd-hair-export.iam.gserviceaccount.com",
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL
      }

      // Initialize with service account
      adminApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID || "krd-hair-export"
      }, 'admin')

      console.log('Firebase Admin SDK initialized successfully')
    } catch (error) {
      console.error('Failed to initialize Firebase Admin SDK:', error)

      // Fallback to default credentials (for development)
      try {
        adminApp = admin.initializeApp({
          projectId: process.env.FIREBASE_PROJECT_ID || "krd-hair-export"
        }, 'admin')
        console.log('Firebase Admin SDK initialized with default credentials')
      } catch (fallbackError) {
        console.error('Failed to initialize Firebase Admin SDK with fallback:', fallbackError)
      }
    }
  }

  return adminApp
}

// Export Firebase Admin instances
export const adminDb = () => {
  const app = getFirebaseAdmin()
  return app ? getFirestore(app) : null
}

export const adminAuth = () => {
  const app = getFirebaseAdmin()
  return app ? getAuth(app) : null
}

export const adminStorage = () => {
  const app = getFirebaseAdmin()
  return app ? getStorage(app) : null
}

export default admin