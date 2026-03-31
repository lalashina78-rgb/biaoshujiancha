import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { 
  ArrowLeft, CheckCircle2, 
  ShieldAlert, Search, 
  FileCheck, BookOpen, FileSearch,
  Cpu
} from 'lucide-react';
import { Button } from '../components/UI/Button';
import { motion, AnimatePresence } from 'motion/react';
import { CheckSteps } from '../components/Check/CheckSteps';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type CheckStatus = 'phase1' | 'phase2' | 'phase3' | 'completed' | 'error';

interface ProgressPhase {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
}

interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning';
}

const TECHNICAL_PHASES: ProgressPhase[] = [
  { 
    id: 'phase1', 
    label: '智能解析', 
    description: '深度解析招标文件结构与关键要素',
    icon: <Search size={18} />
  },
  { 
    id: 'phase2', 
    label: '规则匹配', 
    description: '基于响应标准进行全量响应点匹配',
    icon: <Cpu size={18} />
  },
  { 
    id: 'phase3', 
    label: '报告生成', 
    description: '汇总分析结果并生成风险评估报告',
    icon: <FileCheck size={18} />
  }
];

const CREDIT_PHASES: ProgressPhase[] = [
  { 
    id: 'phase1', 
    label: '要素提取', 
    description: '提取招标文件中的资信响应标准',
    icon: <BookOpen size={18} />
  },
  { 
    id: 'phase2', 
    label: '资质核验', 
    description: '交叉比对投标文件中的资质证明材料',
    icon: <FileSearch size={18} />
  },
  { 
    id: 'phase3', 
    label: '结果汇总', 
    description: '计算资信匹配度并生成合规性报告',
    icon: <FileCheck size={18} />
  }
];

