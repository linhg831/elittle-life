import React from 'react';
import { Task, Category } from '../types';
import { Check, Clock, Trash2, Edit2, RotateCcw } from 'lucide-react';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, onDelete, onEdit }) => {
  
  const getCategoryStyles = (category: Category) => {
    switch (category) {
      case 'WORK':
        return 'border-l-[3px] border-l-macaron-blue-dark';
      case 'FAMILY':
        return 'border-l-[3px] border-l-macaron-pink-dark';
      case 'LONG_TERM':
        return 'border-l-[3px] border-l-macaron-yellow-dark';
      default:
        return 'border-l-[3px] border-slate-300';
    }
  };

  const getCheckColors = (category: Category) => {
    switch (category) {
        case 'WORK': return 'text-blue-500 border-blue-200 bg-blue-50';
        case 'FAMILY': return 'text-pink-500 border-pink-200 bg-pink-50';
        case 'LONG_TERM': return 'text-yellow-600 border-yellow-200 bg-yellow-50';
    }
  }

  return (
    <div className={`
      relative group flex items-start gap-2 p-2 mb-2 rounded-xl bg-white/95 shadow-sm
      ${getCategoryStyles(task.category)}
      ${task.completed ? 'opacity-60 grayscale-[0.5]' : ''}
    `}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle(task.id);
        }}
        className={`
          flex-shrink-0 w-4 h-4 mt-0.5 rounded-full border-[1.5px] flex items-center justify-center transition-colors
          ${task.completed ? 'bg-slate-100 border-slate-300' : getCheckColors(task.category)}
        `}
      >
        {task.completed && <Check size={10} className="text-slate-400" />}
      </button>

      {/* Padding right to accommodate buttons. Reduced to 3.5rem (approx 56px) for compact view */}
      <div className="flex-1 min-w-0 pr-[3.5rem]">
        <div className="flex items-start justify-between">
          <span className={`
            font-bold text-sm leading-tight break-words text-slate-700
            ${task.completed ? 'line-through text-slate-400' : ''}
          `}>
            {task.text}
          </span>
        </div>
        
        {task.time && (
          <div className="flex items-center gap-1 mt-0.5 text-[10px] font-semibold text-slate-400">
            <Clock size={10} />
            <span>{task.time}</span>
          </div>
        )}
      </div>

      {/* Buttons always visible, compact scale */}
      <div className="absolute right-1 top-1.5 z-10 flex items-center gap-0.5">
        {!task.completed && (
             <button 
             onClick={(e) => {
               e.stopPropagation();
               onEdit(task);
             }}
             className="p-1 text-slate-400 hover:text-blue-500 bg-white shadow-sm border border-slate-100 rounded-full active:scale-90 transition-transform"
             title="Edit"
           >
             <Edit2 size={12} />
           </button>
        )}
        {task.completed && (
             <button 
             onClick={(e) => {
               e.stopPropagation();
               onToggle(task.id);
             }}
             className="p-1 text-slate-400 hover:text-green-500 bg-white shadow-sm border border-slate-100 rounded-full active:scale-90 transition-transform"
             title="Restore"
           >
             <RotateCcw size={12} />
           </button>
        )}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onDelete(task.id);
          }}
          className="p-1 text-slate-400 hover:text-red-500 bg-white shadow-sm border border-slate-100 rounded-full active:scale-90 transition-transform"
          title="Delete"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
};