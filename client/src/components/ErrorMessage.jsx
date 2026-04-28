import React from 'react';

const ErrorMessage = ({ message, onClose, type = 'error' }) => {
  if (!message) return null;

  const typeStyles = {
    error: {
      backgroundColor: '#fff1f0',
      borderColor: '#f5222d',
      color: '#f5222d',
    },
    warning: {
      backgroundColor: '#fffbe6',
      borderColor: '#faad14',
      color: '#faad14',
    },
    success: {
      backgroundColor: '#f6ffed',
      borderColor: '#52c41a',
      color: '#52c41a',
    },
  };

  return (
    <div
      style={{
        padding: '12px 16px',
        marginBottom: '16px',
        border: `1px solid ${typeStyles[type].borderColor}`,
        borderRadius: '4px',
        backgroundColor: typeStyles[type].backgroundColor,
        color: typeStyles[type].color,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <span>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'inherit',
            fontSize: '20px',
            cursor: 'pointer',
            padding: '0',
          }}
        >
          ×
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
