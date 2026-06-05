import React, { useState, useEffect, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Utensils, Sparkles, Globe, ChevronDown, LogOut } from 'lucide-react';
import { apiRequest } from './utils/api';

import Login from './pages/Auth/Login';
import SuperAdminPanel from './pages/SuperAdmin/SuperAdminPanel';

export default function App() {
  const [restaurants, setRestaurants] = useState([]);
  const [categories, setCategories] = useState([]);
  const [menus, setMenus] = useState([]);
  const [orders, setOrders] = useState([]);
  const [coupons, setCoupons] = useState([]);

  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('Orderin_super_users');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('Orderin_current_user_super');
    return saved ? JSON.parse(saved) : null;
  });

  const [currentView, setCurrentView] = useState(() => {
    return currentUser ? 'super_admin' : 'login';
  });

  const [darkMode, setDarkMode] = useState(false);

  // Sync state with localstorage
  useEffect(() => {
    localStorage.setItem('Orderin_super_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('Orderin_current_user_super', JSON.stringify(currentUser));
      setCurrentView('super_admin');
    } else {
      localStorage.removeItem('Orderin_current_user_super');
      setCurrentView('login');
    }
  }, [currentUser]);

  // Global auth session expiration and live database restaurants synchronization
  useEffect(() => {
    const handleAuthExpired = () => {
      console.warn("🔐 Session expired or invalid. Logging out...");
      handleLogout();
    };
    window.addEventListener('auth_session_expired', handleAuthExpired);

    if (currentUser) {
      const fetchLiveRestaurants = async () => {
        try {
          const res = await apiRequest('/super-admin/restaurants');
          if (res.success && Array.isArray(res.restaurants)) {
            const formatted = res.restaurants.map(dbRest => ({
              id: dbRest._id || dbRest.id,
              name: dbRest.name,
              slug: dbRest.slug,
              logo: dbRest.logo || 'https://img.icons8.com/fluency/196/hamburger.png',
              banner: dbRest.banner || 'https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=1200&auto=format&fit=crop',
              theme: dbRest.theme || { primaryColor: '#ff385c', secondaryColor: '#0f172a', textColor: '#ffffff', styleType: 'glassmorphism' },
              timings: dbRest.timings || { open: '09:00', close: '22:00' },
              contact: dbRest.contact || { phone: dbRest.phone || '', email: dbRest.email || '', address: dbRest.address || '', socialLinks: {} },
              settings: dbRest.settings || { gstPercentage: 5, deliveryCharge: 40, minimumOrderAmount: 150 },
              tables: dbRest.tables || [{ tableNo: 'T1', qrCodeUrl: '' }],
              isApproved: dbRest.isApproved,
              isActive: dbRest.isActive,
              rating: dbRest.rating || 5.0,
              featured: dbRest.featured || false,
              subscriptionPlan: dbRest.subscriptionPlan || 'free',
              subscriptionExpiry: dbRest.subscriptionExpiry,
              subscriptionActive: dbRest.subscriptionActive
            }));
            setRestaurants(formatted);
          }
        } catch (err) {
          console.warn("⚠️ Could not load live restaurants from MongoDB database:", err.message);
        }
      };
      fetchLiveRestaurants();
    }

    return () => {
      window.removeEventListener('auth_session_expired', handleAuthExpired);
    };
  }, [currentUser]);

  const handleLogout = () => {
    localStorage.removeItem('Orderin_super_token');
    setCurrentUser(null);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-[#08090c] text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-white/5 py-4 px-6 sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          
          <div className="flex items-center gap-2 cursor-pointer group">
            <div className="w-10 h-10 bg-gradient-to-tr from-red-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/20">
              <Utensils className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-white flex items-center gap-1.5 leading-none">
                Orderin SaaS Cockpit
                <Sparkles className="w-4 h-4 text-indigo-400 fill-indigo-400" />
              </span>
              <p className="text-[10px] text-slate-400 tracking-wider font-bold mt-0.5">PLATFORM COCKPIT</p>
            </div>
          </div>

          <div className="flex items-center gap-4">

            {currentUser && (
              <div className="flex items-center gap-3 pl-4 border-l border-white/5">
                <div className="text-right">
                  <span className="text-xs font-black text-white block">{currentUser.name}</span>
                  <span className="text-[9px] text-indigo-400 font-bold uppercase tracking-wider">👑 Master Super Admin</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-slate-300 p-2.5 rounded-xl border border-white/10 transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {currentView === 'login' ? (
            <Login
              setCurrentUser={setCurrentUser}
              setCurrentView={setCurrentView}
            />
          ) : (
            <SuperAdminPanel
              restaurants={restaurants}
              setRestaurants={setRestaurants}
              orders={orders}
              categories={categories}
              setCategories={setCategories}
              coupons={coupons}
              setCoupons={setCoupons}
              users={users}
              setUsers={setUsers}
            />
          )}
        </AnimatePresence>
      </main>

    </div>
  );
}
