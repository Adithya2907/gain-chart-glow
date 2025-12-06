import { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, Calendar, Weight } from 'lucide-react';

interface ProgressViewProps {
  exerciseNames: string[];
  getExerciseHistory: (name: string) => {
    date: string;
    exercises: { sets: number; reps: number; weight?: number }[];
  }[];
}

export function ProgressView({ exerciseNames, getExerciseHistory }: ProgressViewProps) {
  const [selectedExercise, setSelectedExercise] = useState<string>('');

  const chartData = useMemo(() => {
    if (!selectedExercise) return [];
    
    const history = getExerciseHistory(selectedExercise);
    return history.map(day => {
      const avgWeight = day.exercises.reduce((sum, e) => sum + (e.weight || 0), 0) / day.exercises.length;
      const totalVolume = day.exercises.reduce((sum, e) => sum + (e.sets * e.reps * (e.weight || 1)), 0);
      const totalReps = day.exercises.reduce((sum, e) => sum + (e.sets * e.reps), 0);
      
      return {
        date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        fullDate: day.date,
        weight: avgWeight || undefined,
        volume: totalVolume,
        reps: totalReps,
      };
    });
  }, [selectedExercise, getExerciseHistory]);

  const stats = useMemo(() => {
    if (chartData.length === 0) return null;
    
    const weights = chartData.filter(d => d.weight).map(d => d.weight!);
    const maxWeight = weights.length > 0 ? Math.max(...weights) : 0;
    const latestWeight = weights.length > 0 ? weights[weights.length - 1] : 0;
    const totalSessions = chartData.length;
    
    return { maxWeight, latestWeight, totalSessions };
  }, [chartData]);

  if (exerciseNames.length === 0) {
    return (
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-bold">Progress</h1>
          <p className="text-muted-foreground mt-1">Track your gains over time</p>
        </header>
        <div className="text-center py-16">
          <TrendingUp className="w-12 h-12 text-muted-foreground/40 mx-auto" />
          <p className="text-muted-foreground mt-4">No exercises logged yet.</p>
          <p className="text-muted-foreground/60 text-sm mt-1">Start tracking your workouts to see progress!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Progress</h1>
        <p className="text-muted-foreground mt-1">Track your gains over time</p>
      </header>

      <div className="glass-card rounded-xl p-4">
        <label className="text-sm text-muted-foreground">Select Exercise</label>
        <Select value={selectedExercise} onValueChange={setSelectedExercise}>
          <SelectTrigger className="mt-2 bg-secondary border-border">
            <SelectValue placeholder="Choose an exercise" />
          </SelectTrigger>
          <SelectContent>
            {exerciseNames.map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedExercise && chartData.length > 0 && (
        <>
          <div className="grid grid-cols-3 gap-3">
            <div className="glass-card rounded-xl p-4 text-center">
              <Weight className="w-5 h-5 text-primary mx-auto" />
              <p className="text-2xl font-bold mt-2">{stats?.maxWeight || 0}</p>
              <p className="text-xs text-muted-foreground">Max Weight (kg)</p>
            </div>
            <div className="glass-card rounded-xl p-4 text-center">
              <TrendingUp className="w-5 h-5 text-primary mx-auto" />
              <p className="text-2xl font-bold mt-2">{stats?.latestWeight || 0}</p>
              <p className="text-xs text-muted-foreground">Latest (kg)</p>
            </div>
            <div className="glass-card rounded-xl p-4 text-center">
              <Calendar className="w-5 h-5 text-primary mx-auto" />
              <p className="text-2xl font-bold mt-2">{stats?.totalSessions || 0}</p>
              <p className="text-xs text-muted-foreground">Sessions</p>
            </div>
          </div>

          <div className="glass-card rounded-xl p-4">
            <h3 className="font-semibold mb-4">Weight Progress</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
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
                    labelStyle={{ color: 'hsl(var(--muted-foreground))' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 0, r: 4 }}
                    activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-card rounded-xl p-4">
            <h3 className="font-semibold mb-4">Volume Progress</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
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
                    labelStyle={{ color: 'hsl(var(--muted-foreground))' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="volume"
                    name="Volume (sets × reps × weight)"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--chart-2))', strokeWidth: 0, r: 4 }}
                    activeDot={{ r: 6, fill: 'hsl(var(--chart-2))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {selectedExercise && chartData.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No data for this exercise yet.</p>
        </div>
      )}
    </div>
  );
}
