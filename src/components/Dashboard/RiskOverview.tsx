import React from 'react';
import { Project, ProjectStatus } from '../../types';
import { AlertCircle, CheckCircle2, Clock, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface RiskOverviewProps {
  projects: Project[];
}

export const RiskOverview: React.FC<RiskOverviewProps> = ({ projects }) => {
  const navigate = useNavigate();

  // Filter for projects that are active and have warnings
  const highRiskProjects = projects.filter(p => 
    p.status !== ProjectStatus.WON && 
    p.status !== ProjectStatus.LOST && 
    (p.progress.credit === 'warning' || p.progress.technical === 'warning' || p.progress.economic === 'warning')
  ).slice(0, 3);

  // Recent checked projects (completed checks)
  const recentCheckedProjects = projects.filter(p => 
    p.status !== ProjectStatus.WON && 
    p.status !== ProjectStatus.LOST && 
    (p.progress.credit === 'success' || p.progress.technical === 'success' || p.progress.economic === 'success')
  ).sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime()).slice(0, 3);

  return (
    <div className="bg-white rounded-xl shadow-[0_2px_10px_-2px_rgba(0,0,0,0.05)] p-6 h-full flex flex-col">
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
        <AlertCircle className="w-5 h-5 text-orange-500 mr-2" />
        风险概览
      </h3>

      {/* High Risk Projects */}
      <div className="mb-6">
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">高风险项目</h4>
        {highRiskProjects.length > 0 ? (
          <div className="space-y-3">
            {highRiskProjects.map(project => (
              <div 
                key={project.id}
                onClick={() => navigate(`/projects/${project.id}`)}
                className="group p-3 bg-orange-50/50 border border-orange-100 rounded-lg hover:bg-orange-50 hover:border-orange-200 transition-all cursor-pointer"
              >
                <div className="flex justify-between items-start mb-1">
                  <h5 className="text-sm font-medium text-gray-900 line-clamp-1 group-hover:text-orange-700 transition-colors">
                    {project.name}
                  </h5>
                  <span className="text-[10px] px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded font-medium shrink-0 ml-2">
                    风险
                  </span>
                </div>
                <div className="flex items-center text-xs text-gray-500 mt-2">
                  <span className="mr-2">检查发现潜在风险点</span>
                  <ChevronRight size={12} className="ml-auto text-gray-400 group-hover:text-orange-500 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-gray-400 py-4 text-center bg-gray-50 rounded-lg border border-dashed border-gray-200">
            暂无高风险项目
          </div>
        )}
      </div>

      {/* Recent Checked Projects */}
      <div>
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">最近检查完成</h4>
        {recentCheckedProjects.length > 0 ? (
          <div className="space-y-3">
            {recentCheckedProjects.map(project => (
              <div 
                key={project.id}
                onClick={() => navigate(`/projects/${project.id}`)}
                className="group p-3 bg-white border border-gray-100 rounded-lg hover:shadow-sm hover:border-brand/20 transition-all cursor-pointer"
              >
                <div className="flex justify-between items-start mb-1">
                  <h5 className="text-sm font-medium text-gray-900 line-clamp-1 group-hover:text-brand transition-colors">
                    {project.name}
                  </h5>
                  <span className="text-[10px] px-1.5 py-0.5 bg-green-50 text-green-700 rounded font-medium shrink-0 ml-2">
                    已完成
                  </span>
                </div>
                <div className="flex items-center text-xs text-gray-400 mt-2">
                  <Clock size={12} className="mr-1" />
                  <span>更新于 {project.lastUpdated.toLocaleDateString()}</span>
                  <ChevronRight size={12} className="ml-auto text-gray-300 group-hover:text-brand transition-colors" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-gray-400 py-4 text-center bg-gray-50 rounded-lg border border-dashed border-gray-200">
            暂无最近检查项目
          </div>
        )}
      </div>
    </div>
  );
};
