import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { 
  ArrowLeft, CheckCircle2, 
  ShieldAlert, Search, 
  FileCheck, BookOpen, FileSearch,
  Cpu, FileText, ChevronRight
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
  id: 'extraction' | 'review' | 'reporting';
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

const CHECK_PHASES: ProgressPhase[] = [
  { 
    id: 'extraction', 
    label: '信息提取', 
    description: '从投标文件及附件中提取评审关键要素',
    icon: <Search size={18} />
  },
  { 
    id: 'review', 
    label: '逐项评审', 
    description: '结合评分标准对比提取到的信息进行合规性分析',
    icon: <Cpu size={18} />
  },
  { 
    id: 'reporting', 
    label: '报告生成', 
    description: '汇总所有评价维度，生成最终评审意见与风险提示',
    icon: <FileCheck size={18} />
  }
];

const MOCK_FILES = [
  '投标函及投标函附录.pdf',
  '法定代表人身份证明与授权委托书.pdf',
  '联合体协议书（如有）.pdf',
  '资格审查材料集.pdf',
  '技术方案建议书.pdf',
  '施工组织设计分项.doc'
];

const MOCK_POINTS = [
  '企业营业执照有效性',
  '类似项目业绩（近3年）要求',
  '主要管理人员职称与社保核验',
  '施工设备配备方案合理性',
  '安全管理体系及应急预案',
  '技术响应偏离度检测'
];

export const CheckProgressPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { projects } = useStore();
  const project = projects.find(p => p.id === id);

  const checkType = searchParams.get('type') || 'credit';
  const stage = searchParams.get('stage') || 'checking';

  const [status, setStatus] = useState<ProgressPhase['id']>('extraction');
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [currentProcessingItem, setCurrentProcessingItem] = useState<string>(MOCK_FILES[0]);

  const addLog = (message: string, type: 'info' | 'success' | 'warning' = 'info') => {
    const now = new Date();
    const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setLogs(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), timestamp: timeString, message, type }]);
  };

  useEffect(() => {
    addLog('启动智能化评审引擎...', 'info');
    
    let currentStep = 0;
    const totalSteps = 20; // total "ticks" for simulation
    
    const interval = setInterval(() => {
      currentStep++;
      const percent = Math.min(Math.round((currentStep / totalSteps) * 100), 100);
      setProgress(percent);

      // Phase logic
      if (currentStep <= 8) {
        setStatus('extraction');
        const fileIndex = Math.min(Math.floor((currentStep - 1) / 1.5), MOCK_FILES.length - 1);
        const fileName = MOCK_FILES[fileIndex];
        if (fileName !== currentProcessingItem) {
          setCurrentProcessingItem(fileName);
          addLog(`正在提取 [${fileName}] 中的关键信息要素...`, 'info');
        }
        if (currentStep === 8) addLog('信息提取阶段完成，共识别 12 个关键响应点', 'success');
      } else if (currentStep <= 17) {
        setStatus('review');
        const pointIndex = Math.min(Math.floor((currentStep - 9) / 1.5), MOCK_POINTS.length - 1);
        const pointName = MOCK_POINTS[pointIndex];
        if (pointName !== currentProcessingItem) {
          setCurrentProcessingItem(pointName);
          addLog(`正在对 [${pointName}] 进行深度符合性评审...`, 'info');
          if (pointIndex === 2) addLog('检测到一名关键人员社保记录不完整', 'warning');
        }
        if (currentStep === 17) addLog('评分项逐项审核完成，正在汇总逻辑关系', 'success');
      } else {
        setStatus('reporting');
        setCurrentProcessingItem('正在整理最终报告...');
        if (currentStep === 18) addLog('整理评审结论与优化建议...', 'info');
        if (currentStep === 20) addLog('评审任务圆满完成！', 'success');
      }

      if (currentStep >= totalSteps) {
        clearInterval(interval);
        setTimeout(() => {
          if (stage === 'parsing') {
            navigate(`/projects/${id}/checkpoints?type=${checkType}`);
          } else {
            navigate(`/projects/${id}/check-result?type=${checkType}`);
          }
        }, 1500);
      }
    }, 800);

    return () => clearInterval(interval);
  }, [id, checkType, stage, navigate, currentProcessingItem]);

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <ShieldAlert size={48} className="text-red-500 mb-4" />
        <p className="text-lg font-medium text-gray-900">项目不存在</p>
        <Button variant="primary" className="mt-4" onClick={() => navigate('/')}>返回首页</Button>
      </div>
    );
  }

  const currentPhaseIndex = CHECK_PHASES.findIndex(p => p.id === status);
  const displayLogs = logs.slice(-4);

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
        {/* Left Side: Document Preview (Simplified) */}
        <div className="lg:col-span-6 flex flex-col h-full">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col items-center justify-center h-full relative">
            
            {/* Simple Document Icon */}
            <div className="bg-indigo-50 rounded-2xl border-2 border-indigo-100 flex flex-col items-center justify-center p-12 mb-8 shadow-sm">
              <div className="w-16 h-20 bg-white rounded-lg border border-indigo-100 shadow-sm flex flex-col items-center justify-center mb-4">
                <FileText size={40} className="text-indigo-600" />
              </div>
              <div className="text-center">
                <div className="text-brand font-bold text-xs tracking-widest uppercase mb-1">正在评审项目</div>
                <h3 className="text-xl font-bold text-gray-900">招标文件.pdf</h3>
                <p className="text-sm text-gray-400 mt-2">15.4 MB • 156 页</p>
              </div>
            </div>

            {/* Simple Status Card */}
            <div className="w-full max-w-sm bg-gray-50 rounded-xl p-4 border border-gray-100 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-sm">
                <div className="w-5 h-5 rounded-full border-2 border-brand border-t-transparent animate-spin" />
              </div>
              <div className="flex-1">
                <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">系统当前状态</div>
                <div className="text-sm font-bold text-gray-900">
                  {status === 'extraction' ? '智能提取响应点' : status === 'review' ? '逐项核验评审中' : '汇总评审意见'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Global Progress & Timeline */}
        <div className="lg:col-span-6 flex flex-col h-full">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 h-full flex flex-col">
            
            {/* Global Progress Top */}
            <div className="mb-10">
              <div className="flex items-end justify-between mb-4">
                <div className="text-sm font-bold text-gray-400 uppercase tracking-wider">总进度</div>
                <div className="text-5xl font-light text-brand font-mono leading-none">
                  {progress}<span className="text-2xl ml-1">%</span>
                </div>
              </div>
              <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden p-0.5">
                <motion.div 
                  className="h-full bg-indigo-600 rounded-full shadow-[0_0_8px_rgba(79,70,229,0.4)]"
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

              {CHECK_PHASES.map((phase, index) => {
                const isCompleted = index < currentPhaseIndex || progress === 100;
                const isCurrent = index === currentPhaseIndex && progress < 100;
                const isPending = index > currentPhaseIndex && progress < 100;

                return (
                  <div key={phase.id} className="relative flex gap-6 group">
                    {/* Icon/Dot */}
                    <div className={cn(
                      "relative z-10 w-9 h-9 rounded-full flex items-center justify-center shrink-0 border-2 transition-all duration-300 shadow-sm",
                      isCompleted ? "bg-green-500 border-green-500 text-white" :
                      isCurrent ? "bg-white border-brand text-brand" :
                      "bg-white border-gray-100 text-gray-300"
                    )}>
                      {isCompleted ? (
                        <CheckCircle2 size={20} />
                      ) : isCurrent ? (
                        <motion.div 
                          animate={{ rotate: 360 }}
                          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        >
                          <Cpu size={18} />
                        </motion.div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-gray-100" />
                      )}
                    </div>

                    {/* Content */}
                    <div className={cn(
                      "flex-1 pt-1 transition-all duration-300",
                      isPending ? "opacity-30" : "opacity-100"
                    )}>
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className={cn(
                          "text-base font-bold",
                          isCurrent || isCompleted ? "text-gray-900" : "text-gray-400"
                        )}>
                          {phase.label}
                        </h4>
                        {isCurrent && (
                          <div className="flex gap-1">
                            <span className="w-1 h-1 rounded-full bg-brand animate-[bounce_1s_infinite_100ms]" />
                            <span className="w-1 h-1 rounded-full bg-brand animate-[bounce_1s_infinite_200ms]" />
                            <span className="w-1 h-1 rounded-full bg-brand animate-[bounce_1s_infinite_300ms]" />
                          </div>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-400 leading-relaxed truncate">
                        {isCompleted ? "该阶段已全部处理完成" : isCurrent ? `正在分析: ${currentProcessingItem}` : phase.description}
                      </p>
                      
                      {/* Filename Logs (Simplified) */}
                      {isCurrent && (
                        <div className="mt-4 space-y-1.5 bg-gray-50/50 rounded-xl p-3 border border-gray-100">
                          <AnimatePresence mode="popLayout" initial={false}>
                            {displayLogs.map((log) => (
                              <motion.div 
                                key={log.id}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={cn(
                                  "flex items-center gap-2 text-[11px] font-medium",
                                  log.type === 'warning' ? "text-orange-500" : 
                                  log.type === 'success' ? "text-green-500" : "text-gray-400"
                                )}
                              >
                                <ChevronRight size={10} className="shrink-0 opacity-50" />
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

