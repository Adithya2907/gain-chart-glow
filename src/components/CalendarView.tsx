import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, Dumbbell, Edit2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { WorkoutDay } from '@/types/workout';
import { ExerciseCard } from '@/components/ExerciseCard';
import { cn } from '@/lib/utils';

interface CalendarViewProps {
  workouts: WorkoutDay[];
  onViewHistory: (exerciseName: string) => void;
  onUpdateDayNotes: (date: string, notes: string) => void;
}

export function CalendarView({ workouts, onViewHistory, onUpdateDayNotes }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState('');

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const workoutDates = new Set(workouts.map(w => w.date));

  const getWorkoutForDate = (date: Date): WorkoutDay | undefined => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return workouts.find(w => w.date === dateStr);
  };

  const selectedWorkout = selectedDate ? getWorkoutForDate(selectedDate) : null;

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setIsEditingNotes(false);
    const workout = getWorkoutForDate(date);
    setNotesValue(workout?.notes || '');
  };

  const handleSaveNotes = () => {
    if (selectedDate) {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      onUpdateDayNotes(dateStr, notesValue);
      setIsEditingNotes(false);
    }
  };

  const handleCancelEdit = () => {
    if (selectedDate) {
      const workout = getWorkoutForDate(selectedDate);
      setNotesValue(workout?.notes || '');
    }
    setIsEditingNotes(false);
  };

  const startDay = monthStart.getDay();
  const emptyDays = Array(startDay).fill(null);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Calendar</h1>
        <p className="text-muted-foreground mt-1">View your workout history</p>
      </header>

      <div className="glass-card rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-lg font-semibold">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-xs text-muted-foreground py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {emptyDays.map((_, index) => (
            <div key={`empty-${index}`} className="aspect-square" />
          ))}
          
          {daysInMonth.map(day => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const hasWorkout = workoutDates.has(dateStr);
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isToday = isSameDay(day, new Date());

            return (
              <button
                key={dateStr}
                onClick={() => handleDateSelect(day)}
                className={cn(
                  "aspect-square rounded-lg flex flex-col items-center justify-center relative transition-colors",
                  isSelected && "bg-primary text-primary-foreground",
                  !isSelected && isToday && "bg-secondary",
                  !isSelected && !isToday && "hover:bg-secondary/50"
                )}
              >
                <span className={cn(
                  "text-sm",
                  !isSelected && !isSameMonth(day, currentMonth) && "text-muted-foreground/50"
                )}>
                  {format(day, 'd')}
                </span>
                {hasWorkout && (
                  <div className={cn(
                    "absolute bottom-1 w-1.5 h-1.5 rounded-full",
                    isSelected ? "bg-primary-foreground" : "bg-primary"
                  )} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {selectedDate && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-muted-foreground">
            {format(selectedDate, 'EEEE, MMMM d')}
          </h2>

          {/* Day Notes Section */}
          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <h3 className="font-semibold text-sm">Day Notes</h3>
              </div>
              {!isEditingNotes && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditingNotes(true)}
                  className="h-7"
                >
                  <Edit2 className="w-3 h-3 mr-1" />
                  {selectedWorkout?.notes ? 'Edit' : 'Add'}
                </Button>
              )}
            </div>

            {isEditingNotes ? (
              <div className="space-y-2">
                <Textarea
                  value={notesValue}
                  onChange={(e) => setNotesValue(e.target.value)}
                  placeholder="Add notes about this day..."
                  className="bg-secondary border-border resize-none h-24 text-sm"
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleSaveNotes}
                    className="flex-1"
                  >
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                {selectedWorkout?.notes ? (
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {selectedWorkout.notes}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground/60 italic">
                    No notes for this day. Click "Add" to add notes.
                  </p>
                )}
              </div>
            )}
          </div>
          
          {selectedWorkout && selectedWorkout.exercises.length > 0 ? (
            <div className="space-y-3">
              <h3 className="font-semibold text-muted-foreground">Exercises</h3>
              {selectedWorkout.exercises
                .sort((a, b) => a.order - b.order)
                .map((exercise) => (
                  <ExerciseCard
                    key={exercise.id}
                    exercise={exercise}
                    onViewHistory={onViewHistory}
                  />
                ))}
            </div>
          ) : (
            <div className="glass-card rounded-xl p-8 text-center">
              <Dumbbell className="w-8 h-8 text-muted-foreground/40 mx-auto" />
              <p className="text-muted-foreground mt-2">No exercises logged on this day</p>
            </div>
          )}
        </div>
      )}

      {!selectedDate && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Select a date to view exercises</p>
        </div>
      )}
    </div>
  );
}
