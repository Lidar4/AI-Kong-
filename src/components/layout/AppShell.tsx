import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';
import { AIModeId, SystemHealth, Conversation } from '../../types';
import { Sidebar } from '../Sidebar';
import { MobileHeader } from '../MobileHeader';

interface AppShellProps {
  activeView: AIModeId;
  onSelectView: (view: AIModeId) => void;
  onNewChat: () => void;
  systemHealth?: SystemHealth;
  children: React.ReactNode;
}

const DEFAULT_HEALTH: SystemHealth = {
  status: 'ready',
  geminiConfigured: false,
  provider: 'Gemini',
  model: 'gemini-3.8-flash',
};

export const AppShell: React.FC<AppShellProps> = ({
  activeView,
  onSelectView,
  onNewChat,
  systemHealth = DEFAULT_HEALTH,
  children,
}) => {

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#090d16] text-slate-100 antialiased font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        activeView={activeView}
        onSelectView={onSelectView}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        isCollapsedDesktop={isDesktopCollapsed}
        onToggleCollapseDesktop={() => setIsDesktopCollapsed(!isDesktopCollapsed)}
      />

      {/* Main Workspace Layout */}
      <div className="flex flex-1 flex-col h-full overflow-hidden">
        {/* Offline Banner if disconnected */}
        {!isOnline && (
          <div className="flex items-center justify-center gap-2 bg-amber-500/20 border-b border-amber-500/40 px-3 py-1.5 text-xs font-semibold text-amber-300">
            <WifiOff className="w-3.5 h-3.5" />
            <span>ইন্টারনেট সংযোগ বিচ্ছিন্ন। অফলাইন মোডে সংরক্ষিত ডেটা দেখা যাবে।</span>
          </div>
        )}

        {/* Mobile-first Header */}
        <MobileHeader
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onNewChat={onNewChat}
          onOpenSettings={() => onSelectView('settings')}
          activeView={activeView}
          systemHealth={systemHealth}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-b from-[#090d16] to-[#0c111e] flex flex-col">
          {children}
        </main>
      </div>
    </div>
  );
};
