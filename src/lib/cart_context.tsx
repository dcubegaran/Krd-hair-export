"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";
import { useAuth } from "./auth_context";

interface CartItem {
  id: string;
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  length: number;
  color: string;
  texture: string;
  origin: string;
}

interface WishlistItem {
  id: string;
  productId: string;
  name: string;
  image: string;
  price: number;
  length: number;
  color: string;
  texture: string;
  origin: string;
}

interface CartContextType {
  cart: CartItem[];
  wishlist: WishlistItem[];
  addToCart: (
    product: any,
    quantity?: number,
    length?: number,
    color?: string
  ) => void;
  removeFromCart: (itemId: string) => void;
  updateCartQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  addToWishlist: (product: any) => void;
  removeFromWishlist: (itemId: string) => void;
  clearWishlist: () => void;
  isInCart: (productId: string) => boolean;
  isInWishlist: (productId: string) => boolean;
  getCartTotal: () => number;
  getCartItemCount: () => number;
  getWishlistCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  const { user } = useAuth();

  // Load cart and wishlist from Firestore on mount and when user changes
  useEffect(() => {
    if (!db) {
      console.error("Firestore not initialized");
      setLoading(false);
      return;
    }

    // Prevent multiple loads for the same user
    if (dataLoaded && user) {
      return;
    }

    let cartUnsubscribe: (() => void) | null = null;
    let wishlistUnsubscribe: (() => void) | null = null;

    const loadUserData = async () => {
      if (user) {
        try {
          // Load user's cart (only once)
          const cartRef = doc(db, "carts", user.uid);
          const cartSnap = await getDoc(cartRef);

          if (cartSnap.exists()) {
            const cartData = cartSnap.data();
            setCart(cartData.items || []);
          } else {
            setCart([]);
          }

          // Load user's wishlist (only once)
          const wishlistRef = doc(db, "wishlists", user.uid);
          const wishlistSnap = await getDoc(wishlistRef);

          if (wishlistSnap.exists()) {
            const wishlistData = wishlistSnap.data();
            setWishlist(wishlistData.items || []);
          } else {
            setWishlist([]);
          }

          setDataLoaded(true);
        } catch (error) {
          console.error("Error loading user data from Firestore:", error);
          setCart([]);
          setWishlist([]);
        }
      } else {
        // For guest users, use localStorage as fallback
        const savedCart = localStorage.getItem("guest_cart");
        const savedWishlist = localStorage.getItem("guest_wishlist");

        if (savedCart) {
          try {
            setCart(JSON.parse(savedCart));
          } catch (error) {
            console.error("Error loading guest cart from localStorage:", error);
            setCart([]);
          }
        } else {
          setCart([]);
        }

        if (savedWishlist) {
          try {
            setWishlist(JSON.parse(savedWishlist));
          } catch (error) {
            console.error(
              "Error loading guest wishlist from localStorage:",
              error
            );
            setWishlist([]);
          }
        } else {
          setWishlist([]);
        }
        setDataLoaded(true);
      }

      setLoading(false);
    };

    loadUserData();

    return () => {
      if (cartUnsubscribe) cartUnsubscribe();
      if (wishlistUnsubscribe) wishlistUnsubscribe();
    };
  }, [user, dataLoaded]);

  // Save cart to Firestore or localStorage whenever it changes (debounced)
  useEffect(() => {
    if (loading || !dataLoaded) return;

    const timeoutId = setTimeout(async () => {
      if (user && db) {
        try {
          const cartRef = doc(db, "carts", user.uid);
          await setDoc(
            cartRef,
            {
              items: cart,
              updatedAt: new Date(),
            },
            { merge: true }
          );
        } catch (error) {
          console.error("Error saving cart to Firestore:", error);
        }
      } else {
        // Save to localStorage for guest users
        localStorage.setItem("guest_cart", JSON.stringify(cart));
      }
    }, 2000); // Increased debounce to 2 seconds to reduce Firestore calls

    return () => clearTimeout(timeoutId);
  }, [cart, user, loading, dataLoaded]);

