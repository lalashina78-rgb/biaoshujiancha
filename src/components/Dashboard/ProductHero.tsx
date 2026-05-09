import React from 'react';
import { Sparkles, ShieldCheck, Activity, Search, Plus } from 'lucide-react';

interface ProductHeroProps {
  onCreateClick: () => void;
}

export const ProductHero: React.FC<ProductHeroProps> = ({ onCreateClick }) => {
  const capabilities = [
    {
      icon: <Sparkles size={20} className="text-blue-600" />,
      title: '规避废标风险',
      desc: 'AI 深度识别招标文件废标条款，确保投标合规性'
    },
    {
      icon: <ShieldCheck size={20} className="text-green-600" />,
      title: '锁定评标胜局',
      desc: '资信、技术、经济全维度符合性核查，提升中标率'
    },
    {
      icon: <Activity size={20} className="text-orange-600" />,
      title: '极大化人效提升',
      desc: '数天评审缩短至分钟级，让初审更精准更高效'
    },
    {
      icon: <Search size={20} className="text-purple-600" />,
      title: '决策支持辅助',
      desc: '提供优化建议与原文溯源证据，让风险可控可查'
    }
  ];

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-stretch items-center justify-between gap-8">
        {/* Left: Intro & Capabilities */}
        <div className="flex-1 w-full flex flex-col justify-center">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">标桥·AI标书检查</h1>
            <p className="text-gray-500 text-sm">招投标合规性保障专家：精准核验、告别废标、稳步中标</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {capabilities.map((cap, idx) => (
              <div key={idx} className="flex items-start p-3 bg-gray-50 rounded-lg border border-gray-100 hover:shadow-sm transition-shadow">
                <div className="p-2 bg-white rounded-md shadow-sm mr-3 shrink-0">
                  {cap.icon}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1">{cap.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{cap.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Main CTA */}
        <div className="shrink-0 flex">
          <button 
            onClick={onCreateClick}
            className="flex flex-col items-center justify-center w-60 py-8 lg:py-0 bg-gradient-to-br from-brand to-brand-dark text-white rounded-xl shadow-lg shadow-brand/20 hover:shadow-xl hover:scale-[1.02] transition-all group"
          >
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-3 group-hover:bg-white/30 transition-colors">
              <Plus size={28} />
            </div>
            <span className="font-bold text-lg">新建项目</span>
            <span className="text-xs text-blue-100 mt-1 opacity-80">开启 AI 智能评审</span>
          </button>
        </div>
      </div>
    </div>
  );
};
