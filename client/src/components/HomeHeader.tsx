import React from 'react';
import { NotificationIcon } from './NotificationIcon';

interface HomeHeaderProps {
  className?: string;
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({ className = "" }) => {
  return (
    <div className={`flex items-center justify-between p-4 ${className}`}>
      <div className="flex items-center space-x-2">
        <h1 className="text-xl font-semibold text-white">Smart Cat Feeder</h1>
      </div>
      
      <div className="flex items-center space-x-4">
        <button className="p-2 rounded-full hover:bg-white/10 transition-colors notification-icon">
          <NotificationIcon className="w-5 h-5 sm:w-6 sm:h-6 aspect-square" />
        </button>
      </div>
    </div>
  );
};

export default HomeHeader;