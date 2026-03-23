import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ArrowLeft, Download, AlertTriangle, CheckCircle2, 
  AlertCircle, ChevronRight, Filter, BarChart3, 
  PieChart as PieChartIcon, ListFilter, Search,
  Info, ExternalLink, LayoutList, FileSearch,
  ChevronDown, ChevronUp, HelpCircle, XCircle,
  Printer, Settings, ChevronLeft, ZoomIn, ZoomOut, FileText, BarChart2
} from 'lucide-react';
import { 
  ResponsiveContainer, RadarChart, PolarGrid, 
  PolarAngleAxis, Radar, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell
} from 'recharts';
import { useStore } from '../store/useStore';
import { ScoringResult, RiskLevel, ScoringPoint } from '../types';
import { Button } from '../components/UI/Button';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { CheckSteps } from '../components/Check/CheckSteps';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Mock Scoring Data for Technical Check
const MOCK_SCORING_RESULT: ScoringResult = {
  totalScore: 85.5,
  maxTotalScore: 100,
  riskLevel: 'medium',
  riskMessage: '存在中风险评分项：部分评分点得分较低，建议查看扣分原因。',
  categories: [
    { category: '施工组织', score: 22, maxScore: 25 },
    { category: '施工进度', score: 18, maxScore: 20 },
    { category: '安全文明', score: 14, maxScore: 15 },
    { category: '质量保证', score: 12, maxScore: 15 },
    { category: '项目管理', score: 11, maxScore: 15 },
    { category: '资源配置', score: 8.5, maxScore: 10 },
  ],
  points: [
    { id: '1', name: '施工组织总体方案完整性', category: '施工组织', score: 6, maxScore: 10, riskLevel: 'medium', deductionSummary: '资源配置说明不完整，缺少关键机械设备进场计划。' },
    { id: '2', name: '施工进度计划合理性', category: '施工进度', score: 4, maxScore: 10, riskLevel: 'medium', deductionSummary: '未体现关键节点控制，逻辑关系描述较笼统。' },
    { id: '3', name: '安全文明施工措施', category: '安全文明', score: 5, maxScore: 10, riskLevel: 'medium', deductionSummary: '安全措施描述笼统，缺乏针对性应急预案。' },
    { id: '4', name: '项目管理机构配置', category: '项目管理', score: 3, maxScore: 8, riskLevel: 'high', deductionSummary: '岗位职责说明缺失，部分关键岗位人员资质证明不清晰。' },
    { id: '5', name: '施工现场平面布置', category: '施工组织', score: 2, maxScore: 7, riskLevel: 'high', deductionSummary: '现场组织方案不足，临时设施布置不符合规范要求。' },
    { id: '6', name: '质量管理体系', category: '质量保证', score: 8, maxScore: 10, riskLevel: 'low', deductionSummary: '体系文件较完整，但部分流程优化建议不足。' },
    { id: '7', name: '劳动力配备计划', category: '资源配置', score: 5, maxScore: 5, riskLevel: 'none' },
    { id: '8', name: '主要材料供应计划', category: '资源配置', score: 3.5, maxScore: 5, riskLevel: 'low', deductionSummary: '供应商名录更新不及时。' },
    { id: '9', name: '环境保护措施', category: '安全文明', score: 5, maxScore: 5, riskLevel: 'none' },
    { id: '10', name: '关键工序技术方案', category: '施工组织', score: 10, maxScore: 10, riskLevel: 'none' },
  ]
};

// Mock Data for Credit Check
interface CreditCheckItem {
  id: string;
  index: string;
  status: 'pass' | 'fail' | 'manual' | 'warning' | 'skip';
  requirement: string;
  location: string;
  requirementLocation: string;
  response: string;
  responseLocation: string;
  explanation: string;
  isExpanded?: boolean;
  subItems?: CreditCheckItem[];
}

