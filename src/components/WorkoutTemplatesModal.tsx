import { useState } from 'react';
import { Plus, Trash2, Edit2, Play, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { WorkoutTemplate } from '@/types/workout';
import { format } from 'date-fns';

interface WorkoutTemplatesModalProps {
  open: boolean;
  onClose: () => void;
  templates: WorkoutTemplate[];
  onAddTemplate: (template: Omit<WorkoutTemplate, 'id'>) => void;
  onUpdateTemplate: (id: string, template: Partial<WorkoutTemplate>) => void;
  onDeleteTemplate: (id: string) => void;
  onLoadTemplate: (templateId: string, date: string) => void;
}

export function WorkoutTemplatesModal({
  open,
  onClose,
  templates,
  onAddTemplate,
  onUpdateTemplate,
  onDeleteTemplate,
  onLoadTemplate,
}: WorkoutTemplatesModalProps) {
  const [editingTemplate, setEditingTemplate] = useState<WorkoutTemplate | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateNotes, setTemplateNotes] = useState('');
  const [exercises, setExercises] = useState<
    {
      name: string;
      type: 'reps' | 'timed';
      sets: { reps?: number; weight?: number; duration?: number }[];
      notes?: string;
    }[]
  >([]);

  const handleSave = () => {
    if (!templateName.trim() || exercises.length === 0) return;

    if (editingTemplate) {
      onUpdateTemplate(editingTemplate.id, {
        name: templateName.trim(),
        exercises,
        notes: templateNotes.trim() || undefined,
      });
    } else {
      onAddTemplate({
        name: templateName.trim(),
        exercises,
        notes: templateNotes.trim() || undefined,
      });
    }

    handleCancel();
  };

  const handleCancel = () => {
    setEditingTemplate(null);
    setShowForm(false);
    setTemplateName('');
    setTemplateNotes('');
    setExercises([]);
  };

  const handleEdit = (template: WorkoutTemplate) => {
    setEditingTemplate(template);
    setTemplateName(template.name);
    setTemplateNotes(template.notes || '');
    setExercises(template.exercises);
    setShowForm(true);
  };

  const handleLoadTemplate = (templateId: string) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    onLoadTemplate(templateId, today);
    onClose();
  };

  const addExercise = () => {
    setExercises([
      ...exercises,
      {
        name: '',
        type: 'reps',
        sets: [{ reps: undefined, weight: undefined }],
      },
    ]);
  };

  const removeExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const updateExercise = (index: number, field: string, value: any) => {
    const updated = [...exercises];
    updated[index] = { ...updated[index], [field]: value };
    setExercises(updated);
  };

  const addSetToExercise = (exerciseIndex: number) => {
    const updated = [...exercises];
    const exercise = updated[exerciseIndex];
    const lastSet = exercise.sets[exercise.sets.length - 1];
    
    if (exercise.type === 'reps') {
      updated[exerciseIndex].sets.push({
        reps: lastSet?.reps,
        weight: lastSet?.weight,
      });
    } else {
      updated[exerciseIndex].sets.push({ duration: lastSet?.duration });
    }
    setExercises(updated);
  };

  const removeSetFromExercise = (exerciseIndex: number, setIndex: number) => {
    const updated = [...exercises];
    if (updated[exerciseIndex].sets.length > 1) {
      updated[exerciseIndex].sets = updated[exerciseIndex].sets.filter(
        (_, i) => i !== setIndex
      );
      setExercises(updated);
    }
  };

  const updateSet = (
    exerciseIndex: number,
    setIndex: number,
    field: string,
    value: number | undefined
  ) => {
    const updated = [...exercises];
    updated[exerciseIndex].sets[setIndex] = {
      ...updated[exerciseIndex].sets[setIndex],
      [field]: value,
    };
    setExercises(updated);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] bg-card border-border overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Workout Templates</DialogTitle>
          <DialogDescription>
            Create and manage workout templates to quickly add planned workouts.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!showForm && (
            <>
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  {templates.length} {templates.length === 1 ? 'template' : 'templates'}
                </p>
                <Button onClick={() => setShowForm(true)} size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  New Template
                </Button>
              </div>

              {templates.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-muted-foreground/40 mx-auto" />
                  <p className="text-muted-foreground mt-4">No templates yet.</p>
                  <p className="text-muted-foreground/60 text-sm mt-1">
                    Create a template to quickly add planned workouts!
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      className="glass-card rounded-xl p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1">{template.name}</h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            {template.exercises.length}{' '}
                            {template.exercises.length === 1 ? 'exercise' : 'exercises'}
                          </p>
                          {template.notes && (
                            <p className="text-xs text-muted-foreground">{template.notes}</p>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleLoadTemplate(template.id)}
                            className="h-8"
                          >
                            <Play className="w-3 h-3 mr-1" />
                            Use
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(template)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDeleteTemplate(template.id)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {showForm && (
            <div className="space-y-4">
              <div>
                <Label>Template Name</Label>
                <Input
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="e.g., Push Day, Leg Day"
                  className="mt-1 bg-secondary border-border"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Exercises</Label>
                  <Button type="button" variant="ghost" size="sm" onClick={addExercise}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add Exercise
                  </Button>
                </div>

                <div className="space-y-3">
                  {exercises.map((exercise, exIdx) => (
                    <div key={exIdx} className="glass-card rounded-lg p-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <Input
                          value={exercise.name}
                          onChange={(e) =>
                            updateExercise(exIdx, 'name', e.target.value)
                          }
                          placeholder="Exercise name"
                          className="flex-1 bg-secondary border-border h-9"
                        />
                        <select
                          value={exercise.type}
                          onChange={(e) =>
                            updateExercise(exIdx, 'type', e.target.value as 'reps' | 'timed')
                          }
                          className="px-2 py-1 rounded border border-border bg-secondary text-sm"
                        >
                          <option value="reps">Reps</option>
                          <option value="timed">Timed</option>
                        </select>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeExercise(exIdx)}
                          className="h-9 w-9 p-0 text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="space-y-1">
                        {exercise.sets.map((set, setIdx) => (
                          <div key={setIdx} className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground w-4">
                              #{setIdx + 1}
                            </span>
                            {exercise.type === 'reps' ? (
                              <>
                                <Input
                                  type="number"
                                  value={set.weight || ''}
                                  onChange={(e) =>
                                    updateSet(
                                      exIdx,
                                      setIdx,
                                      'weight',
                                      e.target.value ? parseFloat(e.target.value) : undefined
                                    )
                                  }
                                  placeholder="kg"
                                  className="flex-1 bg-secondary border-border h-8 text-sm"
                                />
                                <span className="text-muted-foreground text-sm">×</span>
                                <Input
                                  type="number"
                                  value={set.reps || ''}
                                  onChange={(e) =>
                                    updateSet(
                                      exIdx,
                                      setIdx,
                                      'reps',
                                      e.target.value ? parseInt(e.target.value) : undefined
                                    )
                                  }
                                  placeholder="reps"
                                  className="flex-1 bg-secondary border-border h-8 text-sm"
                                />
                              </>
                            ) : (
                              <Input
                                type="number"
                                value={set.duration || ''}
                                onChange={(e) =>
                                  updateSet(
                                    exIdx,
                                    setIdx,
                                    'duration',
                                    e.target.value ? parseInt(e.target.value) : undefined
                                  )
                                }
                                placeholder="seconds"
                                className="flex-1 bg-secondary border-border h-8 text-sm"
                              />
                            )}
                            {exercise.sets.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeSetFromExercise(exIdx, setIdx)}
                                className="h-8 w-8 p-0"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => addSetToExercise(exIdx)}
                          className="w-full text-xs"
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Add Set
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Notes (optional)</Label>
                <Textarea
                  value={templateNotes}
                  onChange={(e) => setTemplateNotes(e.target.value)}
                  placeholder="Template notes..."
                  className="mt-1 bg-secondary border-border resize-none h-16"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSave} className="flex-1" disabled={!templateName.trim() || exercises.length === 0}>
                  {editingTemplate ? 'Update' : 'Create'} Template
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

