import React from 'react';
import { format, addDays, subDays, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar, CalendarDays } from 'lucide-react';

interface DateHeaderProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onGoToday: () => void;
  onOpenCalendar: () => void;
}

export const DateHeader: React.FC<DateHeaderProps> = ({ currentDate, onDateChange, onGoToday, onOpenCalendar }) => {
  return (
    <div className="sticky top-0 z-20 bg-[#FDFBF7]/90 backdrop-blur-md px-6 pt-12 pb-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold text-slate-700 tracking-tight font-sans">Elittle Life</h1>
        <div className="flex gap-2">
            {!isToday(currentDate) && (
            <button 
                onClick={onGoToday}
                className="flex items-center gap-1 bg-white border border-slate-200 text-xs font-bold text-slate-500 px-3 py-1.5 rounded-full shadow-sm active:scale-95 transition-transform"
            >
                <Calendar size={12} />
                回到今天
            </button>
            )}
            <button 
                onClick={onOpenCalendar}
                className="flex items-center gap-1 bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm active:scale-95 transition-transform hover:bg-slate-700"
            >
                <CalendarDays size={14} />
            </button>
        </div>
      </div>
      
      <div className="flex items-center justify-between bg-white rounded-2xl p-2 shadow-sm border border-slate-100">
        <button 
          onClick={() => onDateChange(subDays(currentDate, 1))}
          className="p-2 text-slate-400 hover:text-slate-600 active:scale-90 transition-transform"
        >
          <ChevronLeft size={24} />
        </button>
        
        <div className="flex flex-col items-center">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-sans">
            {format(currentDate, 'EEEE')}
          </span>
          <span className="text-xl font-extrabold text-slate-700 font-sans">
            {format(currentDate, 'MMM d, yyyy')}
          </span>
        </div>

        <button 
          onClick={() => onDateChange(addDays(currentDate, 1))}
          className="p-2 text-slate-400 hover:text-slate-600 active:scale-90 transition-transform"
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
};