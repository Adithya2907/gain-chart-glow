import { useState } from 'react';
import { Plus, Trash2, Edit2, Target, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Goal } from '@/types/workout';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface GoalsModalProps {
  open: boolean;
  onClose: () => void;
  goals: Goal[];
  exerciseNames: string[];
  onAddGoal: (goal: Omit<Goal, 'id'>) => void;
  onUpdateGoal: (id: string, goal: Partial<Goal>) => void;
  onDeleteGoal: (id: string) => void;
}

export function GoalsModal({
  open,
  onClose,
  goals,
  exerciseNames,
  onAddGoal,
  onUpdateGoal,
  onDeleteGoal,
}: GoalsModalProps) {
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [exerciseName, setExerciseName] = useState('');
  const [targetValue, setTargetValue] = useState('');
  const [targetDate, setTargetDate] = useState<Date | undefined>(new Date());
  const [goalType, setGoalType] = useState<'weight' | 'reps' | 'duration'>('weight');
  const [notes, setNotes] = useState('');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const handleSave = () => {
    if (!exerciseName.trim() || !targetValue || !targetDate) return;

    if (editingGoal) {
      onUpdateGoal(editingGoal.id, {
        exerciseName: exerciseName.trim(),
        targetValue: parseFloat(targetValue),
        targetDate: format(targetDate, 'yyyy-MM-dd'),
        type: goalType,
        notes: notes.trim() || undefined,
      });
    } else {
      onAddGoal({
        exerciseName: exerciseName.trim(),
        targetValue: parseFloat(targetValue),
        targetDate: format(targetDate, 'yyyy-MM-dd'),
        type: goalType,
        notes: notes.trim() || undefined,
      });
    }

    handleCancel();
  };

  const handleCancel = () => {
    setEditingGoal(null);
    setShowForm(false);
    setExerciseName('');
    setTargetValue('');
    setTargetDate(new Date());
    setGoalType('weight');
    setNotes('');
  };

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setExerciseName(goal.exerciseName);
    setTargetValue(goal.targetValue.toString());
    setTargetDate(new Date(goal.targetDate));
    setGoalType(goal.type);
    setNotes(goal.notes || '');
    setShowForm(true);
  };

  const getGoalTypeLabel = (type: 'weight' | 'reps' | 'duration') => {
    switch (type) {
      case 'weight':
        return 'Weight (kg)';
      case 'reps':
        return 'Reps';
      case 'duration':
        return 'Duration (seconds)';
    }
  };

  const formatGoalValue = (goal: Goal): string => {
    switch (goal.type) {
      case 'weight':
        return `${goal.targetValue} kg`;
      case 'reps':
        return `${goal.targetValue} reps`;
      case 'duration':
        const mins = Math.floor(goal.targetValue / 60);
        const secs = goal.targetValue % 60;
        return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
    }
  };

  const activeGoals = goals.filter((g) => !g.achieved);
  const achievedGoals = goals.filter((g) => g.achieved);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[85vh] bg-card border-border overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Goals</DialogTitle>
          <DialogDescription>
            Set and track your fitness goals with target dates.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!showForm && (
            <>
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  {activeGoals.length} active {activeGoals.length === 1 ? 'goal' : 'goals'}
                </p>
                <Button onClick={() => setShowForm(true)} size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  New Goal
                </Button>
              </div>

              {goals.length === 0 ? (
                <div className="text-center py-12">
                  <Target className="w-12 h-12 text-muted-foreground/40 mx-auto" />
                  <p className="text-muted-foreground mt-4">No goals set yet.</p>
                  <p className="text-muted-foreground/60 text-sm mt-1">
                    Set a goal to track your progress!
                  </p>
                </div>
              ) : (
                <>
                  {activeGoals.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="font-semibold text-sm text-muted-foreground">Active Goals</h3>
                      {activeGoals.map((goal) => (
                        <div key={goal.id} className="glass-card rounded-xl p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Target className="w-4 h-4 text-primary" />
                                <h4 className="font-semibold">{goal.exerciseName}</h4>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Target: {formatGoalValue(goal)} by {format(new Date(goal.targetDate), 'MMM d, yyyy')}
                              </p>
                              {goal.notes && (
                                <p className="text-xs text-muted-foreground mt-1">{goal.notes}</p>
                              )}
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(goal)}
                                className="h-7 w-7 p-0"
                              >
                                <Edit2 className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onDeleteGoal(goal.id)}
                                className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {achievedGoals.length > 0 && (
                    <div className="space-y-2 mt-4">
                      <h3 className="font-semibold text-sm text-muted-foreground">Achieved Goals</h3>
                      {achievedGoals.map((goal) => (
                        <div key={goal.id} className="glass-card rounded-xl p-4 opacity-75">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <CheckCircle2 className="w-4 h-4 text-primary" />
                                <h4 className="font-semibold line-through">{goal.exerciseName}</h4>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {formatGoalValue(goal)} - Achieved{' '}
                                {goal.achievedDate
                                  ? format(new Date(goal.achievedDate), 'MMM d, yyyy')
                                  : ''}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDeleteGoal(goal.id)}
                              className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {showForm && (
            <div className="space-y-4">
              <div>
                <Label>Exercise Name</Label>
                <Input
                  value={exerciseName}
                  onChange={(e) => setExerciseName(e.target.value)}
                  placeholder="e.g., Squat"
                  className="mt-1 bg-secondary border-border"
                  list="exercise-suggestions"
                />
                <datalist id="exercise-suggestions">
                  {exerciseNames.map((name) => (
                    <option key={name} value={name} />
                  ))}
                </datalist>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Goal Type</Label>
                  <Select
                    value={goalType}
                    onValueChange={(v: 'weight' | 'reps' | 'duration') => setGoalType(v)}
                  >
                    <SelectTrigger className="mt-1 bg-secondary border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weight">Weight (kg)</SelectItem>
                      <SelectItem value="reps">Reps</SelectItem>
                      <SelectItem value="duration">Duration (seconds)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Target Value</Label>
                  <Input
                    type="number"
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value)}
                    placeholder={goalType === 'weight' ? 'kg' : goalType === 'reps' ? 'reps' : 'seconds'}
                    className="mt-1 bg-secondary border-border"
                  />
                </div>
              </div>

              <div>
                <Label>Target Date</Label>
                <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        "w-full mt-1 justify-start text-left font-normal bg-secondary border-border",
                        !targetDate && "text-muted-foreground"
                      )}
                    >
                      {targetDate ? format(targetDate, 'MMM d, yyyy') : 'Select date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={targetDate}
                      onSelect={(date) => {
                        setTargetDate(date);
                        setIsDatePickerOpen(false);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label>Notes (optional)</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Goal notes..."
                  className="mt-1 bg-secondary border-border resize-none h-16"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleSave}
                  className="flex-1"
                  disabled={!exerciseName.trim() || !targetValue || !targetDate}
                >
                  {editingGoal ? 'Update' : 'Create'} Goal
                </Button>
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

