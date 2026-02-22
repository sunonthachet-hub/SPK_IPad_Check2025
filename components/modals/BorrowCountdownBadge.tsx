import React, { useState, useEffect } from 'react';

interface BorrowCountdownBadgeProps {
  borrowDate?: string;
  dueDate?: string;
  t: (key: string) => string;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  totalDays: number;
  isExpired: boolean;
  isUrgent: boolean; // less than 7 days
  isWarning: boolean; // less than 3 days
  isDanger: boolean; // less than 1 day
}

const BorrowCountdownBadge: React.FC<BorrowCountdownBadgeProps> = ({ dueDate, t }) => {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining | null>(null);

  useEffect(() => {
    if (!dueDate) {
      setTimeRemaining(null);
      return;
    }

    const calculateTimeRemaining = () => {
      const now = new Date();
      const dueDateObj = new Date(dueDate);
      const timeDiff = dueDateObj.getTime() - now.getTime();

      if (timeDiff < 0) {
        setTimeRemaining({
          days: 0,
          hours: 0,
          minutes: 0,
          totalDays: 0,
          isExpired: true,
          isUrgent: false,
          isWarning: false,
          isDanger: false,
        });
        return;
      }

      const totalSeconds = Math.floor(timeDiff / 1000);
      const days = Math.floor(totalSeconds / (24 * 3600));
      const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);

      const totalDays = Math.ceil(timeDiff / (24 * 3600 * 1000));

      setTimeRemaining({
        days,
        hours,
        minutes,
        totalDays,
        isExpired: false,
        isUrgent: totalDays <= 7,
        isWarning: totalDays <= 3,
        isDanger: totalDays < 1,
      });
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [dueDate]);

  if (!timeRemaining) return null;

  if (timeRemaining.isExpired) {
    return (
      <div className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 border border-red-500 rounded-full text-xs font-semibold text-red-700">
        <span className="material-icons-outlined text-sm">error</span>
        {t('deviceOverdue') || 'Overdue'}
      </div>
    );
  }

  // Determine color based on urgency
  let bgColor = 'bg-green-100';
  let borderColor = 'border-green-500';
  let textColor = 'text-green-700';
  let icon = 'check_circle';

  if (timeRemaining.isDanger) {
    bgColor = 'bg-red-100';
    borderColor = 'border-red-500';
    textColor = 'text-red-700';
    icon = 'warning';
  } else if (timeRemaining.isWarning) {
    bgColor = 'bg-yellow-100';
    borderColor = 'border-yellow-500';
    textColor = 'text-yellow-700';
    icon = 'schedule';
  } else if (timeRemaining.isUrgent) {
    bgColor = 'bg-orange-100';
    borderColor = 'border-orange-500';
    textColor = 'text-orange-700';
    icon = 'access_time';
  }

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 ${bgColor} border ${borderColor} rounded-full text-xs font-semibold ${textColor}`}>
      <span className="material-icons-outlined text-sm">{icon}</span>
      <span>
        {timeRemaining.days}วัน {timeRemaining.hours}ชั่วโมง
      </span>
    </div>
  );
};

export default BorrowCountdownBadge;
