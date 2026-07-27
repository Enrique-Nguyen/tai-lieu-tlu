'use client';

import { useState, Suspense } from 'react';
import { Header } from '@/components/header';
import { Sidebar } from '@/components/sidebar';
import { Footer } from '@/components/footer';
import { NavigationProgress } from '@/components/navigation-progress';
import { UserProfile } from '@/lib/auth';
import { X } from 'lucide-react';

interface LayoutShellProps {
  profile: UserProfile | null;
  children: React.ReactNode;
}

export function LayoutShell({ profile, children }: LayoutShellProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-blue-500 selection:text-white">
      {/* Navigation Progress Bar */}
      <Suspense fallback={null}>
        <NavigationProgress />
      </Suspense>

      {/* Global Header */}
      <Suspense fallback={null}>
        <Header
          profile={profile}
          onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        />
      </Suspense>

      {/* Main Container with Sidebar + Content */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <Suspense fallback={null}>
            <Sidebar />
          </Suspense>
        </div>

        {/* Mobile Drawer Overlay */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
              onClick={() => setMobileSidebarOpen(false)}
            />

            {/* Sidebar Content */}
            <div className="relative w-72 max-w-[80vw] bg-white dark:bg-slate-900 h-full shadow-2xl z-10 flex flex-col animate-in slide-in-from-left duration-200">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  Menu Điều Huống
                </span>
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                <Suspense fallback={null}>
                  <Sidebar onCloseMobile={() => setMobileSidebarOpen(false)} />
                </Suspense>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Viewport */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
