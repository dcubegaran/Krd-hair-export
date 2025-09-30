// Sample data seeding script
// Run this in browser console on localhost:3000/krd_panel after logging in as admin

const sampleProducts = [
  {
    name: "Brazilian Straight Hair",
    sku: "BS-001",
    description: "Premium quality Brazilian straight hair bundles. 100% virgin human hair with natural shine and softness.",
    category: "straight",
    subcategory: "bundles",
    origin: "Brazil",
    hairType: "virgin",
    texture: "straight",
    lengths: [12, 14, 16, 18, 20, 22, 24, 26, 28, 30],
    colors: ["Natural Black", "Dark Brown", "Medium Brown"],
    pricePerBundle: 85,
    bulkPricing: [
      { minQuantity: 5, pricePerUnit: 80 },
      { minQuantity: 10, pricePerUnit: 75 }
    ],
    stockQuantity: 100,
    minOrderQuantity: 1,
    images: ["https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500"],
    isActive: true,
    isFeatured: true
  },
  {
    name: "Peruvian Body Wave",
    sku: "PBW-002",
    description: "Luxurious Peruvian body wave hair with natural bounce and volume. Perfect for a glamorous look.",
    category: "wavy",
    subcategory: "bundles",
    origin: "Peru",
    hairType: "virgin",
    texture: "body wave",
    lengths: [14, 16, 18, 20, 22, 24, 26, 28],
    colors: ["Natural Black", "Dark Brown"],
    pricePerBundle: 95,
    bulkPricing: [
      { minQuantity: 3, pricePerUnit: 90 },
      { minQuantity: 6, pricePerUnit: 85 }
    ],
    stockQuantity: 75,
    minOrderQuantity: 1,
    images: ["https://images.unsplash.com/photo-1560869713-7d0b29837c56?w=500"],
    isActive: true,
    isFeatured: true
  },
  {
    name: "Indian Deep Curly",
    sku: "IDC-003",
    description: "Beautiful Indian deep curly hair with defined curls and natural texture. Adds volume and style.",
    category: "curly",
    subcategory: "bundles",
    origin: "India",
    hairType: "virgin",
    texture: "deep curly",
    lengths: [12, 14, 16, 18, 20, 22, 24],
    colors: ["Natural Black", "Dark Brown", "Medium Brown"],
    pricePerBundle: 75,
    bulkPricing: [
      { minQuantity: 4, pricePerUnit: 70 },
      { minQuantity: 8, pricePerUnit: 65 }
    ],
    stockQuantity: 60,
    minOrderQuantity: 1,
    images: ["https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=500"],
    isActive: true,
    isFeatured: true
  }
];

// Function to add sample products (run in browser console)
async function addSampleProducts() {
  console.log('Adding sample products...');
  
  for (const product of sampleProducts) {
    try {
      // This assumes ProductService is available globally
      // You might need to import it or access it through window
      const result = await ProductService.createProduct(product);
      console.log(`Added product: ${product.name}`, result);
    } catch (error) {
      console.error(`Error adding ${product.name}:`, error);
    }
  }
  
  console.log('Sample products added!');
}

// Uncomment the line below to run automatically
// addSampleProducts();

console.log('Sample data script loaded. Run addSampleProducts() to add sample products.');