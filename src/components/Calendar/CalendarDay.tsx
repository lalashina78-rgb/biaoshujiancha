import React from 'react';
import { CalendarEvent, EventType } from '../../types';

interface CalendarDayProps {
  date: Date;
  events: CalendarEvent[];
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected?: boolean;
  onClick?: (date: Date) => void;
  view?: 'month' | 'week';
}

export const CalendarDay: React.FC<CalendarDayProps> = ({ date, events, isCurrentMonth, isToday, isSelected, onClick, view }) => {
  // Determine dot color based on priority: Blue (REMINDER) > Orange (DEADLINE/OPENING)
  const hasManual = events.some(e => e.type === EventType.REMINDER);
  const hasSystem = events.some(e => e.type !== EventType.REMINDER);
  
  let dotColor = '';
  if (hasManual) dotColor = 'bg-brand'; // Blue
  else if (hasSystem) dotColor = 'bg-orange-400'; // Orange

  return (
    <div 
      onClick={() => onClick && onClick(date)}
      className={`relative flex flex-col items-center justify-center p-1 border-b border-r border-gray-50/50 ${!isCurrentMonth && view === 'month' ? 'bg-gray-50/30' : 'bg-white'} hover:bg-gray-50 transition-colors cursor-pointer group ${view === 'month' ? 'h-12' : 'h-14'}`}
    >
      <div className={`text-[13px] font-medium w-7 h-7 flex items-center justify-center rounded-full transition-colors ${
        isSelected ? 'bg-brand text-white shadow-sm' : 
        isToday ? 'bg-blue-50 text-brand' : 
        !isCurrentMonth && view === 'month' ? 'text-gray-300' : 'text-gray-600 group-hover:text-brand'
      }`}>
        {date.getDate()}
      </div>
      
      {/* Single Dot */}
      <div className="h-2 mt-0.5 flex items-center justify-center">
        {dotColor && (
          <div className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
        )}
      </div>
    </div>
  );
};
