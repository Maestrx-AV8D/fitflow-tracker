import React from 'react';

export default function HomeScreen({ profile, stats }) {
  return (
    <section className="home">
      <header className="home-header">
        <div className="avatar">{profile?.avatar || '👤'}</div>
        <div>
          <h2>{profile?.name || 'Hello!'}</h2>
          <p className="muted">Welcome back</p>
        </div>
      </header>

      <div className="stats-panel">
        <div className="chart">[Your Chart]</div>
        <div className="stat-cards">
          <div className="stat-card">
            ⏱️ <strong>{stats?.training ?? 0}h</strong>
            <span>Training</span>
          </div>
          <div className="stat-card">
            🚶 <strong>{stats?.steps ?? 0}km</strong>
            <span>Steps</span>
          </div>
          <div className="stat-card">
            🔥 <strong>{stats?.calories ?? 0}</strong>
            <span>Calories</span>
          </div>
        </div>
      </div>
    </section>
  );
}