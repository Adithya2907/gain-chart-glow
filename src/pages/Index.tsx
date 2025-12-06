import { useState } from 'react';
import { Navigation, TabType } from '@/components/Navigation';
import { TodayView } from '@/components/TodayView';
import { CalendarView } from '@/components/CalendarView';
import { ProgressView } from '@/components/ProgressView';
import { ExercisesListView } from '@/components/ExercisesListView';
import { ExerciseHistoryModal } from '@/components/ExerciseHistoryModal';
import { SettingsModal } from '@/components/SettingsModal';
import { WorkoutTemplatesModal } from '@/components/WorkoutTemplatesModal';
import { GoalsModal } from '@/components/GoalsModal';
import { useWorkouts } from '@/hooks/useWorkouts';
import { Dumbbell, Settings, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabType>('today');
  const [historyExercise, setHistoryExercise] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [goalsOpen, setGoalsOpen] = useState(false);
  
  const { 
    workouts,
    getTodayWorkout, 
    addExercise, 
    removeExercise,
    updateExercise,
    getAllExerciseNames,
    getExerciseHistory,
    updateWorkoutDayNotes,
    exportData,
    importData,
    measurements,
    addMeasurement,
    updateMeasurement,
    deleteMeasurement,
    templates,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    getTemplates,
    loadTemplateToDay,
    goals,
    addGoal,
    updateGoal,
    deleteGoal,
    getGoals,
    getGoalsForExercise,
    checkAndUpdateGoals,
  } = useWorkouts();

  const handleViewHistory = (exerciseName: string) => {
    setHistoryExercise(exerciseName);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xl font-bold">GymTrack</span>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setGoalsOpen(true)}
              className="h-10 w-10"
            >
              <Target className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSettingsOpen(true)}
              className="h-10 w-10"
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {activeTab === 'today' && (
          <TodayView
            todayWorkout={getTodayWorkout()}
            onAddExercise={addExercise}
            onRemoveExercise={removeExercise}
            onUpdateExercise={updateExercise}
            onViewHistory={handleViewHistory}
            suggestions={getAllExerciseNames()}
            onOpenTemplates={() => setTemplatesOpen(true)}
          />
        )}

        {activeTab === 'calendar' && (
          <CalendarView
            workouts={workouts}
            onViewHistory={handleViewHistory}
            onUpdateDayNotes={updateWorkoutDayNotes}
            onUpdateExercise={updateExercise}
            goals={goals}
          />
        )}

        {activeTab === 'exercises' && (
          <ExercisesListView
            exerciseNames={getAllExerciseNames()}
            getExerciseHistory={getExerciseHistory}
            onViewHistory={handleViewHistory}
          />
        )}

        {activeTab === 'progress' && (
          <ProgressView
            exerciseNames={getAllExerciseNames()}
            getExerciseHistory={getExerciseHistory}
            goals={goals}
          />
        )}
      </div>

      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

      <ExerciseHistoryModal
        exerciseName={historyExercise}
        history={historyExercise ? getExerciseHistory(historyExercise) : []}
        onClose={() => setHistoryExercise(null)}
      />

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onExport={exportData}
        onImport={importData}
        measurements={measurements}
        onAddMeasurement={addMeasurement}
        onUpdateMeasurement={updateMeasurement}
        onDeleteMeasurement={deleteMeasurement}
      />

      <WorkoutTemplatesModal
        open={templatesOpen}
        onClose={() => setTemplatesOpen(false)}
        templates={templates}
        onAddTemplate={addTemplate}
        onUpdateTemplate={updateTemplate}
        onDeleteTemplate={deleteTemplate}
        onLoadTemplate={loadTemplateToDay}
      />

      <GoalsModal
        open={goalsOpen}
        onClose={() => {
          setGoalsOpen(false);
          checkAndUpdateGoals();
        }}
        goals={goals}
        exerciseNames={getAllExerciseNames()}
        onAddGoal={addGoal}
        onUpdateGoal={updateGoal}
        onDeleteGoal={deleteGoal}
      />
    </div>
  );
};

export default Index;
