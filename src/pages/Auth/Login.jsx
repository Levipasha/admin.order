import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Mail } from 'lucide-react';
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

export default function Login({ setCurrentUser, setCurrentView }) {
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setSubmitting(true);

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput, password: passwordInput }),
      });
      const data = await response.json();

      if (!response.ok || !data.success || !data.token) {
        setAuthError(data.error || 'Login failed. Please check your credentials.');
        return;
      }

      if (data.user?.role !== 'super_admin') {
        setAuthError('Access denied. This panel is for platform super admins only.');
        return;
      }

      localStorage.setItem('Orderin_super_token', data.token);
      setCurrentUser({
        id: data.user.id,
        email: data.user.email,
        role: data.user.role,
        name: data.user.name,
        restaurantId: null,
      });
      setCurrentView('super_admin');
    } catch (err) {
      setAuthError(
        err.message?.includes('fetch')
          ? 'Could not reach the backend server. Make sure it is running on port 5000.'
          : err.message || 'Login failed. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-md mx-auto bg-slate-900 border border-white/5 rounded-3xl p-8 shadow-2xl space-y-6"
    >
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto shadow-md">
          <Lock className="w-5 h-5" />
        </div>
        <h2 className="text-2xl font-black text-white">Platform Super Admin</h2>
        <p className="text-xs text-slate-400">Log in to approve restaurants, adjust subscription plans, and view SaaS billing charts</p>
      </div>

      {authError && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-xl text-center font-bold">
          {authError}
        </div>
      )}

      <form onSubmit={handleLoginSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider flex items-center gap-1">
            <Mail className="w-3.5 h-3.5" />
            Super Admin Email
          </label>
          <input
            type="email"
            required
            placeholder="you@company.com"
            className="w-full bg-slate-800 border border-slate-700 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-white"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            disabled={submitting}
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider flex items-center gap-1">
            <Lock className="w-3.5 h-3.5" />
            Security Password
          </label>
          <input
            type="password"
            required
            placeholder="••••••••"
            className="w-full bg-slate-800 border border-slate-700 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-white"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            disabled={submitting}
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-indigo-600/20 transition hover:scale-102 disabled:opacity-60"
        >
          {submitting ? 'Signing in...' : 'Sign In to SaaS Cockpit'}
        </button>
      </form>

    </motion.div>
  );
}
