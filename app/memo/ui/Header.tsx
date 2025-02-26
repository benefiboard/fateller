import React from 'react';
import { Twitter } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <div className="bg-teal-500 p-2 flex justify-between items-center sticky top-0 z-20">
      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
        <Twitter size={20} color="#1DA1F2" />
      </div>
      <div className="text-white font-semibold">BrainLabeling</div>
      <div className="w-8 h-8"></div>
    </div>
  );
};

export default Header;