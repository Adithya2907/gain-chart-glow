import { X, Weight, RotateCcw, Repeat } from 'lucide-react';
import { Exercise } from '@/types/workout';
import { Button } from '@/components/ui/button';

interface ExerciseCardProps {
  exercise: Exercise;
  onRemove: (id: string) => void;
}

export function ExerciseCard({ exercise, onRemove }: ExerciseCardProps) {
  return (
    <div className="glass-card rounded-xl p-4 group animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-foreground">{exercise.name}</h3>
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <RotateCcw className="w-3.5 h-3.5" />
              {exercise.sets} sets
            </span>
            <span className="flex items-center gap-1">
              <Repeat className="w-3.5 h-3.5" />
              {exercise.reps} reps
            </span>
            {exercise.weight && (
              <span className="flex items-center gap-1">
                <Weight className="w-3.5 h-3.5" />
                {exercise.weight} kg
              </span>
            )}
          </div>
          {exercise.notes && (
            <p className="mt-2 text-sm text-muted-foreground/80 italic">
              {exercise.notes}
            </p>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemove(exercise.id)}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
