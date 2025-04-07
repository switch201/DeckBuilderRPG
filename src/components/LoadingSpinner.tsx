import React from 'react';

type LoadingSpinnerProps = {
    message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = 'Loading...' }) => {
    return (
        <div className="game-view loading">
            <div className="loading-spinner" />
            <p>{message}</p>
        </div>
    );
}; 