import { X, Timer, Weight, ChevronRight, Edit2 } from 'lucide-react';
import { Exercise } from '@/types/workout';
import { Button } from '@/components/ui/button';

interface ExerciseCardProps {
  exercise: Exercise;
  onRemove?: (id: string) => void;
  onViewHistory?: (exerciseName: string) => void;
  onEdit?: (exercise: Exercise) => void;
  showOrder?: boolean;
  isEditing?: boolean;
}

export function ExerciseCard({ exercise, onRemove, onViewHistory, onEdit, showOrder = true, isEditing = false }: ExerciseCardProps) {
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const totalVolume = exercise.type === 'reps' 
    ? exercise.sets.reduce((sum, s) => sum + ((s.reps || 0) * (s.weight || 0)), 0)
    : null;

  const totalTime = exercise.type === 'timed'
    ? exercise.sets.reduce((sum, s) => sum + (s.duration || 0), 0)
    : null;

  return (
    <div className="glass-card rounded-xl p-4 group animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {showOrder && (
              <span className="text-xs text-primary font-medium bg-primary/10 px-2 py-0.5 rounded">
                #{exercise.order + 1}
              </span>
            )}
            <h3 className="font-semibold text-foreground">{exercise.name}</h3>
            {exercise.type === 'timed' && (
              <Timer className="w-4 h-4 text-muted-foreground" />
            )}
          </div>

          <div className="mt-3 space-y-1.5">
            {exercise.sets.map((set, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground w-12">Set {index + 1}:</span>
                {exercise.type === 'reps' ? (
                  <span className="text-foreground">
                    {set.weight ? `${set.weight}kg × ` : ''}{set.reps} reps
                  </span>
                ) : (
                  <span className="text-foreground">
                    {formatDuration(set.duration || 0)}
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
            <span>{exercise.sets.length} sets</span>
            {totalVolume !== null && totalVolume > 0 && (
              <span className="flex items-center gap-1">
                <Weight className="w-3 h-3" />
                {totalVolume.toLocaleString()} kg volume
              </span>
            )}
            {totalTime !== null && (
              <span className="flex items-center gap-1">
                <Timer className="w-3 h-3" />
                {formatDuration(totalTime)} total
              </span>
            )}
          </div>

          {exercise.notes && (
            <p className="mt-2 text-sm text-muted-foreground/80 italic">
              {exercise.notes}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1">
          {onEdit && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(exercise)}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary"
            >
              <Edit2 className="w-4 h-4" />
            </Button>
          )}
          {onViewHistory && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onViewHistory(exercise.name)}
              className="text-muted-foreground hover:text-primary"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
          {onRemove && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onRemove(exercise.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
