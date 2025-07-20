import React from 'react';

export default function ActivityBrowser() {
  const activities = [
    { id:'gym',   title:'Gym',   icon:'🏋️‍♂️' },
    { id:'run',   title:'Run',   icon:'🏃‍♂️' },
    { id:'swim',  title:'Swim',  icon:'🏊‍♀️' },
    { id:'bike',  title:'Cycle', icon:'🚴‍♂️' },
    { id:'yoga',  title:'Yoga',  icon:'🧘‍♀️' },
  ];

  return (
    <section className="browser">
      <h2 className="browser-title">Find Your Activity</h2>
      <div className="browser-grid">
        {activities.map(a => (
          <div key={a.id} className="browser-card">
            <div className="card-icon">{a.icon}</div>
            <h3 className="card-title">{a.title}</h3>
            <p className="card-sub">≈ {Math.random()*300+200 |0} kcal/hr</p>
          </div>
        ))}
      </div>
    </section>
  );
}