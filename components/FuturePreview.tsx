import React from 'react';
import { Task } from '../types';
import { addDays, format } from 'date-fns';

interface FuturePreviewProps {
  currentDate: Date;
  tasks: Task[];
  onNavigate: (date: Date) => void;
}

export const FuturePreview: React.FC<FuturePreviewProps> = ({ currentDate, tasks, onNavigate }) => {
  const nextDays = [1, 2, 3].map(offset => {
    const date = addDays(currentDate, offset);
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayTasks = tasks.filter(t => t.date === dateStr);
    return { date, dayTasks };
  });

  return (
    // Increased pt-3 to pt-12 to ensure content sits below the floating Add button
    <div className="pb-6 pt-12 px-4 bg-white/70 backdrop-blur-md border-t border-slate-100/50 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1 text-center">
        Coming Up
      </h3>
      <div className="grid grid-cols-3 gap-2">
        {nextDays.map(({ date, dayTasks }, index) => {
           const workCount = dayTasks.filter(t => t.category === 'WORK').length;
           const familyCount = dayTasks.filter(t => t.category === 'FAMILY').length;
           
           return (
             <button
               key={index}
               onClick={() => onNavigate(date)}
               className="bg-white/80 rounded-lg p-2 shadow-sm border border-slate-100 hover:border-blue-200 transition-all active:scale-95 text-left flex flex-col items-center justify-center h-20"
             >
               <div className="text-[10px] font-bold text-slate-500">{format(date, 'EEE')}</div>
               <div className="text-base font-black text-slate-800 leading-tight">{format(date, 'd')}</div>
               
               <div className="flex gap-1 mt-1.5 w-full px-2">
                 {workCount > 0 && (
                   <div className="h-1.5 flex-1 rounded-full bg-macaron-blue"></div>
                 )}
                 {familyCount > 0 && (
                   <div className="h-1.5 flex-1 rounded-full bg-macaron-pink"></div>
                 )}
                 {workCount === 0 && familyCount === 0 && (
                    <div className="h-1.5 flex-1 rounded-full bg-slate-100"></div>
                 )}
               </div>
             </button>
           );
        })}
      </div>
    </div>
  );
};