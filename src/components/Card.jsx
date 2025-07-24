import React from 'react'

export default function Card({ title, children, className = '' }) {
  return (
    <div className={`bg-n-7 text-n-2 p-6 rounded-lg shadow-md ${className}`}>
      {title && <h3 className="h5 mb-4">{title}</h3>}
      {children}
    </div>
  )
}