import React, { useState } from 'react';
import { X, Lock, Mail, ShieldAlert, KeyRound, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { api } from '../lib/api';
import { User } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [forgotPasswordNotice, setForgotPasswordNotice] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const res = await api.login(email.trim(), password);
      onLoginSuccess(res.user);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'লগইন ব্যর্থ হয়েছে। সঠিক ইমেইল ও পাসওয়ার্ড দিন।');
    } finally {
      setIsLoading(false);
    }
  };

  const fillQuickHelper = (userType: 'admin' | 'reporter') => {
    if (userType === 'admin') {
      setEmail('tarek987517@gmail.com');
      setPassword('HaorTv@Admin2026!');
    } else {
      setEmail('reporter@haortvhd.com');
      setPassword('HaorReporter#2026!');
    }
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="bg-gray-950 text-white p-5 flex items-center justify-between border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-700 flex items-center justify-center text-white font-bold shadow">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">হাওর টিভি HD কন্ট্রোল প্যানেল</h3>
              <p className="text-[11px] text-gray-400">নিরাপদ মাল্টি-অ্যাডমিন ও রিপোর্টার লগইন</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {forgotPasswordNotice && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
              পাসওয়ার্ড রিসেটের জন্য প্রধান সম্পাদক অথবা সার্ভার অ্যাডমিনের সাথে যোগাযোগ করুন (01624541284)।
            </div>
          )}

          {/* Email input */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              ইমেইল অ্যাড্রেস *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="login-email-field"
                type="email"
                required
                autoComplete="email"
                placeholder="name@haortvhd.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-red-600 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Password input - MUST BE type="password" */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-gray-700">
                গোপন পাসওয়ার্ড *
              </label>
              <button
                type="button"
                onClick={() => setForgotPasswordNotice(!forgotPasswordNotice)}
                className="text-[11px] text-red-700 hover:underline"
              >
                পাসওয়ার্ড ভুলে গেছেন?
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                id="login-password-field"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                placeholder="••••••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-9 pr-10 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-red-600 focus:bg-white transition font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember me */}
          <div className="flex items-center justify-between text-xs text-gray-600">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-red-700 rounded border-gray-300 focus:ring-red-600"
              />
              <span>আমাকে মনে রাখুন (Remember Me)</span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            id="login-submit-btn"
            type="submit"
            disabled={isLoading}
            className="w-full bg-red-700 hover:bg-red-800 text-white font-bold py-2.5 rounded-lg text-sm transition shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <span>লগইন করুন</span>
            )}
          </button>

          {/* Quick Demo Helper buttons for testing */}
          <div className="pt-3 border-t border-gray-100">
            <span className="text-[11px] font-semibold text-gray-400 block mb-2 text-center uppercase tracking-wider">
              টেস্টিং ক্রেডেনশিয়াল হেল্পার
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => fillQuickHelper('admin')}
                className="px-2 py-1.5 rounded bg-gray-100 hover:bg-red-50 text-gray-800 hover:text-red-700 border border-gray-200 transition text-[11px] text-left"
              >
                <span className="font-bold block">Super Admin</span>
                <span className="text-[10px] text-gray-500 truncate block">তারেক রহমান</span>
              </button>
              <button
                type="button"
                onClick={() => fillQuickHelper('reporter')}
                className="px-2 py-1.5 rounded bg-gray-100 hover:bg-red-50 text-gray-800 hover:text-red-700 border border-gray-200 transition text-[11px] text-left"
              >
                <span className="font-bold block">Reporter</span>
                <span className="text-[10px] text-gray-500 truncate block">মেরাজ বিন আসকর</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
