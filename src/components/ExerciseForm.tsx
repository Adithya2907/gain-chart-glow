import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface ExerciseFormProps {
  onSubmit: (exercise: {
    name: string;
    sets: number;
    reps: number;
    weight?: number;
    notes?: string;
  }) => void;
  suggestions: string[];
}

export function ExerciseForm({ onSubmit, suggestions }: ExerciseFormProps) {
  const [name, setName] = useState('');
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');
  const [notes, setNotes] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredSuggestions = suggestions.filter(s =>
    s.toLowerCase().includes(name.toLowerCase()) && name.length > 0
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !sets || !reps) return;

    onSubmit({
      name: name.trim(),
      sets: parseInt(sets),
      reps: parseInt(reps),
      weight: weight ? parseFloat(weight) : undefined,
      notes: notes.trim() || undefined,
    });

    setName('');
    setSets('');
    setReps('');
    setWeight('');
    setNotes('');
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card rounded-xl p-4 space-y-4">
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

      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label htmlFor="sets" className="text-muted-foreground text-sm">Sets</Label>
          <Input
            id="sets"
            type="number"
            min="1"
            value={sets}
            onChange={(e) => setSets(e.target.value)}
            placeholder="3"
            className="mt-1 bg-secondary border-border"
          />
        </div>
        <div>
          <Label htmlFor="reps" className="text-muted-foreground text-sm">Reps</Label>
          <Input
            id="reps"
            type="number"
            min="1"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            placeholder="10"
            className="mt-1 bg-secondary border-border"
          />
        </div>
        <div>
          <Label htmlFor="weight" className="text-muted-foreground text-sm">Weight (kg)</Label>
          <Input
            id="weight"
            type="number"
            min="0"
            step="0.5"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="50"
            className="mt-1 bg-secondary border-border"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="notes" className="text-muted-foreground text-sm">Notes (optional)</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any notes about this exercise..."
          className="mt-1 bg-secondary border-border resize-none h-20"
        />
      </div>

      <Button 
        type="submit" 
        className="w-full"
        disabled={!name || !sets || !reps}
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Exercise
      </Button>
    </form>
  );
}
