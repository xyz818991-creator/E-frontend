import React from 'react';

export const InputField = ({ label, name, type = 'text', value, onChange, placeholder, required = false }) => {
  return (
    <label style={{ display: 'block', marginBottom: '12px' }}>
      <span style={{ fontSize: '13px', color: 'var(--gold2)', display: 'block', marginBottom: '4px' }}>
        {label} {required && '*'}
      </span>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        style={{
          width: '100%',
          padding: '10px 14px',
          background: 'rgba(255,240,208,0.04)',
          border: '1px solid var(--line)',
          borderRadius: '8px',
          color: 'var(--cream)',
          fontSize: '14px'
        }}
      />
    </label>
  );
};

export default InputField;

