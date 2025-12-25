import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-4xl font-bold mb-4">404 — Page not found</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-6">The page you tried to access doesn't exist or may have been moved.</p>
      <Link to="/" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">Return to Home</Link>
    </div>
  );
};

export default NotFoundPage;
