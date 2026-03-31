import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, ChevronRight, Copy, CheckCircle2, 
  AlertCircle, Info, FileText, BookOpen, 
  Lightbulb, ExternalLink, ChevronDown, ChevronUp,
  Sparkles, ShieldAlert, BarChart3
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { ScoringPointDetail, RiskLevel } from '../types';
import { Button } from '../components/UI/Button';
import { PageHeader } from '../components/common/PageHeader';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Mock Detail Data
const MOCK_DETAIL: ScoringPointDetail = {
  id: '2',
  name: '施工进度计划合理性',
  category: '施工进度',
  score: 4,
  maxScore: 10,
  riskLevel: 'medium',
  deductionReasons: [
    '进度计划虽给出里程碑节点，但未明确关键工序的持续时间、工序搭接关系与关键线路计算依据（缺少网络计划/关键线路说明），可执行性不足；',
    '资源保障仅给出高峰期人员与设备数量，未与各阶段工作量、峰值需求进行对应，缺少“资源曲线/劳动力计划表”；',
    '风险应对措施描述较笼统，未针对雨季、材料到货、交叉作业等风险给出触发条件与调整策略（如压缩关键线路、增加班组、倒排节点）。'
  ],
  suggestions: [
    '补充关键工序网络计划或关键线路计算说明（至少明确关键线路工序、工期占用与里程碑对应关系）；',
    '增加分阶段资源投入计划（劳动力/设备配置表），并与里程碑节点绑定；',
    '增加雨季与赶工专项方案（触发条件、组织措施、资源增配与节点调整方式），并在甘特图中体现调整预案。'
  ],
  requirements: '施工进度计划应完整、可执行，明确关键线路与里程碑节点；进度安排需与项目工期要求一致，并提供相应的资源保障措施（人员、设备、材料）及赶工/风险应对方案。',
  requirementSource: '招标文件《技术标响应细则》- “施工组织设计”部分 - 响应点：施工进度计划合理性。P232',
  responseContent: '• 总工期：180日历天（满足招标文件要求180日历天）。\n• 关键线路：测量放线→土方开挖→基础施工→主体结构→机电安装→装饰装修→系统调试→竣工验收。\n• 里程碑节点：\n  1）第30天：完成基础施工；\n  2）第90天：完成主体结构封顶；\n  3）第150天：完成机电安装及装饰装修；\n  4）第175天：完成系统联调；\n  5）第180天：完成竣工验收移交。\n• 资源保障：高峰期投入管理人员12人、劳务工人约80人，配置塔吊1台、挖机2台、混凝土泵1台；雨季采用“分区流水+夜间赶工”方式确保节点。',
  responseSource: '投标文件《施工组织设计》- 第4章《施工进度计划及保证措施》- 4.1《总体进度安排》、4.2《关键线路与里程碑》；甘特图见P56-P58'
};

