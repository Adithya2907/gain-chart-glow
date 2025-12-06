import { useState } from 'react';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { BodyMeasurement } from '@/types/workout';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface BodyMeasurementsFormProps {
  measurement?: BodyMeasurement;
  onSubmit: (measurement: Omit<BodyMeasurement, 'id'>) => void;
  onCancel: () => void;
}

export function BodyMeasurementsForm({ measurement, onSubmit, onCancel }: BodyMeasurementsFormProps) {
  const [date, setDate] = useState<Date | undefined>(
    measurement ? new Date(measurement.date) : new Date()
  );
  const [weight, setWeight] = useState<string>(measurement?.weight?.toString() || '');
  const [bodyFat, setBodyFat] = useState<string>(measurement?.bodyFat?.toString() || '');
  const [chest, setChest] = useState<string>(measurement?.chest?.toString() || '');
  const [waist, setWaist] = useState<string>(measurement?.waist?.toString() || '');
  const [hips, setHips] = useState<string>(measurement?.hips?.toString() || '');
  const [biceps, setBiceps] = useState<string>(measurement?.biceps?.toString() || '');
  const [thighs, setThighs] = useState<string>(measurement?.thighs?.toString() || '');
  const [notes, setNotes] = useState<string>(measurement?.notes || '');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return;

    onSubmit({
      date: format(date, 'yyyy-MM-dd'),
      weight: weight ? parseFloat(weight) : undefined,
      bodyFat: bodyFat ? parseFloat(bodyFat) : undefined,
      chest: chest ? parseFloat(chest) : undefined,
      waist: waist ? parseFloat(waist) : undefined,
      hips: hips ? parseFloat(hips) : undefined,
      biceps: biceps ? parseFloat(biceps) : undefined,
      thighs: thighs ? parseFloat(thighs) : undefined,
      notes: notes.trim() || undefined,
    });
  };

  const hasAnyValue = weight || bodyFat || chest || waist || hips || biceps || thighs || notes;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label className="text-muted-foreground text-sm">Date</Label>
        <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className={cn(
                "w-full mt-1 justify-start text-left font-normal bg-secondary border-border",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, 'MMM d, yyyy') : 'Select date'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(selectedDate) => {
                setDate(selectedDate);
                setIsDatePickerOpen(false);
              }}
              disabled={(date) => date > new Date()}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="weight" className="text-muted-foreground text-sm">Weight (kg)</Label>
          <Input
            id="weight"
            type="number"
            step="0.1"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="kg"
            className="mt-1 bg-secondary border-border"
          />
        </div>
        <div>
          <Label htmlFor="bodyFat" className="text-muted-foreground text-sm">Body Fat (%)</Label>
          <Input
            id="bodyFat"
            type="number"
            step="0.1"
            value={bodyFat}
            onChange={(e) => setBodyFat(e.target.value)}
            placeholder="%"
            className="mt-1 bg-secondary border-border"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="chest" className="text-muted-foreground text-sm">Chest (cm)</Label>
          <Input
            id="chest"
            type="number"
            step="0.1"
            value={chest}
            onChange={(e) => setChest(e.target.value)}
            placeholder="cm"
            className="mt-1 bg-secondary border-border"
          />
        </div>
        <div>
          <Label htmlFor="waist" className="text-muted-foreground text-sm">Waist (cm)</Label>
          <Input
            id="waist"
            type="number"
            step="0.1"
            value={waist}
            onChange={(e) => setWaist(e.target.value)}
            placeholder="cm"
            className="mt-1 bg-secondary border-border"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="hips" className="text-muted-foreground text-sm">Hips (cm)</Label>
          <Input
            id="hips"
            type="number"
            step="0.1"
            value={hips}
            onChange={(e) => setHips(e.target.value)}
            placeholder="cm"
            className="mt-1 bg-secondary border-border"
          />
        </div>
        <div>
          <Label htmlFor="biceps" className="text-muted-foreground text-sm">Biceps (cm)</Label>
          <Input
            id="biceps"
            type="number"
            step="0.1"
            value={biceps}
            onChange={(e) => setBiceps(e.target.value)}
            placeholder="cm"
            className="mt-1 bg-secondary border-border"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="thighs" className="text-muted-foreground text-sm">Thighs (cm)</Label>
        <Input
          id="thighs"
          type="number"
          step="0.1"
          value={thighs}
          onChange={(e) => setThighs(e.target.value)}
          placeholder="cm"
          className="mt-1 bg-secondary border-border"
        />
      </div>

      <div>
        <Label htmlFor="notes" className="text-muted-foreground text-sm">Notes (optional)</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any additional notes..."
          className="mt-1 bg-secondary border-border resize-none h-16"
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" className="flex-1" disabled={!date || !hasAnyValue}>
          {measurement ? 'Update' : 'Add'} Measurement
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

