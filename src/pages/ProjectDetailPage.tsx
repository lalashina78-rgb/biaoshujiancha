import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ProjectDetail } from '../components/Project/ProjectDetail';
import { useStore } from '../store/useStore';

export const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects } = useStore();

  const project = projects.find(p => p.id === id);

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl shadow-sm">
        <h2 className="text-xl font-bold text-gray-700 mb-2">项目不存在或已被删除</h2>
        <p className="text-gray-500 mb-6">您访问的项目 ID 无效或您没有权限查看。</p>
        <button 
          onClick={() => navigate('/')}
          className="px-6 py-2 bg-brand text-white rounded-lg hover:bg-brand-dark transition-colors"
        >
          返回工作台
        </button>
      </div>
    );
  }

  return (
    <ProjectDetail 
      project={project} 
      onBack={() => navigate('/')}
    />
  );
};

