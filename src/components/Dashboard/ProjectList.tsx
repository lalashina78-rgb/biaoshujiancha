import React, { useState, useEffect } from 'react';
import { ProjectCard } from './ProjectCard';
import { ProjectRow } from './ProjectRow';
import { Project, ProjectStatus } from '../../types';
import { Plus, Search, ClipboardList, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { Button } from '../UI/Button';

interface ProjectListProps {
  projects: Project[];
  onCreateClick: () => void;
  onProjectClick: (project: Project) => void;
  viewMode?: 'grid' | 'list';
  showCheckStatus?: boolean;
}

export const ProjectList: React.FC<ProjectListProps> = ({ projects, onCreateClick, onProjectClick, viewMode = 'grid', showCheckStatus }) => {
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'DONE' | 'ARCHIVED'>('ACTIVE');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = viewMode === 'list' ? 10 : 5; // Show more items in list view

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, searchQuery]);

  // Filter Logic
  const filteredProjects = projects.filter(p => {
    // 1. Text Search
    if (searchQuery && !p.name.includes(searchQuery)) return false;

    // 2. Tab Filter
    if (filterStatus === 'ALL') return true;
    if (filterStatus === 'ACTIVE') {
      return [
        ProjectStatus.CREATED, 
        ProjectStatus.IN_PROGRESS, 
        ProjectStatus.SUBMITTED,
        ProjectStatus.OPENED
      ].includes(p.status);
    }
    if (filterStatus === 'DONE') {
      return [ProjectStatus.WON, ProjectStatus.LOST].includes(p.status);
    }
    // Assume archived is empty for now or specific status
    if (filterStatus === 'ARCHIVED') return false; 
    
    return true;
  }).sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime());

  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const paginatedProjects = filteredProjects.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const tabs = [
    { key: 'ACTIVE', label: '进行中' },
    { key: 'ALL', label: '全部' },
    { key: 'DONE', label: '已完成' },
    { key: 'ARCHIVED', label: '已归档' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-[0_2px_10px_-2px_rgba(0,0,0,0.05)] flex flex-col h-full overflow-hidden">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 gap-4">
        <h2 className="text-lg font-bold text-text-primary">我的项目</h2>
        
        <div className="flex items-center gap-3">
          {/* Status Filter Dropdown */}
          <div className="relative">
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="appearance-none pl-3 pr-9 h-10 text-sm border border-[#E5E7EB] rounded-md focus:border-brand focus:ring-1 focus:ring-brand outline-none bg-white transition-all cursor-pointer min-w-[100px]"
            >
              {tabs.map(tab => (
                <option key={tab.key} value={tab.key}>{tab.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="搜索项目名称" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 h-10 text-sm border border-[#E5E7EB] rounded-md focus:border-brand focus:ring-1 focus:ring-brand outline-none w-48 transition-all"
            />
          </div>
        </div>
      </div>

      {/* List Content & Pagination Block */}
      <div className="overflow-hidden flex-1 flex flex-col border-t border-gray-200">
        <div className={`flex-1 overflow-y-auto ${viewMode === 'grid' ? 'divide-y divide-gray-200' : ''}`}>
          {paginatedProjects.length > 0 ? (
            viewMode === 'grid' ? (
              // Grid View (using ProjectCard but stacked vertically as per original design, or actually grid?)
              // The original ProjectList rendered ProjectCards in a vertical list (divide-y).
              // So 'grid' here actually means 'card view'.
              <div className="divide-y divide-gray-200">
                {paginatedProjects.map((project, index) => (
                  <ProjectCard 
                    key={project.id} 
                    project={project} 
                    onClick={() => onProjectClick(project)} 
                    isFirst={index === 0}
                    isLast={index === paginatedProjects.length - 1 && filteredProjects.length <= itemsPerPage}
                    showCheckStatus={showCheckStatus}
                  />
                ))}
              </div>
            ) : (
              // List View (using ProjectRow)
              <div className="divide-y divide-gray-200">
                {paginatedProjects.map((project) => (
                  <ProjectRow 
                    key={project.id} 
                    project={project} 
                    onClick={() => onProjectClick(project)} 
                  />
                ))}
              </div>
            )
          ) : (
            <div className="h-64 flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <ClipboardList size={32} className="text-gray-400" />
              </div>
              <h3 className="text-text-primary font-medium mb-1">还没有创建项目</h3>
              <p className="text-text-tertiary text-sm mb-4">创建项目开始您的投标之旅</p>
              <Button size="sm" onClick={onCreateClick}>
                <Plus size={16} className="mr-1" /> 创建项目
              </Button>
            </div>
          )}
        </div>
        
        {/* Pagination inside the same block */}
        {filteredProjects.length > 0 && (
          <div className="px-6 py-3 bg-gray-50/30 border-t border-gray-200 flex items-center justify-between shrink-0">
            <span className="text-xs text-text-tertiary">
              共 {filteredProjects.length} 个项目，第 {currentPage}/{totalPages || 1} 页
            </span>
            <div className="flex items-center gap-2">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="p-1.5 rounded-md border border-gray-200 text-gray-500 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors bg-white shadow-sm"
              >
                <ChevronLeft size={16} />
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 text-xs rounded-md transition-all ${
                      currentPage === page 
                      ? 'bg-brand text-white font-medium shadow-sm' 
                      : 'text-text-secondary hover:bg-white hover:shadow-sm'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button 
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="p-1.5 rounded-md border border-gray-200 text-gray-500 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors bg-white shadow-sm"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