const MOCK_CREDIT_RESULTS: CreditCheckItem[] = [
  {
    id: 'c1',
    index: '1',
    status: 'fail',
    requirement: '投标人须具备建筑工程施工总承包一级及以上资质。',
    location: '招标文件 P12',
    requirementLocation: '招标文件 P12 第3.1.1条',
    response: '投标人提供的是建筑工程施工总承包二级资质证书。',
    responseLocation: '投标文件 P45 资质证明部分',
    explanation: '资质等级不符合招标文件要求的一级及以上资质。',
    subItems: [
      {
        id: 'c1-1',
        index: '1.1',
        status: 'fail',
        requirement: '资质证书在有效期内。',
        location: '招标文件 P12',
        requirementLocation: '招标文件 P12 第3.1.1.1条',
        response: '资质证书有效期至2023年12月31日，已过期。',
        responseLocation: '投标文件 P45 资质证书复印件',
        explanation: '证书已超过有效期，视为无效资质。'
      }
    ]
  },
  {
    id: 'c2',
    index: '2',
    status: 'pass',
    requirement: '投标人自2021年1月1日以来须具有至少1项合同金额不低于5000万元的类似工程业绩。',
    location: '招标文件 P13',
    requirementLocation: '招标文件 P13 第3.1.2条',
    response: '提供了“某市体育馆建设项目”合同，金额6200万元，竣工日期2022年5月。',
    responseLocation: '投标文件 P58 业绩证明材料',
    explanation: '业绩金额与时间均符合要求。'
  },
  {
    id: 'c3',
    index: '3',
    status: 'manual',
    requirement: '拟派项目经理须具备一级注册建造师执业资格，且具有有效的安全生产考核合格证书（B证）。',
    location: '招标文件 P14',
    requirementLocation: '招标文件 P14 第3.1.3条',
    response: '提供了张三的一级建造师证书及B证，但B证扫描件较模糊。',
    responseLocation: '投标文件 P65 人员资质部分',
    explanation: '人员资格基本符合，但B证清晰度不足，需人工核实原件或清晰扫描件。'
  },
  {
    id: 'c4',
    index: '4',
    status: 'pass',
    requirement: '投标人财务状况良好，须提供2022年度经审计的财务报告。',
    location: '招标文件 P15',
    requirementLocation: '招标文件 P15 第3.1.4条',
    response: '提供了2022年度审计报告，资产负债率55%，流动比率1.5。',
    responseLocation: '投标文件 P80 财务报表',
    explanation: '财务报告完整，指标符合要求。'
  },
  {
    id: 'c5',
    index: '5',
    status: 'fail',
    requirement: '投标人须提供近三个月（2023年10月-12月）依法缴纳社会保障资金的证明材料。',
    location: '招标文件 P16',
    requirementLocation: '招标文件 P16 第3.1.5条',
    response: '仅提供了2023年10月和11月的社保缴纳证明，缺少12月份材料。',
    responseLocation: '投标文件 P92 社保缴纳证明',
    explanation: '证明材料不完整，缺少要求的2023年12月份记录。'
  },
  {
    id: 'c6',
    index: '6',
    status: 'warning',
    requirement: '投标人须具有良好的商业信誉，未被列入“信用中国”网站失信被执行人名单。',
    location: '招标文件 P17',
    requirementLocation: '招标文件 P17 第3.1.6条',
    response: '经核查“信用中国”截图，该单位无失信记录，但有关联公司存在轻微行政处罚。',
    responseLocation: '投标文件 P105 信用记录截图',
    explanation: '信用记录基本良好，但关联公司的处罚记录可能存在合规风险。'
  },
  {
    id: 'c7',
    index: '7',
    status: 'manual',
    requirement: '投标人近三年内（2021年至今）在经营活动中没有重大违法记录。',
    location: '招标文件 P18',
    requirementLocation: '招标文件 P18 第3.1.7条',
    response: '投标人提供了无重大违法记录声明函，但系统检测到其关联公司曾有行政处罚记录。',
    responseLocation: '投标文件 P110 诚信声明',
    explanation: '声明函已提供，但关联公司的处罚记录是否影响本项目需人工判定。'
  },
  {
    id: 'c8',
    index: '8',
    status: 'skip',
    requirement: '投标人须具备有效的质量管理体系认证（ISO9001）、环境管理体系认证（ISO14001）。',
    location: '招标文件 P19',
    requirementLocation: '招标文件 P19 第3.1.8条',
    response: '未在投标文件中找到相关证书，且本项目非强制要求。',
    responseLocation: '投标文件',
    explanation: '未找到相关材料，根据招标文件非强制性要求，系统跳过此项检查。'
  },
  {
    id: 'c9',
    index: '9',
    status: 'fail',
    requirement: '拟派技术负责人须具备高级工程师职称，且具有10年以上相关工作经验。',
    location: '招标文件 P20',
    requirementLocation: '招标文件 P20 第3.1.9条',
    response: '拟派技术负责人李四为工程师职称（中级），工作经验为8年。',
    responseLocation: '投标文件 P135 技术负责人简历',
    explanation: '职称等级及工作年限均未达到招标文件要求。'
  },
  {
    id: 'c10',
    index: '10',
    status: 'pass',
    requirement: '投标人须提供近三个月（2023年10月-12月）依法缴纳税收的证明材料。',
    location: '招标文件 P21',
    requirementLocation: '招标文件 P21 第3.1.10条',
    response: '提供了2023年10月、11月、12月的完税证明。',
    responseLocation: '投标文件 P145 纳税证明材料',
    explanation: '纳税证明完整，符合要求。'
  }
];

