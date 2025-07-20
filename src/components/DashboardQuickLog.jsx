import { useNavigate } from 'react-router-dom';

const ACTIVITIES = [
  { name: 'Run', emoji: '🏃‍♂️' },
  { name: 'Cycle', emoji: '🚴‍♀️' },
  { name: 'Swim', emoji: '🏊‍♀️' },
  { name: 'Gym', emoji: '🏋️‍♂️' },
];

export default function DashboardQuickLog() {
  const nav = useNavigate();
  return (
    <section className="mt-8 max-w-xl mx-auto px-4">
      <h2 className="text-lg font-semibold mb-2">Quick Log</h2>
      <div className="grid grid-cols-2 gap-4">
        {ACTIVITIES.map(a => (
          <button
            key={a.name}
            onClick={() => nav('/log', { state: { defaultActivity: a.name } })}
            className="flex flex-col items-center justify-center bg-white rounded-xl py-6 shadow hover:shadow-md transition"
          >
            <span className="text-3xl">{a.emoji}</span>
            <span className="mt-2 font-medium">{a.name}</span>
          </button>
        ))}
      </div>
    </section>
  );
}