export const CheckProgressPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { projects } = useStore();
  const project = projects.find(p => p.id === id);

  const checkType = searchParams.get('type') || 'credit';
  const stage = searchParams.get('stage') || 'checking'; // 'parsing' or 'checking'
  const isCredit = checkType === 'credit';

  const phases = useMemo(() => {
    if (stage === 'parsing') {
      return [
        { id: 'phase1', label: '文件读取', description: '加载并解析PDF文件流', icon: <Search size={18} /> },
        { id: 'phase2', label: '结构识别', description: '识别文档目录与章节层级', icon: <BookOpen size={18} /> },
        { id: 'phase3', label: '关键点提取', description: '提取响应相关的关键信息点', icon: <FileSearch size={18} /> }
      ];
    }
    return isCredit ? CREDIT_PHASES : TECHNICAL_PHASES;
  }, [isCredit, stage]);

  const [status, setStatus] = useState<CheckStatus>('phase1');
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const addLog = (message: string, type: 'info' | 'success' | 'warning' = 'info') => {
    const now = new Date();
    const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setLogs(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), timestamp: timeString, message, type }]);
  };

  useEffect(() => {
    // Initial log
    addLog('系统初始化完成，准备开始检查任务...', 'info');

    // Mock progress simulation
    const timer1 = setTimeout(() => {
      setProgress(33);
      setStatus('phase1');
      addLog('正在加载文件索引...', 'info');
      addLog('PDF文本层解析完成，共识别 156 页', 'success');
      addLog('开始提取关键章节内容...', 'info');
    }, 1000);

    const timer2 = setTimeout(() => {
      setProgress(66);
      setStatus('phase2');
      addLog('第一阶段解析完成', 'success');
      addLog('进入深度匹配阶段...', 'info');
      addLog('正在比对响应标准与响应内容...', 'info');
      addLog('发现 3 个潜在风险项', 'warning');
      addLog('正在计算分项匹配度...', 'info');
    }, 4000);

    const timer3 = setTimeout(() => {
      setProgress(90);
      setStatus('phase3');
      addLog('匹配度计算完成', 'success');
      addLog('正在生成最终报告...', 'info');
      addLog('汇总风险提示与优化建议...', 'info');
    }, 7500);

    const timer4 = setTimeout(() => {
      setProgress(100);
      setStatus('completed');
      addLog('所有检查任务已完成！', 'success');
      
      // Auto redirect after a short delay
      setTimeout(() => {
        if (stage === 'parsing') {
          navigate(`/projects/${id}/checkpoints?type=${checkType}`);
        } else {
          navigate(`/projects/${id}/check-result?type=${checkType}`);
        }
      }, 2000);
    }, 10000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [id, checkType, stage, navigate]);

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <ShieldAlert size={48} className="text-red-500 mb-4" />
        <p className="text-lg font-medium text-gray-900">项目不存在</p>
        <Button variant="primary" className="mt-4" onClick={() => navigate('/')}>返回首页</Button>
      </div>
    );
  }

  const currentPhaseIndex = status === 'completed' ? 3 : phases.findIndex(p => p.id === status);
  const currentLogs = logs.slice(-3); // Show last 3 logs

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      {/* Top Header & Steps */}
      <div className="px-6 py-4 shrink-0 border-b border-gray-100 bg-white z-10 relative">
        <div className="max-w-[1400px] w-full mx-auto flex items-center justify-between relative">
          <div className="flex items-center gap-4 w-[30%]">
            <button 
              onClick={() => navigate(`/projects/${id}`)} 
              className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 shrink-0"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold text-gray-900 line-clamp-1" title={project?.name || '未知项目'}>
              {project?.name || '未知项目'}
            </h1>
          </div>

          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px]">
            <CheckSteps 
              currentStep={stage === 'parsing' ? 1 : 3} 
              className="mb-0 py-0 shadow-none border-none bg-transparent" 
            />
          </div>

          <div className="flex items-center gap-3 w-[30%] justify-end">
            {/* Right actions if any */}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden p-6 flex flex-col">
        <div className="max-w-[1400px] w-full mx-auto flex-1 flex flex-col min-h-0 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        {/* Left Column: Immersive Scanning Area */}
        <div className="lg:col-span-6 flex flex-col h-full">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col items-center justify-center h-full relative overflow-hidden">
            
            {/* PDF Icon with Scanning Animation */}
            <div className="relative w-32 h-40 mb-12">
              {/* PDF Base Icon */}
              <div className="absolute inset-0 bg-blue-50/80 rounded-xl border-2 border-blue-100 flex flex-col items-center justify-center overflow-hidden shadow-sm">
                <div className="w-14 h-16 bg-white rounded border border-blue-100 shadow-sm flex flex-col items-center justify-center mb-3">
                   <span className="text-blue-600 font-bold text-xl">PDF</span>
                </div>
                <div className="w-20 h-1.5 bg-blue-200/60 rounded-full mb-2"></div>
                <div className="w-16 h-1.5 bg-blue-200/60 rounded-full mb-2"></div>
                <div className="w-20 h-1.5 bg-blue-200/60 rounded-full"></div>
              </div>
              
              {/* Scanning Light Band */}
              {status !== 'completed' && (
                <motion.div 
                  className="absolute left-[-30%] right-[-30%] h-0.5 bg-brand shadow-[0_0_12px_rgba(59,130,246,0.9)] z-10"
                  animate={{ top: ['0%', '100%', '0%'] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                >
                  <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-brand/20 to-transparent"></div>
                  <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-brand/20 to-transparent"></div>
                </motion.div>
              )}
            </div>

            {/* File Info */}
            <div className="text-center z-10">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {stage === 'parsing' 
                  ? '招标文件.pdf' 
                  : (isCredit ? '资信标投标文件.pdf' : '技术标投标文件.pdf')}
              </h3>
              <p className="text-sm text-gray-500 mb-8">15.4 MB</p>
              
              <div className="flex flex-col items-center justify-center gap-3">
                <span className="text-sm font-medium text-gray-600">
                  {status === 'completed' ? '解析完成' : '智能解析中...'}
                </span>
                {status !== 'completed' && (
                  <div className="w-2.5 h-2.5 rounded-full bg-brand animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.6)]"></div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Global Progress & Timeline */}
        <div className="lg:col-span-6 flex flex-col h-full">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 h-full flex flex-col">
            
            {/* Global Progress Top */}
            <div className="mb-12">
              <div className="text-5xl font-light text-gray-800 mb-4 font-mono">
                {progress}%
              </div>
              <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-brand rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            {/* Vertical Steps */}
            <div className="relative pl-2 space-y-10 flex-1">
              {/* Vertical Line */}
              <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-gray-100" />

              {phases.map((phase, index) => {
                const isCompleted = index < currentPhaseIndex || status === 'completed';
                const isCurrent = index === currentPhaseIndex && status !== 'completed';
                const isPending = index > currentPhaseIndex && status !== 'completed';

                return (
                  <div key={phase.id} className="relative flex gap-5 group">
                    {/* Icon/Dot */}
                    <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-white ${
                      isCompleted ? 'text-green-500' :
                      isCurrent ? 'text-brand' :
                      'text-gray-300'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle2 size={26} className="bg-white" />
                      ) : isCurrent ? (
                        <div className="w-5 h-5 rounded-full border-2 border-brand border-t-transparent animate-spin" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-gray-200" />
                      )}
                    </div>

                    {/* Content */}
                    <div className={`flex-1 pt-1 ${
                      isPending ? 'opacity-40' : 'opacity-100'
                    }`}>
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className={`text-base font-bold ${
                          isCurrent ? 'text-gray-900' : 
                          isCompleted ? 'text-gray-900' : 'text-gray-500'
                        }`}>
                          {phase.label}
                          {isCurrent && <span className="ml-2 text-sm font-normal text-gray-500">(处理中...)</span>}
                        </h4>
                      </div>
                      
                      {isCompleted && (
                        <p className="text-sm text-gray-500 mt-1">
                          已完成
                        </p>
                      )}
                      
                      {/* Sub-steps visual (only for current) */}
                      {isCurrent && (
                        <div className="mt-3 space-y-2">
                          <AnimatePresence mode="popLayout">
                            {currentLogs.map((log) => (
                              <motion.div 
                                key={log.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, height: 0 }}
                                className="flex items-center gap-2 text-sm text-gray-600"
                              >
                                <div className="w-1.5 h-1.5 rounded-full bg-brand/60 shrink-0" />
                                <span className="truncate">{log.message}</span>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
};

