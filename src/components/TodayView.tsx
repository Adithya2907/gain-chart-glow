import { useState } from 'react';
import { ExerciseForm } from '@/components/ExerciseForm';
import { ExerciseCard } from '@/components/ExerciseCard';
import { ExerciseEditForm } from '@/components/ExerciseEditForm';
import { WorkoutDay, Exercise, SetEntry } from '@/types/workout';
import { Flame, FileText, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TodayViewProps {
  todayWorkout: WorkoutDay | undefined;
  onAddExercise: (exercise: Omit<Exercise, 'id' | 'order'>, date?: string) => void;
  onRemoveExercise: (id: string) => void;
  onUpdateExercise: (exerciseId: string, updates: Partial<Exercise>, date?: string) => void;
  onViewHistory: (exerciseName: string) => void;
  suggestions: string[];
  onOpenTemplates?: () => void;
}

export function TodayView({ 
  todayWorkout, 
  onAddExercise, 
  onRemoveExercise,
  onUpdateExercise,
  onViewHistory,
  suggestions,
  onOpenTemplates,
}: TodayViewProps) {
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null);
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

      {onOpenTemplates && (
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Workout Templates
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Load a pre-planned workout template
              </p>
            </div>
            <Button onClick={onOpenTemplates} size="sm" variant="outline">
              Browse Templates
            </Button>
          </div>
        </div>
      )}

      <ExerciseForm 
        onSubmit={(exercise) => onAddExercise(exercise, exercise.date)} 
        suggestions={suggestions} 
      />

      {todayWorkout && todayWorkout.notes && (
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-muted-foreground" />
            <h3 className="font-semibold text-sm">Today's Notes</h3>
          </div>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {todayWorkout.notes}
          </p>
        </div>
      )}

      {todayWorkout && todayWorkout.exercises.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-muted-foreground">Logged Exercises</h2>
          {todayWorkout.exercises
            .sort((a, b) => a.order - b.order)
            .map((exercise) => 
              editingExerciseId === exercise.id ? (
                <ExerciseEditForm
                  key={exercise.id}
                  exercise={exercise}
                  onSave={(updatedExercise) => {
                    onUpdateExercise(exercise.id, updatedExercise);
                    setEditingExerciseId(null);
                  }}
                  onCancel={() => setEditingExerciseId(null)}
                />
              ) : (
                <ExerciseCard
                  key={exercise.id}
                  exercise={exercise}
                  onRemove={onRemoveExercise}
                  onEdit={(ex) => setEditingExerciseId(ex.id)}
                  onViewHistory={onViewHistory}
                />
              )
            )}
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
