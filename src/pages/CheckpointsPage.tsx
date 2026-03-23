import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { 
  ArrowLeft, ChevronRight, Search, RotateCcw, 
  Plus, Edit2, Trash2, ExternalLink, AlertCircle,
  FileText, ZoomIn, ZoomOut, Maximize2, ChevronDown,
  ChevronUp, CheckCircle2, Info, BarChart2
} from 'lucide-react';
import { Button } from '../components/UI/Button';
import { CheckSteps } from '../components/Check/CheckSteps';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Checkpoint {
  id: string;
  name: string;
  requirement: string;
  location: string;
  isMandatory: boolean;
  group: string;
}

const MOCK_CHECKPOINTS: Record<string, Checkpoint[]> = {
  'credit': [
    { id: '1', name: '营业执照', requirement: '投标人须具有独立法人资格，提供有效的营业执照副本复印件。', location: '招标文件 P10 第2.1条', isMandatory: true, group: '资质检查' },
    { id: '2', name: '资质证书', requirement: '建筑工程施工总承包一级及以上资质。', location: '招标文件 P12 第3.1.1条', isMandatory: true, group: '资质检查' },
    { id: '3', name: '项目经理资格', requirement: '拟派项目经理须具备一级注册建造师执业资格，且具有有效的安全生产考核合格证书（B证）。', location: '招标文件 P14 第3.1.3条', isMandatory: true, group: '资格检查' },
    { id: '4', name: '财务状况', requirement: '提供2022年度经审计的财务报告，资产负债率不得高于80%。', location: '招标文件 P15 第3.1.4条', isMandatory: false, group: '资格检查' },
    { id: '5', name: '业绩要求', requirement: '近三年内具有至少1项合同金额不低于5000万元的类似工程业绩。', location: '招标文件 P13 第3.1.2条', isMandatory: false, group: '资格检查' },
  ],
  'technical': [
    { id: 't1', name: '施工组织设计', requirement: '包含完整的施工方案、质量保证措施、安全文明施工措施等。', location: '招标文件 P25 第4.1条', isMandatory: true, group: '响应性检查' },
    { id: 't2', name: '进度计划', requirement: '横道图或网络图清晰，关键节点明确。', location: '招标文件 P28 第4.2条', isMandatory: false, group: '响应性检查' },
  ],
  'economic': [
    { id: 'e1', name: '投标报价', requirement: '报价不得超过最高投标限价。', location: '招标文件 P40 第5.1条', isMandatory: true, group: '形式检查' },
    { id: 'e2', name: '算术性错误', requirement: '单价与合价不一致时，以单价为准。', location: '招标文件 P42 第5.2条', isMandatory: true, group: '形式检查' },
  ]
};

