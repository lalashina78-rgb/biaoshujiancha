import React from 'react';
import { Bot, FileCheck, AlertTriangle, RefreshCw, Plus } from 'lucide-react';

interface ProductHeroProps {
  onCreateClick: () => void;
}

export const ProductHero: React.FC<ProductHeroProps> = ({ onCreateClick }) => {
  const capabilities = [
    {
      icon: <Bot size={20} className="text-blue-600" />,
      title: 'AI技术标评审',
      desc: '自动解析评分标准，模拟评审生成报告'
    },
    {
      icon: <FileCheck size={20} className="text-green-600" />,
      title: '标书合规检查',
      desc: '识别否决性条款，提前发现废标风险'
    },
    {
      icon: <AlertTriangle size={20} className="text-orange-600" />,
      title: '多维风险识别',
      desc: '检测格式、内容及逻辑问题'
    },
    {
      icon: <RefreshCw size={20} className="text-purple-600" />,
      title: '一键优化重评',
      desc: '提供优化建议，支持修改后重新评分'
    }
  ];

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-stretch items-center justify-between gap-8">
        {/* Left: Intro & Capabilities */}
        <div className="flex-1 w-full flex flex-col justify-center">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">AI标书检查平台</h1>
            <p className="text-gray-500 text-sm">自动识别标书风险，降低废标概率，提高投标质量。</p>
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
            <span className="font-bold text-lg">新建检查项目</span>
            <span className="text-xs text-blue-100 mt-1 opacity-80">开始智能检查</span>
          </button>
        </div>
      </div>
    </div>
  );
};
