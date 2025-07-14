import React from 'react'
import { useEntries } from '../hooks/useEntries.jsx'

export default function History() {
  const { entries, loading, deleteEntry } = useEntries()

  return (
    <div className="page-container">
      <div className="page-card">
        <h2>History</h2>
        {loading ? (
          <p>Loading…</p>
        ) : entries.length ? (
          <ul className="entry-list">
            {entries.map(e => {
              const data = e.segments || {}
              return (
                <li key={e.id} className="entry-item">
                  <div className="entry-head">
                    <time>{data.date}</time>
                    <strong style={{ marginLeft: 8 }}>{data.activity}</strong>
                  </div>
                  <p>Date: {data.date}</p>
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
          <p>No history yet.</p>
        )}
      </div>
    </div>
  )
}