export const ScoringPointDetailPage: React.FC = () => {
  const { id, pointId } = useParams<{ id: string; pointId: string }>();
  const navigate = useNavigate();
  const { projects } = useStore();
  const project = projects.find(p => p.id === id);

  const [isReqExpanded, setIsReqExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!project) {
    return <div className="p-8 text-center">项目不存在</div>;
  }

  const handleCopy = () => {
    const text = MOCK_DETAIL.deductionReasons.join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full w-full max-w-[1400px] mx-auto space-y-6 pb-12 p-6">
      {/* 顶部栏/导航 */}
      <PageHeader
        title="响应点详情"
        breadcrumbs={[
          { label: '响应总览', onClick: () => navigate(`/projects/${id}/check-result`) },
          { label: '响应点详情' }
        ]}
        onBack={() => navigate(`/projects/${id}/check-result`)}
      />

      {/* 响应结果概览区 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
              MOCK_DETAIL.riskLevel === 'high' ? "bg-red-50 text-red-500" :
              MOCK_DETAIL.riskLevel === 'medium' ? "bg-orange-50 text-orange-500" :
              "bg-brand/5 text-brand"
            )}>
              {MOCK_DETAIL.riskLevel === 'high' ? <ShieldAlert size={28} /> : <BarChart3 size={28} />}
            </div>
            <div>
              <h2 
                className="text-xl font-bold text-gray-900 cursor-pointer hover:text-brand transition-colors"
                onClick={() => navigate(`/projects/${id}/check-result`)}
              >
                {MOCK_DETAIL.name}
              </h2>
              <div className="flex items-center gap-3 mt-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm text-gray-500">匹配度：</span>
                  <span className={cn(
                    "text-lg font-bold",
                    Math.round((MOCK_DETAIL.score / MOCK_DETAIL.maxScore * 100) / 10) * 10 <= 30 ? "text-red-600" :
                    Math.round((MOCK_DETAIL.score / MOCK_DETAIL.maxScore * 100) / 10) * 10 <= 60 ? "text-orange-600" :
                    Math.round((MOCK_DETAIL.score / MOCK_DETAIL.maxScore * 100) / 10) * 10 <= 80 ? "text-yellow-600" :
                    "text-green-600"
                  )}>
                    {Math.round((MOCK_DETAIL.score / MOCK_DETAIL.maxScore * 100) / 10) * 10}%
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="primary" className="flex items-center gap-2 bg-brand hover:bg-brand-dark">
              <Sparkles size={18} />
              AI 优化建议
            </Button>
          </div>
        </div>
      </div>

      {/* 扣分原因说明区 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <AlertCircle size={16} className="text-orange-500" />
            差异原因说明
          </h3>
          <button 
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-brand transition-colors"
          >
            {copied ? <CheckCircle2 size={14} className="text-green-500" /> : <Copy size={14} />}
            {copied ? '已复制' : '复制内容'}
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div className="space-y-3">
            {MOCK_DETAIL.deductionReasons.map((reason, index) => (
              <div key={index} className="flex gap-3 p-3 bg-red-50/30 rounded-xl border border-red-100/50">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-red-100 text-red-600 text-[10px] font-bold shrink-0 mt-0.5">
                  {index + 1}
                </span>
                <p className="text-sm text-gray-700 leading-relaxed">{reason}</p>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-gray-100">
            <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Lightbulb size={16} className="text-brand" />
              优化建议
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {MOCK_DETAIL.suggestions.map((suggestion, index) => (
                <div key={index} className="p-4 bg-brand/5 rounded-xl border border-brand/10 relative overflow-hidden group">
                  <div className="absolute -right-2 -bottom-2 text-brand/5 group-hover:text-brand/10 transition-colors">
                    <Sparkles size={64} />
                  </div>
                  <p className="text-xs text-brand-dark leading-relaxed relative z-10">
                    {suggestion}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 响应要求区 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/30">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <BookOpen size={16} className="text-brand" />
              响应要求
            </h3>
          </div>
          <div className="p-6 flex-1 flex flex-col">
            <div className="flex-1">
              <div className={cn(
                "text-sm text-gray-700 leading-relaxed overflow-hidden transition-all duration-300",
                !isReqExpanded && "max-h-[120px]"
              )}>
                {MOCK_DETAIL.requirements}
              </div>
              {MOCK_DETAIL.requirements.length > 200 && (
                <button 
                  onClick={() => setIsReqExpanded(!isReqExpanded)}
                  className="mt-2 text-xs text-brand font-medium flex items-center gap-1 hover:underline"
                >
                  {isReqExpanded ? (
                    <>收起内容 <ChevronUp size={14} /></>
                  ) : (
                    <>展开全部 <ChevronDown size={14} /></>
                  )}
                </button>
              )}
            </div>
            <div className="mt-6 pt-4 border-t border-gray-50">
              <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100 group cursor-pointer hover:border-brand/30 transition-all">
                <Info size={14} className="text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <div className="text-[10px] text-gray-400 mb-1">来源章节</div>
                  <div className="text-xs text-gray-600 font-medium group-hover:text-brand transition-colors flex items-center justify-between">
                    {MOCK_DETAIL.requirementSource}
                    <ExternalLink size={12} className="shrink-0" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 投标响应内容区 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/30">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <FileText size={16} className="text-brand" />
              投标响应内容
            </h3>
          </div>
          <div className="p-6 flex-1 flex flex-col">
            <div className="flex-1">
              <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap bg-brand/5 p-4 rounded-xl border border-brand/10">
                {MOCK_DETAIL.responseContent.split('\n').map((line, i) => {
                  // Simple highlight simulation for keywords
                  const keywords = ['180日历天', '关键线路', '里程碑节点', '资源保障'];
                  let content: React.ReactNode = line;
                  keywords.forEach(kw => {
                    if (line.includes(kw)) {
                      const parts = line.split(kw);
                      content = (
                        <>
                          {parts[0]}
                          <span className="bg-brand/20 text-brand-dark font-bold px-1 rounded">{kw}</span>
                          {parts[1]}
                        </>
                      );
                    }
                  });
                  return <div key={i} className="mb-1">{content}</div>;
                })}
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-50">
              <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100 group cursor-pointer hover:border-brand/30 transition-all">
                <Info size={14} className="text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <div className="text-[10px] text-gray-400 mb-1">来源章节定位</div>
                  <div className="text-xs text-gray-600 font-medium group-hover:text-brand transition-colors flex items-center justify-between">
                    {MOCK_DETAIL.responseSource}
                    <ExternalLink size={12} className="shrink-0" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
