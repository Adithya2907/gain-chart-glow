import { useState } from 'react';
import { Plus, Minus, Timer, Repeat, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { SetEntry } from '@/types/workout';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface ExerciseFormProps {
  onSubmit: (exercise: {
    name: string;
    type: 'reps' | 'timed';
    sets: SetEntry[];
    notes?: string;
    date?: string;
  }) => void;
  suggestions: string[];
}

export function ExerciseForm({ onSubmit, suggestions }: ExerciseFormProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<'reps' | 'timed'>('reps');
  const [sets, setSets] = useState<SetEntry[]>([{ reps: undefined, weight: undefined }]);
  const [notes, setNotes] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const filteredSuggestions = suggestions.filter(s =>
    s.toLowerCase().includes(name.toLowerCase()) && name.length > 0
  );

  const addSet = () => {
    if (type === 'reps') {
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

  const handleTypeChange = (newType: 'reps' | 'timed') => {
    setType(newType);
    if (newType === 'reps') {
      setSets([{ reps: undefined, weight: undefined }]);
    } else {
      setSets([{ duration: undefined }]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || sets.length === 0) return;

    const validSets = sets.filter(set => 
      type === 'reps' ? (set.reps && set.reps > 0) : (set.duration && set.duration > 0)
    );

    if (validSets.length === 0) return;

    const dateString = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : undefined;

    onSubmit({
      name: name.trim(),
      type,
      sets: validSets,
      notes: notes.trim() || undefined,
      date: dateString,
    });

    setName('');
    setSets(type === 'reps' ? [{ reps: undefined, weight: undefined }] : [{ duration: undefined }]);
    setNotes('');
    setSelectedDate(new Date());
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const getDateString = (date: Date | undefined) => {
    if (!date) return 'Select date';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(date);
    selected.setHours(0, 0, 0, 0);
    
    if (selected.getTime() === today.getTime()) {
      return 'Today';
    }
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (selected.getTime() === yesterday.getTime()) {
      return 'Yesterday';
    }
    return format(date, 'MMM d, yyyy');
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card rounded-xl p-4 space-y-4">
      <div>
        <Label className="text-muted-foreground text-sm">Date</Label>
        <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className={cn(
                "w-full mt-1 justify-start text-left font-normal bg-secondary border-border",
                !selectedDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {getDateString(selectedDate)}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                setSelectedDate(date);
                setIsDatePickerOpen(false);
              }}
              disabled={(date) => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const checkDate = new Date(date);
                checkDate.setHours(0, 0, 0, 0);
                return checkDate > today;
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="relative">
        <Label htmlFor="name" className="text-muted-foreground text-sm">Exercise Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          placeholder="e.g., Bench Press"
          className="mt-1 bg-secondary border-border"
        />
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-lg shadow-lg overflow-hidden">
            {filteredSuggestions.slice(0, 5).map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => {
                  setName(suggestion);
                  setShowSuggestions(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-secondary transition-colors text-sm"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <Label className="text-muted-foreground text-sm">Exercise Type</Label>
        <div className="flex gap-2 mt-2">
          <Button
            type="button"
            variant={type === 'reps' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleTypeChange('reps')}
            className="flex-1"
          >
            <Repeat className="w-4 h-4 mr-1" />
            Reps
          </Button>
          <Button
            type="button"
            variant={type === 'timed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleTypeChange('timed')}
            className="flex-1"
          >
            <Timer className="w-4 h-4 mr-1" />
            Timed
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-muted-foreground text-sm">Sets</Label>
          <Button type="button" variant="ghost" size="sm" onClick={addSet}>
            <Plus className="w-4 h-4 mr-1" />
            Add Set
          </Button>
        </div>

        {sets.map((set, index) => (
          <div key={index} className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-200">
            <span className="text-xs text-muted-foreground w-6">#{index + 1}</span>
            
            {type === 'reps' ? (
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
        <Label htmlFor="notes" className="text-muted-foreground text-sm">Notes (optional)</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any notes about this exercise..."
          className="mt-1 bg-secondary border-border resize-none h-16"
        />
      </div>

      <Button 
        type="submit" 
        className="w-full"
        disabled={!name}
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Exercise
      </Button>
    </form>
  );
}
