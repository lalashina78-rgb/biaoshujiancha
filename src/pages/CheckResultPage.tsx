import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ArrowLeft, Download, AlertTriangle, CheckCircle2, 
  AlertCircle, ChevronRight, Filter, BarChart3, 
  PieChart as PieChartIcon, ListFilter, Search,
  Info, ExternalLink, LayoutList, FileSearch,
  ChevronDown, ChevronUp, HelpCircle, XCircle, X,
  Printer, Settings, ChevronLeft, ZoomIn, ZoomOut, FileText, BarChart2,
  ClipboardCheck
} from 'lucide-react';
import { 
  ResponsiveContainer, RadarChart, PolarGrid, 
  PolarAngleAxis, Radar, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell
} from 'recharts';
import { useStore } from '../store/useStore';
import { ScoringResult, RiskLevel, ScoringPoint, BidResponse, CreditCheckItem } from '../types';
import { Button } from '../components/UI/Button';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { CheckSteps } from '../components/Check/CheckSteps';
import { MOCK_SCORING_RESULT, MOCK_CREDIT_RESULTS } from './mockData';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Mock Scoring Data for Technical Check
// MOVED TO mockData.ts

// Mock Data for Credit Check
// INTERFACES MOVED TO types.ts

// MOCK_CREDIT_RESULTS MOVED TO mockData.ts

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
  const [filterType, setFilterType] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Credit Check States
  const [viewMode, setViewMode] = useState<'list' | 'file'>('list');
  const [creditFilter, setCreditFilter] = useState<'all' | 'fail' | 'pass' | 'manual'>('all');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(['c1']));
  const [pdfPage, setPdfPage] = useState<number>(1);
  const [activeResultId, setActiveResultId] = useState<string | null>(null);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const [previewModal, setPreviewModal] = useState<{isOpen: boolean, item: CreditCheckItem | null, sourceFile?: string}>({isOpen: false, item: null});

  const handleLocatorClick = (e: React.MouseEvent, item: CreditCheckItem, sourceFile: string) => {
    e.stopPropagation();
    setPdfPage(parseInt(item.responseLocation.match(/P(\d+)/)?.[1] || '1'));
    setActiveResultId(item.id);
    if (viewMode === 'list') {
      setPreviewModal({ isOpen: true, item, sourceFile });
    }
  };

  // Default positioning for File View
  React.useEffect(() => {
    if (viewMode === 'file') {
      const firstFail = MOCK_CREDIT_RESULTS.find(i => i.status === 'fail');
      const firstManual = MOCK_CREDIT_RESULTS.find(i => i.status === 'manual');
      const target = firstFail || firstManual || MOCK_CREDIT_RESULTS[0];
      
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
      case 'high':
        result = result.filter(p => p.riskLevel === 'high');
        break;
      case 'medium':
        result = result.filter(p => p.riskLevel === 'medium');
        break;
      case 'low':
        result = result.filter(p => p.riskLevel === 'low');
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
      <div className="space-y-6 pr-2 pb-6">
        {/* 响应汇总与图表 */}
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
                <span className={cn(
                  "text-3xl font-bold",
                  Math.round((MOCK_SCORING_RESULT.totalScore / MOCK_SCORING_RESULT.maxTotalScore * 100) / 10) * 10 <= 30 ? "text-red-600" :
                  Math.round((MOCK_SCORING_RESULT.totalScore / MOCK_SCORING_RESULT.maxTotalScore * 100) / 10) * 10 <= 60 ? "text-orange-600" :
                  Math.round((MOCK_SCORING_RESULT.totalScore / MOCK_SCORING_RESULT.maxTotalScore * 100) / 10) * 10 <= 80 ? "text-yellow-600" :
                  "text-green-600"
                )}>
                  {Math.round((MOCK_SCORING_RESULT.totalScore / MOCK_SCORING_RESULT.maxTotalScore * 100) / 10) * 10}%
                </span>
                <span className="text-xs text-gray-400 font-medium">总体匹配度</span>
              </div>
            </div>
            
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-gray-900">技术标响应匹配度</h2>
                <span className="text-sm text-gray-400">(满分 100%)</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-xl border border-orange-100 text-sm text-orange-600">
                <AlertTriangle size={16} className="shrink-0" />
                <p>技术标的响应不完整，部分响应点匹配度较低，建议查看差异原因。</p>
              </div>
            </div>
          </div>
          
          <Button variant="outline" className="flex items-center gap-2">
            <Download size={18} />
            导出报告
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* 维度分析 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-6">
              <BarChart2 size={18} className="text-brand" />
              分类匹配度分布
            </h3>
            <div className="h-[250px] mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                  <PolarGrid stroke="#f3f4f6" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 500 }} />
                  <Radar
                    name="匹配度"
                    dataKey="A"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.15}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                    formatter={(value: number) => [`${value.toFixed(1)}%`, '匹配度']}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="space-y-4">
              {MOCK_SCORING_RESULT.categories.map(cat => (
                <div key={cat.category} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-sm font-bold">
                    <span className="text-gray-700">{cat.category}</span>
                    <span className={cn(
                      "text-gray-900",
                      Math.round((cat.score / cat.maxScore * 100) / 10) * 10 <= 30 ? "text-red-600" :
                      Math.round((cat.score / cat.maxScore * 100) / 10) * 10 <= 60 ? "text-orange-600" :
                      Math.round((cat.score / cat.maxScore * 100) / 10) * 10 <= 80 ? "text-yellow-600" :
                      "text-green-600"
                    )}>
                      {Math.round((cat.score / cat.maxScore * 100) / 10) * 10}%
                    </span>
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

          {/* 详细响应列表 */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <LayoutList size={18} className="text-brand" />
                详细响应清单
              </h3>
              <div className="relative w-64">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="搜索响应点..." 
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                />
              </div>
            </div>
            
            <div className="px-6 pt-4 border-b border-gray-50 flex items-center justify-between">
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

              <div className="relative pb-4">
                <button 
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-all"
                >
                  <Filter size={14} className="text-gray-400" />
                  <span>
                    {filterType === 'all' ? '全部风险' : 
                     filterType === 'high' ? '高风险' : 
                     filterType === 'medium' ? '中风险' : '低风险'}
                  </span>
                  <ChevronDown size={14} className={cn("text-gray-400 transition-transform", isFilterOpen && "rotate-180")} />
                </button>

                {isFilterOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setIsFilterOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-20">
                      {[
                        { id: 'all', label: '全部' },
                        { id: 'high', label: '高风险' },
                        { id: 'medium', label: '中风险' },
                        { id: 'low', label: '低风险' }
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => {
                            setFilterType(opt.id as any);
                            setIsFilterOpen(false);
                          }}
                          className={cn(
                            "w-full px-4 py-2 text-left text-sm transition-colors hover:bg-gray-50",
                            filterType === opt.id ? "text-brand font-bold bg-brand/5" : "text-gray-600"
                          )}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="p-6 space-y-4">
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
                      <div className={cn(
                        "text-lg font-bold",
                        Math.round((point.score / point.maxScore * 100) / 10) * 10 <= 30 ? "text-red-600" :
                        Math.round((point.score / point.maxScore * 100) / 10) * 10 <= 60 ? "text-orange-600" :
                        Math.round((point.score / point.maxScore * 100) / 10) * 10 <= 80 ? "text-yellow-600" :
                        "text-green-600"
                      )}>
                        {Math.round((point.score / point.maxScore * 100) / 10) * 10}%
                      </div>
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

    const summaryStatus = failCount > 0 ? 'fail' : manualCount > 0 ? 'manual' : 'pass';

    const renderSummaryCard = () => (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6 flex-1">
            <div className={cn(
              "w-16 h-16 rounded-2xl flex items-center justify-center shrink-0",
              summaryStatus === 'fail' ? "bg-red-50 text-red-500" :
              summaryStatus === 'manual' ? "bg-orange-50 text-orange-500" :
              "bg-green-50 text-green-500"
            )}>
              {summaryStatus === 'fail' ? <XCircle size={32} /> : 
               summaryStatus === 'manual' ? <HelpCircle size={32} /> : 
               <CheckCircle2 size={32} />}
            </div>
            <div className="flex-1 max-w-3xl">
              <div className="flex items-center gap-4 mb-3">
                <h2 className={cn(
                  "text-xl font-bold",
                  summaryStatus === 'fail' ? "text-red-600" :
                  summaryStatus === 'manual' ? "text-orange-600" :
                  "text-green-600"
                )}>
                  {summaryStatus === 'fail' ? '存在不符合项' : 
                   summaryStatus === 'manual' ? '存在人工复核项' : 
                   '全部符合'}
                </h2>
                <div className="h-4 w-px bg-gray-200" />
                <div className="flex items-center gap-4 text-sm text-gray-500 font-medium">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500" /> {failCount}个不通过</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-orange-500" /> {manualCount}个人工复核</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500" /> {passCount}个通过</span>
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
        <div className="space-y-6">
          {renderSummaryCard()}
          <div className="flex gap-6 flex-1 min-h-0">
          {/* Left: File Preview (60%) */}
          <div className="w-[60%] flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* PDF Toolbar */}
            <div className="px-4 py-3 border-b border-gray-100 bg-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-white rounded-xl p-1 border border-brand/20 shadow-sm">
                  <button className="p-1.5 hover:bg-brand/5 rounded-lg text-brand transition-all">
                    <ChevronLeft size={18} />
                  </button>
                  <div className="px-2 flex items-center gap-2.5">
                    <FileText size={18} className="text-brand" />
                    <span className="text-sm font-bold text-gray-900">资信标.pdf</span>
                  </div>
                  <button className="p-1.5 hover:bg-brand/5 rounded-lg text-brand transition-all">
                    <ChevronRight size={18} />
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
                  className={cn(
                    "absolute left-0 w-full animate-pulse pointer-events-none mix-blend-multiply z-10",
                    filteredCreditItems.find(i => i.id === activeResultId)?.status === 'fail' ? "bg-red-100/50 border-y-2 border-red-300" : "bg-brand/10 border-y-2 border-brand/30"
                  )}
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
                  className={cn(
                    "absolute left-0 w-full animate-pulse pointer-events-none mix-blend-multiply z-10",
                    filteredCreditItems.find(i => i.id === activeResultId)?.status === 'fail' ? "bg-red-100/50 border-y-2 border-red-300" : "bg-brand/10 border-y-2 border-brand/30"
                  )}
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
                  { id: 'pass', label: '通过' },
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
                        "bg-orange-50 text-orange-700 border-orange-100"
                      )}>
                        {item.status === 'pass' ? '✓ 通过' : 
                         item.status === 'fail' ? '✗ 不通过' : 
                         '○ 人工复核'}
                      </div>
                    </div>
                    <button className="p-1 hover:bg-white rounded text-gray-400 opacity-0 group-hover:opacity-100 transition-all">
                      <ExternalLink size={14} />
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-[11px] font-bold text-gray-400 uppercase mb-1">要求描述</h4>
                      <div className="space-y-1">
                        <p className="text-xs text-gray-900 font-bold">{item.name}</p>
                        <p className="text-xs text-gray-600 leading-relaxed">{item.requirement}</p>
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-[10px] text-brand font-medium">
                        <FileSearch size={10} />
                        <span>{item.requirementLocation}</span>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-[11px] font-bold text-gray-400 uppercase mb-2">投标响应</h4>
                      <div className="space-y-3">
                        {item.responses.map((res, ridx) => (
                          <div key={ridx} className="bg-white/50 rounded-lg p-2.5 border border-gray-100/50">
                            <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold mb-2">
                              <FileSearch size={10} />
                              <span>{res.sourceFile}</span>
                            </div>
                            
                            {res.texts && res.texts.length > 0 && (
                              <div className="space-y-1 mb-2 last:mb-0">
                                {res.texts.map((t, tidx) => (
                                  <div 
                                    key={tidx} 
                                    className="flex items-start gap-2 text-xs"
                                  >
                                    <span className={cn("shrink-0", item.status === 'fail' ? "text-red-400" : "text-gray-400")}>
                                      {t.label}：
                                    </span>
                                    <span 
                                      onClick={(e) => handleLocatorClick(e, item, res.sourceFile)}
                                      className={cn("font-medium transition-colors cursor-pointer hover:underline", item.status === 'fail' ? "text-red-600 hover:text-red-700" : "text-gray-900 hover:text-brand")}
                                    >
                                      {t.value}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {res.materials && res.materials.length > 0 && (
                              <div className="flex flex-wrap gap-1.5">
                                {res.materials.map((m, midx) => (
                                  <div 
                                    key={midx} 
                                    onClick={(e) => handleLocatorClick(e, item, res.sourceFile)}
                                    className={cn(
                                      "flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border cursor-pointer transition-all hover:shadow-sm hover:-translate-y-0.5",
                                      item.status === 'fail' 
                                        ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100" 
                                        : "bg-brand/5 text-brand border-brand/10 hover:bg-brand/10"
                                    )}
                                  >
                                    <FileText size={10} />
                                    {m}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-gray-100/50">
                      <h4 className="text-[11px] font-bold text-gray-400 uppercase mb-1">结果说明</h4>
                      <div className="space-y-1">
                        {item.explanation.map((exp, idx) => (
                          <p key={idx} className="text-xs text-gray-500 leading-relaxed italic flex items-start gap-1">
                            <span className="mt-1 w-1 h-1 rounded-full bg-gray-300 shrink-0" />
                            {exp}
                          </p>
                        ))}
                      </div>
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
      <div className="space-y-6">
        {renderSummaryCard()}

        {/* 检查结果列表 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between shrink-0">
            <h3 className="text-base font-bold text-gray-900">详细检查清单</h3>
            <div className="flex items-center gap-2">
              {[
                { id: 'all', label: '全部', color: 'gray' },
                { id: 'pass', label: '通过', color: 'green' },
                { id: 'fail', label: '不通过', color: 'red' },
                { id: 'manual', label: '人工复核', color: 'orange' }
              ].map(opt => (
                <button 
                  key={opt.id}
                  onClick={() => setCreditFilter(opt.id as any)}
                  className={cn(
                    "px-2 py-1 rounded text-[10px] font-bold border transition-all",
                    creditFilter === opt.id 
                      ? (opt.color === 'gray' ? "bg-gray-900 text-white border-gray-900" : 
                         opt.color === 'red' ? "bg-red-600 text-white border-red-600" :
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
          <div>
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
                  <tr key={item.id} className={cn(
                    "group transition-colors",
                    item.status === 'fail' ? "hover:bg-red-50/30" : "hover:bg-gray-50"
                  )}>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-900">{item.index}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border",
                        item.status === 'pass' ? "bg-green-50 text-green-700 border-green-100" :
                        item.status === 'fail' ? "bg-red-50 text-red-700 border-red-100" :
                        "bg-orange-50 text-orange-700 border-orange-100"
                      )}>
                        {item.status === 'pass' ? <CheckCircle2 size={12} /> : 
                         item.status === 'fail' ? <XCircle size={12} /> : 
                         <HelpCircle size={12} />}
                        {item.status === 'pass' ? '通过' : 
                         item.status === 'fail' ? '不通过' : 
                         '人工复核'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1.5">
                        <p className="text-sm text-gray-900 leading-relaxed font-bold">{item.name}</p>
                        <p className="text-xs text-gray-500 leading-relaxed">{item.requirement}</p>
                        <div className="flex items-center gap-1 text-[10px] text-gray-400">
                          <FileSearch size={10} />
                          <span>{item.requirementLocation}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-3">
                        {item.responses.map((res, ridx) => (
                          <div key={ridx} className="space-y-1.5">
                            <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold">
                              <FileSearch size={10} />
                              <span>{res.sourceFile}</span>
                            </div>
                            
                            {res.texts && res.texts.length > 0 && (
                              <div className="space-y-1">
                                {res.texts.map((t, tidx) => (
                                  <div 
                                    key={tidx} 
                                    className="flex items-start gap-2 text-xs"
                                  >
                                    <span className={cn("shrink-0", item.status === 'fail' ? "text-red-400" : "text-gray-400")}>
                                      {t.label}：
                                    </span>
                                    <span 
                                      onClick={(e) => handleLocatorClick(e, item, res.sourceFile)}
                                      className={cn("font-medium transition-colors cursor-pointer hover:underline", item.status === 'fail' ? "text-red-600 hover:text-red-700" : "text-gray-900 hover:text-brand")}
                                    >
                                      {t.value}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {res.materials && res.materials.length > 0 && (
                              <div className="flex flex-wrap gap-1.5">
                                {res.materials.map((m, midx) => (
                                  <div 
                                    key={midx} 
                                    onClick={(e) => handleLocatorClick(e, item, res.sourceFile)}
                                    className={cn(
                                      "flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border cursor-pointer transition-all hover:shadow-sm hover:-translate-y-0.5",
                                      item.status === 'fail' 
                                        ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100" 
                                        : "bg-brand/5 text-brand border-brand/10 hover:bg-brand/10"
                                    )}
                                  >
                                    <FileText size={10} />
                                    {m}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {item.explanation.map((exp, idx) => (
                          <p key={idx} className="text-sm text-gray-500 leading-relaxed flex items-start gap-1.5">
                            <span className="mt-2 w-1 h-1 rounded-full bg-gray-300 shrink-0" />
                            {exp}
                          </p>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Preview Modal for List View */}
        {previewModal.isOpen && previewModal.item && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-6xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 shrink-0">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <FileText className="text-brand" size={18} />
                    <span className="font-bold text-gray-900">{previewModal.sourceFile || '证件材料.pdf'}</span>
                  </div>
                  <div className="h-4 w-px bg-gray-300" />
                  <div className="flex items-center gap-1">
                    <button className="p-1 hover:bg-gray-200 rounded transition-colors text-gray-500 disabled:opacity-50" disabled={pdfPage === 1} onClick={() => setPdfPage(Math.max(1, pdfPage - 1))}>
                      <ChevronLeft size={16} />
                    </button>
                    <span className="text-xs text-gray-600 font-medium px-2">第 {pdfPage} 页 / 共 156 页</span>
                    <button className="p-1 hover:bg-gray-200 rounded transition-colors text-gray-500" onClick={() => setPdfPage(pdfPage + 1)}>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-0.5 mr-2">
                    <button className="p-1 hover:bg-gray-50 rounded transition-all text-gray-500">
                      <ZoomOut size={16} />
                    </button>
                    <span className="text-[10px] text-gray-500 font-medium w-8 text-center">100%</span>
                    <button className="p-1 hover:bg-gray-50 rounded transition-all text-gray-500">
                      <ZoomIn size={16} />
                    </button>
                  </div>
                  <button onClick={() => setPreviewModal({ isOpen: false, item: null })} className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-400 transition-colors">
                    <X size={18} />
                  </button>
                </div>
              </div>
              
              <div 
                ref={scrollContainerRef}
                className="flex-1 bg-gray-100/50 overflow-auto p-8 flex flex-col items-center gap-8"
              >
                {/* Page 1 */}
                <div className="w-full max-w-2xl bg-white shadow-lg h-[1000px] p-16 relative text-gray-800 font-serif shrink-0">
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
                    <div className="text-[120px] font-bold text-gray-100 -rotate-45 select-none whitespace-nowrap">
                      投标文件 · 内部资料
                    </div>
                  </div>

                  <div 
                    className={cn(
                      "absolute left-0 w-full animate-pulse pointer-events-none mix-blend-multiply z-10",
                      previewModal.item?.status === 'fail' ? "bg-red-100/50 border-y-2 border-red-300" : "bg-brand/10 border-y-2 border-brand/30"
                    )}
                    style={getHighlightStyle(0)} 
                  />
                  
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

                  <div className="space-y-10 text-sm leading-relaxed relative z-0">
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

                  <div className="absolute bottom-8 left-0 w-full flex justify-between px-16 text-xs text-gray-400 border-t border-gray-100 pt-4">
                    <span>某建筑工程有限公司</span>
                    <span>第 45 页 / 共 156 页</span>
                  </div>
                </div>

                {/* Page 2 */}
                <div className="w-full max-w-2xl bg-white shadow-lg h-[1000px] p-16 relative text-gray-800 font-serif shrink-0">
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
                    <div className="text-[120px] font-bold text-gray-100 -rotate-45 select-none whitespace-nowrap">
                      投标文件 · 内部资料
                    </div>
                  </div>

                  <div 
                    className={cn(
                      "absolute left-0 w-full animate-pulse pointer-events-none mix-blend-multiply z-10",
                      previewModal.item?.status === 'fail' ? "bg-red-100/50 border-y-2 border-red-300" : "bg-brand/10 border-y-2 border-brand/30"
                    )}
                    style={getHighlightStyle(1)} 
                  />

                  <div className="space-y-10 text-sm leading-relaxed relative z-0">
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

                  <div className="absolute bottom-8 left-0 w-full flex justify-between px-16 text-xs text-gray-400 border-t border-gray-100 pt-4">
                    <span>某建筑工程有限公司</span>
                    <span>第 65 页 / 共 156 页</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col w-full">
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

      <div className="p-6">
        <div className="max-w-[1400px] w-full mx-auto space-y-6">
          {checkType === 'credit' && renderCreditView()}
          {checkType === 'technical' && renderTechnicalView()}
          {checkType === 'economic' && (
            <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-2xl shadow-sm border border-gray-200 p-12 py-24">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <ClipboardCheck size={32} className="text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">未发起经济标检查</h3>
              <p className="text-gray-500 text-center max-w-md">
                当前项目尚未发起经济标智能检查，因此无法查看检查结果。您可以返回项目详情页发起检查，或上传相关经济标文件。
              </p>
              <Button 
                onClick={() => navigate(`/projects/${id}`)}
                variant="outline" 
                className="mt-8 flex items-center gap-2"
              >
                <ArrowLeft size={16} />
                返回项目详情
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
