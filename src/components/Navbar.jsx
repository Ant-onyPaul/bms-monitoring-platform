import { FiMenu, FiSearch, FiBell, FiMoon } from 'react-icons/fi';

export default function Navbar({ toggleSidebar }) {

  return (
    <header className="h-16 bg-[#07131E]/70 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-4 sm:px-6 z-30 sticky top-0 animate-fadeIn transition-all">
      
      {/* Left side: Hamburger (mobile) + Title */}
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="p-2 -ml-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors lg:hidden focus:outline-none"
        >
          <FiMenu className="w-6 h-6" />
        </button>
      </div>

      {/* Right side: Search, Actions, Profile */}
      <div className="flex items-center gap-4 sm:gap-6">
        
        {/* Search (hidden on mobile) */}
        <div className="hidden sm:flex items-center relative group">
          <FiSearch className="absolute left-3 text-slate-400 w-4 h-4 group-focus-within:text-brand-blue transition-colors" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="bg-slate-900/50 border border-slate-700/50 text-sm rounded-full pl-9 pr-4 py-1.5 text-white placeholder-slate-500 focus:outline-none focus:border-brand-blue/50 focus:ring-2 focus:ring-brand-blue/20 w-48 focus:w-64 transition-all duration-300"
          />
        </div>

        {/* Icons */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button className="p-2 rounded-full text-slate-400 hover:text-brand-blue hover:bg-brand-blue/10 transition-all relative group">
            <FiBell className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-[#07131E] shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse"></span>
          </button>
          <button className="p-2 rounded-full text-slate-400 hover:text-brand-accent hover:bg-cyan-500/10 transition-all hidden sm:block group">
            <FiMoon className="w-5 h-5 group-hover:-rotate-12 transition-transform" />
          </button>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-3 sm:pl-5 border-l border-white/10">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm font-semibold text-white tracking-wide">Alex Mercer</span>
            <span className="text-xs text-brand-green">Online</span>
          </div>
          <div className="relative group cursor-pointer">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-blue to-emerald-500 p-[2px]">
              <div className="w-full h-full rounded-full bg-[#081B29] flex items-center justify-center text-white font-bold group-hover:bg-transparent transition-colors duration-300">
                AM
              </div>
            </div>
            {/* Online Indicator */}
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-brand-green rounded-full border-2 border-[#07131E] shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
          </div>
        </div>
      </div>

    </header>
  );
}
