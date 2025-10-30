import React from 'react';
import { Link } from 'react-router-dom';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
      <div className="max-w-md w-full text-center">
        <div className="card">
          <ExclamationTriangleIcon className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
          <h1 className="text-h2 mb-2">Page Not Found</h1>
          <p className="text-neutral-600 mb-6">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="flex space-x-4 justify-center">
            <Link to="/" className="btn btn-primary">
              Go Home
            </Link>
            <button 
              onClick={() => window.history.back()} 
              className="btn btn-outline"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;