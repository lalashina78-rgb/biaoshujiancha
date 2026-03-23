import React from 'react';
import { Plus } from 'lucide-react';

import toolIconUrl from '../../assets/icons/清标工具.svg';
import marketIconUrl from '../../assets/icons/素材市场.svg';
import aiIconUrl from '../../assets/icons/招标解析.svg';
import playIconUrl from '../../assets/icons/模拟开标.svg';
import chartIconUrl from '../../assets/icons/交易智库.svg';
import bookIconUrl from '../../assets/icons/标桥百科.svg';

interface QuickActionsProps {
  onCreateClick: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onCreateClick }) => {
  const tools = [
    { name: '清标工具', iconUrl: toolIconUrl },
    { name: '素材市场', iconUrl: marketIconUrl },
    { name: '招标解析', iconUrl: aiIconUrl },
    { name: '模拟开标', iconUrl: playIconUrl },
    { name: '交易智库', iconUrl: chartIconUrl },
    { name: '标桥百科', iconUrl: bookIconUrl },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Create Project Card - Major Action */}
      <div className="lg:w-1/4 shrink-0">
        <button 
          onClick={onCreateClick}
          className="w-full h-[120px] bg-gradient-to-br from-[#125FFA] to-[#0A47C7] rounded-lg shadow-lg shadow-blue-500/20 text-white p-6 flex flex-col justify-between hover:scale-[1.02] hover:shadow-xl transition-all duration-300 group"
        >
          <div className="flex items-start justify-between w-full">
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
              <Plus size={24} className="text-white" />
            </div>
          </div>
          <div className="text-left">
            <h3 className="text-lg font-bold mb-1">创建项目</h3>
          </div>
        </button>
      </div>

      {/* Tool Grid */}
      <div className="flex-1 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {tools.map((tool) => (
          <button 
            key={tool.name}
            className="flex flex-col items-center justify-center p-4 bg-white rounded-lg border border-transparent shadow-sm hover:border-blue-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300 h-[120px]"
          >
            <div className="mb-2">
              <img src={tool.iconUrl} alt={tool.name} className="w-10 h-10 object-contain" />
            </div>
            <span className="text-sm text-text-secondary font-medium">{tool.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
