import React from 'react';
import { Sparkles, Image as ImageIcon, Layers, Zap, Info } from 'lucide-react';

interface HeaderProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  activeSidebarTab: 'chat' | 'library';
  setActiveSidebarTab: (tab: 'chat' | 'library') => void;
  libraryCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  isSidebarOpen,
  setIsSidebarOpen,
  activeSidebarTab,
  setActiveSidebarTab,
  libraryCount,
}) => {
  return (
    <header className="h-16 border-b border-[#252033] bg-[#0c0a13]/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between z-30 sticky top-0">
      {/* Left branding and sidebar quick toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-lg bg-[#191524] hover:bg-[#252034] text-[#f4b8cf] border border-[#f4b8cf]/20 transition-all flex items-center gap-1.5 text-xs font-medium"
          title={isSidebarOpen ? 'Collapse Sidebar' : 'Open AI Chat & Library'}
        >
          <Layers className="w-4 h-4 text-[#c4b5fd]" />
          <span className="hidden sm:inline">
            {isSidebarOpen ? 'Hide Sidebar' : 'AI Chat & Library'}
          </span>
          {libraryCount > 0 && (
            <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-[#f4b8cf]/20 text-[#ffd6e8] border border-[#f4b8cf]/40 font-mono">
              {libraryCount}
            </span>
          )}
        </button>

        <div className="h-4 w-px bg-[#262137] mx-1 hidden sm:block" />

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#f4b8cf] via-[#c4b5fd] to-[#ffffff] p-[1px] shadow-sm shadow-[#f4b8cf]/20">
            <div className="w-full h-full bg-[#0d0b14] rounded-[7px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#f4b8cf]" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                MerchGraphic <span className="text-[#f4b8cf] font-serif italic text-xs sm:text-sm font-normal">AI</span>
              </h1>
              <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#c4b5fd]/15 text-[#e9d5ff] border border-[#c4b5fd]/30 font-medium">
                Gemini Vision
              </span>
            </div>
            <p className="text-[11px] text-[#9b94ab] hidden md:block leading-none mt-0.5">
              Extract isolated 2D prints & typography off merchandise photos
            </p>
          </div>
        </div>
      </div>

      {/* Right controls / quick action tabs */}
      <div className="flex items-center gap-2">
        <div className="flex items-center bg-[#151221] p-0.5 rounded-lg border border-[#2b243d]">
          <button
            onClick={() => {
              setIsSidebarOpen(true);
              setActiveSidebarTab('chat');
            }}
            className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
              isSidebarOpen && activeSidebarTab === 'chat'
                ? 'bg-[#29223c] text-[#f4b8cf] shadow-sm shadow-black/40 border border-[#f4b8cf]/30'
                : 'text-[#a79eb8] hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#f4b8cf]" />
            <span>AI Tutor</span>
          </button>
          <button
            onClick={() => {
              setIsSidebarOpen(true);
              setActiveSidebarTab('library');
            }}
            className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
              isSidebarOpen && activeSidebarTab === 'library'
                ? 'bg-[#29223c] text-[#c4b5fd] shadow-sm shadow-black/40 border border-[#c4b5fd]/30'
                : 'text-[#a79eb8] hover:text-white'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5 text-[#c4b5fd]" />
            <span>Library</span>
            {libraryCount > 0 && (
              <span className="text-[10px] px-1 rounded bg-[#c4b5fd]/20 text-[#c4b5fd]">
                {libraryCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
