import React from 'react';
import { RefreshCw, FileText, Layers } from 'lucide-react';
import { Project, ProjectStatus } from '../../types';

interface ProjectCardProps {
  project: Project;
  onClick: (project: Project) => void;
  isFirst?: boolean;
  isLast?: boolean;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick }) => {
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return '刚刚';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}分钟前`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}小时前`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}天前`;
    return date.toLocaleDateString('zh-CN');
  };

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
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[13px] text-gray-500">
            <Layers size={14} className="text-brand/60" />
            <span className="font-medium text-gray-700">版本数量: {project.versions?.length || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
