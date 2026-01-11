import React from 'react';
import EnhancedNavigation from '../Navigation/EnhancedNavigation';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <EnhancedNavigation />
      <main className="pt-14 sm:pt-16">
        {children}
      </main>
    </div>
  );
};

export default Layout;