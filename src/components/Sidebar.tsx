import React from 'react';
import {
  Home,
  MessageSquare,
  LayoutGrid,
  Code2,
  Globe,
  Terminal,
  Bug,
  Boxes,
  LineChart,
  Palette,
  GraduationCap,
  PenTool,
  BookOpen,
  CalendarCheck,
  Languages,
  History,
  Settings,
  X,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { AIModeId } from '../types';
import { AI_MODES } from '../data/modes';
import { PWAInstallButton } from './PWAInstallButton';

interface SidebarProps {
  activeView: AIModeId;
  onSelectView: (view: AIModeId) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  isCollapsedDesktop: boolean;
  onToggleCollapseDesktop: () => void;
}

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Home,
  MessageSquare,
  LayoutGrid,
  Code2,
  Globe,
  Terminal,
  Bug,
  Boxes,
  LineChart,
  Palette,
  GraduationCap,
  PenTool,
  BookOpen,
  CalendarCheck,
  Languages,
  History,
  Settings,
};

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onSelectView,
  isOpenMobile,
  onCloseMobile,
  isCollapsedDesktop,
  onToggleCollapseDesktop,
}) => {
  const renderItem = (mode: (typeof AI_MODES)[0]) => {
    const IconComponent = ICON_MAP[mode.iconName] || Sparkles;
    const isActive = activeView === mode.id;

    return (
      <button
        key={mode.id}
        id={`nav-item-${mode.id}`}
        onClick={() => {
          onSelectView(mode.id);
          onCloseMobile();
        }}
        aria-label={mode.banglaName}
        title={`${mode.banglaName} (${mode.name})`}
        className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-medium transition-all active:scale-[0.98] ${
          isActive
            ? 'bg-emerald-500/15 text-emerald-300 font-semibold border border-emerald-500/30 shadow-sm'
            : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
        } ${isCollapsedDesktop ? 'justify-center px-2' : ''}`}
      >
        <IconComponent
          className={`h-4 w-4 shrink-0 transition-colors ${
            isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-200'
          }`}
        />

        {!isCollapsedDesktop && (
          <div className="flex flex-1 items-center justify-between truncate">
            <span className="truncate">{mode.banglaName}</span>
            {mode.badge && (
              <span className="ml-1 rounded bg-emerald-500/20 px-1.5 py-0.5 text-[9.5px] font-semibold text-emerald-300">
                {mode.badge}
              </span>
            )}
          </div>
        )}

        {isCollapsedDesktop && isActive && (
          <span className="absolute right-1 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-emerald-400" />
        )}
      </button>
    );
  };

  const navContent = (
    <div className="flex h-full flex-col justify-between overflow-y-auto p-3">
      <div className="space-y-4">
        {/* Brand logo & title */}
        <div className="flex items-center justify-between px-2 pt-1 pb-2 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <img src="/icon.svg" alt="Logo" className="h-7 w-7 shrink-0 rounded-lg shadow" />
            {!isCollapsedDesktop && (
              <div className="truncate">
                <div className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                  সর্বকাজ AI বন্ধু
                </div>
                <div className="text-[10px] text-slate-400">AI Bondhu Workspace</div>
              </div>
            )}
          </div>

          {/* Desktop collapse toggle */}
          <button
            onClick={onToggleCollapseDesktop}
            className="hidden md:flex h-6 w-6 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white"
            aria-label={isCollapsedDesktop ? 'প্রসারিত করুন' : 'সংকুচিত করুন'}
          >
            {isCollapsedDesktop ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>

          {/* Mobile close button */}
          <button
            onClick={onCloseMobile}
            className="flex md:hidden h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white"
            aria-label="বন্ধ করুন"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Section: Core */}
        <div className="space-y-1">
          {!isCollapsedDesktop && (
            <div className="px-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              মূল ওয়ার্কস্পেস
            </div>
          )}
          {AI_MODES.slice(0, 3).map(renderItem)}
        </div>

        {/* Section: Coding & Web */}
        <div className="space-y-1">
          {!isCollapsedDesktop && (
            <div className="px-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              কোডিং ও ওয়েব
            </div>
          )}
          {AI_MODES.slice(3, 8).map(renderItem)}
        </div>

        {/* Section: Creation & Analysis */}
        <div className="space-y-1">
          {!isCollapsedDesktop && (
            <div className="px-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              ডিজাইন ও ডেটা
            </div>
          )}
          {AI_MODES.slice(8, 10).map(renderItem)}
        </div>

        {/* Section: Learning & Productivity */}
        <div className="space-y-1">
          {!isCollapsedDesktop && (
            <div className="px-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              শিক্ষা, লেখা ও প্ল্যানিং
            </div>
          )}
          {AI_MODES.slice(10, 15).map(renderItem)}
        </div>

        {/* Section: Manage */}
        <div className="space-y-1 pt-2 border-t border-slate-800/80">
          {!isCollapsedDesktop && (
            <div className="px-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              ব্যবস্থাপনা
            </div>
          )}
          {AI_MODES.slice(15).map(renderItem)}
        </div>
      </div>

      {/* Footer / PWA Install */}
      <div className="pt-3 border-t border-slate-800/80">
        {!isCollapsedDesktop ? (
          <div className="space-y-2">
            <PWAInstallButton compact />
            <div className="text-[10px] text-slate-500 text-center px-1">
              v1.0.0 • নিরাপদ ও সর্বাঙ্গীন AI
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <PWAInstallButton compact />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Drawer (with backdrop) */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 w-72 max-w-[85vw] h-full bg-[#0d121f] border-r border-slate-800 shadow-2xl flex flex-col">
            {navContent}
          </div>
        </div>
      )}

      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden md:flex shrink-0 flex-col bg-[#0b101b] border-r border-slate-800/90 transition-all duration-200 ${
          isCollapsedDesktop ? 'w-16' : 'w-64'
        }`}
      >
        {navContent}
      </aside>
    </>
  );
};
