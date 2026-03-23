import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CheckStepsProps {
  currentStep: 1 | 2 | 3;
  isCurrentStepCompleted?: boolean;
  className?: string;
}

const STEPS = [
  { id: 1, label: '确认文件' },
  { id: 2, label: '查看检查点' },
  { id: 3, label: '查看结果' },
];

export const CheckSteps: React.FC<CheckStepsProps> = ({ currentStep, isCurrentStepCompleted, className }) => {
  return (
    <div className={cn("w-full py-3 px-4 bg-white rounded-2xl border border-gray-100 shadow-sm mb-6", className)}>
      <div className="max-w-3xl mx-auto relative flex items-start">
        {STEPS.map((step, index) => {
          const isCompleted = step.id < currentStep || (step.id === currentStep && isCurrentStepCompleted);
          const isActive = step.id === currentStep && !isCurrentStepCompleted;
          const isPending = step.id > currentStep;

          return (
            <div key={step.id} className="relative flex-1 flex flex-col items-center">
              {/* Connection Line to next step */}
              {index < STEPS.length - 1 && (
                <div className="absolute top-4 left-1/2 w-full h-0.5 bg-gray-100 -z-0">
                  <div 
                    className="h-full bg-brand transition-all duration-500"
                    style={{ 
                      width: step.id < currentStep || (step.id === currentStep && isCurrentStepCompleted) ? '100%' : '0%' 
                    }}
                  />
                </div>
              )}

              <div className={cn(
                "relative z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 border-2",
                isCompleted ? "bg-brand border-brand text-white" :
                isActive ? "bg-white border-brand text-brand shadow-[0_0_0_2.5px_rgba(37,99,235,0.1)]" :
                "bg-white border-gray-200 text-gray-300"
              )}>
                {isCompleted ? (
                  <CheckCircle2 size={18} />
                ) : (
                  <span className="text-xs font-bold">{step.id}</span>
                )}
              </div>
              <div className={cn(
                "mt-1.5 whitespace-nowrap text-xs font-bold transition-colors duration-300",
                isPending ? "text-gray-400" : "text-gray-900"
              )}>
                {step.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
