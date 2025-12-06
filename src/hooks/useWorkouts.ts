import { useState, useEffect } from "react";
import { WorkoutDay, Exercise, SetEntry, BodyMeasurement, WorkoutTemplate, Goal } from "@/types/workout";

const STORAGE_KEY = "gym-tracker-workouts-v2";
const MEASUREMENTS_STORAGE_KEY = "gym-tracker-measurements-v1";
const TEMPLATES_STORAGE_KEY = "gym-tracker-templates-v1";
const GOALS_STORAGE_KEY = "gym-tracker-goals-v1";

export function useWorkouts() {
  const [workouts, setWorkouts] = useState<WorkoutDay[]>([]);
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([]);
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setWorkouts(JSON.parse(stored));
    }

    const storedMeasurements = localStorage.getItem(MEASUREMENTS_STORAGE_KEY);
    if (storedMeasurements) {
      setMeasurements(JSON.parse(storedMeasurements));
    }

    const storedTemplates = localStorage.getItem(TEMPLATES_STORAGE_KEY);
    if (storedTemplates) {
      setTemplates(JSON.parse(storedTemplates));
    }

    const storedGoals = localStorage.getItem(GOALS_STORAGE_KEY);
    if (storedGoals) {
      setGoals(JSON.parse(storedGoals));
    }
  }, []);

  const saveWorkouts = (newWorkouts: WorkoutDay[]) => {
    setWorkouts(newWorkouts);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newWorkouts));
  };

  const saveMeasurements = (newMeasurements: BodyMeasurement[]) => {
    setMeasurements(newMeasurements);
    localStorage.setItem(MEASUREMENTS_STORAGE_KEY, JSON.stringify(newMeasurements));
  };

  const saveTemplates = (newTemplates: WorkoutTemplate[]) => {
    setTemplates(newTemplates);
    localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(newTemplates));
  };

  const saveGoals = (newGoals: Goal[]) => {
    setGoals(newGoals);
    localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(newGoals));
  };

  const getDateString = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  const getTodayDate = () => getDateString(new Date());

  const getWorkoutByDate = (date: string): WorkoutDay | undefined => {
    return workouts.find((w) => w.date === date);
  };

  const getTodayWorkout = (): WorkoutDay | undefined => {
    return getWorkoutByDate(getTodayDate());
  };

  const addExercise = (
    exercise: Omit<Exercise, "id" | "order">,
    date?: string
  ) => {
    const targetDate = date || getTodayDate();
    const existingWorkout = workouts.find((w) => w.date === targetDate);
    const currentOrder = existingWorkout?.exercises.length || 0;

    const newExercise: Exercise = {
      ...exercise,
      id: crypto.randomUUID(),
      order: currentOrder,
    };

    if (existingWorkout) {
      const updatedWorkouts = workouts.map((w) =>
        w.date === targetDate
          ? { ...w, exercises: [...w.exercises, newExercise] }
          : w
      );
      saveWorkouts(updatedWorkouts);
    } else {
      saveWorkouts([
        ...workouts,
        { date: targetDate, exercises: [newExercise] },
      ]);
    }
  };

  const removeExercise = (exerciseId: string, date?: string) => {
    const targetDate = date || getTodayDate();
    const updatedWorkouts = workouts
      .map((w) =>
        w.date === targetDate
          ? { ...w, exercises: w.exercises.filter((e) => e.id !== exerciseId) }
          : w
      )
      .filter((w) => w.exercises.length > 0);

    saveWorkouts(updatedWorkouts);
  };

  const updateExercise = (
    exerciseId: string,
    updates: Partial<Exercise>,
    date?: string
  ) => {
    const targetDate = date || getTodayDate();
    const updatedWorkouts = workouts.map((w) =>
      w.date === targetDate
        ? {
            ...w,
            exercises: w.exercises.map((e) =>
              e.id === exerciseId ? { ...e, ...updates } : e
            ),
          }
        : w
    );
    saveWorkouts(updatedWorkouts);
  };

  const getAllExerciseNames = (): string[] => {
    const names = new Set<string>();
    workouts.forEach((w) => {
      w.exercises.forEach((e) => names.add(e.name));
    });
    return Array.from(names).sort();
  };

  const getExerciseHistory = (exerciseName: string) => {
    return workouts
      .filter((w) =>
        w.exercises.some(
          (e) => e.name.toLowerCase() === exerciseName.toLowerCase()
        )
      )
      .map((w) => ({
        date: w.date,
        exercises: w.exercises.filter(
          (e) => e.name.toLowerCase() === exerciseName.toLowerCase()
        ),
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const getDaysWithWorkouts = (): string[] => {
    return workouts.map((w) => w.date);
  };

  const updateWorkoutDayNotes = (date: string, notes: string) => {
    const existingWorkout = workouts.find((w) => w.date === date);
    
    if (existingWorkout) {
      const updatedWorkouts = workouts.map((w) =>
        w.date === date ? { ...w, notes: notes.trim() || undefined } : w
      );
      saveWorkouts(updatedWorkouts);
    } else {
      // Create a new workout day with just notes
      saveWorkouts([
        ...workouts,
        { date, exercises: [], notes: notes.trim() || undefined },
      ]);
    }
  };

  const addMeasurement = (measurement: Omit<BodyMeasurement, "id">) => {
    const newMeasurement: BodyMeasurement = {
      ...measurement,
      id: crypto.randomUUID(),
    };
    const updated = [...measurements, newMeasurement].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    saveMeasurements(updated);
  };

  const updateMeasurement = (id: string, measurement: Partial<BodyMeasurement>) => {
    const updated = measurements.map((m) =>
      m.id === id ? { ...m, ...measurement } : m
    );
    saveMeasurements(updated);
  };

  const deleteMeasurement = (id: string) => {
    const updated = measurements.filter((m) => m.id !== id);
    saveMeasurements(updated);
  };

  const getMeasurements = (): BodyMeasurement[] => {
    return [...measurements].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  };

  // Workout Templates
  const addTemplate = (template: Omit<WorkoutTemplate, "id">) => {
    const newTemplate: WorkoutTemplate = {
      ...template,
      id: crypto.randomUUID(),
    };
    saveTemplates([...templates, newTemplate]);
  };

  const updateTemplate = (id: string, template: Partial<WorkoutTemplate>) => {
    const updated = templates.map((t) =>
      t.id === id ? { ...t, ...template } : t
    );
    saveTemplates(updated);
  };

  const deleteTemplate = (id: string) => {
    const updated = templates.filter((t) => t.id !== id);
    saveTemplates(updated);
  };

  const getTemplates = (): WorkoutTemplate[] => {
    return [...templates];
  };

  const loadTemplateToDay = (templateId: string, date: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (!template) return;

    const existingWorkout = workouts.find((w) => w.date === date);
    const currentOrder = existingWorkout?.exercises.length || 0;

    const newExercises: Exercise[] = template.exercises.map((ex, idx) => ({
      id: crypto.randomUUID(),
      name: ex.name,
      type: ex.type,
      sets: ex.sets.map((set) => ({
        reps: set.reps,
        weight: set.weight,
        duration: set.duration,
      })),
      notes: ex.notes,
      order: currentOrder + idx,
    }));

    if (existingWorkout) {
      const updatedWorkouts = workouts.map((w) =>
        w.date === date
          ? { ...w, exercises: [...w.exercises, ...newExercises] }
          : w
      );
      saveWorkouts(updatedWorkouts);
    } else {
      saveWorkouts([
        ...workouts,
        { date, exercises: newExercises, notes: template.notes },
      ]);
    }
  };

  // Goals
  const addGoal = (goal: Omit<Goal, "id">) => {
    const newGoal: Goal = {
      ...goal,
      id: crypto.randomUUID(),
      achieved: false,
    };
    saveGoals([...goals, newGoal]);
  };

  const updateGoal = (id: string, goal: Partial<Goal>) => {
    const updated = goals.map((g) =>
      g.id === id ? { ...g, ...goal } : g
    );
    saveGoals(updated);
  };

  const deleteGoal = (id: string) => {
    const updated = goals.filter((g) => g.id !== id);
    saveGoals(updated);
  };

  const getGoals = (): Goal[] => {
    return [...goals].sort(
      (a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime()
    );
  };

  const getGoalsForExercise = (exerciseName: string): Goal[] => {
    return goals.filter(
      (g) => g.exerciseName.toLowerCase() === exerciseName.toLowerCase() && !g.achieved
    );
  };

  const checkAndUpdateGoals = () => {
    const today = getTodayDate();
    const updatedGoals = goals.map((goal) => {
      if (goal.achieved) return goal;

      const history = getExerciseHistory(goal.exerciseName);
      if (history.length === 0) return goal;

      // Check if goal is achieved
      const latest = history[history.length - 1];
      let achieved = false;

      if (goal.type === 'weight') {
        const maxWeight = latest.exercises.reduce((max, ex) => {
          const exerciseMax = ex.sets.reduce((m, set) => {
            return set.weight && set.weight > m ? set.weight : m;
          }, 0);
          return exerciseMax > max ? exerciseMax : max;
        }, 0);
        achieved = maxWeight >= goal.targetValue;
      } else if (goal.type === 'reps') {
        const totalReps = latest.exercises.reduce((sum, ex) => {
          return sum + ex.sets.reduce((s, set) => s + (set.reps || 0), 0);
        }, 0);
        achieved = totalReps >= goal.targetValue;
      } else if (goal.type === 'duration') {
        const maxDuration = latest.exercises.reduce((max, ex) => {
          const exerciseMax = ex.sets.reduce((m, set) => {
            return set.duration && set.duration > m ? set.duration : m;
          }, 0);
          return exerciseMax > max ? exerciseMax : max;
        }, 0);
        achieved = maxDuration >= goal.targetValue;
      }

      if (achieved && !goal.achieved) {
        return {
          ...goal,
          achieved: true,
          achievedDate: today,
        };
      }

      return goal;
    });

    saveGoals(updatedGoals);
  };

  const exportData = (): string => {
    const data = {
      version: "2",
      exportDate: new Date().toISOString(),
      workouts,
      measurements,
      templates,
      goals,
    };
    return JSON.stringify(data, null, 2);
  };

  const importData = (
    jsonData: string
  ): { success: boolean; error?: string } => {
    try {
      const parsed = JSON.parse(jsonData);

      // Validate the structure
      if (!parsed.workouts || !Array.isArray(parsed.workouts)) {
        return {
          success: false,
          error: "Invalid data format. Expected workouts array.",
        };
      }

      // Validate each workout has required fields
      for (const workout of parsed.workouts) {
        if (
          !workout.date ||
          !workout.exercises ||
          !Array.isArray(workout.exercises)
        ) {
          return { success: false, error: "Invalid workout data structure." };
        }

        for (const exercise of workout.exercises) {
          if (
            !exercise.id ||
            !exercise.name ||
            !exercise.type ||
            !exercise.sets
          ) {
            return {
              success: false,
              error: "Invalid exercise data structure.",
            };
          }
        }
      }

      // If validation passes, save the data
      saveWorkouts(parsed.workouts);
      
      // Import measurements if they exist
      if (parsed.measurements && Array.isArray(parsed.measurements)) {
        const validMeasurements = parsed.measurements.filter(
          (m: any) => m.id && m.date
        );
        if (validMeasurements.length > 0) {
          saveMeasurements(validMeasurements);
        }
      }

      // Import templates if they exist
      if (parsed.templates && Array.isArray(parsed.templates)) {
        const validTemplates = parsed.templates.filter(
          (t: any) => t.id && t.name && t.exercises
        );
        if (validTemplates.length > 0) {
          saveTemplates(validTemplates);
        }
      }

      // Import goals if they exist
      if (parsed.goals && Array.isArray(parsed.goals)) {
        const validGoals = parsed.goals.filter(
          (g: any) => g.id && g.exerciseName && g.targetValue && g.targetDate
        );
        if (validGoals.length > 0) {
          saveGoals(validGoals);
        }
      }
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to parse JSON data.",
      };
    }
  };

  return {
    workouts,
    getTodayWorkout,
    getWorkoutByDate,
    addExercise,
    removeExercise,
    updateExercise,
    getAllExerciseNames,
    getExerciseHistory,
    getDaysWithWorkouts,
    updateWorkoutDayNotes,
    exportData,
    importData,
    // Body measurements
    measurements,
    addMeasurement,
    updateMeasurement,
    deleteMeasurement,
    getMeasurements,
    // Workout templates
    templates,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    getTemplates,
    loadTemplateToDay,
    // Goals
    goals,
    addGoal,
    updateGoal,
    deleteGoal,
    getGoals,
    getGoalsForExercise,
    checkAndUpdateGoals,
  };
}
