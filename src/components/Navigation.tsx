import { Dumbbell, TrendingUp, Calendar, List } from 'lucide-react';
import { cn } from '@/lib/utils';

export type TabType = 'today' | 'calendar' | 'progress' | 'exercises';

interface NavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
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
          onClick={() => onTabChange('calendar')}
          className={cn(
            "flex-1 flex flex-col items-center gap-1 py-4 transition-colors",
            activeTab === 'calendar' 
              ? "text-primary" 
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-xs font-medium">Calendar</span>
        </button>
        <button
          onClick={() => onTabChange('exercises')}
          className={cn(
            "flex-1 flex flex-col items-center gap-1 py-4 transition-colors",
            activeTab === 'exercises' 
              ? "text-primary" 
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <List className="w-5 h-5" />
          <span className="text-xs font-medium">Exercises</span>
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
