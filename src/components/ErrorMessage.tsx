import React from 'react';

type ErrorMessageProps = {
    message: string;
    onDismiss: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onDismiss }) => {
    return (
        <div className="error-message">
            <p>{message}</p>
            <button onClick={onDismiss}>Dismiss</button>
        </div>
    );
}; 