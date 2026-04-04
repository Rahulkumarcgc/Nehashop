import { API_URL } from './config.js';
import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import { ProductProvider } from './context/ProductContext'
import Navbar from './components/common/Navbar'
import Footer from './components/common/Footer'
import CartDrawer from './components/common/CartDrawer'
import HomePage from './pages/Homepage'
import ProductDetailPage from './pages/ProductDetailPage'
import CheckoutPage from './pages/CheckoutPage'
import CartPage from './pages/CartPage'
import OrderPage from './pages/OrderPage'
import ProfilePage from './pages/ProfilePage'
import ShopPage from './pages/ShopPage'
import WishlistPage from './pages/WishlistPage'
import AnnouncementBar from './components/common/AnnouncementBar'
import FloatingButtons from './components/common/FloatingButtons'
import TopProgressBar from './components/common/TopProgressBar'
import SupportChat from './components/common/SupportChat'

function App() {
  const { user, isSignedIn } = useUser()
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false)

  // Drawer Handler
  useEffect(() => {
    const handler = () => setCartDrawerOpen(true)
    window.addEventListener('openCartDrawer', handler)
    return () => window.removeEventListener('openCartDrawer', handler)
  }, [])

  // 1. Fetch Cloud Cart & Sync User on Login
  useEffect(() => {
    if (isSignedIn && user?.id) {
      // Sync user profile to backend
      fetch(`${API_URL}/api/users/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clerkUserId: user.id,
          email: user.primaryEmailAddress?.emailAddress || '',
          firstName: user.firstName || '',
          lastName: user.lastName || ''
        })
      }).catch(e => console.error("User sync failed", e));

      const fetchCart = async () => {
        try {
          const res = await fetch(`${API_URL}/api/cart/${user.id}`);
          const dbCart = await res.json();
          if (Array.isArray(dbCart) && dbCart.length > 0) {
            const formatted = dbCart.map(c => ({
              ...c.product,
              id: c.product.numericId,
              dbId: c.product.id,
              qty: c.quantity
            }));
            const cartKey = `cart_${user.id}`;
            const local = JSON.parse(localStorage.getItem(cartKey) || '[]');
            
            // If local is empty but cloud has items, pull down cloud items
            if (local.length === 0) {
              localStorage.setItem(cartKey, JSON.stringify(formatted));
              window.dispatchEvent(new Event('cartUpdated'));
            }
          }
        } catch (e) {
          console.error("Cloud cart fetch failed", e);
        }
      };

      const fetchWishlist = async () => {
        try {
          const res = await fetch(`${API_URL}/api/wishlist/${user.id}`);
          const dbWishlist = await res.json();
          if (Array.isArray(dbWishlist) && dbWishlist.length > 0) {
            const formatted = dbWishlist.map(w => ({
              ...w.product,
              id: w.product.numericId,
              dbId: w.product.id
            }));
            const wishKey = `wishlist_${user.id}`;
            const local = JSON.parse(localStorage.getItem(wishKey) || '[]');
            
            // If local is empty but cloud has items, pull down cloud items
            if (local.length === 0) {
              localStorage.setItem(wishKey, JSON.stringify(formatted));
              window.dispatchEvent(new Event('wishlistUpdated'));
            }
          }
        } catch (e) {
          console.error("Cloud wishlist fetch failed", e);
        }
      };
      
      // Delay slightly to ensure standard initialization doesn't immediately overwrite
      setTimeout(() => {
        fetchCart();
        fetchWishlist();
      }, 500); 
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn, user?.id]);

  // 2. Sync Cart to Cloud whenever it gets updated
  useEffect(() => {
    const syncToCloud = () => {
      if (isSignedIn && user?.id) {
        const cartKey = `cart_${user.id}`;
        const local = JSON.parse(localStorage.getItem(cartKey) || '[]');
        fetch(`${API_URL}/api/cart/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clerkUserId: user.id, items: local })
        }).catch(e => console.error("Cloud Sync failed", e));
      }
    };
    
    window.addEventListener('cartUpdated', syncToCloud);
    return () => window.removeEventListener('cartUpdated', syncToCloud);
  }, [isSignedIn, user?.id]);

  // 3. Sync Wishlist to Cloud whenever it gets updated
  useEffect(() => {
    const syncWishToCloud = () => {
      if (isSignedIn && user?.id) {
        const wishKey = `wishlist_${user.id}`;
        const local = JSON.parse(localStorage.getItem(wishKey) || '[]');
        fetch(`${API_URL}/api/wishlist/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clerkUserId: user.id, items: local })
        }).catch(e => console.error("Cloud Wishlist Sync failed", e));
      }
    };
    
    window.addEventListener('wishlistUpdated', syncWishToCloud);
    return () => window.removeEventListener('wishlistUpdated', syncWishToCloud);
  }, [isSignedIn, user?.id]);

  return (
    <ProductProvider>
      <div>
        <TopProgressBar />
        <AnnouncementBar />
        <Navbar onCartClick={() => setCartDrawerOpen(true)} />
        <CartDrawer isOpen={cartDrawerOpen} onClose={() => setCartDrawerOpen(false)} />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders" element={<OrderPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
        </Routes>
        <Footer />
        <FloatingButtons />
        <SupportChat />
      </div>
    </ProductProvider>
  )
}

export default App