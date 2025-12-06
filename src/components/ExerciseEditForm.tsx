import { useState, useEffect } from 'react';
import { Plus, Minus, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Exercise, SetEntry } from '@/types/workout';
import { cn } from '@/lib/utils';

interface ExerciseEditFormProps {
  exercise: Exercise;
  onSave: (exercise: Exercise) => void;
  onCancel: () => void;
}

export function ExerciseEditForm({ exercise, onSave, onCancel }: ExerciseEditFormProps) {
  const [sets, setSets] = useState<SetEntry[]>(exercise.sets);
  const [notes, setNotes] = useState(exercise.notes || '');

  useEffect(() => {
    setSets(exercise.sets);
    setNotes(exercise.notes || '');
  }, [exercise]);

  const addSet = () => {
    if (exercise.type === 'reps') {
      const lastSet = sets[sets.length - 1];
      setSets([...sets, { reps: lastSet?.reps, weight: lastSet?.weight }]);
    } else {
      setSets([...sets, { duration: undefined }]);
    }
  };

  const removeSet = (index: number) => {
    if (sets.length > 1) {
      setSets(sets.filter((_, i) => i !== index));
    }
  };

  const updateSet = (index: number, field: keyof SetEntry, value: number | undefined) => {
    setSets(sets.map((set, i) => 
      i === index ? { ...set, [field]: value } : set
    ));
  };

  const handleSave = () => {
    const validSets = sets.filter(set => 
      exercise.type === 'reps' 
        ? (set.reps && set.reps > 0)
        : (set.duration && set.duration > 0)
    );

    if (validSets.length === 0) return;

    onSave({
      ...exercise,
      sets: validSets,
      notes: notes.trim() || undefined,
    });
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const hasWeight = exercise.type === 'reps' && sets.some(s => s.weight !== undefined);

  return (
    <div className="glass-card rounded-xl p-4 space-y-4 border-2 border-primary/50">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{exercise.name}</h3>
        <div className="flex gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleSave}
            className="h-8"
          >
            <Save className="w-4 h-4 mr-1" />
            Save
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="h-8"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Sets</span>
          <Button type="button" variant="ghost" size="sm" onClick={addSet}>
            <Plus className="w-4 h-4 mr-1" />
            Add Set
          </Button>
        </div>

        {sets.map((set, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground w-6">#{index + 1}</span>
            
            {exercise.type === 'reps' ? (
              <>
                {hasWeight && (
                  <>
                    <div className="flex-1">
                      <Input
                        type="number"
                        min="0"
                        step="0.5"
                        value={set.weight || ''}
                        onChange={(e) => updateSet(index, 'weight', e.target.value ? parseFloat(e.target.value) : undefined)}
                        placeholder="kg"
                        className="bg-secondary border-border h-9 text-sm"
                      />
                    </div>
                    <span className="text-muted-foreground text-sm">×</span>
                  </>
                )}
                <div className="flex-1">
                  <Input
                    type="number"
                    min="1"
                    value={set.reps || ''}
                    onChange={(e) => updateSet(index, 'reps', e.target.value ? parseInt(e.target.value) : undefined)}
                    placeholder="reps"
                    className="bg-secondary border-border h-9 text-sm"
                  />
                </div>
              </>
            ) : (
              <div className="flex-1">
                <Input
                  type="number"
                  min="1"
                  value={set.duration || ''}
                  onChange={(e) => updateSet(index, 'duration', e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="seconds"
                  className="bg-secondary border-border h-9 text-sm"
                />
              </div>
            )}

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeSet(index)}
              className={cn(
                "h-9 w-9 text-muted-foreground hover:text-destructive",
                sets.length === 1 && "opacity-50 pointer-events-none"
              )}
            >
              <Minus className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>

      <div>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes (optional)"
          className="bg-secondary border-border resize-none h-16 text-sm"
        />
      </div>
    </div>
  );
}

