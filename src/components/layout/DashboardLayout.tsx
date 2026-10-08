'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import MessengerWidget from '@/components/chat/MessengerWidget';
import { AuthUser } from '@/types';

interface DashboardLayoutProps {
  user: AuthUser;
  children: React.ReactNode;
}

export default function DashboardLayout({ user, children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [clinicName, setClinicName] = useState<string>(
    user.clinicName || 'Clinique Médicale'
  );

  useEffect(() => {
    // Fetch live clinic name from settings
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data?.clinic?.name) {
          setClinicName(data.clinic.name);
        }
      })
      .catch(() => {});

    // Listen to real-time update event
    const handleClinicUpdate = (e: any) => {
      if (e.detail?.name) {
        setClinicName(e.detail.name);
      }
    };

    window.addEventListener('clinic-updated', handleClinicUpdate);
    return () => window.removeEventListener('clinic-updated', handleClinicUpdate);
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F8FC]">
      {/* Sidebar */}
      <Sidebar
        user={user}
        clinicName={clinicName}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onCloseMobile={() => setSidebarOpen(false)}
      />

      {/* Main Wrapper */}
      <div className="lg:pl-64 flex flex-col min-h-screen transition-all duration-300">
        <Topbar
          user={user}
          clinicName={clinicName}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full">
          {children}
        </main>
      </div>

      {/* Messenger Chat Bubble & Docked Box */}
      <MessengerWidget currentUser={user} />
    </div>
  );
}
