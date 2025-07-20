export const ACTIVITIES = [
  {
    id: 'gym',
    label: 'Gym',
    emoji: '🏋️‍♂️',
    fields: [
      { name: 'exercise', label: 'Exercise' },
      { name: 'sets', label: 'Sets' },
      { name: 'reps', label: 'Reps' },
      { name: 'weight', label: 'Weight (kg)' },
    ],
  },
  {
    id: 'run',
    label: 'Run',
    emoji: '🏃‍♂️',
    fields: [
      { name: 'distance', label: 'Distance (km)' },
      { name: 'duration', label: 'Duration (min)' },
    ],
  },
  {
    id: 'meal',
    label: 'Meal',
    emoji: '🍽️',
    fields: [
      { name: 'meal', label: 'Meal description' },
      { name: 'calories', label: 'Calories' },
    ],
  },
];