export const CheckResultPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { projects } = useStore();
  const project = projects.find(p => p.id === id);

  const checkType = searchParams.get('type') || 'credit';
  const isCredit = checkType === 'credit';

  // Technical Check States
  const [activeCategory, setActiveCategory] = useState<string>('全部');
  const [filterType, setFilterType] = useState<'all' | 'risk' | 'deduction' | 'full'>('risk');

  // Credit Check States
  const [viewMode, setViewMode] = useState<'list' | 'file'>('list');
  const [creditFilter, setCreditFilter] = useState<'all' | 'fail' | 'pass' | 'manual' | 'warning' | 'skip'>('all');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(['c1']));
  const [pdfPage, setPdfPage] = useState<number>(1);
  const [activeResultId, setActiveResultId] = useState<string | null>(null);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  // Default positioning for File View
  React.useEffect(() => {
    if (viewMode === 'file') {
      const firstFail = MOCK_CREDIT_RESULTS.find(i => i.status === 'fail');
      const firstWarning = MOCK_CREDIT_RESULTS.find(i => i.status === 'warning');
      const firstManual = MOCK_CREDIT_RESULTS.find(i => i.status === 'manual');
      const target = firstFail || firstWarning || firstManual || MOCK_CREDIT_RESULTS[0];
      
      if (target) {
        const page = parseInt(target.responseLocation.match(/P(\d+)/)?.[1] || '1');
        setPdfPage(page);
        setActiveResultId(target.id);
      }
    }
  }, [viewMode]);

  // Mock highlight positions based on result ID
  const getHighlightStyle = (pageIndex: number) => {
    if (!activeResultId) return { display: 'none' };
    
    // Fake positions for demonstration
    const positions: Record<string, { top: string, height: string, page: number }> = {
      'c1': { top: '300px', height: '60px', page: 45 },
      'c2': { top: '450px', height: '80px', page: 58 },
      'c3': { top: '600px', height: '100px', page: 65 },
      'c4': { top: '200px', height: '50px', page: 80 },
      'c5': { top: '400px', height: '70px', page: 92 },
      'c6': { top: '350px', height: '120px', page: 105 },
      'c7': { top: '550px', height: '90px', page: 110 },
      'c8': { top: '250px', height: '60px', page: 120 },
      'c9': { top: '400px', height: '80px', page: 135 },
      'c10': { top: '500px', height: '60px', page: 145 },
    };

    const pos = positions[activeResultId] || { top: '300px', height: '80px', page: 45 };
    
    const highlightPageIndex = pos.page > 60 ? 1 : 0;

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

  React.useEffect(() => {
    if (activeResultId && scrollContainerRef.current) {
      const positions: Record<string, { top: string, height: string, page: number }> = {
        'c1': { top: '300px', height: '60px', page: 45 },
        'c2': { top: '450px', height: '80px', page: 58 },
        'c3': { top: '600px', height: '100px', page: 65 },
        'c4': { top: '200px', height: '50px', page: 80 },
        'c5': { top: '400px', height: '70px', page: 92 },
        'c6': { top: '350px', height: '120px', page: 105 },
        'c7': { top: '550px', height: '90px', page: 110 },
        'c8': { top: '250px', height: '60px', page: 120 },
        'c9': { top: '400px', height: '80px', page: 135 },
        'c10': { top: '500px', height: '60px', page: 145 },
      };

      const pos = positions[activeResultId] || { top: '300px', height: '80px', page: 45 };
      
      const topValue = parseInt(pos.top.replace('px', ''));
      const heightValue = parseInt(pos.height.replace('px', ''));
      const containerHeight = scrollContainerRef.current.clientHeight;
      
      const highlightPageIndex = pos.page > 60 ? 1 : 0;
      
      const pageOffset = highlightPageIndex * (1000 + 32);
      const scrollTop = pageOffset + topValue - (containerHeight / 2) + (heightValue / 2) + 32; // 32 is p-8 padding
      
      scrollContainerRef.current.scrollTo({
        top: Math.max(0, scrollTop),
        behavior: 'smooth'
      });
    }
  }, [activeResultId]);

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const categories = useMemo(() => {
    const cats = ['全部', ...MOCK_SCORING_RESULT.categories.map(c => c.category)];
    return cats;
  }, []);

  const filteredPoints = useMemo(() => {
    let result = MOCK_SCORING_RESULT.points;

    // Filter by category
    if (activeCategory !== '全部') {
      result = result.filter(p => p.category === activeCategory);
    }

    // Filter by type
    switch (filterType) {
      case 'risk':
        result = result.filter(p => p.riskLevel === 'high' || p.riskLevel === 'medium');
        break;
      case 'deduction':
        result = result.filter(p => p.score < p.maxScore);
        break;
      case 'full':
        result = result.filter(p => p.score === p.maxScore);
        break;
      default:
        break;
    }

    // Sort by risk level
    const riskOrder: Record<RiskLevel, number> = { high: 0, medium: 1, low: 2, none: 3 };
    return [...result].sort((a, b) => riskOrder[a.riskLevel] - riskOrder[b.riskLevel]);
  }, [activeCategory, filterType]);

  const filteredCreditItems = useMemo(() => {
    if (creditFilter === 'all') return MOCK_CREDIT_RESULTS;
    return MOCK_CREDIT_RESULTS.filter(item => item.status === creditFilter);
  }, [creditFilter]);

  if (!project) {
    return <div className="p-8 text-center">项目不存在</div>;
  }

  const getRiskColor = (level: RiskLevel) => {
    switch (level) {
      case 'high': return 'text-functional-error bg-red-50 border-red-100';
      case 'medium': return 'text-orange-600 bg-orange-50 border-orange-100';
      case 'low': return 'text-yellow-600 bg-yellow-50 border-yellow-100';
      default: return 'text-gray-500 bg-gray-50 border-gray-100';
    }
  };

  const getRiskLabel = (level: RiskLevel) => {
    switch (level) {
      case 'high': return '高风险';
      case 'medium': return '中风险';
      case 'low': return '低风险';
      default: return '无风险';
    }
  };

  const chartData = MOCK_SCORING_RESULT.categories.map(c => ({
    subject: c.category,
    A: (c.score / c.maxScore) * 100,
    fullMark: 100,
    score: c.score,
    maxScore: c.maxScore
  }));

  const renderTechnicalView = () => {
    const summaryStatus = MOCK_SCORING_RESULT.riskLevel;
    const failCount = MOCK_SCORING_RESULT.points.filter(p => p.riskLevel === 'high').length;
    const warningCount = MOCK_SCORING_RESULT.points.filter(p => p.riskLevel === 'medium').length;

    // Data for Bar Chart (Top 5 items with lowest score percentage)
    const barData = [...MOCK_SCORING_RESULT.points]
      .sort((a, b) => (a.score / a.maxScore) - (b.score / b.maxScore))
      .slice(0, 5)
      .map(p => ({
        name: p.name.length > 6 ? p.name.substring(0, 6) + '...' : p.name,
        fullName: p.name,
        score: p.score,
        maxScore: p.maxScore,
        percentage: (p.score / p.maxScore) * 100
      }));

    return (
      <div className="flex-1 overflow-y-auto space-y-6 pr-2 pb-6">
        {/* 评分汇总与图表 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="58"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-gray-100"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="58"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeDasharray={364.4}
                  strokeDashoffset={364.4 * (1 - MOCK_SCORING_RESULT.totalScore / MOCK_SCORING_RESULT.maxTotalScore)}
                  strokeLinecap="round"
                  fill="transparent"
                  className={cn(
                    "transition-all duration-1000",
                    summaryStatus === 'high' ? "text-red-500" :
                    summaryStatus === 'medium' ? "text-brand" :
                    "text-brand"
                  )}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-gray-900">{MOCK_SCORING_RESULT.totalScore}</span>
                <span className="text-xs text-gray-400 font-medium">/ {MOCK_SCORING_RESULT.maxTotalScore} 分</span>
              </div>
            </div>
            
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-gray-900">技术标总分</h2>
                <span className="text-sm text-gray-400">(满分 {MOCK_SCORING_RESULT.maxTotalScore} 分)</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-xl border border-orange-100 text-sm text-orange-600">
                <AlertTriangle size={16} className="shrink-0" />
                <p>存在中风险评分项：部分评分点得分较低，建议查看扣分原因。</p>
              </div>
            </div>
          </div>
          
          <Button variant="outline" className="flex items-center gap-2">
            <Download size={18} />
            导出报告
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 维度分析 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-6">
              <BarChart2 size={18} className="text-brand" />
              分类得分分布
            </h3>
            <div className="flex-1 min-h-[250px] mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                  <PolarGrid stroke="#f3f4f6" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 500 }} />
                  <Radar
                    name="得分率"
                    dataKey="A"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.15}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                    formatter={(value: number) => [`${value.toFixed(1)}%`, '得分率']}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="space-y-4">
              {MOCK_SCORING_RESULT.categories.map(cat => (
                <div key={cat.category} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-sm font-bold">
                    <span className="text-gray-700">{cat.category}</span>
                    <span className="text-gray-900">{cat.score} / {cat.maxScore}</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        cat.score / cat.maxScore < 0.6 ? "bg-red-500" :
                        cat.score / cat.maxScore < 0.8 ? "bg-yellow-500" :
                        "bg-green-500"
                      )}
                      style={{ width: `${(cat.score / cat.maxScore) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 详细评分列表 */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <LayoutList size={18} className="text-brand" />
                详细评分清单
              </h3>
              <div className="relative w-64">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="搜索评分点..." 
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                />
              </div>
            </div>
            
            <div className="px-6 pt-4 border-b border-gray-50">
              <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={cn(
                      "pb-4 text-sm font-bold transition-all whitespace-nowrap border-b-2",
                      activeCategory === cat ? "text-brand border-brand" : "text-gray-500 border-transparent hover:text-gray-700"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-4 bg-gray-50/30">
              <button 
                onClick={() => setFilterType('all')}
                className={cn(
                  "text-sm font-bold transition-all",
                  filterType === 'all' ? "text-gray-900" : "text-gray-500 hover:text-gray-700"
                )}
              >
                全部
              </button>
              <button 
                onClick={() => setFilterType('risk')}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold transition-all border",
                  filterType === 'risk' ? "bg-white text-gray-900 border-gray-200 shadow-sm" : "text-gray-500 border-transparent hover:text-gray-700"
                )}
              >
                风险项
                <span className="px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 text-[10px]">5</span>
              </button>
              <button 
                onClick={() => setFilterType('deduction')}
                className={cn(
                  "text-sm font-bold transition-all",
                  filterType === 'deduction' ? "text-gray-900" : "text-gray-500 hover:text-gray-700"
                )}
              >
                扣分项
              </button>
              <button 
                onClick={() => setFilterType('full')}
                className={cn(
                  "text-sm font-bold transition-all",
                  filterType === 'full' ? "text-gray-900" : "text-gray-500 hover:text-gray-700"
                )}
              >
                满分项
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {filteredPoints.map((point) => (
                <div key={point.id} className="flex items-start justify-between p-4 rounded-xl border border-gray-100 hover:border-brand/30 hover:shadow-sm transition-all bg-white group cursor-pointer">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-2 py-1 bg-brand/10 text-brand rounded text-[10px] font-bold uppercase">
                        {point.category}
                      </span>
                      <h4 className="text-base font-bold text-gray-900 group-hover:text-brand transition-colors">{point.name}</h4>
                    </div>
                    <p className="text-sm text-gray-500">
                      <span className="text-gray-400">扣分摘要：</span>
                      {point.deductionSummary || '符合要求，未扣分'}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-8 ml-6 shrink-0">
                    <div className="flex flex-col items-end">
                      <div className="text-lg font-bold text-gray-900">
                        {point.score} <span className="text-gray-400 text-sm font-medium">/ {point.maxScore}</span>
                      </div>
                      <span className="text-[10px] text-gray-400">得分情况</span>
                    </div>
                    
                    <div className={cn(
                      "px-3 py-1 rounded text-xs font-bold border",
                      point.riskLevel === 'high' ? "bg-red-50 text-red-600 border-red-100" :
                      point.riskLevel === 'medium' ? "bg-orange-50 text-orange-600 border-orange-100" :
                      point.riskLevel === 'low' ? "bg-yellow-50 text-yellow-600 border-yellow-100" :
                      "bg-green-50 text-green-600 border-green-100"
                    )}>
                      {point.riskLevel === 'high' ? '高风险' :
                       point.riskLevel === 'medium' ? '中风险' :
                       point.riskLevel === 'low' ? '低风险' : '无风险'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCreditView = () => {
    const failCount = MOCK_CREDIT_RESULTS.filter(i => i.status === 'fail').length;
    const passCount = MOCK_CREDIT_RESULTS.filter(i => i.status === 'pass').length;
    const manualCount = MOCK_CREDIT_RESULTS.filter(i => i.status === 'manual').length;
    const warningCount = MOCK_CREDIT_RESULTS.filter(i => i.status === 'warning').length;
    const skipCount = MOCK_CREDIT_RESULTS.filter(i => i.status === 'skip').length;

    const summaryStatus = failCount > 0 ? 'fail' : warningCount > 0 ? 'warning' : manualCount > 0 ? 'manual' : 'pass';

    const renderSummaryCard = () => (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6 flex-1">
            <div className={cn(
              "w-16 h-16 rounded-2xl flex items-center justify-center shrink-0",
              summaryStatus === 'fail' ? "bg-red-50 text-red-500" :
              summaryStatus === 'warning' ? "bg-yellow-50 text-yellow-500" :
              summaryStatus === 'manual' ? "bg-orange-50 text-orange-500" :
              "bg-green-50 text-green-500"
            )}>
              {summaryStatus === 'fail' ? <XCircle size={32} /> : 
               summaryStatus === 'warning' ? <AlertTriangle size={32} /> :
               summaryStatus === 'manual' ? <HelpCircle size={32} /> : 
               <CheckCircle2 size={32} />}
            </div>
            <div className="flex-1 max-w-3xl">
              <div className="flex items-center gap-4 mb-3">
                <h2 className={cn(
                  "text-xl font-bold",
                  summaryStatus === 'fail' ? "text-red-600" :
                  summaryStatus === 'warning' ? "text-yellow-600" :
                  summaryStatus === 'manual' ? "text-orange-600" :
                  "text-green-600"
                )}>
                  {summaryStatus === 'fail' ? '存在不符合项' : 
                   summaryStatus === 'warning' ? '存在警告项' :
                   summaryStatus === 'manual' ? '存在人工检查项' : 
                   '全部符合'}
                </h2>
                <div className="h-4 w-px bg-gray-200" />
                <div className="flex items-center gap-4 text-sm text-gray-500 font-medium">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500" /> {failCount}个不符合</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-yellow-500" /> {warningCount}个警告</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-orange-500" /> {manualCount}个人工检查</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500" /> {passCount}个符合</span>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-gray-50/80 rounded-xl border border-gray-100 text-sm text-gray-600">
                <Info size={16} className="text-brand shrink-0" />
                <p>检查结果仅供参考，请以具体检查结果为准。人工检查项，请自己填写！</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3 items-end shrink-0 ml-6">
            <div className="flex items-center bg-gray-100/50 rounded-lg p-1">
              <button 
                onClick={() => setViewMode('list')}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-bold transition-all",
                  viewMode === 'list' ? "bg-white text-brand shadow-sm" : "text-gray-500 hover:text-gray-700"
                )}
              >
                <LayoutList size={16} />
                列表视图
              </button>
              <button 
                onClick={() => setViewMode('file')}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-bold transition-all",
                  viewMode === 'file' ? "bg-white text-brand shadow-sm" : "text-gray-500 hover:text-gray-700"
                )}
              >
                <FileSearch size={16} />
                文件视图
              </button>
            </div>
            <Button variant="outline" className="flex items-center gap-2 w-full justify-center">
              <Download size={18} />
              导出报告
            </Button>
          </div>
        </div>
      </div>
    );

    if (viewMode === 'file') {
      return (
        <div className="flex-1 flex flex-col min-h-0 space-y-6">
          {renderSummaryCard()}
          <div className="flex gap-6 flex-1 min-h-0">
          {/* Left: File Preview (60%) */}
          <div className="w-[60%] flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* PDF Toolbar */}
            <div className="px-4 py-3 border-b border-gray-100 bg-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-1 border border-gray-100">
                  <button className="p-1.5 hover:bg-white rounded text-gray-400 hover:text-gray-900 transition-all">
                    <ChevronLeft size={16} />
                  </button>
                  <div className="px-2 flex items-center gap-2">
                    <FileText size={14} className="text-brand" />
                    <span className="text-xs font-bold text-gray-700">资信标.pdf</span>
                  </div>
                  <button className="p-1.5 hover:bg-white rounded text-gray-400 hover:text-gray-900 transition-all">
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-1 border border-gray-100">
                  <button className="p-1.5 hover:bg-white rounded text-gray-400"><ZoomOut size={16} /></button>
                  <span className="text-xs font-bold px-2 border-x border-gray-200">100%</span>
                  <button className="p-1.5 hover:bg-white rounded text-gray-400"><ZoomIn size={16} /></button>
                </div>
                <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-1.5 border border-gray-100">
                  <span className="text-xs text-gray-400">页码</span>
                  <input 
                    type="text" 
                    value={pdfPage} 
                    onChange={(e) => setPdfPage(parseInt(e.target.value) || 1)}
                    className="w-8 bg-transparent text-center text-xs font-bold text-gray-900 focus:outline-none" 
                  />
                  <span className="text-xs text-gray-400">/ 156</span>
                </div>
                <div className="h-4 w-px bg-gray-200 mx-1" />
                <button className="p-2 hover:bg-gray-50 rounded-lg text-gray-400"><Search size={18} /></button>
                <button className="p-2 hover:bg-gray-50 rounded-lg text-gray-400"><Printer size={18} /></button>
                <button className="p-2 hover:bg-gray-50 rounded-lg text-gray-400"><Settings size={18} /></button>
              </div>
            </div>

            {/* PDF Content Area */}
            <div 
              ref={scrollContainerRef}
              className="flex-1 bg-gray-100/50 overflow-auto p-8 flex flex-col items-center gap-8"
            >
              {/* Page 1 */}
              <div className="w-full max-w-2xl bg-white shadow-lg h-[1000px] p-16 relative text-gray-800 font-serif shrink-0">
                {/* Watermark */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
                  <div className="text-[120px] font-bold text-gray-100 -rotate-45 select-none whitespace-nowrap">
                    投标文件 · 内部资料
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
                    <span className="text-xs text-gray-500">正本</span>
                  </div>
                  <h2 className="text-3xl font-bold mb-4 tracking-wide">投标文件（资信标）</h2>
                  <p className="text-sm text-gray-600">
                    投标人：某建筑工程有限公司
                  </p>
                </div>

                {/* Document Body */}
                <div className="space-y-10 text-sm leading-relaxed relative z-0">
                  {/* Section 1 */}
                  <section>
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <span className="w-1.5 h-4 bg-gray-800 block"></span>
                      一、 资质证明文件
                    </h3>
                    <div className="pl-4 space-y-6 text-justify">
                      <div>
                        <h4 className="font-bold mb-2">1. 营业执照</h4>
                        <p className="indent-8 text-gray-600">
                          我公司具有独立法人资格，现提供有效的营业执照副本复印件。统一社会信用代码：911100001234567890。
                        </p>
                      </div>
                      <div>
                        <h4 className="font-bold mb-2">2. 资质证书</h4>
                        <p className="indent-8 text-gray-600">
                          我公司具备建筑工程施工总承包二级资质，证书编号：D211123456，有效期至2023年12月31日。
                        </p>
                      </div>
                    </div>
                  </section>

                  {/* Section 2 */}
                  <section>
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <span className="w-1.5 h-4 bg-gray-800 block"></span>
                      二、 类似工程业绩
                    </h3>
                    <div className="pl-4 space-y-3 text-justify">
                      <p className="indent-8">
                        我公司自2021年1月1日以来，完成过以下类似工程业绩：
                      </p>
                      <table className="w-full border-collapse border border-gray-400 text-xs mt-4">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="border border-gray-400 p-2 text-left">序号</th>
                            <th className="border border-gray-400 p-2 text-left">项目名称</th>
                            <th className="border border-gray-400 p-2 text-left">合同金额(万元)</th>
                            <th className="border border-gray-400 p-2 text-left">竣工日期</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="border border-gray-400 p-2 text-center">1</td>
                            <td className="border border-gray-400 p-2">某市体育馆建设项目</td>
                            <td className="border border-gray-400 p-2 text-right">6,200.00</td>
                            <td className="border border-gray-400 p-2 text-center">2022-05-15</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </section>
                </div>

                {/* Footer */}
                <div className="absolute bottom-8 left-0 w-full flex justify-between px-16 text-xs text-gray-400 border-t border-gray-100 pt-4">
                  <span>某建筑工程有限公司</span>
                  <span>第 45 页 / 共 156 页</span>
                </div>
              </div>

              {/* Page 2 */}
              <div className="w-full max-w-2xl bg-white shadow-lg h-[1000px] p-16 relative text-gray-800 font-serif shrink-0">
                {/* Watermark */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
                  <div className="text-[120px] font-bold text-gray-100 -rotate-45 select-none whitespace-nowrap">
                    投标文件 · 内部资料
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
                      三、 拟派项目主要人员
                    </h3>
                    <div className="pl-4 space-y-6 text-justify">
                      <div>
                        <h4 className="font-bold mb-2">1. 项目经理</h4>
                        <p className="indent-8 text-gray-600">
                          拟派项目经理张三，具备一级注册建造师执业资格（证书编号：京1112021202212345），并持有有效的安全生产考核合格证书（B证）。
                        </p>
                      </div>
                      <div>
                        <h4 className="font-bold mb-2">2. 技术负责人</h4>
                        <p className="indent-8 text-gray-600">
                          拟派技术负责人李四，工程师职称（中级），从事建筑工程施工技术管理工作8年。
                        </p>
                      </div>
                    </div>
                  </section>
                  
                  {/* Section 4 */}
                  <section>
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <span className="w-1.5 h-4 bg-gray-800 block"></span>
                      四、 财务状况及纳税证明
                    </h3>
                    <div className="pl-4 space-y-6 text-justify">
                      <div>
                        <h4 className="font-bold mb-2">1. 财务审计报告</h4>
                        <p className="indent-8 text-gray-600">
                          附2022年度经会计师事务所审计的财务报告复印件。报告显示，我公司2022年度资产负债率为55%，流动比率为1.5，财务状况良好。
                        </p>
                      </div>
                      <div>
                        <h4 className="font-bold mb-2">2. 社保及纳税证明</h4>
                        <p className="indent-8 text-gray-600">
                          附2023年10月、11月的社保缴纳证明，以及2023年10月、11月、12月的完税证明复印件。
                        </p>
                      </div>
                    </div>
                  </section>
                </div>

                {/* Footer */}
                <div className="absolute bottom-8 left-0 w-full flex justify-between px-16 text-xs text-gray-400 border-t border-gray-100 pt-4">
                  <span>某建筑工程有限公司</span>
                  <span>第 65 页 / 共 156 页</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Results List (40%) */}
          <div className="w-[40%] flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500">检查结果 ({filteredCreditItems.length})</span>
              <div className="flex items-center gap-1">
                {[
                  { id: 'all', label: '全部' },
                  { id: 'fail', label: '不通过' },
                  { id: 'manual', label: '人工' }
                ].map(opt => (
                  <button 
                    key={opt.id}
                    onClick={() => setCreditFilter(opt.id as any)}
                    className={cn(
                      "px-2 py-1 rounded text-[10px] font-bold border transition-all",
                      creditFilter === opt.id 
                        ? "bg-brand text-white border-brand" 
                        : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {filteredCreditItems.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => {
                    setPdfPage(parseInt(item.responseLocation.match(/P(\d+)/)?.[1] || '1'));
                    setActiveResultId(item.id);
                  }}
                  className={cn(
                    "p-4 rounded-xl border transition-all cursor-pointer group relative",
                    activeResultId === item.id ? "border-brand bg-brand/5" :
                    item.status === 'fail' ? "border-red-100 bg-red-50/10 hover:bg-red-50/30" : 
                    "border-gray-100 hover:border-brand/30 hover:bg-gray-50"
                  )}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-400">#{item.index}</span>
                      <div className={cn(
                        "flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border",
                        item.status === 'pass' ? "bg-green-50 text-green-700 border-green-100" :
                        item.status === 'fail' ? "bg-red-50 text-red-700 border-red-100" :
                        item.status === 'warning' ? "bg-yellow-50 text-yellow-700 border-yellow-100" :
                        item.status === 'skip' ? "bg-gray-50 text-gray-500 border-gray-100" :
                        "bg-orange-50 text-orange-700 border-orange-100"
                      )}>
                        {item.status === 'pass' ? '✓ 通过' : 
                         item.status === 'fail' ? '✗ 不通过' : 
                         item.status === 'warning' ? '⚠ 警告' :
                         item.status === 'skip' ? '⊘ 跳过' :
                         '○ 待人工'}
                      </div>
                    </div>
                    <button className="p-1 hover:bg-white rounded text-gray-400 opacity-0 group-hover:opacity-100 transition-all">
                      <ExternalLink size={14} />
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-[11px] font-bold text-gray-400 uppercase mb-1">要求描述</h4>
                      <p className="text-xs text-gray-900 leading-relaxed">{item.requirement}</p>
                      <div className="flex items-center gap-1 mt-1 text-[10px] text-brand font-medium">
                        <FileSearch size={10} />
                        <span>{item.requirementLocation}</span>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-[11px] font-bold text-gray-400 uppercase mb-1">投标响应</h4>
                      <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">{item.response}</p>
                      <div className="flex items-center gap-1 mt-1 text-[10px] text-brand font-medium">
                        <FileSearch size={10} />
                        <span>{item.responseLocation}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-gray-100/50">
                      <h4 className="text-[11px] font-bold text-gray-400 uppercase mb-1">结果说明</h4>
                      <p className="text-xs text-gray-500 leading-relaxed italic">{item.explanation}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        </div>
      );
    }

    return (
      <div className="flex-1 flex flex-col min-h-0 space-y-6">
        {renderSummaryCard()}

        {/* 检查结果列表 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex-1 flex flex-col min-h-0">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between shrink-0">
            <h3 className="text-base font-bold text-gray-900">详细检查清单</h3>
            <div className="flex items-center gap-2">
              {[
                { id: 'all', label: '全部', color: 'gray' },
                { id: 'fail', label: '不通过', color: 'red' },
                { id: 'warning', label: '警告', color: 'yellow' },
                { id: 'manual', label: '人工', color: 'orange' },
                { id: 'pass', label: '通过', color: 'green' }
              ].map(opt => (
                <button 
                  key={opt.id}
                  onClick={() => setCreditFilter(opt.id as any)}
                  className={cn(
                    "px-2 py-1 rounded text-[10px] font-bold border transition-all",
                    creditFilter === opt.id 
                      ? (opt.color === 'gray' ? "bg-gray-900 text-white border-gray-900" : 
                         opt.color === 'red' ? "bg-red-600 text-white border-red-600" :
                         opt.color === 'yellow' ? "bg-yellow-600 text-white border-yellow-600" :
                         opt.color === 'orange' ? "bg-orange-600 text-white border-orange-600" :
                         "bg-green-600 text-white border-green-600")
                      : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-20">序号</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-32">检查结果</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-1/4">要求描述</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-1/4">投标响应</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">结果说明</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredCreditItems.map((item) => (
                  <React.Fragment key={item.id}>
                    <tr className={cn(
                      "group transition-colors",
                      item.status === 'fail' ? "hover:bg-red-50/30" : "hover:bg-gray-50"
                    )}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {item.subItems && (
                            <button 
                              onClick={() => toggleExpand(item.id)}
                              className="p-1 hover:bg-gray-200 rounded transition-colors text-gray-400"
                            >
                              {expandedItems.has(item.id) ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>
                          )}
                          <span className="text-sm font-medium text-gray-900">{item.index}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border",
                          item.status === 'pass' ? "bg-green-50 text-green-700 border-green-100" :
                          item.status === 'fail' ? "bg-red-50 text-red-700 border-red-100" :
                          item.status === 'warning' ? "bg-yellow-50 text-yellow-700 border-yellow-100" :
                          item.status === 'skip' ? "bg-gray-50 text-gray-500 border-gray-100" :
                          "bg-orange-50 text-orange-700 border-orange-100"
                        )}>
                          {item.status === 'pass' ? <CheckCircle2 size={12} /> : 
                           item.status === 'fail' ? <XCircle size={12} /> : 
                           item.status === 'warning' ? <AlertTriangle size={12} /> :
                           item.status === 'skip' ? <XCircle size={12} className="opacity-30" /> :
                           <HelpCircle size={12} />}
                          {item.status === 'pass' ? '通过' : 
                           item.status === 'fail' ? '不通过' : 
                           item.status === 'warning' ? '警告' :
                           item.status === 'skip' ? '跳过' :
                           '待人工填写'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1.5">
                          <p className="text-sm text-gray-900 leading-relaxed font-medium">{item.requirement}</p>
                          <div className="flex items-center gap-1 text-[10px] text-gray-400">
                            <FileSearch size={10} />
                            <span>{item.requirementLocation}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1.5">
                          <p className="text-sm text-gray-600 leading-relaxed">{item.response}</p>
                          <div className="flex items-center gap-1 text-[10px] text-gray-400">
                            <FileSearch size={10} />
                            <span>{item.responseLocation}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-500 leading-relaxed">{item.explanation}</p>
                      </td>
                    </tr>
                    {item.subItems && expandedItems.has(item.id) && item.subItems.map(sub => (
                      <tr key={sub.id} className="bg-gray-50/30 border-l-4 border-brand/20">
                        <td className="px-6 py-3 pl-12 text-sm text-gray-500 font-medium">{sub.index}</td>
                        <td className="px-6 py-3">
                          <div className={cn(
                            "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border",
                            sub.status === 'pass' ? "bg-green-50 text-green-700 border-green-100" :
                            sub.status === 'fail' ? "bg-red-50 text-red-700 border-red-100" :
                            sub.status === 'warning' ? "bg-yellow-50 text-yellow-700 border-yellow-100" :
                            sub.status === 'skip' ? "bg-gray-50 text-gray-500 border-gray-100" :
                            "bg-orange-50 text-orange-700 border-orange-100"
                          )}>
                            {sub.status === 'pass' ? '通过' : 
                             sub.status === 'fail' ? '不通过' : 
                             sub.status === 'warning' ? '警告' :
                             sub.status === 'skip' ? '跳过' :
                             '待人工'}
                          </div>
                        </td>
                        <td className="px-6 py-3">
                          <p className="text-xs text-gray-600">{sub.requirement}</p>
                        </td>
                        <td className="px-6 py-3">
                          <p className="text-xs text-gray-500">{sub.response}</p>
                        </td>
                        <td className="px-6 py-3">
                          <p className="text-xs text-gray-400 italic">{sub.explanation}</p>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      {/* Top Header & Steps */}
      <div className="px-6 h-[88px] shrink-0 flex items-center">
        <div className="max-w-[1400px] w-full mx-auto flex items-center justify-between relative">
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
            <CheckSteps 
              currentStep={3} 
              isCurrentStepCompleted={true}
              className="mb-0 py-0 shadow-none border-none bg-transparent" 
            />
          </div>

          <div className="flex items-center gap-3 w-[30%] justify-end">
            <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200 p-1 shadow-sm">
              <button 
                onClick={() => setSearchParams({ type: 'credit' })}
                className={cn(
                  "px-4 py-1.5 rounded-md text-sm font-bold transition-all",
                  checkType === 'credit' ? "bg-brand text-white shadow-sm" : "text-gray-500 hover:text-gray-900"
                )}
              >
                资信标
              </button>
              <button 
                onClick={() => setSearchParams({ type: 'technical' })}
                className={cn(
                  "px-4 py-1.5 rounded-md text-sm font-bold transition-all",
                  checkType === 'technical' ? "bg-brand text-white shadow-sm" : "text-gray-500 hover:text-gray-900"
                )}
              >
                技术标
              </button>
              <button 
                onClick={() => setSearchParams({ type: 'economic' })}
                className={cn(
                  "px-4 py-1.5 rounded-md text-sm font-bold transition-all",
                  checkType === 'economic' ? "bg-brand text-white shadow-sm" : "text-gray-500 hover:text-gray-900"
                )}
              >
                经济标
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden p-6 flex flex-col">
        <div className="max-w-[1400px] w-full mx-auto flex-1 flex flex-col min-h-0 space-y-6">
          {checkType === 'credit' && renderCreditView()}
          {checkType === 'technical' && renderTechnicalView()}
          {checkType === 'economic' && (
            <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-2xl shadow-sm border border-gray-200 p-12 h-full">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <BarChart2 size={32} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">经济标检查功能开发中</h3>
              <p className="text-gray-500 text-center max-w-md">
                我们正在努力开发经济标的智能检查功能，包括工程量清单核对、综合单价分析、不平衡报价识别等，敬请期待。
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
