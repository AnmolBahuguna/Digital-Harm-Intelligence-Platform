import React, { useEffect, useState } from 'react';

interface StatsCounterProps {
  end: number;
  label: string;
  duration?: number;
  suffix?: string;
  color?: string;
}

const StatsCounter: React.FC<StatsCounterProps> = ({
  end,
  label,
  duration = 2000,
  suffix = '',
  color = 'text-blue-600 dark:text-blue-400'
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const endTime = startTime + duration;
    
    const updateCount = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentCount = Math.floor(easeOutQuart * end);
      
      setCount(currentCount);
      
      if (now < endTime) {
        requestAnimationFrame(updateCount);
      } else {
        setCount(end);
      }
    };
    
    updateCount();
  }, [end, duration]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <div className="text-center">
      <div className={`text-3xl sm:text-4xl font-bold ${color} mb-2`}>
        {formatNumber(count)}{suffix}
      </div>
      <div className="text-sm sm:text-base text-gray-600 dark:text-gray-300 font-medium">
        {label}
      </div>
    </div>
  );
};

export default StatsCounter;