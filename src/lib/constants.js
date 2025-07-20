// src/lib/constants.js

export const ACTIVITIES = [
  {
    id: 'run',
    label: 'Run',
    emoji: '🏃‍♂️',
    fields: [
      { name: 'distance', label: 'Distance (km)', type: 'number', step: 0.1, placeholder: 'e.g. 5.2' },
      { name: 'duration', label: 'Duration (min)', type: 'number', placeholder: 'e.g. 30' },
      { name: 'pace', label: 'Avg. Pace (min/km)', type: 'number', step: 0.1, placeholder: 'e.g. 5.8' },
    ],
  },
  {
    id: 'cycle',
    label: 'Cycle',
    emoji: '🚴‍♂️',
    fields: [
      { name: 'distance', label: 'Distance (km)', type: 'number', step: 0.1, placeholder: 'e.g. 20' },
      { name: 'duration', label: 'Duration (min)', type: 'number', placeholder: 'e.g. 60' },
      { name: 'cadence', label: 'Cadence (rpm)', type: 'number', placeholder: 'e.g. 90' },
    ],
  },
  {
    id: 'swim',
    label: 'Swim',
    emoji: '🏊‍♂️',
    fields: [
      { name: 'laps', label: 'Laps', type: 'number', placeholder: 'e.g. 20' },
      { name: 'distance', label: 'Distance (m)', type: 'number', placeholder: 'e.g. 500' },
      { name: 'duration', label: 'Duration (min)', type: 'number', placeholder: 'e.g. 45' },
    ],
  },
  {
    id: 'gym',
    label: 'Gym',
    emoji: '🏋️‍♂️',
    // these define *one* exercise entry; we'll let the user add many
    fields: [
      { name: 'exerciseName', label: 'Exercise Name', type: 'text', placeholder: 'e.g. Bench Press' },
      { name: 'sets', label: 'Sets', type: 'number', placeholder: 'e.g. 3' },
      { name: 'reps', label: 'Reps', type: 'number', placeholder: 'e.g. 8' },
      { name: 'weight', label: 'Weight (kg)', type: 'number', step: 0.5, placeholder: 'e.g. 60' },
    ],
  },
];