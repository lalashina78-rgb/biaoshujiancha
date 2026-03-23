import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { 
  Search, 
  Filter, 
  Plus, 
  MoreVertical, 
  Eye, 
  Edit2, 
  Trash2,
  Clock,
  MapPin,
  CalendarDays,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { ProjectStatus } from '../types';
import { Button } from '../components/UI/Button';
import { PageHeader } from '../components/common/PageHeader';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const getStatusColor = (status: ProjectStatus) => {
  switch (status) {
    case ProjectStatus.CREATED: return 'bg-gray-100 text-gray-700 border-gray-200';
    case ProjectStatus.IN_PROGRESS: return 'bg-blue-50 text-blue-700 border-blue-200';
    case ProjectStatus.CHECKING: return 'bg-orange-50 text-orange-700 border-orange-200';
    case ProjectStatus.SUBMITTED: return 'bg-purple-50 text-purple-700 border-purple-200';
    case ProjectStatus.OPENED: return 'bg-cyan-50 text-cyan-700 border-cyan-200';
    case ProjectStatus.WON: return 'bg-green-50 text-green-700 border-green-200';
    case ProjectStatus.LOST: return 'bg-red-50 text-red-700 border-red-200';
    default: return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

const formatDate = (date?: Date) => {
  if (!date) return '-';
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

const getDaysRemaining = (date?: Date) => {
  if (!date) return null;
  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export const ProjectManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { projects, setIsCreateModalOpen } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (p.region && p.region.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col h-full space-y-6">
      <PageHeader
        title="项目管理"
        description={<span className="text-sm text-gray-500">管理您的所有投标项目，跟踪进度和状态</span>}
        actions={
          <Button 
            variant="primary" 
            className="flex items-center gap-2 shadow-md shadow-brand/20"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus size={18} />
            新建项目
          </Button>
        }
        className="px-0 py-2"
      />

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="搜索项目名称或地区..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all outline-none text-sm"
            />
          </div>
          <div className="relative hidden sm:block">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none pl-10 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all outline-none text-sm text-gray-700 cursor-pointer"
            >
              <option value="all">所有状态</option>
              {Object.values(ProjectStatus).map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          </div>
        </div>
        
        <div className="text-sm text-gray-500">
          共找到 <span className="font-bold text-gray-900">{filteredProjects.length}</span> 个项目
        </div>
      </div>

      {/* Project List / Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">项目名称/编号</th>
                <th className="px-6 py-4 font-medium">项目类型</th>
                <th className="px-6 py-4 font-medium">招标人/联系方式</th>
                <th className="px-6 py-4 font-medium">开标时间</th>
                <th className="px-6 py-4 font-medium">负责人</th>
                <th className="px-6 py-4 font-medium">状态</th>
                <th className="px-6 py-4 font-medium text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProjects.length > 0 ? (
                filteredProjects.map((project) => {
                  const daysRemaining = getDaysRemaining(project.deadline);
                  return (
                    <tr 
                      key={project.id} 
                      className="hover:bg-gray-50/50 transition-colors group cursor-pointer"
                      onClick={() => navigate(`/projects/${project.id}`)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900 group-hover:text-brand transition-colors line-clamp-1">
                            {project.name}
                          </span>
                          <span className="text-xs text-gray-500 mt-1 font-mono">
                            {project.projectNumber || '暂无编号'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-700 bg-gray-100 px-2 py-1 rounded-md">
                          {project.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm text-gray-900 line-clamp-1" title={project.tenderer}>
                            {project.tenderer || '-'}
                          </span>
                          <span className="text-xs text-gray-500 mt-1">
                            {project.contactPerson ? `${project.contactPerson} ` : ''}
                            {project.contactPhone ? `(${project.contactPhone})` : ''}
                            {!project.contactPerson && !project.contactPhone && '-'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5 text-sm text-gray-700">
                            <CalendarDays size={14} className="text-gray-400" />
                            {formatDate(project.openingDate)}
                          </div>
                          {daysRemaining !== null && (
                            <div className="mt-1">
                              {daysRemaining > 0 ? (
                                <span className={cn(
                                  "text-xs font-medium px-1.5 py-0.5 rounded",
                                  daysRemaining <= 3 ? "bg-red-50 text-red-600" : "bg-orange-50 text-orange-600"
                                )}>
                                  倒计时 {daysRemaining} 天
                                </span>
                              ) : (
                                <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">
                                  已开标
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-brand-light text-brand flex items-center justify-center text-xs font-bold">
                            {project.manager ? project.manager.charAt(0) : '?'}
                          </div>
                          <span className="text-sm text-gray-700">{project.manager || '-'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-2.5 py-1 rounded-full text-xs font-medium border whitespace-nowrap",
                          getStatusColor(project.status)
                        )}>
                          {project.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          <button 
                            onClick={() => navigate(`/projects/${project.id}`)}
                            className="p-1.5 text-gray-400 hover:text-brand hover:bg-brand-light rounded-md transition-colors"
                            title="查看详情"
                          >
                            <Eye size={18} />
                          </button>
                          <button 
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            title="编辑"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button 
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title="删除"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                        <Search size={24} className="text-gray-400" />
                      </div>
                      <p>没有找到匹配的项目</p>
                      <Button 
                        variant="outline" 
                        className="mt-4"
                        onClick={() => {
                          setSearchTerm('');
                          setStatusFilter('all');
                        }}
                      >
                        清除筛选
                      </Button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination (Mock) */}
        {filteredProjects.length > 0 && (
          <div className="mt-auto border-t border-gray-100 px-6 py-4 flex items-center justify-between bg-gray-50/50">
            <span className="text-sm text-gray-500">
              显示 1 到 {filteredProjects.length} 条，共 {filteredProjects.length} 条
            </span>
            <div className="flex items-center gap-2">
              <button className="p-1.5 rounded border border-gray-200 text-gray-400 hover:bg-white disabled:opacity-50" disabled>
                <ChevronLeft size={16} />
              </button>
              <button className="w-8 h-8 rounded bg-brand text-white text-sm font-medium">1</button>
              <button className="p-1.5 rounded border border-gray-200 text-gray-600 hover:bg-white hover:text-brand">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
