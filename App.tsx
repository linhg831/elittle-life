import React, { useState, useEffect, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { format, eachDayOfInterval, getDay, parseISO } from 'date-fns';
import { Plus } from 'lucide-react';
import { Task, Category, RecurringSettings } from './types';
import { saveTasks, loadTasks } from './utils/storage';
import { DateHeader } from './components/DateHeader';
import { TaskItem } from './components/TaskItem';
import { TaskInputModal } from './components/TaskInputModal';
import { FuturePreview } from './components/FuturePreview';
import { CalendarOverview } from './components/CalendarOverview';
import { RecurrenceOptionModal, RecurrenceScope } from './components/RecurrenceOptionModal';

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Recurrence Action State
  const [isRecurrenceModalOpen, setIsRecurrenceModalOpen] = useState(false);
  const [pendingRecurrenceAction, setPendingRecurrenceAction] = useState<{
    type: 'DELETE' | 'EDIT';
    task: Task;
    newData?: { text: string; category: Category; time: string | null; date: string | null };
  } | null>(null);

  // Load initial data
  useEffect(() => {
    const loaded = loadTasks();
    setTasks(loaded);
  }, []);

  // Save on change
  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  const currentDateStr = format(currentDate, 'yyyy-MM-dd');

  // --- Handlers ---

  const handleAddTask = (text: string, category: Category, time: string | null, recurring: RecurringSettings | null, date: string | null) => {
    const newTasks: Task[] = [];
    const timestamp = Date.now();

    if (category === 'LONG_TERM') {
      newTasks.push({
        id: uuidv4(),
        text,
        category,
        date: null,
        time: null,
        completed: false,
        createdAt: timestamp,
      });
    } else if (recurring) {
      // Handle Recurring
      const start = parseISO(recurring.startDate);
      const end = parseISO(recurring.endDate);
      const days = eachDayOfInterval({ start, end });
      const recurringId = uuidv4(); // Generate ID for the series
      
      days.forEach(day => {
        if (recurring.daysOfWeek.includes(getDay(day))) {
          newTasks.push({
            id: uuidv4(),
            recurringId,
            text,
            category,
            date: format(day, 'yyyy-MM-dd'),
            time,
            completed: false,
            createdAt: timestamp,
          });
        }
      });
    } else {
      // Single Task
      newTasks.push({
        id: uuidv4(),
        text,
        category,
        date: date || currentDateStr, // Use provided date or current date
        time,
        completed: false,
        createdAt: timestamp,
      });
    }

    setTasks(prev => [...prev, ...newTasks]);
  };

  const handleEditTask = (id: string, text: string, category: Category, time: string | null, date: string | null) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    if (task.recurringId) {
      // Intercept for recurring logic
      setPendingRecurrenceAction({
        type: 'EDIT',
        task,
        newData: { text, category, time, date }
      });
      setIsRecurrenceModalOpen(true);
      setEditingTask(null); // Close the edit modal
    } else {
      // Normal update
      setTasks(prev => prev.map(t => 
        t.id === id ? { ...t, text, category, time, date } : t
      ));
      setEditingTask(null);
    }
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => 
      t.id === id ? { ...t, completed: !t.completed } : t
    ));
  };

  const deleteTask = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    if (task.recurringId) {
       // Intercept for recurring logic
       setPendingRecurrenceAction({
         type: 'DELETE',
         task
       });
       setIsRecurrenceModalOpen(true);
    } else {
      // Normal delete
      setTasks(prev => prev.filter(t => t.id !== id));
    }
  };

  const executeRecurrenceAction = (scope: RecurrenceScope) => {
    if (!pendingRecurrenceAction) return;
    const { type, task, newData } = pendingRecurrenceAction;

    setTasks(prev => {
      let nextTasks = [...prev];

      if (type === 'DELETE') {
        if (scope === 'SINGLE') {
          return nextTasks.filter(t => t.id !== task.id);
        } else if (scope === 'ALL') {
          return nextTasks.filter(t => t.recurringId !== task.recurringId);
        } else if (scope === 'FUTURE') {
           // Delete this task AND any task in the series with a date >= this task's date
           const cutoffDate = task.date || '0000-00-00';
           return nextTasks.filter(t => {
             if (t.recurringId !== task.recurringId) return true;
             // If date is null (long term), delete it too if it's part of series
             if (!t.date) return false;
             return t.date < cutoffDate;
           });
        }
      } 
      
      if (type === 'EDIT' && newData) {
        if (scope === 'SINGLE') {
          return nextTasks.map(t => t.id === task.id ? { ...t, ...newData } : t);
        } else {
           // ALL or FUTURE
           const cutoffDate = task.date || '0000-00-00';
           
           return nextTasks.map(t => {
             // Skip if not in series
             if (t.recurringId !== task.recurringId) return t;

             // Logic for FUTURE scope
             if (scope === 'FUTURE' && t.date && t.date < cutoffDate) return t;
             
             // Apply updates
             // Note: We DO NOT update the 'date' for other tasks, as that would collapse the series to one day.
             // We only update text, category, time.
             // Exception: If the user changed the date of the *current* task, that change is already in `newData` and applied to *this* task logic below? 
             // Actually, `newData` contains the date the user selected in the form.
             
             if (t.id === task.id) {
               // For the specifically clicked task, apply all changes including date
               return { ...t, ...newData };
             } else {
               // For others, apply text/category/time, but KEEP their original date
               return { 
                 ...t, 
                 text: newData.text,
                 category: newData.category,
                 time: newData.time,
                 // preserve t.date
               };
             }
           });
        }
      }

      return nextTasks;
    });

    setIsRecurrenceModalOpen(false);
    setPendingRecurrenceAction(null);
  };

  const openEdit = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  // --- Sorting & Filtering ---

  const sortTasks = (taskList: Task[]) => {
    return taskList.sort((a, b) => {
      // 1. Time (if exists)
      if (a.time && b.time) return a.time.localeCompare(b.time);
      if (a.time && !b.time) return -1;
      if (!a.time && b.time) return 1;
      
      // 2. Completed at bottom
      if (a.completed !== b.completed) return a.completed ? 1 : -1;

      // 3. Creation time
      return a.createdAt - b.createdAt;
    });
  };

  const workTasks = useMemo(() => sortTasks(tasks.filter(t => t.category === 'WORK' && t.date === currentDateStr)), [tasks, currentDateStr]);
  const familyTasks = useMemo(() => sortTasks(tasks.filter(t => t.category === 'FAMILY' && t.date === currentDateStr)), [tasks, currentDateStr]);
  const longTermTasks = useMemo(() => sortTasks(tasks.filter(t => t.category === 'LONG_TERM')), [tasks]);

  const Section = ({ title, items, bgColor, titleColor, emptyMsg }: { title: string, items: Task[], bgColor: string, titleColor: string, emptyMsg: string }) => (
    // Changed: flex-1 for equal width 3 columns. min-w-0 to allow shrinking. Reduced padding.
    <div className={`flex-1 min-w-0 h-full ${bgColor} overflow-y-auto no-scrollbar px-1 pt-4 pb-[28rem] border-r border-white/20 last:border-r-0`}>
      <h2 className={`text-sm font-black ${titleColor} mb-3 flex flex-col items-center justify-center text-center gap-1 min-h-[3rem]`}>
        <span className="leading-tight">{title}</span>
        <span className="text-[10px] bg-white/60 px-1.5 py-0.5 rounded-full font-bold shadow-sm">{items.length}</span>
      </h2>
      {items.length === 0 ? (
        <div className="h-20 mx-1 flex flex-col items-center justify-center text-slate-500/50 text-[10px] font-bold italic border-2 border-dashed border-white/40 rounded-xl bg-white/20 text-center px-1">
          <span>{emptyMsg}</span>
        </div>
      ) : (
        <div className="space-y-2 px-1">
            {items.map(task => (
                <TaskItem 
                    key={task.id} 
                    task={task} 
                    onToggle={toggleTask} 
                    onDelete={deleteTask}
                    onEdit={openEdit}
                />
            ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="h-[100dvh] bg-[#FDFBF7] text-slate-800 font-sans flex flex-col overflow-hidden">
      <DateHeader 
        currentDate={currentDate} 
        onDateChange={setCurrentDate} 
        onGoToday={() => setCurrentDate(new Date())}
        onOpenCalendar={() => setIsCalendarOpen(true)}
      />

      {/* Main Area: 3 Columns Equal Width, No Scroll */}
      <div className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0 flex w-full pb-0">
          
          {/* LEFT: Work */}
          <Section 
            title="工作" 
            items={workTasks} 
            bgColor="bg-macaron-blue" 
            titleColor="text-blue-800"
            emptyMsg="沒工作了！"
          />

          {/* MIDDLE: Family */}
          <Section 
            title="家庭 & 生活" 
            items={familyTasks} 
            bgColor="bg-macaron-pink" 
            titleColor="text-pink-800"
            emptyMsg="今天沒事~"
          />

          {/* RIGHT: Long Term */}
          <Section 
            title="長程計畫 & 備註" 
            items={longTermTasks} 
            bgColor="bg-macaron-yellow" 
            titleColor="text-yellow-800"
            emptyMsg="夢想清單..."
          />
          
        </div>

        {/* Footer Area */}
        <div className="absolute bottom-0 w-full z-20 pointer-events-none">
           {/* Add Button - Added z-50 to ensure it's on top */}
           <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 pointer-events-auto z-50">
             <button
              onClick={() => { setEditingTask(null); setIsModalOpen(true); }}
              className="w-14 h-14 bg-slate-800 hover:bg-slate-700 text-white rounded-full shadow-xl shadow-slate-900/20 flex items-center justify-center transition-all hover:scale-105 active:scale-90"
             >
               <Plus size={28} strokeWidth={3} />
             </button>
           </div>
           
           {/* Future Preview */}
           <div className="pointer-events-auto">
             <FuturePreview 
              currentDate={currentDate} 
              tasks={tasks} 
              onNavigate={setCurrentDate}
            />
           </div>
        </div>
      </div>

      <TaskInputModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddTask}
        onEditSubmit={handleEditTask}
        initialDate={currentDateStr}
        editingTask={editingTask}
      />

      <CalendarOverview 
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        currentDate={currentDate}
        onSelectDate={setCurrentDate}
        tasks={tasks}
      />

      <RecurrenceOptionModal 
        isOpen={isRecurrenceModalOpen}
        onClose={() => { setIsRecurrenceModalOpen(false); setPendingRecurrenceAction(null); }}
        onConfirm={executeRecurrenceAction}
        actionType={pendingRecurrenceAction?.type || 'DELETE'}
      />
    </div>
  );
};

export default App;