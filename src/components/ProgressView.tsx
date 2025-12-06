import { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, Calendar, Weight, Timer, Target } from 'lucide-react';
import { Exercise, Goal } from '@/types/workout';
import { format } from 'date-fns';

interface ProgressViewProps {
  exerciseNames: string[];
  getExerciseHistory: (name: string) => {
    date: string;
    exercises: Exercise[];
  }[];
  goals?: Goal[];
}

export function ProgressView({ exerciseNames, getExerciseHistory, goals = [] }: ProgressViewProps) {
  const [selectedExercise, setSelectedExercise] = useState<string>('');
  
  const exerciseGoals = useMemo(() => {
    if (!selectedExercise) return [];
    return goals.filter(
      (g) => g.exerciseName.toLowerCase() === selectedExercise.toLowerCase() && !g.achieved
    );
  }, [selectedExercise, goals]);

  const chartData = useMemo<{
    date: string;
    fullDate: string;
    maxWeight: number;
    volume: number;
    reps: number;
    duration: number;
    type: 'reps' | 'timed';
  }[]>(() => {
    if (!selectedExercise) return [];
    
    const history = getExerciseHistory(selectedExercise);
    return history.map(day => {
      let maxWeight = 0;
      let totalVolume = 0;
      let totalReps = 0;
      let totalDuration = 0;
      let exerciseType: 'reps' | 'timed' = 'reps';

      day.exercises.forEach(ex => {
        exerciseType = ex.type;
        ex.sets.forEach(set => {
          if (set.weight && set.weight > maxWeight) maxWeight = set.weight;
          if (set.weight && set.reps) totalVolume += set.weight * set.reps;
          if (set.reps) totalReps += set.reps;
          if (set.duration) totalDuration += set.duration;
        });
      });
      
      return {
        date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        fullDate: day.date,
        maxWeight,
        volume: totalVolume,
        reps: totalReps,
        duration: totalDuration,
        type: exerciseType,
      };
    });
  }, [selectedExercise, getExerciseHistory]);

  const isTimedExercise = chartData.length > 0 && chartData[0].type === 'timed';

  // Create projection data for goals
  const goalProjectionData = useMemo(() => {
    if (chartData.length === 0 || exerciseGoals.length === 0) return [];

    const projections: Array<{ date: string; fullDate: string; value: number; goalId: string }> = [];

    exerciseGoals.forEach((goal) => {
      if (isTimedExercise && goal.type !== 'duration') return;
      if (!isTimedExercise && goal.type !== 'weight') return;

      const latestDataPoint = chartData[chartData.length - 1];
      const latestValue = isTimedExercise ? latestDataPoint.duration : latestDataPoint.maxWeight;
      
      if (latestValue === 0 || latestValue === undefined) return;

      const goalDate = new Date(goal.targetDate);
      const latestDate = new Date(latestDataPoint.fullDate);
      const daysDiff = Math.ceil((goalDate.getTime() - latestDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff <= 0) return; // Goal date is in the past or today

      // Create projection points: current value to goal value over time
      const valueDiff = goal.targetValue - latestValue;
      const projectionPoints = Math.min(daysDiff, 30); // Show up to 30 days of projection

      for (let i = 1; i <= projectionPoints; i++) {
        const projectionDate = new Date(latestDate);
        projectionDate.setDate(projectionDate.getDate() + i);
        
        // Linear interpolation from current to goal
        const progress = i / daysDiff;
        const projectedValue = latestValue + (valueDiff * progress);

        projections.push({
          date: format(projectionDate, 'MMM d'),
          fullDate: format(projectionDate, 'yyyy-MM-dd'),
          value: projectedValue,
          goalId: goal.id,
        });
      }
    });

    return projections;
  }, [chartData, exerciseGoals, isTimedExercise]);

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
            {isTimedExercise ? (
              <>
                <div className="glass-card rounded-xl p-4 text-center">
                  <Timer className="w-5 h-5 text-primary mx-auto" />
                  <p className="text-2xl font-bold mt-2">{formatDuration(stats?.maxDuration || 0)}</p>
                  <p className="text-xs text-muted-foreground">Best Time</p>
                </div>
                <div className="glass-card rounded-xl p-4 text-center">
                  <TrendingUp className="w-5 h-5 text-primary mx-auto" />
                  <p className="text-2xl font-bold mt-2">{formatDuration(stats?.latestDuration || 0)}</p>
                  <p className="text-xs text-muted-foreground">Latest</p>
                </div>
              </>
            ) : (
              <>
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
              </>
            )}
            <div className="glass-card rounded-xl p-4 text-center">
              <Calendar className="w-5 h-5 text-primary mx-auto" />
              <p className="text-2xl font-bold mt-2">{stats?.totalSessions || 0}</p>
              <p className="text-xs text-muted-foreground">Sessions</p>
            </div>
          </div>

          {exerciseGoals.length > 0 && (
            <div className="glass-card rounded-xl p-3 bg-orange-500/10 border-orange-500/20">
              <div className="flex items-start gap-2">
                <Target className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-sm mb-1">Active Goals</h3>
                  {exerciseGoals.map((goal) => {
                    const formatGoalValue = () => {
                      if (goal.type === 'weight') {
                        return `${goal.targetValue} kg`;
                      } else if (goal.type === 'reps') {
                        return `${goal.targetValue} reps`;
                      } else {
                        const mins = Math.floor(goal.targetValue / 60);
                        const secs = goal.targetValue % 60;
                        return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
                      }
                    };
                    return (
                      <p key={goal.id} className="text-xs text-muted-foreground">
                        {formatGoalValue()} by {new Date(goal.targetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          <div className="glass-card rounded-xl p-4">
            <h3 className="font-semibold mb-4">
              {isTimedExercise ? 'Duration Progress' : 'Weight Progress'}
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 0 }}>
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
                  {exerciseGoals.map((goal) => {
                    if (isTimedExercise && goal.type !== 'duration') return null;
                    if (!isTimedExercise && goal.type !== 'weight') return null;
                    const formatGoalLabel = () => {
                      if (goal.type === 'weight') {
                        return `Goal: ${goal.targetValue}kg`;
                      } else {
                        const mins = Math.floor(goal.targetValue / 60);
                        const secs = goal.targetValue % 60;
                        return `Goal: ${mins > 0 ? `${mins}m ${secs}s` : `${secs}s`}`;
                      }
                    };
                    return (
                      <ReferenceLine
                        key={goal.id}
                        y={goal.targetValue}
                        stroke="hsl(25, 95%, 53%)"
                        strokeDasharray="5 5"
                        strokeWidth={2}
                        label={{
                          value: formatGoalLabel(),
                          position: 'right',
                          fill: 'hsl(25, 95%, 53%)',
                          fontSize: 10,
                        }}
                      />
                    );
                  })}
                  <Line
                    type="monotone"
                    dataKey={isTimedExercise ? 'duration' : 'maxWeight'}
                    name={isTimedExercise ? 'Duration (s)' : 'Weight (kg)'}
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 0, r: 4 }}
                    activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
                  />
                  {goalProjectionData.length > 0 && exerciseGoals.map((goal) => {
                    if (isTimedExercise && goal.type !== 'duration') return null;
                    if (!isTimedExercise && goal.type !== 'weight') return null;
                    
                    const goalProjections = goalProjectionData.filter(p => p.goalId === goal.id);
                    if (goalProjections.length === 0) return null;

                    const lastActual = chartData[chartData.length - 1];
                    const lastValue = isTimedExercise ? lastActual.duration : lastActual.maxWeight;
                    
                    // Create projection data points starting from last actual point
                    const projectionData = [
                      {
                        date: lastActual.date,
                        fullDate: lastActual.fullDate,
                        [isTimedExercise ? 'duration' : 'maxWeight']: lastValue,
                      },
                      ...goalProjections.map(p => ({
                        date: p.date,
                        fullDate: p.fullDate,
                        [isTimedExercise ? 'duration' : 'maxWeight']: p.value,
                      })),
                    ];

                    return (
                      <Line
                        key={`projection-${goal.id}`}
                        type="monotone"
                        dataKey={isTimedExercise ? 'duration' : 'maxWeight'}
                        data={projectionData}
                        stroke="hsl(25, 95%, 53%)"
                        strokeDasharray="8 4"
                        strokeWidth={1.5}
                        dot={false}
                        connectNulls={true}
                        strokeOpacity={0.6}
                        isAnimationActive={false}
                      />
                    );
                  })}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {!isTimedExercise && (
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
          )}
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
