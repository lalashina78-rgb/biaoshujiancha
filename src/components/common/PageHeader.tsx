import React from 'react';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
}

export interface PageHeaderProps {
  title: string;
  breadcrumbs?: BreadcrumbItem[];
  onBack?: () => void;
  actions?: React.ReactNode;
  className?: string;
  description?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  breadcrumbs = [],
  onBack,
  actions,
  className,
  description
}) => {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      <div className="flex items-center gap-4">
        {onBack && (
          <button 
            onClick={onBack} 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 shrink-0"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <div className="flex flex-col">
          {breadcrumbs.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-0.5">
              {breadcrumbs.map((item, index) => (
                <React.Fragment key={index}>
                  {index > 0 && <ChevronRight size={12} className="shrink-0 text-gray-400" />}
                  <span 
                    className={cn(
                      "truncate max-w-[200px]",
                      item.onClick ? "cursor-pointer hover:text-brand transition-colors" : "text-gray-900"
                    )}
                    onClick={item.onClick}
                  >
                    {item.label}
                  </span>
                </React.Fragment>
              ))}
            </div>
          )}
          <h1 className="text-xl font-bold text-gray-900 truncate">{title}</h1>
          {description && (
            <div className="mt-0.5">
              {description}
            </div>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex items-center gap-3 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
};
