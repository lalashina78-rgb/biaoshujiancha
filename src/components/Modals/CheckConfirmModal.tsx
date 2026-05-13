import React from 'react';
import { X, Play, Zap, Sparkles, CreditCard } from 'lucide-react';
import { Button } from '../UI/Button';
import { motion, AnimatePresence } from 'framer-motion';

interface CheckConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const CheckConfirmModal: React.FC<CheckConfirmModalProps> = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <AnimatePresence>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-md" 
          onClick={onClose} 
        />
      </AnimatePresence>

      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative bg-white rounded-[32px] shadow-2xl w-full max-w-[720px] overflow-hidden flex flex-col font-sans"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-50 shrink-0">
          <h2 className="text-lg font-bold text-gray-800">检查确认</h2>
          <button 
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-12 flex flex-col items-center text-center">
          {/* Animated Icon Container */}
          <div className="relative mb-8">
            <motion.div 
              animate={{ scale: [1, 1.1, 1] }} 
              transition={{ repeat: Infinity, duration: 3 }}
              className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 relative z-10"
            >
              <Play size={32} fill="currentColor" />
            </motion.div>
            <div className="absolute inset-0 bg-blue-400/20 rounded-full blur-xl scale-150 animate-pulse" />
          </div>

          <h3 className="text-2xl font-bold text-gray-900 mb-3">准备开始检查</h3>
          <p className="text-gray-500 text-sm max-w-md leading-relaxed mb-10">
            针对资信标核心条款的 AI 智能核验系统已就绪。系统将核对此版本文件与招标文件的响应程度。
          </p>

          {/* Quota Consumption Card */}
          <div className="w-full bg-[#F5F8FF] rounded-3xl p-8 mb-10 relative overflow-hidden">
            {/* Background decorative glass elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/10 rounded-full blur-3xl -mr-16 -mt-16" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-400/10 rounded-full blur-3xl -ml-16 -mb-16" />

            <div className="relative flex items-center justify-between gap-4">
              {/* Current */}
              <div className="flex-1 flex flex-col items-center">
                <span className="text-xs font-bold text-gray-400 mb-2">当前剩余</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-gray-900">3</span>
                  <span className="text-sm font-bold text-gray-400">次</span>
                </div>
              </div>

              {/* Arrow/Middle Section */}
              <div className="flex flex-col items-center shrink-0">
                <div className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center text-blue-500 mb-2">
                  <Zap size={18} fill="currentColor" />
                </div>
                <div className="bg-blue-100/50 text-blue-600 text-[10px] font-bold px-3 py-1 rounded-full border border-blue-200">
                  此环节消耗 1 次
                </div>
              </div>

              {/* Result */}
              <div className="flex-1 flex flex-col items-center">
                <span className="text-xs font-bold text-gray-400 mb-2">检查后剩余</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-blue-600">2</span>
                  <span className="text-sm font-bold text-blue-600">次</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 w-full">
            <Button 
              variant="outline" 
              className="flex-1 h-16 rounded-2xl border-gray-100 text-gray-400 font-bold hover:bg-gray-50 text-base"
              onClick={onClose}
            >
              暂不检查
            </Button>
            <Button 
              className="flex-1 h-16 rounded-2xl bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-200 text-white font-bold text-base flex items-center justify-center gap-2"
              onClick={onConfirm}
            >
              <Sparkles size={18} /> 确认消耗并开始 <span className="text-lg">→</span>
            </Button>
          </div>

          {/* Footer Link */}
          <button className="mt-8 text-gray-400 hover:text-blue-500 text-xs font-bold flex items-center gap-1.5 transition-colors">
            <CreditCard size={14} /> 获取更多次数
          </button>
        </div>
      </motion.div>
    </div>
  );
};
