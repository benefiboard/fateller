import React from 'react';
import { Home, Search, Bell, Mail } from 'lucide-react';

const BottomNavigation: React.FC = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto flex justify-around py-3 border-t border-gray-200 bg-white z-20">
      <button className="text-teal-500">
        <Home size={24} />
      </button>
      <button className="text-gray-500">
        <Search size={24} />
      </button>
      <button className="text-gray-500">
        <Bell size={24} />
      </button>
      <button className="text-gray-500">
        <Mail size={24} />
      </button>
    </div>
  );
};

export default BottomNavigation;
