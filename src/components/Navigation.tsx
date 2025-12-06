import { Dumbbell, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavigationProps {
  activeTab: 'today' | 'progress';
  onTabChange: (tab: 'today' | 'progress') => void;
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 glass-card border-t border-border/50 z-50">
      <div className="max-w-lg mx-auto flex">
        <button
          onClick={() => onTabChange('today')}
          className={cn(
            "flex-1 flex flex-col items-center gap-1 py-4 transition-colors",
            activeTab === 'today' 
              ? "text-primary" 
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Dumbbell className="w-5 h-5" />
          <span className="text-xs font-medium">Today</span>
        </button>
        <button
          onClick={() => onTabChange('progress')}
          className={cn(
            "flex-1 flex flex-col items-center gap-1 py-4 transition-colors",
            activeTab === 'progress' 
              ? "text-primary" 
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <TrendingUp className="w-5 h-5" />
          <span className="text-xs font-medium">Progress</span>
        </button>
      </div>
    </nav>
  );
}
