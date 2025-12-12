import React, { useState, useEffect } from 'react';
import { 
  format, addMonths, subMonths, startOfMonth, endOfMonth, 
  eachDayOfInterval, getDay, isSameDay, isToday, isSameMonth 
} from 'date-fns';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Task } from '../types';

interface CalendarOverviewProps {
  isOpen: boolean;
  onClose: () => void;
  currentDate: Date;
  onSelectDate: (date: Date) => void;
  tasks: Task[];
}

export const CalendarOverview: React.FC<CalendarOverviewProps> = ({ 
  isOpen, onClose, currentDate, onSelectDate, tasks 
}) => {
  const [viewDate, setViewDate] = useState(currentDate);

  // Reset view to current date when opened
  useEffect(() => {
    if (isOpen) {
      setViewDate(currentDate);
    }
  }, [isOpen, currentDate]);

  if (!isOpen) return null;

  // Generate 3 months starting from viewDate
  const monthsToDisplay = [0, 1, 2].map(offset => addMonths(viewDate, offset));

  const getDayTasks = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return tasks.filter(t => t.date === dateStr);
  };

  const hasCategory = (dayTasks: Task[], category: 'WORK' | 'FAMILY' | 'LONG_TERM') => {
    return dayTasks.some(t => t.category === category);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#FDFBF7] animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <h2 className="text-lg font-black text-slate-700">日曆總覽</h2>
        <button 
          onClick={onClose}
          className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 active:scale-90 transition-transform"
        >
          <X size={20} className="text-slate-600" />
        </button>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between px-6 py-2 bg-white/50">
        <button 
          onClick={() => setViewDate(subMonths(viewDate, 1))}
          className="p-2 text-slate-400 hover:text-blue-500 active:scale-90"
        >
          <ChevronLeft size={24} />
        </button>
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-sans">
            {format(monthsToDisplay[0], 'MMM yyyy')} - {format(monthsToDisplay[2], 'MMM yyyy')}
        </span>
        <button 
          onClick={() => setViewDate(addMonths(viewDate, 1))}
          className="p-2 text-slate-400 hover:text-blue-500 active:scale-90"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Scrollable Months Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-20">
        {monthsToDisplay.map((monthDate, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100/50">
            <h3 className="text-lg font-bold text-slate-800 mb-3 px-1 border-b border-slate-50 pb-2 font-sans">
              {format(monthDate, 'MMMM yyyy')}
            </h3>
            
            {/* Days Header */}
            <div className="grid grid-cols-7 mb-2 text-center">
              {['S','M','T','W','T','F','S'].map(d => (
                <div key={d} className="text-[10px] font-bold text-slate-400 font-sans">{d}</div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-y-2 gap-x-1">
              {/* Empty slots for start of month */}
              {Array.from({ length: getDay(startOfMonth(monthDate)) }).map((_, idx) => (
                <div key={`empty-${idx}`} />
              ))}

              {/* Actual Days */}
              {eachDayOfInterval({
                start: startOfMonth(monthDate),
                end: endOfMonth(monthDate)
              }).map((day) => {
                const dayTasks = getDayTasks(day);
                const isSelected = isSameDay(day, currentDate);
                const isTodayDate = isToday(day);

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => {
                      onSelectDate(day);
                      onClose();
                    }}
                    className={`
                      relative h-10 rounded-lg flex flex-col items-center justify-center transition-all font-sans
                      ${isSelected ? 'bg-slate-800 text-white shadow-md' : 'hover:bg-slate-50 text-slate-700'}
                      ${isTodayDate && !isSelected ? 'border border-blue-200 bg-blue-50/30' : ''}
                    `}
                  >
                    <span className={`text-sm font-bold ${isSelected ? 'text-white' : ''}`}>
                      {format(day, 'd')}
                    </span>
                    
                    {/* Indicators */}
                    <div className="flex gap-0.5 mt-0.5">
                      {hasCategory(dayTasks, 'WORK') && (
                        <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-blue-300' : 'bg-macaron-blue-dark'}`} />
                      )}
                      {hasCategory(dayTasks, 'FAMILY') && (
                        <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-pink-300' : 'bg-macaron-pink-dark'}`} />
                      )}
                      {hasCategory(dayTasks, 'LONG_TERM') && (
                        <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-yellow-300' : 'bg-macaron-yellow-dark'}`} />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};