import React from 'react';
import { Clock, FileText } from 'lucide-react';
import { Project, ProjectStatus } from '../../types';

interface ProjectRowProps {
  project: Project;
  onClick: (project: Project) => void;
  isFirst?: boolean;
  isLast?: boolean;
}

export const ProjectRow: React.FC<ProjectRowProps> = ({ project, onClick }) => {
  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.CREATED: return 'bg-gray-100 text-gray-600';
      case ProjectStatus.IN_PROGRESS: return 'bg-blue-50 text-blue-600';
      case ProjectStatus.SUBMITTED: return 'bg-green-50 text-green-600';
      case ProjectStatus.OPENED: return 'bg-purple-50 text-purple-600';
      case ProjectStatus.WON: return 'bg-emerald-50 text-emerald-600';
      case ProjectStatus.LOST: return 'bg-red-50 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusLabel = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.CREATED: return '未开始';
      case ProjectStatus.IN_PROGRESS: return '进行中';
      case ProjectStatus.SUBMITTED: return '已完成';
      default: return status;
    }
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
      return { label: '投标截止', time: project.deadline, daysLeft: diffDays, isUrgent: diffDays <= 3 };
    }
    if (project.openingDate && project.openingDate > now) {
      const diffDays = Math.ceil((project.openingDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return { label: '开标时间', time: project.openingDate, daysLeft: diffDays, isUrgent: false };
    }
    return { label: '已截止', time: null, daysLeft: 0, isUrgent: false };
  };

  const nextNode = getNextNode(project);

  return (
    <div 
      onClick={() => onClick(project)}
      className="group flex flex-col sm:flex-row sm:items-center p-4 hover:bg-gray-50 transition-all cursor-pointer border-b border-gray-100 last:border-0 gap-4"
    >
      {/* 1. Basic Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <h3 className="font-bold text-base text-gray-900 truncate group-hover:text-brand transition-colors">
            {project.name}
          </h3>
        </div>
        <div className="flex items-center text-xs text-gray-500 gap-3">
          <span className={`px-2 py-0.5 rounded-md font-medium ${getStatusColor(project.status)}`}>
            {getStatusLabel(project.status)}
          </span>
          <span className="flex items-center text-gray-400">
            <Clock size={12} className="mr-1" />
            更新于 {formatTimeAgo(project.lastUpdated)}
          </span>
        </div>
      </div>

      {/* 2. Key Time Info */}
      {nextNode.time && (
        <div className="sm:w-48 shrink-0 flex flex-col justify-center sm:border-l sm:border-gray-100 sm:pl-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-gray-500">{nextNode.label}</span>
            {nextNode.isUrgent && (
              <span className="text-[10px] bg-red-100 text-red-600 px-1.5 rounded font-medium">
                剩{nextNode.daysLeft}天
              </span>
            )}
          </div>
          <div className={`text-sm font-medium ${nextNode.isUrgent ? 'text-red-600' : 'text-gray-900'}`}>
            {nextNode.time.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      )}
    </div>
  );
};
