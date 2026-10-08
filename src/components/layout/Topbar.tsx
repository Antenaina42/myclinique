'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, Search, Moon, Sun, User, Settings, LogOut, ChevronDown, Shield, Bell } from 'lucide-react';
import { AuthUser } from '@/types';
import NotificationDropdown from './NotificationDropdown';
import GlobalSearchModal from './GlobalSearchModal';

interface TopbarProps {
  user: AuthUser;
  clinicName?: string;
  onToggleSidebar: () => void;
}

export default function Topbar({ user, clinicName, onToggleSidebar }: TopbarProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 bg-white border-b border-slate-200">
        {/* Left: Sidebar Toggle & Search Bar Trigger */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title="Menu de navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search Trigger Button */}
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2.5 px-3 py-1.5 text-xs text-slate-400 bg-slate-100/80 hover:bg-slate-200/80 rounded-lg border border-slate-200/70 transition-all w-48 sm:w-72 justify-between"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span className="truncate">Rechercher...</span>
            </div>
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-white rounded border border-slate-200 shadow-2xs">
              Ctrl K
            </kbd>
          </button>
        </div>

        {/* Center: Clinic Branch Badge */}
        <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 font-medium">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-bold text-slate-700">{clinicName || user.clinicName || 'Clinique Médicale'}</span>
          <span className="text-slate-300">•</span>
          <span className="text-blue-600 font-semibold">Portail Médical Connecté</span>
        </div>

        {/* Right: Actions, Notifications & Profile Dropdown */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Dark / Light Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title={darkMode ? 'Passer en mode clair' : 'Passer en mode sombre'}
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* Notifications Dropdown */}
          <NotificationDropdown />

          <div className="h-6 w-px bg-slate-200 mx-1" />

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-100 transition-colors group"
            >
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                {user.firstName[0]}{user.lastName[0]}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-slate-800 leading-tight">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-[10px] text-blue-600 font-medium leading-none mt-0.5">
                  {user.role}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />
            </button>

            {userMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setUserMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-800">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                    <div className="mt-1.5">
                      <span className="inline-block px-2 py-0.5 rounded text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                        {user.role}
                      </span>
                    </div>
                  </div>

                  <div className="py-1">
                    <Link
                      href="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      <span>Mon Profil</span>
                    </Link>

                    <Link
                      href="/settings/clinic"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                    >
                      <Settings className="w-4 h-4 text-slate-400" />
                      <span>Paramètres Clinique</span>
                    </Link>

                    <Link
                      href="/reports"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                    >
                      <Shield className="w-4 h-4 text-slate-400" />
                      <span>Rapports & Audit</span>
                    </Link>
                  </div>

                  <div className="border-t border-slate-100 pt-1">
                    <form action="/api/auth/logout" method="POST">
                      <button
                        type="submit"
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Se déconnecter</span>
                      </button>
                    </form>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Global Search Modal */}
      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
