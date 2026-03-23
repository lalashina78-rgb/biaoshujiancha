import React from 'react';
import { Clock, RefreshCw, Clock3, Calendar } from 'lucide-react';
import { Project, ProjectStatus, ProjectType } from '../../types';
import { CheckCircle2, AlertCircle, Clock3 as ClockPending, FileText } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  onClick: (project: Project) => void;
  isFirst?: boolean;
  isLast?: boolean;
  showCheckStatus?: boolean;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick, isFirst, isLast, showCheckStatus }) => {
  const formatDate = (date?: Date) => {
    if (!date) return '未设置';
    return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }) + ' ' + 
           date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return '刚刚';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}分钟前`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}小时前`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}天前`;
    return date.toLocaleDateString('zh-CN');
  };

  const getNextNode = (project: Project) => {
    const now = new Date();
    if (project.deadline && project.deadline > now) {
      const diffDays = Math.ceil((project.deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return { 
        label: '投标截止', 
        time: project.deadline, 
        isUrgent: diffDays <= 3,
        daysLeft: diffDays,
        icon: <Clock size={16} className={diffDays <= 3 ? "text-red-500" : "text-gray-400"} />
      };
    }
    if (project.openingDate && project.openingDate > now) {
      const diffDays = Math.ceil((project.openingDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return { 
        label: '开标时间', 
        time: project.openingDate, 
        isUrgent: diffDays <= 3,
        daysLeft: diffDays,
        icon: <Calendar size={16} className={diffDays <= 3 ? "text-red-500" : "text-gray-400"} />
      };
    }
    return { 
      label: '投标截止', 
      time: project.deadline, 
      isUrgent: false,
      daysLeft: 0,
      icon: <Clock size={16} className="text-gray-400" />
    };
  };

  const nextNode = getNextNode(project);
  
  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.CREATED: return 'bg-gray-100 text-gray-600';
      case ProjectStatus.IN_PROGRESS: return 'bg-blue-50 text-blue-600';
      case ProjectStatus.CHECKING: return 'bg-yellow-50 text-yellow-600';
      case ProjectStatus.SUBMITTED: return 'bg-green-50 text-green-600';
      case ProjectStatus.OPENED: return 'bg-purple-50 text-purple-600';
      case ProjectStatus.WON: return 'bg-emerald-50 text-emerald-600';
      case ProjectStatus.LOST: return 'bg-red-50 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusLabel = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.CREATED: return '已创建';
      case ProjectStatus.IN_PROGRESS: return '标书制作中';
      case ProjectStatus.CHECKING: return '检查中';
      case ProjectStatus.SUBMITTED: return '已提交';
      case ProjectStatus.OPENED: return '已开标';
      case ProjectStatus.WON: return '已中标';
      case ProjectStatus.LOST: return '未中标';
      default: return status;
    }
  };

  const renderProgressIcon = (status: 'success' | 'warning' | 'pending') => {
    switch (status) {
      case 'success': return <CheckCircle2 size={14} className="text-green-500" />;
      case 'warning': return <AlertCircle size={14} className="text-orange-500" />;
      case 'pending': return <ClockPending size={14} className="text-gray-300" />;
    }
  };

  const getProgressColor = (status: 'success' | 'warning' | 'pending') => {
    switch (status) {
      case 'success': return 'text-gray-700';
      case 'warning': return 'text-orange-600';
      case 'pending': return 'text-gray-400';
    }
  };

  return (
    <div 
      onClick={() => onClick(project)}
      className="group bg-white px-6 py-4 hover:bg-gray-50 transition-all cursor-pointer border-b border-gray-200 last:border-b-0"
    >
      {/* Top Row: Name and Status */}
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-[17px] text-gray-900 line-clamp-1 flex-1 pr-4 group-hover:text-brand transition-colors">
          {project.name}
        </h3>
        <span className={`text-[11px] px-1.5 py-0.5 rounded font-medium shrink-0 ${getStatusColor(project.status)}`}>
          {getStatusLabel(project.status)}
        </span>
      </div>

      {/* Second Row: Update Time & Deadline */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded text-[12px]">
            <FileText size={12} />
            <span>{project.type}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[13px] text-gray-400">
            <RefreshCw size={12} />
            <span>更新于 {formatTimeAgo(project.lastUpdated)}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 text-[13px] ${nextNode.isUrgent ? 'text-red-500' : 'text-gray-500'}`}>
            {nextNode.icon}
            <span className="font-medium">
              {nextNode.label}: {nextNode.time ? (
                nextNode.time.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }) + ' ' + 
                nextNode.time.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false })
              ) : '未设置'}
            </span>
          </div>
          {nextNode.daysLeft > 0 && nextNode.daysLeft <= 3 && (
            <span className="bg-red-500 text-white text-[11px] px-1.5 py-0.5 rounded font-medium">
              剩 {nextNode.daysLeft} 天
            </span>
          )}
        </div>
      </div>

      {/* Third Row: Check Progress (Optional) */}
      {showCheckStatus && (
        <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
          <span className="text-[13px] text-gray-400">检查进度</span>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1.5">
              <span className={`text-[13px] ${getProgressColor(project.progress.credit)}`}>资信标</span>
              {renderProgressIcon(project.progress.credit)}
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`text-[13px] ${getProgressColor(project.progress.technical)}`}>技术标</span>
              {renderProgressIcon(project.progress.technical)}
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`text-[13px] ${getProgressColor(project.progress.economic)}`}>经济标</span>
              {renderProgressIcon(project.progress.economic)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
