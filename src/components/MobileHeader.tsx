import React from 'react';
import { Menu, Plus, Settings } from 'lucide-react';
import { AIModeId, SystemHealth } from '../types';
import { PWAInstallButton } from './PWAInstallButton';

interface MobileHeaderProps {
  onOpenMobileMenu: () => void;
  onNewChat: () => void;
  onOpenSettings: () => void;
  activeView: AIModeId;
  systemHealth?: SystemHealth;
}

const DEFAULT_HEALTH: SystemHealth = {
  status: 'ready',
  geminiConfigured: false,
  provider: 'Gemini',
  model: 'gemini-3.8-flash',
};

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  onOpenMobileMenu,
  onNewChat,
  onOpenSettings,
  systemHealth = DEFAULT_HEALTH,
}) => {
  const isConfigured = Boolean(systemHealth?.geminiConfigured);

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-slate-800/80 bg-[#090d16]/90 px-3 backdrop-blur-md">
      {/* Left: Hamburger & Brand */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenMobileMenu}
          aria-label="মেনু খুলুন"
          className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-300 hover:bg-slate-800 transition active:scale-95 md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2">
          <img src="/icon.svg" alt="সর্বকাজ AI বন্ধু" className="h-7 w-7 rounded-lg shadow-sm" />
          <div className="flex flex-col">
            <h1 className="text-sm font-bold text-white tracking-tight leading-tight">
              সর্বকাজ AI বন্ধু
            </h1>
            <div className="flex items-center gap-1.5 text-[10px]">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  isConfigured ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
              />
              <span className={isConfigured ? 'text-emerald-400' : 'text-amber-400'}>
                {isConfigured ? 'প্রস্তুত' : 'API কী প্রয়োজন'}
              </span>
            </div>
          </div>
        </div>
      </div>


      {/* Right: Quick actions */}
      <div className="flex items-center gap-1.5">
        <PWAInstallButton compact />

        <button
          onClick={onNewChat}
          aria-label="নতুন চ্যাট"
          title="নতুন চ্যাট শুরু করুন"
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition active:scale-95"
        >
          <Plus className="h-4 w-4" />
        </button>

        <button
          onClick={onOpenSettings}
          aria-label="সেটিংস"
          title="সেটিংস"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition active:scale-95"
        >
          <Settings className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
};
