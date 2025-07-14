import React from 'react'
import { useEntries } from '../hooks/useEntries.jsx'

export default function Dashboard() {
  const { entries, loading, deleteEntry } = useEntries()

  return (
    <div className="page-container">
      <div className="page-card">
        <h2>Dashboard</h2>
        <p>Welcome to your fitness tracker.</p>
      </div>

      <div className="page-card">
        <h3>Recent Activities</h3>
        {loading ? (
          <p>Loading…</p>
        ) : entries.length ? (
          <ul className="entry-list">
            {entries.slice(0,5).map(e => {
              const data = e.segments || {}
              return (
                <li key={e.id} className="entry-item">
                  <div className="entry-head">
                    <time>{data.date}</time>
                    <strong style={{ marginLeft: 8 }}>{data.activity}</strong>
                  </div>
                  <button
                    type="button"
                    className="delete-button"
                    onClick={() => deleteEntry(e.id)}
                  >
                    Delete
                  </button>
                </li>
              )
            })}
          </ul>
        ) : (
          <p>No activities logged yet.</p>
        )}
      </div>
    </div>
  )
}