export const CheckpointsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { projects } = useStore();
  const project = projects.find(p => p.id === id);
  
  const checkType = searchParams.get('type') || 'credit';
  const [activeTab, setActiveTab] = useState<string>(checkType);
  const [checkpoints, setCheckpoints] = useState<Record<string, Checkpoint[]>>(MOCK_CHECKPOINTS);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showReParseModal, setShowReParseModal] = useState(false);
  const [pdfPage, setPdfPage] = useState(10);
  const [activeCheckpointId, setActiveCheckpointId] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const currentCheckpoints = checkpoints[activeTab] || [];
  
  const groupedCheckpoints = useMemo(() => {
    const groups: Record<string, Checkpoint[]> = {};
    currentCheckpoints.forEach(cp => {
      if (!groups[cp.group]) groups[cp.group] = [];
      groups[cp.group].push(cp);
    });
    return groups;
  }, [currentCheckpoints]);

  // Mock highlight positions based on checkpoint ID
  const getHighlightStyle = (pageIndex: number) => {
    if (!activeCheckpointId) return { display: 'none' };
    
    // Fake positions for demonstration
    const positions: Record<string, { top: string, height: string, page: number }> = {
      '1': { top: '300px', height: '60px', page: 10 },
      '2': { top: '450px', height: '80px', page: 12 },
      '3': { top: '600px', height: '100px', page: 14 },
      '4': { top: '200px', height: '50px', page: 15 },
      '5': { top: '400px', height: '70px', page: 13 },
      't1': { top: '350px', height: '120px', page: 25 },
      't2': { top: '550px', height: '90px', page: 28 },
      'e1': { top: '250px', height: '60px', page: 40 },
      'e2': { top: '400px', height: '80px', page: 42 },
    };

    const pos = positions[activeCheckpointId] || { top: '480px', height: '160px', page: 14 };
    
    // Determine which page the highlight should be on (mock logic)
    const highlightPageIndex = pos.page > 14 ? 1 : 0;
    
    if (highlightPageIndex !== pageIndex) {
      return { display: 'none' };
    }
    
    return {
      top: pos.top,
      height: pos.height,
      display: 'block',
      transition: 'all 0.3s ease-in-out'
    };
  };

  useEffect(() => {
    if (activeCheckpointId && scrollContainerRef.current) {
      const positions: Record<string, { top: string, height: string, page: number }> = {
        '1': { top: '300px', height: '60px', page: 10 },
        '2': { top: '450px', height: '80px', page: 12 },
        '3': { top: '600px', height: '100px', page: 14 },
        '4': { top: '200px', height: '50px', page: 15 },
        '5': { top: '400px', height: '70px', page: 13 },
        't1': { top: '350px', height: '120px', page: 25 },
        't2': { top: '550px', height: '90px', page: 28 },
        'e1': { top: '250px', height: '60px', page: 40 },
        'e2': { top: '400px', height: '80px', page: 42 },
      };
      
      const pos = positions[activeCheckpointId] || { top: '480px', height: '160px', page: 14 };
      
      const topValue = parseInt(pos.top.replace('px', ''));
      const heightValue = parseInt(pos.height.replace('px', ''));
      const containerHeight = scrollContainerRef.current.clientHeight;
      
      const highlightPageIndex = pos.page > 14 ? 1 : 0;
      
      // Calculate scroll position to center the highlight
      // 1000px is the page height, 32px is the gap between pages
      const pageOffset = highlightPageIndex * (1000 + 32);
      const scrollTop = pageOffset + topValue - (containerHeight / 2) + (heightValue / 2) + 32; // 32 is p-8 padding
      
      scrollContainerRef.current.scrollTo({
        top: Math.max(0, scrollTop),
        behavior: 'smooth'
      });
    }
  }, [activeCheckpointId]);

  const handleDelete = (cpId: string) => {
    setCheckpoints(prev => ({
      ...prev,
      [activeTab]: prev[activeTab].filter(cp => cp.id !== cpId)
    }));
  };

  const handleEdit = (cpId: string, newRequirement: string) => {
    setCheckpoints(prev => ({
      ...prev,
      [activeTab]: prev[activeTab].map(cp => cp.id === cpId ? { ...cp, requirement: newRequirement } : cp)
    }));
    setEditingId(null);
  };

  const handleAdd = () => {
    const newCp: Checkpoint = {
      id: Date.now().toString(),
      name: '新检查点',
      requirement: '请输入检查要求',
      location: '手动添加',
      isMandatory: false,
      group: '资质检查'
    };
    setCheckpoints(prev => ({
      ...prev,
      [activeTab]: [...prev[activeTab], newCp]
    }));
    setEditingId(newCp.id);
  };

  const handleReParse = () => {
    setShowReParseModal(false);
    // Navigate to the progress page to simulate re-parsing
    navigate(`/projects/${id}/check-progress?type=${activeTab}&stage=parsing`);
  };

  return (
    <>
      <div className="flex flex-col h-full w-full overflow-hidden">
      {/* Top Header & Steps */}
      <div className="pt-0 pb-6 px-6 h-[72px] shrink-0 flex items-center">
        <div className="max-w-[1400px] w-full mx-auto flex items-center justify-between relative h-full">
          <div className="flex items-center gap-4 w-[30%]">
            <button 
              onClick={() => navigate(`/projects/${id}`)} 
              className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500 shrink-0"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-lg font-bold text-gray-900 line-clamp-2" title={project?.name || '未知项目'}>
              {project?.name || '未知项目'}
            </h1>
          </div>
          
          <div className="absolute left-1/2 -translate-x-1/2 w-[400px]">
            <CheckSteps currentStep={2} className="mb-0 py-0 shadow-none border-none bg-transparent" />
          </div>

          <div className="flex items-center gap-3 w-[30%] justify-end">
            <Button 
              variant="outline" 
              className="flex items-center gap-2 text-orange-600 border-orange-200 hover:bg-orange-50 bg-white"
              onClick={() => setShowReParseModal(true)}
            >
              <RotateCcw size={16} />
              重新解析
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content: Split Layout */}
      <div className="flex-1 overflow-hidden p-6 flex flex-col">
        <div className="max-w-[1400px] w-full mx-auto flex-1 flex flex-col overflow-hidden bg-white rounded-2xl shadow-sm border border-gray-200">
          <div className="flex-1 flex overflow-hidden">
          {/* Left: PDF Preview */}
          <div className="w-1/2 border-r border-gray-200 bg-gray-200/50 relative flex flex-col">
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full shadow-sm border border-gray-200">
            <button className="p-1 hover:bg-gray-100 rounded text-gray-600"><ZoomOut size={16} /></button>
            <span className="text-xs font-medium px-2 border-x border-gray-200">100%</span>
            <button className="p-1 hover:bg-gray-100 rounded text-gray-600"><ZoomIn size={16} /></button>
            <div className="w-px h-4 bg-gray-200 mx-1" />
            <span className="text-xs font-medium">第 {pdfPage} / 156 页</span>
          </div>
          
          <div className="flex-1 overflow-auto p-8 flex flex-col items-center gap-8" ref={scrollContainerRef}>
            {/* Page 1 */}
            <div className="w-full max-w-2xl bg-white shadow-lg h-[1000px] p-16 relative text-gray-800 font-serif shrink-0">
              {/* Watermark */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
                <div className="text-[120px] font-bold text-gray-100 -rotate-45 select-none whitespace-nowrap">
                  招标文件 · 内部资料
                </div>
              </div>

              {/* Highlight Overlay */}
              <div 
                className="absolute left-0 w-full bg-brand/10 border-y-2 border-brand/30 animate-pulse pointer-events-none mix-blend-multiply z-10" 
                style={getHighlightStyle(0)}
              />
              
              {/* Document Header */}
              <div className="text-center mb-12 border-b-2 border-gray-800 pb-6 relative z-0">
                <div className="flex justify-between items-end mb-4">
                  <span className="text-xs text-gray-500">项目编号：ZB-2023-001</span>
                  <span className="text-xs text-gray-500">密级：公开</span>
                </div>
                <h2 className="text-3xl font-bold mb-4 tracking-wide">第三章 评标办法（综合评估法）</h2>
                <p className="text-sm text-gray-600">
                  根据《中华人民共和国招标投标法》及相关法律法规，制定本评标办法。
                </p>
              </div>

              {/* Document Body */}
              <div className="space-y-10 text-sm leading-relaxed relative z-0">
                {/* Section 1 */}
                <section>
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-gray-800 block"></span>
                    1. 评标原则与方法
                  </h3>
                  <div className="pl-4 space-y-3 text-justify">
                    <p className="indent-8">
                      1.1 本次评标遵循公平、公正、科学、择优的原则。评标委员会将按照招标文件规定的评标标准和方法，对投标文件进行系统地评审和比较。
                    </p>
                    <p className="indent-8">
                      1.2 评标方法采用<span className="font-bold border-b border-gray-800">综合评估法</span>。总分100分，其中：资信标20分，技术标40分，商务标40分。
                    </p>
                  </div>
                </section>

                {/* Section 2 */}
                <section>
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-gray-800 block"></span>
                    2. 详细评分标准
                  </h3>
                  
                  <div className="pl-4 mb-6">
                    <h4 className="font-bold mb-3 text-base">2.1 技术标评分细则（40分）</h4>
                    <table className="w-full border-collapse border border-gray-400 text-xs">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border border-gray-400 p-3 text-left w-1/5">评审项目</th>
                          <th className="border border-gray-400 p-3 text-left">评审标准与得分依据</th>
                          <th className="border border-gray-400 p-3 text-center w-16">分值</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-gray-400 p-3 font-bold align-top">
                            施工组织设计<br/>
                            <span className="font-normal text-gray-500">(15分)</span>
                          </td>
                          <td className="border border-gray-400 p-3 space-y-2">
                            <p><strong>(1) 总体方案 (5分)：</strong> 施工部署科学合理，总体思路清晰。优得5-4分，良得3.9-3分，一般得2.9-0分。</p>
                            <p><strong>(2) 关键技术 (5分)：</strong> 针对本项目难点（深基坑、高支模）有专项方案。方案可行、计算准确。优得5-4分，良得3.9-3分，一般得2.9-0分。</p>
                            <p><strong>(3) 进度计划 (5分)：</strong> 网络图关键线路清晰，工期满足要求。优得5-4分，良得3.9-3分，一般得2.9-0分。</p>
                          </td>
                          <td className="border border-gray-400 p-3 text-center align-top font-bold">15</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-400 p-3 font-bold align-top">
                            项目管理机构<br/>
                            <span className="font-normal text-gray-500">(10分)</span>
                          </td>
                          <td className="border border-gray-400 p-3">
                            <p className="mb-2"><strong>(1) 项目经理 (5分)：</strong> 具有一级注册建造师资格，且有类似工程业绩。每多一个业绩加1分，满分5分。</p>
                            <p><strong>(2) 技术负责人 (5分)：</strong> 具有高级工程师职称，10年以上经验得满分；否则酌情扣分。</p>
                          </td>
                          <td className="border border-gray-400 p-3 text-center align-top font-bold">10</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-400 p-3 font-bold align-top">
                            资源配置计划<br/>
                            <span className="font-normal text-gray-500">(15分)</span>
                          </td>
                          <td className="border border-gray-400 p-3">
                            <p>劳动力、机械设备、材料供应计划周全，满足施工高峰期需求。承诺自有设备率&gt;80%得满分。</p>
                          </td>
                          <td className="border border-gray-400 p-3 text-center align-top font-bold">15</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>

              {/* Footer */}
              <div className="absolute bottom-8 left-0 w-full flex justify-between px-16 text-xs text-gray-400 border-t border-gray-100 pt-4">
                <span>XX市公共资源交易中心监制</span>
                <span>第 14 页 / 共 156 页</span>
              </div>
            </div>

            {/* Page 2 */}
            <div className="w-full max-w-2xl bg-white shadow-lg h-[1000px] p-16 relative text-gray-800 font-serif shrink-0">
              {/* Watermark */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
                <div className="text-[120px] font-bold text-gray-100 -rotate-45 select-none whitespace-nowrap">
                  招标文件 · 内部资料
                </div>
              </div>

              {/* Highlight Overlay */}
              <div 
                className="absolute left-0 w-full bg-brand/10 border-y-2 border-brand/30 animate-pulse pointer-events-none mix-blend-multiply z-10" 
                style={getHighlightStyle(1)}
              />

              {/* Document Body */}
              <div className="space-y-10 text-sm leading-relaxed relative z-0">
                {/* Section 3 */}
                <section>
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-gray-800 block"></span>
                    3. 否决投标情形
                  </h3>
                  <div className="pl-4 bg-red-50 border border-red-100 p-4 rounded-lg">
                    <p className="font-bold text-red-700 mb-2">依据《招标投标法》及实施条例，有下列情形之一的，作废标处理：</p>
                    <ul className="list-disc pl-5 space-y-1 text-red-600/80">
                      <li>投标文件未加盖投标人公章和法定代表人印鉴的；</li>
                      <li>投标报价低于成本或者高于招标文件设定的最高投标限价的；</li>
                      <li>未响应招标文件的实质性要求和条件的；</li>
                      <li>投标人有串通投标、弄虚作假、行贿等违法行为的。</li>
                    </ul>
                  </div>
                </section>

                {/* Stamp Area */}
                <div className="mt-16 flex justify-end pr-12 relative">
                  <div className="text-center relative z-10">
                    <p className="mb-8 font-bold text-lg">招标人（盖章）：</p>
                    <p className="font-serif">2023 年 10 月 15 日</p>
                  </div>
                  {/* Stamp Graphic */}
                  <div className="absolute top-[-20px] right-[20px] w-32 h-32 border-4 border-red-600 rounded-full flex items-center justify-center opacity-80 rotate-[-15deg] pointer-events-none mix-blend-multiply">
                    <div className="w-[90%] h-[90%] border border-red-600 rounded-full flex items-center justify-center relative">
                      <div className="absolute top-2 text-[10px] text-red-600 tracking-[0.2em] font-bold w-full text-center">
                        XX建设工程招标专用章
                      </div>
                      <div className="text-red-600 text-4xl">★</div>
                      <div className="absolute bottom-3 text-[8px] text-red-600 font-mono">
                        1101050000000
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="absolute bottom-8 left-0 w-full flex justify-between px-16 text-xs text-gray-400 border-t border-gray-100 pt-4">
                <span>XX市公共资源交易中心监制</span>
                <span>第 15 页 / 共 156 页</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Checkpoints List */}
        <div className="w-1/2 bg-white flex flex-col overflow-hidden">
          {/* Tabs */}
          <div className="px-6 pt-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex gap-1">
              {[
                { id: 'credit', label: '资信标' },
                { id: 'technical', label: '技术标' },
                { id: 'economic', label: '经济标' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "px-6 py-3 text-sm font-bold transition-all border-b-2",
                    activeTab === tab.id ? "text-brand border-brand" : "text-gray-400 border-transparent hover:text-gray-600"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <button 
              onClick={handleAdd}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-brand/5 text-brand rounded-lg text-xs font-bold hover:bg-brand/10 transition-all"
            >
              <Plus size={14} />
              新增检查点
            </button>
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {activeTab === 'economic' ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                  <BarChart2 size={24} className="text-gray-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">经济标检查点提取功能开发中</h3>
                  <p className="text-sm text-gray-500 max-w-xs mx-auto">
                    我们正在努力开发经济标的智能检查点提取功能，敬请期待。
                  </p>
                </div>
              </div>
            ) : (
              (Object.entries(groupedCheckpoints) as [string, Checkpoint[]][]).map(([group, items]) => (
                <div key={group} className="space-y-3">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-1 h-3 bg-brand rounded-full" />
                    {group}
                  </h3>
                  <div className="space-y-3">
                    {items.map(cp => (
                      <div 
                        key={cp.id}
                        onClick={() => {
                          setPdfPage(parseInt(cp.location.match(/P(\d+)/)?.[1] || '10'));
                          setActiveCheckpointId(cp.id);
                        }}
                        className={cn(
                          "group p-4 rounded-xl border transition-all cursor-pointer relative",
                          editingId === cp.id ? "border-brand ring-2 ring-brand/10 bg-brand/5" : 
                          activeCheckpointId === cp.id ? "border-brand bg-brand/5 shadow-sm" :
                          "border-gray-100 bg-white hover:border-brand/30 hover:shadow-md"
                        )}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              {cp.isMandatory && (
                                <span className="px-1.5 py-0.5 bg-red-50 text-red-600 text-[10px] font-bold rounded border border-red-100">
                                  否决
                                </span>
                              )}
                              <h4 className="text-sm font-bold text-gray-900">{cp.name}</h4>
                            </div>
                            
                            {editingId === cp.id ? (
                              <textarea 
                                autoFocus
                                className="w-full p-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20"
                                value={cp.requirement}
                                onChange={(e) => handleEdit(cp.id, e.target.value)}
                                onBlur={() => setEditingId(null)}
                              />
                            ) : (
                              <p className="text-xs text-gray-500 leading-relaxed">{cp.requirement}</p>
                            )}

                            <div className="flex items-center gap-3 mt-2">
                              <div className="flex items-center gap-1 text-[10px] text-brand font-medium">
                                <ExternalLink size={10} />
                                <span>{cp.location}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                            <button 
                              onClick={(e) => { e.stopPropagation(); setEditingId(cp.id); }}
                              className="p-1.5 hover:bg-gray-100 rounded text-gray-400 hover:text-brand"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleDelete(cp.id); }}
                              className="p-1.5 hover:bg-gray-100 rounded text-gray-400 hover:text-red-500"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        </div>
      </div>

        {/* Bottom Fixed Action Bar */}
        <div className="bg-white border-t border-gray-200 px-6 py-4 shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
          <div className="max-w-[1400px] w-full mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Info size={16} className="text-brand" />
              <span>共识别出 <span className="font-bold text-gray-900">{currentCheckpoints.length}</span> 个检查点，请确认后开始检查。</span>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => navigate(`/projects/${id}`)}>
                取消
              </Button>
              <Button 
                variant="primary" 
                disabled={currentCheckpoints.length === 0}
                onClick={() => navigate(`/projects/${id}/check-progress?type=${activeTab}&stage=checking`)}
                className="px-12"
              >
                下一步：开始检查
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Re-Parse Confirmation Modal */}
      {showReParseModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowReParseModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 overflow-hidden">
            <div className="flex items-center gap-3 text-orange-600 mb-4">
              <AlertCircle size={24} />
              <h3 className="text-lg font-bold">重新解析确认</h3>
            </div>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              重新解析将覆盖当前所有手动修改和新增的检查点，恢复到系统最初提取的状态。此操作不可撤销，是否确认？
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowReParseModal(false)}>取消</Button>
              <Button variant="primary" className="bg-orange-600 hover:bg-orange-700 border-orange-600" onClick={handleReParse}>
                确认重新解析
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
