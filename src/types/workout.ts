export interface SetEntry {
  reps?: number;
  weight?: number;
  duration?: number; // in seconds, for timed exercises like plank
}

export interface Exercise {
  id: string;
  name: string;
  type: "reps" | "timed";
  sets: SetEntry[];
  notes?: string;
  order: number; // to track exercise order within the day
}

export interface WorkoutDay {
  date: string; // ISO date string YYYY-MM-DD
  exercises: Exercise[];
  notes?: string; // Day-level notes
}

export interface WorkoutData {
  workouts: WorkoutDay[];
}

export interface BodyMeasurement {
  id: string;
  date: string; // ISO date string YYYY-MM-DD
  weight?: number; // in kg
  bodyFat?: number; // percentage
  chest?: number; // in cm
  waist?: number; // in cm
  hips?: number; // in cm
  biceps?: number; // in cm
  thighs?: number; // in cm
  notes?: string;
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  exercises: {
    name: string;
    type: "reps" | "timed";
    sets: {
      reps?: number;
      weight?: number;
      duration?: number;
    }[];
    notes?: string;
  }[];
  notes?: string;
}

export interface Goal {
  id: string;
  exerciseName: string;
  targetValue: number;
  targetDate: string; // ISO date string YYYY-MM-DD
  type: "weight" | "reps" | "duration"; // weight in kg, reps count, or duration in seconds
  achieved?: boolean;
  achievedDate?: string;
  notes?: string;
}
