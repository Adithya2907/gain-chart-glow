import { useMemo } from 'react';
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Exercise } from '@/types/workout';
import { Calendar, TrendingUp, Weight, Timer } from 'lucide-react';

interface ExerciseHistoryModalProps {
  exerciseName: string | null;
  history: {
    date: string;
    exercises: Exercise[];
  }[];
  onClose: () => void;
}

export function ExerciseHistoryModal({ exerciseName, history, onClose }: ExerciseHistoryModalProps) {
  const chartData = useMemo(() => {
    return history.map(day => {
      const exercise = day.exercises[0];
      let maxWeight = 0;
      let totalVolume = 0;
      let totalReps = 0;
      let totalDuration = 0;

      day.exercises.forEach(ex => {
        ex.sets.forEach(set => {
          if (set.weight && set.weight > maxWeight) maxWeight = set.weight;
          if (set.weight && set.reps) totalVolume += set.weight * set.reps;
          if (set.reps) totalReps += set.reps;
          if (set.duration) totalDuration += set.duration;
        });
      });

      return {
        date: format(new Date(day.date), 'MMM d'),
        fullDate: day.date,
        maxWeight,
        volume: totalVolume,
        reps: totalReps,
        duration: totalDuration,
        type: exercise?.type,
      };
    });
  }, [history]);

  const isTimedExercise = chartData.length > 0 && chartData[0].type === 'timed';

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const stats = useMemo(() => {
    if (chartData.length === 0) return null;

    if (isTimedExercise) {
      const durations = chartData.map(d => d.duration);
      return {
        maxDuration: Math.max(...durations),
        latestDuration: durations[durations.length - 1],
        totalSessions: chartData.length,
      };
    } else {
      const weights = chartData.filter(d => d.maxWeight > 0).map(d => d.maxWeight);
      return {
        maxWeight: weights.length > 0 ? Math.max(...weights) : 0,
        latestWeight: weights.length > 0 ? weights[weights.length - 1] : 0,
        totalSessions: chartData.length,
      };
    }
  }, [chartData, isTimedExercise]);

  return (
    <Dialog open={!!exerciseName} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-lg max-h-[85vh] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl">{exerciseName} History</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-6">
            {stats && (
              <div className="grid grid-cols-3 gap-3">
                {isTimedExercise ? (
                  <>
                    <div className="bg-secondary rounded-xl p-3 text-center">
                      <Timer className="w-4 h-4 text-primary mx-auto" />
                      <p className="text-lg font-bold mt-1">{formatDuration(stats.maxDuration || 0)}</p>
                      <p className="text-xs text-muted-foreground">Best Time</p>
                    </div>
                    <div className="bg-secondary rounded-xl p-3 text-center">
                      <TrendingUp className="w-4 h-4 text-primary mx-auto" />
                      <p className="text-lg font-bold mt-1">{formatDuration(stats.latestDuration || 0)}</p>
                      <p className="text-xs text-muted-foreground">Latest</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-secondary rounded-xl p-3 text-center">
                      <Weight className="w-4 h-4 text-primary mx-auto" />
                      <p className="text-lg font-bold mt-1">{stats.maxWeight}</p>
                      <p className="text-xs text-muted-foreground">Max (kg)</p>
                    </div>
                    <div className="bg-secondary rounded-xl p-3 text-center">
                      <TrendingUp className="w-4 h-4 text-primary mx-auto" />
                      <p className="text-lg font-bold mt-1">{stats.latestWeight}</p>
                      <p className="text-xs text-muted-foreground">Latest (kg)</p>
                    </div>
                  </>
                )}
                <div className="bg-secondary rounded-xl p-3 text-center">
                  <Calendar className="w-4 h-4 text-primary mx-auto" />
                  <p className="text-lg font-bold mt-1">{stats.totalSessions}</p>
                  <p className="text-xs text-muted-foreground">Sessions</p>
                </div>
              </div>
            )}

            {chartData.length > 1 && (
              <div className="bg-secondary rounded-xl p-4">
                <h3 className="font-semibold mb-3 text-sm">
                  {isTimedExercise ? 'Duration Progress' : 'Weight Progress'}
                </h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="date" 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={11}
                        tickLine={false}
                      />
                      <YAxis 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          color: 'hsl(var(--foreground))',
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey={isTimedExercise ? 'duration' : 'maxWeight'}
                        name={isTimedExercise ? 'Duration (s)' : 'Weight (kg)'}
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={{ fill: 'hsl(var(--primary))', strokeWidth: 0, r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-muted-foreground">Session History</h3>
              {history.slice().reverse().map(day => (
                <div key={day.date} className="bg-secondary rounded-xl p-3">
                  <p className="text-sm font-medium mb-2">
                    {format(new Date(day.date), 'EEEE, MMM d, yyyy')}
                  </p>
                  {day.exercises.map((exercise, idx) => (
                    <div key={idx} className="space-y-1 text-sm">
                      {exercise.sets.map((set, setIdx) => (
                        <div key={setIdx} className="flex items-center gap-2 text-muted-foreground">
                          <span className="w-12">Set {setIdx + 1}:</span>
                          {exercise.type === 'reps' ? (
                            <span>{set.weight ? `${set.weight}kg × ` : ''}{set.reps} reps</span>
                          ) : (
                            <span>{formatDuration(set.duration || 0)}</span>
                          )}
                        </div>
                      ))}
                      {exercise.notes && (
                        <p className="text-xs text-muted-foreground/60 italic mt-1">
                          {exercise.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
