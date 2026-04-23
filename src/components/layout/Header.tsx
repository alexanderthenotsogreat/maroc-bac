import React from "react";
import { User } from "firebase/auth";
import { BookOpen, LogOut, Menu, UserPlus, AlertTriangle, Cloud } from "lucide-react";
import { UserSettings } from "../../types";
import { THEMES } from "../../constants/ui";
import { cn } from "../../lib/utils";

interface HeaderProps {
  user: User;
  onLogout: () => void;
  onUpgrade?: () => void;
  settings: UserSettings;
  onMenuToggle: () => void;
}

export function Header({ user, onLogout, onUpgrade, settings, onMenuToggle }: HeaderProps) {
  const theme = THEMES[settings.themeColor];
  const isGuest = user.isAnonymous;
  const [isSyncing, setIsSyncing] = React.useState(true);

  React.useEffect(() => {
    // Show sync for 3 seconds on mount to indicate cross-device data load
    const timer = setTimeout(() => setIsSyncing(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <header className="h-16 border-b border-zinc-200 bg-white/80 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuToggle}
          className="p-2 hover:bg-zinc-100 rounded-lg lg:hidden text-zinc-500"
        >
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-2">
          <div className={cn("p-1.5 rounded-lg text-white", theme.primary)}>
            <BookOpen size={20} />
          </div>
          <h1 className="text-lg sm:text-xl font-serif font-bold tracking-tight text-zinc-900 italic">
            MarocBac<span className={cn("not-italic", theme.text)}>Notebook</span>
          </h1>
          {isSyncing && (
            <div className="ml-2 animate-pulse text-zinc-400 flex items-center gap-1.5">
              <Cloud size={14} className="animate-bounce" />
              <span className="text-[8px] font-black uppercase tracking-widest hidden sm:inline">Sync</span>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3 sm:gap-4">
        {isGuest ? (
          <button 
            onClick={onUpgrade}
            className={cn("hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm", theme.primary, "text-white hover:opacity-90")}
          >
            <UserPlus size={16} />
            <span>Synchroniser le Compte</span>
          </button>
        ) : (
          <div className="text-sm text-zinc-500 hidden sm:block">
            Welcome, <span className="font-medium text-zinc-900">{user.displayName?.split(' ')[0]}</span>
          </div>
        )}
        
        {isGuest && (
          <div className="sm:hidden text-amber-500" title="Mode Invité - Compte non synchronisé">
            <AlertTriangle size={20} />
          </div>
        )}

        <button 
          onClick={onLogout}
          className="p-2 hover:bg-zinc-100 rounded-full transition-colors text-zinc-500 hover:text-zinc-900"
          title="Déconnexion"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
