import React from "react";

/**
 * ActivityTimeline Component
 * Displays vertical timeline of activity logs
 */
export default function ActivityTimeline({ logs }) {
  const getLogColor = (type) => {
    switch (type) {
      case 'status':
        return 'bg-blue-500';
      case 'call':
        return 'bg-purple-500';
      case 'email':
        return 'bg-green-500';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <div className="relative border-l-2 border-gray-100 ml-2 space-y-8">
      {logs.map((log) => (
        <div key={log.id} className="ml-6 relative">
          {/* Dot */}
          <div className={`absolute -left-[29px] top-1 w-4 h-4 rounded-full border-2 border-white shadow-sm ${getLogColor(log.type)}`}></div>
          
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
            <div>
              <p className="text-sm font-medium text-gray-900">{log.msg}</p>
              <p className="text-xs text-gray-500 mt-1">by {log.user}</p>
            </div>
            <span className="text-xs text-gray-400 mt-1 sm:mt-0">{log.date}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
