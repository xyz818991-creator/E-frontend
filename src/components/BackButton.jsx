import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Simple back button used throughout the app.
 * It navigates one step back in the history stack.
 * The component can be styled via the optional `className` prop.
 */
export default function BackButton({ className }) {
  const navigate = useNavigate();
  const handleClick = () => navigate(-1);
  return (
    <button
      type="button"
      className={className || 'back-button'}
      onClick={handleClick}
      aria-label="Go back"
    >
      ← Back
    </button>
  );
}