  // Save wishlist to Firestore or localStorage whenever it changes (debounced)
  useEffect(() => {
    if (loading || !dataLoaded) return;

    const timeoutId = setTimeout(async () => {
      if (user && db) {
        try {
          const wishlistRef = doc(db, "wishlists", user.uid);
          await setDoc(
            wishlistRef,
            {
              items: wishlist,
              updatedAt: new Date(),
            },
            { merge: true }
          );
        } catch (error) {
          console.error("Error saving wishlist to Firestore:", error);
        }
      } else {
        // Save to localStorage for guest users
        localStorage.setItem("guest_wishlist", JSON.stringify(wishlist));
      }
    }, 2000); // Increased debounce to 2 seconds to reduce Firestore calls

    return () => clearTimeout(timeoutId);
  }, [wishlist, user, loading, dataLoaded]);

  const addToCart = async (
    product: any,
    quantity: number = 1,
    length?: number,
    color?: string
  ) => {
    const newItem: CartItem = {
      id: `${product.id}_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`,
      productId: product.id,
      name: product.name,
      image: product.images?.[0] || "/placeholder.svg",
      price: product.pricePerBundle,
      quantity: quantity,
      length: length || product.lengths?.[0] || 0,
      color: color || product.color || product.colors?.[0] || "Natural Black",
      texture: product.texture,
      origin: product.origin,
    };

    // Update local state (Firestore sync happens via useEffect)
    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (item) =>
          item.productId === product.id &&
          item.length === newItem.length &&
          item.color === newItem.color
      );

      if (existingItem) {
        return prevCart.map((item) =>
          item.id === existingItem.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prevCart, newItem];
      }
    });

    console.log(`✅ Added ${product.name} to cart!`);
  };

  const removeFromCart = async (itemId: string) => {
    // Update local state (Firestore sync happens via useEffect)
    setCart((prevCart) => prevCart.filter((item) => item.id !== itemId));
    console.log("🗑️ Removed item from cart");
  };

  const updateCartQuantity = async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(itemId);
      return;
    }

    // Update local state (Firestore sync happens via useEffect)
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = async () => {
    // Update local state (Firestore sync happens via useEffect)
    setCart([]);
    console.log("🧹 Cart cleared");
  };

  const addToWishlist = async (product: any) => {
    const newItem: WishlistItem = {
      id: `${product.id}_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`,
      productId: product.id,
      name: product.name,
      image: product.images?.[0] || "/placeholder.svg",
      price: product.pricePerBundle,
      length: product.lengths?.[0] || 0,
      color: product.color || product.colors?.[0] || "Natural Black",
      texture: product.texture,
      origin: product.origin,
    };

    // Update local state (Firestore sync happens via useEffect)
    setWishlist((prevWishlist) => {
      const existingItem = prevWishlist.find(
        (item) => item.productId === product.id
      );

      if (existingItem) {
        console.log("❤️ Item already in wishlist");
        return prevWishlist;
      }

      console.log(`❤️ Added ${product.name} to wishlist!`);
      return [...prevWishlist, newItem];
    });
  };

  const removeFromWishlist = async (itemId: string) => {
    // Update local state (Firestore sync happens via useEffect)
    setWishlist((prevWishlist) =>
      prevWishlist.filter((item) => item.id !== itemId)
    );
    console.log("💔 Removed item from wishlist");
  };

  const clearWishlist = async () => {
    // Update local state (Firestore sync happens via useEffect)
    setWishlist([]);
    console.log("🧹 Wishlist cleared");
  };

  const isInCart = (productId: string) => {
    return cart.some((item) => item.productId === productId);
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some((item) => item.productId === productId);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  const getWishlistCount = () => {
    return wishlist.length;
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        wishlist,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        addToWishlist,
        removeFromWishlist,
        clearWishlist,
        isInCart,
        isInWishlist,
        getCartTotal,
        getCartItemCount,
        getWishlistCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
