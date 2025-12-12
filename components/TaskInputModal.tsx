import React, { useState, useEffect } from 'react';
import { Task, Category, RecurringSettings } from '../types';
import { X, Calendar as CalendarIcon, Repeat, Briefcase, Home, Star, ArrowRight } from 'lucide-react';
import { format, addDays } from 'date-fns';

interface TaskInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (text: string, category: Category, time: string | null, recurring: RecurringSettings | null, date: string | null) => void;
  onEditSubmit: (id: string, text: string, category: Category, time: string | null, date: string | null) => void;
  initialDate: string;
  editingTask: Task | null;
}

export const TaskInputModal: React.FC<TaskInputModalProps> = ({ 
  isOpen, onClose, onSubmit, onEditSubmit, initialDate, editingTask 
}) => {
  const [text, setText] = useState('');
  const [time, setTime] = useState('');
  const [taskDate, setTaskDate] = useState(initialDate); // New state for Date
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurStart, setRecurStart] = useState(initialDate);
  const [recurEnd, setRecurEnd] = useState(format(addDays(new Date(initialDate), 30), 'yyyy-MM-dd'));
  const [recurDays, setRecurDays] = useState<number[]>([]); // 0-6

  useEffect(() => {
    if (isOpen) {
      if (editingTask) {
        setText(editingTask.text);
        setTime(editingTask.time || '');
        // If editing a Long Term task (date is null), default to initialDate, otherwise use task date
        setTaskDate(editingTask.date || initialDate); 
        setIsRecurring(false); 
      } else {
        setText('');
        setTime('');
        setTaskDate(initialDate);
        setIsRecurring(false);
        setRecurStart(initialDate);
        setRecurDays([]);
      }
    }
  }, [isOpen, editingTask, initialDate]);

  const handleCategorySelect = (category: Category) => {
    if (!text.trim()) return;

    if (editingTask) {
      // Pass the updated date
      const finalDate = category === 'LONG_TERM' ? null : taskDate;
      onEditSubmit(editingTask.id, text, category, time || null, finalDate);
    } else {
      const recurringSettings: RecurringSettings | null = isRecurring && recurDays.length > 0 ? {
        startDate: recurStart,
        endDate: recurEnd,
        daysOfWeek: recurDays
      } : null;
      
      // Pass the selected date for single tasks
      const finalDate = (category === 'LONG_TERM') ? null : (recurringSettings ? null : taskDate);
      
      onSubmit(text, category, time || null, recurringSettings, finalDate);
    }
    onClose();
  };

  const toggleDay = (dayIndex: number) => {
    setRecurDays(prev => 
      prev.includes(dayIndex) ? prev.filter(d => d !== dayIndex) : [...prev, dayIndex]
    );
  };

  if (!isOpen) return null;

  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/30 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-700">
            {editingTask ? '編輯事項' : '新增事項'}
          </h2>
          <button onClick={onClose} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200">
            <X size={20} className="text-slate-600" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5">
          {/* Text Input */}
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">想要做什麼？</label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="例如：買牛奶、開會..."
              className="w-full text-lg font-semibold border-b-2 border-slate-100 py-2 focus:outline-none focus:border-blue-400 placeholder-slate-300"
              autoFocus
            />
          </div>

          {/* Time & Date & Recurring Toggle */}
          <div className="flex flex-col gap-4">
             {/* Row 1: Time and Date */}
             <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-400 mb-1">日期</label>
                  <input
                    type="date"
                    disabled={isRecurring && !editingTask} // Disable date picker if recurring is checked (uses range instead)
                    value={taskDate}
                    onChange={(e) => setTaskDate(e.target.value)}
                    className="w-full bg-slate-50 rounded-xl px-3 py-2 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:opacity-50 font-sans"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-400 mb-1">時間 (選填)</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-slate-50 rounded-xl px-3 py-2 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-100 font-sans"
                  />
                </div>
             </div>
            
            {!editingTask && (
              <div className="flex items-center pt-2">
                <button
                  onClick={() => setIsRecurring(!isRecurring)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-colors w-full justify-center ${
                    isRecurring ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <Repeat size={16} />
                  <span>設定循環行程</span>
                </button>
              </div>
            )}
          </div>

          {/* Recurring Settings */}
          {isRecurring && !editingTask && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-4">
               <div className="flex items-center gap-2">
                 <div className="flex-1">
                   <span className="text-xs font-bold text-slate-400 block mb-1">開始</span>
                   <input type="date" value={recurStart} onChange={e => setRecurStart(e.target.value)} className="w-full p-1 bg-white rounded border text-sm font-sans" />
                 </div>
                 <ArrowRight size={16} className="text-slate-300 mt-4" />
                 <div className="flex-1">
                   <span className="text-xs font-bold text-slate-400 block mb-1">結束</span>
                   <input type="date" value={recurEnd} onChange={e => setRecurEnd(e.target.value)} className="w-full p-1 bg-white rounded border text-sm font-sans" />
                 </div>
               </div>
               
               <div>
                 <span className="text-xs font-bold text-slate-400 block mb-2">重複於</span>
                 <div className="flex justify-between">
                   {days.map((d, i) => (
                     <button
                        key={i}
                        onClick={() => toggleDay(i)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all font-sans ${
                          recurDays.includes(i) ? 'bg-blue-500 text-white shadow-md scale-110' : 'bg-white text-slate-400 border border-slate-200'
                        }`}
                     >
                       {d}
                     </button>
                   ))}
                 </div>
               </div>
            </div>
          )}

          {/* Category Selection (Submit) */}
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-3 text-center">
              點擊下方分類並儲存
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                disabled={!text}
                onClick={() => handleCategorySelect('WORK')}
                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-macaron-blue hover:bg-macaron-blue-dark/20 text-blue-800 transition-all active:scale-95 disabled:opacity-50"
              >
                <Briefcase className="mb-1" size={24} />
                <span className="font-bold text-sm">工作</span>
              </button>
              
              <button
                disabled={!text}
                onClick={() => handleCategorySelect('FAMILY')}
                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-macaron-pink hover:bg-macaron-pink-dark/20 text-pink-800 transition-all active:scale-95 disabled:opacity-50"
              >
                <Home className="mb-1" size={24} />
                <span className="font-bold text-sm">家庭</span>
              </button>

              <button
                disabled={!text}
                onClick={() => handleCategorySelect('LONG_TERM')}
                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-macaron-yellow hover:bg-macaron-yellow-dark/20 text-yellow-800 transition-all active:scale-95 disabled:opacity-50"
              >
                <Star className="mb-1" size={24} />
                <span className="font-bold text-sm">長程</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};