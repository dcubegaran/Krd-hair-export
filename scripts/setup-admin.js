// Admin user setup script
// Run this in browser console after logging in with 2003devadharani@gmail.com

async function setupAdminUser() {
  try {
    console.log('Setting up admin user...');
    
    // Get current user
    const user = auth.currentUser;
    if (!user) {
      console.error('No user logged in. Please login first.');
      return;
    }
    
    console.log('Current user:', user.email);
    
    // Create admin user document in Firestore
    const adminUserData = {
      email: user.email,
      displayName: user.displayName || 'Admin User',
      role: 'admin',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      permissions: ['read', 'write', 'delete', 'admin'],
      phone: '',
      address: {
        street: '',
        city: '',
        state: '',
        country: '',
        zipCode: ''
      }
    };
    
    // Add to Firestore users collection
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, adminUserData);
    
    console.log('✅ Admin user created successfully!');
    console.log('User data:', adminUserData);
    
    // Verify the user was created
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      console.log('✅ Verification: User document exists in Firestore');
      console.log('User role:', userDoc.data().role);
    } else {
      console.error('❌ User document was not created');
    }
    
  } catch (error) {
    console.error('Error setting up admin user:', error);
  }
}

// Auto-run if Firebase is available
if (typeof db !== 'undefined' && typeof auth !== 'undefined') {
  console.log('Firebase detected. You can run setupAdminUser() to create admin user.');
} else {
  console.log('Firebase not detected. Make sure you are on the app page and logged in.');
}