import React from 'react';
import { Layers, ArrowRight, Check, X } from 'lucide-react';

export type RecurrenceScope = 'SINGLE' | 'FUTURE' | 'ALL';

interface RecurrenceOptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (scope: RecurrenceScope) => void;
  actionType: 'EDIT' | 'DELETE';
}

export const RecurrenceOptionModal: React.FC<RecurrenceOptionModalProps> = ({ isOpen, onClose, onConfirm, actionType }) => {
  if (!isOpen) return null;

  const isDelete = actionType === 'DELETE';
  const colorClass = isDelete ? 'text-red-500 bg-red-50 hover:bg-red-100' : 'text-blue-600 bg-blue-50 hover:bg-blue-100';
  const borderClass = isDelete ? 'border-red-100' : 'border-blue-100';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden p-6 animate-scale-in">
        <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-black text-slate-700">
                {isDelete ? '刪除循環事項' : '編輯循環事項'}
            </h3>
            <button onClick={onClose} className="p-1 bg-slate-100 rounded-full hover:bg-slate-200">
                <X size={16} className="text-slate-500" />
            </button>
        </div>
        
        <p className="text-sm text-slate-500 mb-6 font-medium">
            此事項屬於循環行程的一部分，您想要如何套用變更？
        </p>

        <div className="space-y-3">
            <button 
                onClick={() => onConfirm('SINGLE')}
                className="w-full flex items-center gap-3 p-4 rounded-xl border border-slate-100 bg-white hover:border-blue-200 shadow-sm transition-all active:scale-95 group"
            >
                <div className="p-2 rounded-full bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-500">
                    <Check size={18} />
                </div>
                <div className="text-left">
                    <span className="block font-bold text-slate-700 text-sm">僅此事項</span>
                    <span className="block text-xs text-slate-400">只修改這一次的內容。</span>
                </div>
            </button>

            <button 
                onClick={() => onConfirm('FUTURE')}
                className="w-full flex items-center gap-3 p-4 rounded-xl border border-slate-100 bg-white hover:border-blue-200 shadow-sm transition-all active:scale-95 group"
            >
                <div className="p-2 rounded-full bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-500">
                    <ArrowRight size={18} />
                </div>
                <div className="text-left">
                    <span className="block font-bold text-slate-700 text-sm">此事項與之後的所有事項</span>
                    <span className="block text-xs text-slate-400">從今天開始之後的所有行程。</span>
                </div>
            </button>

            <button 
                onClick={() => onConfirm('ALL')}
                className="w-full flex items-center gap-3 p-4 rounded-xl border border-slate-100 bg-white hover:border-blue-200 shadow-sm transition-all active:scale-95 group"
            >
                <div className={`p-2 rounded-full ${colorClass}`}>
                    <Layers size={18} />
                </div>
                <div className="text-left">
                    <span className={`block font-bold text-sm ${isDelete ? 'text-red-600' : 'text-blue-600'}`}>
                        系列中的所有事項
                    </span>
                    <span className="block text-xs text-slate-400">
                        {isDelete ? '取消整個循環行程。' : '修改整個循環設定。'}
                    </span>
                </div>
            </button>
        </div>
      </div>
    </div>
  );
};