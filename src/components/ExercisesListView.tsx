import { useState, useMemo } from 'react';
import { Search, Filter, Repeat, Timer, Calendar, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Exercise } from '@/types/workout';
import { cn } from '@/lib/utils';

interface ExerciseListItem {
  name: string;
  type: 'reps' | 'timed';
  totalSessions: number;
  lastPerformed: string | null;
  maxWeight?: number;
  maxDuration?: number;
}

interface ExercisesListViewProps {
  exerciseNames: string[];
  getExerciseHistory: (name: string) => {
    date: string;
    exercises: Exercise[];
  }[];
  onViewHistory: (exerciseName: string) => void;
}

export function ExercisesListView({
  exerciseNames,
  getExerciseHistory,
  onViewHistory,
}: ExercisesListViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'reps' | 'timed'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'sessions' | 'recent'>('name');

  const exerciseList = useMemo<ExerciseListItem[]>(() => {
    return exerciseNames.map((name) => {
      const history = getExerciseHistory(name);
      const allExercises = history.flatMap((h) => h.exercises);
      
      if (allExercises.length === 0) {
        return {
          name,
          type: 'reps' as const,
          totalSessions: 0,
          lastPerformed: null,
        };
      }

      const exerciseType = allExercises[0].type;
      let maxWeight = 0;
      let maxDuration = 0;

      allExercises.forEach((ex) => {
        ex.sets.forEach((set) => {
          if (set.weight && set.weight > maxWeight) {
            maxWeight = set.weight;
          }
          if (set.duration && set.duration > maxDuration) {
            maxDuration = set.duration;
          }
        });
      });

      const sortedHistory = [...history].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      return {
        name,
        type: exerciseType,
        totalSessions: history.length,
        lastPerformed: sortedHistory.length > 0 ? sortedHistory[0].date : null,
        maxWeight: maxWeight > 0 ? maxWeight : undefined,
        maxDuration: maxDuration > 0 ? maxDuration : undefined,
      };
    });
  }, [exerciseNames, getExerciseHistory]);

  const filteredAndSorted = useMemo(() => {
    let filtered = exerciseList.filter((exercise) => {
      const matchesSearch = exercise.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesType =
        typeFilter === 'all' || exercise.type === typeFilter;
      return matchesSearch && matchesType;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'sessions':
          return b.totalSessions - a.totalSessions;
        case 'recent':
          if (!a.lastPerformed && !b.lastPerformed) return 0;
          if (!a.lastPerformed) return 1;
          if (!b.lastPerformed) return -1;
          return (
            new Date(b.lastPerformed).getTime() -
            new Date(a.lastPerformed).getTime()
          );
        default:
          return 0;
      }
    });

    return filtered;
  }, [exerciseList, searchQuery, typeFilter, sortBy]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);

    if (checkDate.getTime() === today.getTime()) {
      return 'Today';
    }
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (checkDate.getTime() === yesterday.getTime()) {
      return 'Yesterday';
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  if (exerciseNames.length === 0) {
    return (
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-bold">Exercises</h1>
          <p className="text-muted-foreground mt-1">All your logged exercises</p>
        </header>
        <div className="text-center py-16">
          <p className="text-muted-foreground">No exercises logged yet.</p>
          <p className="text-muted-foreground/60 text-sm mt-1">
            Start tracking your workouts to see exercises here!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Exercises</h1>
        <p className="text-muted-foreground mt-1">
          {filteredAndSorted.length} {filteredAndSorted.length === 1 ? 'exercise' : 'exercises'}
        </p>
      </header>

      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search exercises..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-secondary border-border"
          />
        </div>

        <div className="flex gap-2">
          <Select value={typeFilter} onValueChange={(v: 'all' | 'reps' | 'timed') => setTypeFilter(v)}>
            <SelectTrigger className="flex-1 bg-secondary border-border">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="reps">Reps & Weight</SelectItem>
              <SelectItem value="timed">Timed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(v: 'name' | 'sessions' | 'recent') => setSortBy(v)}>
            <SelectTrigger className="flex-1 bg-secondary border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Sort by Name</SelectItem>
              <SelectItem value="sessions">Sort by Sessions</SelectItem>
              <SelectItem value="recent">Sort by Recent</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredAndSorted.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No exercises match your filters.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredAndSorted.map((exercise) => (
            <div
              key={exercise.name}
              className="glass-card rounded-xl p-4 hover:bg-card/90 transition-colors cursor-pointer"
              onClick={() => onViewHistory(exercise.name)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">{exercise.name}</h3>
                    {exercise.type === 'reps' ? (
                      <Repeat className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Timer className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {exercise.totalSessions}{' '}
                        {exercise.totalSessions === 1 ? 'session' : 'sessions'}
                      </span>
                    </div>
                    {exercise.lastPerformed && (
                      <div className="flex items-center gap-1">
                        <span>Last: {formatDate(exercise.lastPerformed)}</span>
                      </div>
                    )}
                  </div>

                  {exercise.type === 'reps' && exercise.maxWeight && (
                    <div className="mt-2 text-sm">
                      <span className="text-muted-foreground">Max Weight: </span>
                      <span className="font-semibold text-primary">
                        {exercise.maxWeight} kg
                      </span>
                    </div>
                  )}

                  {exercise.type === 'timed' && exercise.maxDuration && (
                    <div className="mt-2 text-sm">
                      <span className="text-muted-foreground">Best Time: </span>
                      <span className="font-semibold text-primary">
                        {formatDuration(exercise.maxDuration)}
                      </span>
                    </div>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewHistory(exercise.name);
                  }}
                  className="ml-2"
                >
                  <TrendingUp className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

