import { useState } from 'react';
import { Navigation, TabType } from '@/components/Navigation';
import { TodayView } from '@/components/TodayView';
import { CalendarView } from '@/components/CalendarView';
import { ProgressView } from '@/components/ProgressView';
import { ExerciseHistoryModal } from '@/components/ExerciseHistoryModal';
import { useWorkouts } from '@/hooks/useWorkouts';
import { Dumbbell } from 'lucide-react';

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabType>('today');
  const [historyExercise, setHistoryExercise] = useState<string | null>(null);
  
  const { 
    workouts,
    getTodayWorkout, 
    addExercise, 
    removeExercise, 
    getAllExerciseNames,
    getExerciseHistory 
  } = useWorkouts();

  const handleViewHistory = (exerciseName: string) => {
    setHistoryExercise(exerciseName);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Dumbbell className="w-5 h-5 text-primary" />
          </div>
          <span className="text-xl font-bold">GymTrack</span>
        </div>

        {activeTab === 'today' && (
          <TodayView
            todayWorkout={getTodayWorkout()}
            onAddExercise={addExercise}
            onRemoveExercise={removeExercise}
            onViewHistory={handleViewHistory}
            suggestions={getAllExerciseNames()}
          />
        )}

        {activeTab === 'calendar' && (
          <CalendarView
            workouts={workouts}
            onViewHistory={handleViewHistory}
          />
        )}

        {activeTab === 'progress' && (
          <ProgressView
            exerciseNames={getAllExerciseNames()}
            getExerciseHistory={getExerciseHistory}
          />
        )}
      </div>

      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

      <ExerciseHistoryModal
        exerciseName={historyExercise}
        history={historyExercise ? getExerciseHistory(historyExercise) : []}
        onClose={() => setHistoryExercise(null)}
      />
    </div>
  );
};

export default Index;
