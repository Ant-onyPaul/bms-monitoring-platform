import { FiMenu, FiSearch, FiBell, FiMoon } from 'react-icons/fi';

export default function Navbar({ toggleSidebar }) {

  return (
    <header className="h-16 bg-background/95 border-b border-border flex items-center justify-between px-4 sm:px-6 z-30 sticky top-0 animate-fadeIn transition-all">
      
      {/* Left side: Hamburger (mobile) + Title */}
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="p-2 -ml-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors lg:hidden focus:outline-none"
        >
          <FiMenu className="w-6 h-6" />
        </button>
      </div>

      {/* Right side: Search, Actions, Profile */}
      <div className="flex items-center gap-4 sm:gap-6">
        
        {/* Search (hidden on mobile) */}
        <div className="hidden sm:flex items-center relative group">
          <FiSearch className="absolute left-3 text-muted-foreground w-4 h-4 group-focus-within:text-[#10B981] transition-colors" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="bg-card border border-border text-sm rounded-md pl-9 pr-4 py-1.5 text-foreground placeholder-muted-foreground focus:outline-none focus:border-[#10B981]/50 focus:ring-1 focus:ring-[#10B981]/20 w-48 focus:w-64 transition-all duration-300"
          />
        </div>

        {/* Icons */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button className="p-2 rounded-md text-muted-foreground hover:text-[#10B981] hover:bg-[#10B981]/10 transition-all relative group">
            <FiBell className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full border border-background shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse"></span>
          </button>
          <button className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-all hidden sm:block group">
            <FiMoon className="w-5 h-5 group-hover:-rotate-12 transition-transform" />
          </button>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-3 sm:pl-5 border-l border-border">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm font-semibold text-foreground tracking-wide">Alex Mercer</span>
            <span className="label-technical !text-[10px] text-[#10B981]">Online</span>
          </div>
          <div className="relative group cursor-pointer">
            <div className="w-9 h-9 rounded-md bg-gradient-to-br from-slate-300 to-slate-200 p-[1px]">
              <div className="w-full h-full rounded-md bg-card flex items-center justify-center text-foreground font-bold group-hover:bg-muted transition-colors duration-300">
                AM
              </div>
            </div>
            {/* Online Indicator */}
            <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-[#10B981] rounded-full border-2 border-background"></span>
          </div>
        </div>
      </div>

    </header>
  );
}
