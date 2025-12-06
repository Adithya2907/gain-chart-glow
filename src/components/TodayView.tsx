import { ExerciseForm } from '@/components/ExerciseForm';
import { ExerciseCard } from '@/components/ExerciseCard';
import { WorkoutDay, Exercise, SetEntry } from '@/types/workout';
import { Flame } from 'lucide-react';

interface TodayViewProps {
  todayWorkout: WorkoutDay | undefined;
  onAddExercise: (exercise: Omit<Exercise, 'id' | 'order'>) => void;
  onRemoveExercise: (id: string) => void;
  onViewHistory: (exerciseName: string) => void;
  suggestions: string[];
}

export function TodayView({ 
  todayWorkout, 
  onAddExercise, 
  onRemoveExercise, 
  onViewHistory,
  suggestions 
}: TodayViewProps) {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const totalSets = todayWorkout?.exercises.reduce((sum, e) => sum + e.sets.length, 0) || 0;
  const totalVolume = todayWorkout?.exercises.reduce((sum, e) => {
    if (e.type === 'reps') {
      return sum + e.sets.reduce((s, set) => s + ((set.reps || 0) * (set.weight || 0)), 0);
    }
    return sum;
  }, 0) || 0;

  return (
    <div className="space-y-6">
      <header>
        <p className="text-muted-foreground text-sm">{today}</p>
        <h1 className="text-2xl font-bold mt-1">Today's Workout</h1>
        
        {todayWorkout && todayWorkout.exercises.length > 0 && (
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-2 text-primary">
              <Flame className="w-5 h-5" />
              <span className="font-semibold">{todayWorkout.exercises.length} exercises</span>
            </div>
            <span className="text-muted-foreground text-sm">
              {totalSets} sets
              {totalVolume > 0 && ` · ${totalVolume.toLocaleString()} kg`}
            </span>
          </div>
        )}
      </header>

      <ExerciseForm onSubmit={onAddExercise} suggestions={suggestions} />

      {todayWorkout && todayWorkout.exercises.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-muted-foreground">Logged Exercises</h2>
          {todayWorkout.exercises
            .sort((a, b) => a.order - b.order)
            .map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                onRemove={onRemoveExercise}
                onViewHistory={onViewHistory}
              />
            ))}
        </div>
      )}

      {(!todayWorkout || todayWorkout.exercises.length === 0) && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No exercises logged yet today.</p>
          <p className="text-muted-foreground/60 text-sm mt-1">Add your first exercise above!</p>
        </div>
      )}
    </div>
  );
}
