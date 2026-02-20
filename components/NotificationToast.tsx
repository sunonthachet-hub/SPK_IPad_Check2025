
import React, { useEffect } from 'react';
import type { Notification } from '../types';

interface NotificationToastProps {
  notification: Notification;
  onClose: (id: number) => void;
}

const NotificationToast: React.FC<NotificationToastProps> = ({ notification, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(notification.id);
    }, 5000);

    return () => clearTimeout(timer);
  }, [notification.id, onClose]);

  const baseClasses = "flex items-center w-full max-w-xs p-4 text-gray-500 bg-white rounded-lg shadow-lg";
  const typeClasses = {
    info: "dark:bg-gray-800 dark:text-gray-400",
    success: "dark:bg-green-800 dark:text-green-200",
    error: "dark:bg-red-800 dark:text-red-200",
  };
  const iconClasses = {
      info: "bg-blue-100 text-blue-500",
      success: "bg-green-100 text-green-500",
      error: "bg-red-100 text-red-500"
  };
  const iconName = {
      info: "info",
      success: "check_circle",
      error: "error"
  }

  return (
    <div className={`${baseClasses} ${typeClasses[notification.type]} animate-fade-in-right`}>
      <div className={`inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg ${iconClasses[notification.type]}`}>
        <span className="material-icons-outlined text-xl">{iconName[notification.type]}</span>
      </div>
      <div className="ml-3 text-sm font-normal">{notification.message}</div>
      <button
        type="button"
        className="ml-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex h-8 w-8"
        onClick={() => onClose(notification.id)}
      >
        <span className="sr-only">Close</span>
        <span className="material-icons-outlined">close</span>
      </button>
    </div>
  );
};

export default NotificationToast;
