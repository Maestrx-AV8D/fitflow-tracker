import React from 'react';

export default function Tooltip({ message, children }) {
  return (
    <span className="tooltip-wrapper">
      {children}
      <span className="tooltip-content">{message}</span>
    </span>
  );
}