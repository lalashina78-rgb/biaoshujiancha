import React, { useState, useRef } from 'react';
import { 
  ArrowLeft, Calendar, MapPin, Clock, Edit2, AlertTriangle, 
  Lightbulb, FileText, Download, Eye, RefreshCw, UploadCloud, 
  Plus, ChevronDown, ChevronUp, ChevronRight, MoreHorizontal, MoreVertical, CheckCircle, 
  AlertCircle, Loader2, Trash2, File, User, Folder, Building2, Briefcase, Phone, CheckCircle2, X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Project, ProjectStatus, ProjectFile, ProposalVersion, CheckStatus } from '../../types';
import { Button } from '../UI/Button';
import { PageHeader } from '../common/PageHeader';
import { AddVersionModal, FileUploadData } from '../Modals/AddVersionModal';
import { UnifiedCheckConfirmModal } from '../Modals/UnifiedCheckConfirmModal';
import { useStore } from '../../store/useStore';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ProjectDetailProps {
  project: Project;
  onBack: () => void;
}

// Mock Helper for file size
const formatSize = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

// Mock Helper for date format
const formatDate = (date?: Date) => {
  if (!date) return '未设置';
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

// --- Sub-components for better organization ---

interface InfoFieldProps {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const InfoField: React.FC<InfoFieldProps> = ({ label, icon, children }) => (
  <div className="flex flex-col gap-1">
    <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
      {icon}
      {label}
    </div>
    <div className="text-sm font-semibold text-gray-900">{children}</div>
  </div>
);

interface TenderFileCardProps {
  file?: ProjectFile;
  typeLabel: string;
  icon: React.ReactNode;
  onUpload?: () => void;
  onDelete?: () => void;
}

const TenderFileCard: React.FC<TenderFileCardProps> = ({ file, typeLabel, icon, onUpload, onDelete }) => {
  if (!file) {
    return (
      <div 
        onClick={onUpload}
        className="border border-dashed border-brand/40 bg-brand/5 rounded-xl p-3 flex items-center cursor-pointer hover:border-brand hover:bg-brand/10 transition-all group"
      >
        <div className="flex items-center gap-3 min-w-0 w-full">
          <div className="w-10 h-10 rounded-lg bg-white border border-dashed border-brand/30 flex items-center justify-center shrink-0 text-brand group-hover:scale-105 transition-transform shadow-sm">
            <UploadCloud size={18} />
          </div>
          <div className="min-w-0 flex flex-col">
            <span className="text-sm font-bold text-brand truncate">点击上传{typeLabel}</span>
            <span className="text-[11px] text-brand/60 mt-0.5 font-medium">支持 PDF / Excel</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3 flex items-center justify-between group hover:border-brand/30 hover:shadow-sm transition-all relative">
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${typeLabel === '招标文件' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
          {icon}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-gray-900 truncate" title={file.name}>{file.name}</span>
            {typeLabel === '招标文件' && <CheckCircle2 size={14} className="text-green-500 shrink-0" />}
          </div>
          <div className="text-[11px] text-gray-500 mt-0.5 font-medium">
            {typeLabel} • {formatSize(file.size)}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
        <button className="p-1.5 text-gray-400 hover:text-brand hover:bg-brand/10 rounded-md transition-colors" title="下载"><Download size={14}/></button>
        <button 
          className="p-1.5 text-gray-400 hover:text-brand hover:bg-brand/10 rounded-md transition-colors" 
          title="替换"
          onClick={onUpload}
        >
          <RefreshCw size={14}/>
        </button>
        {onDelete && (
          <button 
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors" 
            title="删除"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 size={14}/>
          </button>
        )}
      </div>
    </div>
  );
};

export const ProjectDetail: React.FC<ProjectDetailProps> = ({ project, onBack }) => {
  // Initialize versions state from props
  const [versions, setVersions] = useState<ProposalVersion[]>(project.versions || [
    {
      id: 'v4',
      name: '投标文件-最终版',
      remark: '最终确认版本，准备递交',
      referenceDocName: '招标文件 V1.0 + 答疑 01',
      uploadTime: new Date('2026-03-01T10:00:00'),
      files: [
        { id: 'fv4_1', name: '投标函.pdf', size: 540000, uploadTime: new Date('2026-03-01T10:00:00'), categories: ['资信标'] },
        { id: 'fv4_2', name: '投标保证金.pdf', size: 1200000, uploadTime: new Date('2026-03-01T10:00:00'), categories: ['资信标'] },
        { id: 'fv4_3', name: '资格审查材料.pdf', size: 9200000, uploadTime: new Date('2026-03-01T10:00:00'), categories: ['资信标'] },
        { id: 'fv4_4', name: '施工组织设计.pdf', size: 45000000, uploadTime: new Date('2026-03-01T10:00:00'), categories: ['技术标'] },
        { id: 'fv4_5', name: '工程量清单报价表.xlsx', size: 2200000, uploadTime: new Date('2026-03-01T10:00:00'), categories: ['经济标'] },
      ],
      checkStatus: {
        credit: { status: 'pending', issueCount: 0 },
        technical: { status: 'pending', issueCount: 0 },
        economic: { status: 'pending', issueCount: 0 },
      }
    },
    {
      id: 'v3',
      name: '投标文件-修订版2',
      remark: '针对技术标响应点进行了优化',
      referenceDocName: '招标文件 V1.0',
      uploadTime: new Date('2026-02-20T15:30:00'),
      files: [
        { id: 'fv3_1', name: '投标函_v3.pdf', size: 5300000, uploadTime: new Date('2026-02-20T15:30:00'), categories: ['资信标'] },
        { id: 'fv3_2', name: '技术内容_v3.pdf', size: 8900000, uploadTime: new Date('2026-02-20T15:30:00'), categories: ['技术标'] },
        { id: 'fv3_3', name: '报价文件_v3.xlsx', size: 2150000, uploadTime: new Date('2026-02-20T15:30:00'), categories: ['经济标'] },
      ],
      checkStatus: {
        credit: { status: 'success', issueCount: 0 },
        technical: { status: 'processing', issueCount: 0 },
        economic: { status: 'pending', issueCount: 0 },
      }
    },
    {
      id: 'v2',
      name: '投标文件-修订版1',
      remark: '补充了部分业绩证明材料',
      referenceDocName: '招标文件 V1.0',
      uploadTime: new Date('2026-02-10T09:15:00'),
      files: [
        { id: 'fv2_1', name: '资信标_v2.pdf', size: 5250000, uploadTime: new Date('2026-02-10T09:15:00') },
        { id: 'fv2_2', name: '技术标_v2.pdf', size: 8800000, uploadTime: new Date('2026-02-10T09:15:00') },
        { id: 'fv2_3', name: '经济标_v2.xlsx', size: 2100000, uploadTime: new Date('2026-02-10T09:15:00') },
      ],
      checkStatus: {
        credit: { status: 'success', issueCount: 0 },
        technical: { status: 'warning', issueCount: 5 },
        economic: { status: 'success', issueCount: 0 },
      }
    },
    {
      id: 'v1',
      name: '投标文件-初始版',
      remark: '第一次编写的版本',
      referenceDocName: '招标文件 V1.0',
      uploadTime: new Date('2026-02-03T14:20:00'),
      files: [
        { id: 'fv1_1', name: '资信标.pdf', size: 5200000, uploadTime: new Date('2026-02-03T14:20:00') },
        { id: 'fv1_2', name: '技术标.pdf', size: 8700000, uploadTime: new Date('2026-02-03T14:20:00') },
        { id: 'fv1_3', name: '经济标.xlsx', size: 2100000, uploadTime: new Date('2026-02-03T14:20:00') },
      ],
      checkStatus: {
        credit: { status: 'success', issueCount: 0 },
        technical: { status: 'warning', issueCount: 2 },
        economic: { status: 'pending', issueCount: 0 },
      }
    }
  ]);
  
  const [expandedVersions, setExpandedVersions] = useState<string[]>([]);
  const [isAddVersionModalOpen, setIsAddVersionModalOpen] = useState(false);
  const [showTempModal, setShowTempModal] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [unifiedCheckModalVersions, setUnifiedCheckModalVersions] = useState<ProposalVersion[]>([]);
  const [initialCheckType, setInitialCheckType] = useState<'credit' | 'technical' | 'economic' | null>(null);
  const navigate = useNavigate();
  const { updateProject } = useStore();
  const controlFileInputRef = useRef<HTMLInputElement>(null);
  const tenderFileInputRef = useRef<HTMLInputElement>(null);

  // Mock Data Injection if not present
  const tenderFile = project.tenderFile || {
    id: 'f1', name: 'XX市政道路改造工程招标文件.pdf', size: 12500000, uploadTime: new Date('2026-02-03T10:35:00')
  };

  const handleControlFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const newFile: ProjectFile = {
        id: `f_control_${Date.now()}`,
        name: file.name,
        size: file.size,
        uploadTime: new Date()
      };
      updateProject(project.id, { controlFile: newFile });
    }
  };

  const handleTenderFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const newFile: ProjectFile = {
        id: `f_tender_${Date.now()}`,
        name: file.name,
        size: file.size,
        uploadTime: new Date()
      };
      updateProject(project.id, { tenderFile: newFile });
    }
  };

  const handleToggleFileCategory = (versionId: string, fileId: string, category: string) => {
    setVersions(prev => prev.map(v => {
      if (v.id !== versionId) return v;
      return {
        ...v,
        files: v.files.map(f => {
          if (f.id !== fileId) return f;
          const currentCats = f.categories || [];
          const newCats = currentCats.includes(category)
            ? currentCats.filter(c => c !== category)
            : [...currentCats, category];
          return { ...f, categories: newCats };
        })
      };
    }));
  };

  const toggleVersion = (id: string) => {
    setExpandedVersions(prev => 
      prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]
    );
  };

  const handleImportVersions = (versionName: string, remark: string, referenceDocName: string, fileData: FileUploadData[]) => {
    // 1. Generate Name
    let finalName = versionName;
    let counter = 1;
    while (versions.some(v => v.name === finalName)) {
      finalName = `${versionName}-${counter}`;
      counter++;
    }

    // 2. Create File Objects
    const newFiles: ProjectFile[] = fileData.map(fd => ({
      id: `f_${Date.now()}_${Math.random()}`,
      name: fd.file.name,
      size: fd.file.size,
      categories: fd.categories,
      uploadTime: new Date()
    }));

    // 3. Create Version Object
    const newVersion: ProposalVersion = {
      id: `v_${Date.now()}_${Math.random()}`,
      name: finalName,
      remark: remark,
      referenceDocName: referenceDocName,
      uploadTime: new Date(),
      files: newFiles,
      checkStatus: {
        credit: { status: 'pending', issueCount: 0 },
        technical: { status: 'pending', issueCount: 0 },
        economic: { status: 'pending', issueCount: 0 },
      }
    };

    setVersions(prev => [newVersion, ...prev]); // Add new version to top
    setExpandedVersions(prev => [newVersion.id, ...prev]); // Auto expand new one
    setIsAddVersionModalOpen(false);
  };

  const handleDeleteVersion = (id: string) => {
    if (confirm('确定要删除这个版本吗？此操作不可恢复。')) {
      setVersions(prev => prev.filter(v => v.id !== id));
      setActiveMenuId(null);
    }
  };

  const handleEditRemark = (id: string, currentRemark?: string) => {
    const newRemark = prompt('请输入新的备注：', currentRemark || '');
    if (newRemark !== null) {
      setVersions(prev => prev.map(v => v.id === id ? { ...v, remark: newRemark } : v));
    }
    setActiveMenuId(null);
  };

  const getDaysRemaining = (deadline?: Date) => {
    if (!deadline) return null;
    const diff = deadline.getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 3600 * 24));
    return days;
  };

  const daysRemaining = getDaysRemaining(project.deadline);
  const isUrgent = daysRemaining !== null && daysRemaining <= 3 && daysRemaining >= 0;

  // Status Badge Helper
  const getStatusBadge = (status: ProjectStatus) => {
    const styles = {
      [ProjectStatus.CREATED]: 'bg-gray-100 text-gray-600',
      [ProjectStatus.IN_PROGRESS]: 'bg-blue-50 text-brand border border-blue-100',
      [ProjectStatus.CHECKING]: 'bg-orange-50 text-orange-600 border border-orange-100',
      [ProjectStatus.SUBMITTED]: 'bg-green-50 text-green-600 border border-green-100',
      [ProjectStatus.OPENED]: 'bg-purple-50 text-purple-600',
      [ProjectStatus.WON]: 'bg-red-50 text-red-600 font-bold',
      [ProjectStatus.LOST]: 'bg-gray-100 text-gray-400',
    };
    return (
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${styles[status]}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="flex flex-col h-full w-full space-y-4">
      {/* Top Banner */}
      <PageHeader
        title={project.name}
        onBack={onBack}
        description={
          <div className="flex items-center gap-4 text-sm text-gray-600 font-medium">
            {getStatusBadge(project.status)}
            <div className="flex items-center gap-1.5">
              <User size={14} className="text-gray-400"/> 
              负责人: <span className="text-gray-900">{project.manager || '未指定'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Briefcase size={14} className="text-gray-400"/> 
              项目编号: <span className="text-gray-900">{project.id.toUpperCase()}</span>
            </div>
          </div>
        }
        actions={
          <Button variant="outline" size="sm" className="gap-2 bg-white shadow-sm">
            <Edit2 size={14} /> 编辑项目信息
          </Button>
        }
        className="px-0 py-2 shrink-0"
      />

      {/* Basic Info Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden h-[214px] shrink-0">
        {/* Content Split */}
        <div className="flex flex-col md:flex-row h-full">
          {/* Left: Basic Info Grid */}
          <div className="flex-1 p-5 grid grid-cols-2 gap-x-8 gap-y-5">
            <InfoField label="招标人" icon={<Building2 size={14} />}>{project.tenderer || '-'}</InfoField>
            <InfoField label="项目类型" icon={<Briefcase size={14} />}>{project.type}</InfoField>
            <InfoField label="联系人" icon={<User size={14} />}>{project.contactPerson || '-'}</InfoField>
            <InfoField label="联系方式" icon={<Phone size={14} />}>{project.contactPhone || '-'}</InfoField>
            <InfoField label="投标截止" icon={<Clock size={14} />}>
              <div className={`flex items-center gap-2 ${isUrgent ? 'text-red-600 font-bold' : 'text-gray-900'}`}>
                {formatDate(project.deadline)}
                {daysRemaining !== null && daysRemaining >= 0 && (
                  <span className={`text-xs px-2 py-0.5 rounded-md font-bold ${isUrgent ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                    剩 {daysRemaining} 天
                  </span>
                )}
              </div>
            </InfoField>
            <InfoField label="开标时间" icon={<Calendar size={14} />}>
              <div className="text-gray-900">
                {formatDate(project.openingDate)}
              </div>
            </InfoField>
          </div>

          {/* Right: Files Panel */}
          <div className="w-full md:w-80 bg-gray-50/50 border-l border-gray-100 p-5 flex flex-col">
            <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Folder size={16} className="text-brand"/> 
              招标相关文件
            </h3>
            <div className="space-y-2.5 flex-1">
              <input 
                type="file" 
                ref={tenderFileInputRef} 
                className="hidden" 
                onChange={handleTenderFileUpload}
                accept=".pdf,.doc,.docx,.xls,.xlsx"
              />
              <input 
                type="file" 
                ref={controlFileInputRef} 
                className="hidden" 
                onChange={handleControlFileUpload}
                accept=".pdf,.doc,.docx,.xls,.xlsx"
              />
              <TenderFileCard 
                file={tenderFile} 
                typeLabel="招标文件" 
                icon={<FileText size={20} />} 
                onUpload={() => tenderFileInputRef.current?.click()}
              />
              <TenderFileCard 
                file={project.controlFile} 
                typeLabel="控制价文件" 
                icon={<FileText size={20} />} 
                onUpload={() => controlFileInputRef.current?.click()}
                onDelete={() => updateProject(project.id, { controlFile: undefined })}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. File Management */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 shrink-0">
        <div className="flex items-center justify-between mb-4">
           <h2 className="text-lg font-bold text-text-primary">投标文件版本</h2>
           <div className="flex gap-2">
             <Button 
               size="sm" 
               variant="outline" 
               className="h-8 gap-1"
               onClick={() => setIsAddVersionModalOpen(true)}
             >
               <Plus size={14} /> 添加版本
             </Button>
             <Button 
               size="sm" 
               variant="outline" 
               className="h-8 gap-1 text-gray-500 border-gray-200"
               onClick={() => setShowTempModal(true)}
             >
               临时按钮
             </Button>
             <Button 
               size="sm" 
               variant="primary" 
               className="h-8 gap-1"
               onClick={() => {
                 setUnifiedCheckModalVersions(versions);
                 setInitialCheckType('credit');
               }}
             >
               <CheckCircle size={14} /> 全部检查
             </Button>
           </div>
        </div>
          
          <div className="space-y-3">
            {versions.length === 0 && (
              <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                <p className="text-sm text-text-tertiary">暂无投标文件版本</p>
                <p className="text-xs text-gray-400 mt-1">可以添加多个版本用于对比分析或保存历史记录</p>
              </div>
            )}
            
            {versions.map((version) => {
              const isExpanded = expandedVersions.includes(version.id);
              
              // Helper to render individual check status (matching homepage style)
              const renderCheckBadge = (label: string, status: CheckStatus) => {
                const icons = {
                  success: <CheckCircle size={14} className="text-functional-success" />,
                  warning: <AlertTriangle size={14} className="text-functional-warning" />,
                  processing: <Loader2 size={14} className="text-brand animate-spin" />,
                  pending: <div className="w-3.5 h-3.5 rounded-full border border-gray-300" />
                };

                const isChecked = status.status === 'success' || status.status === 'warning';
                const isProcessing = status.status === 'processing';
                const buttonText = isChecked ? '查看' : (isProcessing ? '进行中' : '检查');
                
                return (
                  <div 
                    className="flex items-center justify-center min-w-[64px] h-7 px-2 rounded-md transition-all hover:bg-brand hover:text-white group cursor-pointer border border-gray-200 bg-white" 
                    title={`${label}: ${status.status}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (label === '技术' && status.status === 'pending') {
                        setUnifiedCheckModalVersions([version]);
                        setInitialCheckType('technical');
                      } else if (label === '技术' && (status.status === 'success' || status.status === 'warning')) {
                        navigate(`/projects/${project.id}/check-result?type=technical`);
                      } else if (label === '资信' && status.status === 'pending') {
                        setUnifiedCheckModalVersions([version]);
                        setInitialCheckType('credit');
                      } else if (label === '资信' && (status.status === 'success' || status.status === 'warning')) {
                        navigate(`/projects/${project.id}/check-result?type=credit`);
                      } else if (label === '经济' && status.status === 'pending') {
                        setUnifiedCheckModalVersions([version]);
                        setInitialCheckType('economic');
                      } else if (label === '经济' && (status.status === 'success' || status.status === 'warning')) {
                        navigate(`/projects/${project.id}/check-result?type=economic`);
                      } else {
                        console.log(`Action: ${buttonText} for ${label}`);
                      }
                    }}
                  >
                    {/* Normal State */}
                    <div className="flex items-center gap-1.5 group-hover:hidden">
                      {icons[status.status]}
                      <span className="text-xs text-text-tertiary">{label}</span>
                    </div>
                    
                    {/* Hover State */}
                    <div className="hidden group-hover:flex items-center gap-1">
                      <span className="text-[11px] font-bold">{buttonText}</span>
                    </div>
                  </div>
                );
              };

              return (
                <div key={version.id} className="border border-blue-100 rounded-lg transition-all duration-300 bg-white">
                  {/* Header Row */}
                  <div 
                    className={`bg-blue-50/40 px-4 py-3 flex items-center gap-4 justify-between cursor-pointer hover:bg-blue-50/80 transition-colors rounded-t-lg ${!isExpanded ? 'rounded-b-lg' : 'border-b border-blue-100'}`}
                    onClick={() => toggleVersion(version.id)}
                  >

                    {/* Group 1: Name + Remark + Date */}
                    <div className="flex-1 flex flex-col min-w-0 pr-4 gap-1">
                       <span className="text-sm font-bold text-gray-900 truncate">{version.name}</span>
                       <div className="flex items-center text-xs text-gray-500">
                         <span className="font-mono text-gray-400 shrink-0">{formatDate(version.uploadTime)}</span>
                         {version.remark && (
                           <>
                             <span className="w-px h-3 bg-gray-300 mx-2 shrink-0"></span>
                             <span className="truncate max-w-[300px]">{version.remark}</span>
                           </>
                         )}
                       </div>
                    </div>

                    {/* Group: Reference Doc Info */}
                    <div className="flex flex-col items-start justify-center w-48 px-4 border-l border-gray-100 shrink-0">
                       <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">检查依据</span>
                       <span className="text-[11px] font-semibold text-gray-600 truncate w-full" title={version.referenceDocName}>
                         {version.referenceDocName || '招标文件 V1.0'}
                       </span>
                    </div>

                    {/* Group 2: Status Summary */}
                    <div className="flex items-center gap-2 text-xs shrink-0">
                         {renderCheckBadge('资信', version.checkStatus.credit)}
                         {renderCheckBadge('技术', version.checkStatus.technical)}
                         {renderCheckBadge('经济', version.checkStatus.economic)}
                    </div>

                    {/* Group 3: Action Buttons */}
                    <div className="flex items-center gap-2 shrink-0 ml-4">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-7 px-3 text-[11px] text-brand border-brand hover:bg-brand/5 bg-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          setUnifiedCheckModalVersions([version]);
                          setInitialCheckType('credit');
                        }}
                      >
                        开始检查
                      </Button>
                      
                      <div className="relative">
                          <button 
                            className="h-7 w-7 flex items-center justify-center rounded-md bg-blue-100/50 text-blue-600 hover:bg-blue-100 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(activeMenuId === version.id ? null : version.id);
                            }}
                          >
                            <MoreHorizontal size={14}/>
                          </button>
                          {activeMenuId === version.id && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setActiveMenuId(null); }} />
                              <div className="absolute right-0 mt-1 w-32 bg-white rounded-md shadow-lg border border-gray-100 z-20 py-1">
                                <button 
                                  className="w-full text-left px-4 py-2 text-xs text-gray-600 hover:bg-gray-50 hover:text-brand transition-colors"
                                  onClick={(e) => { e.stopPropagation(); handleEditRemark(version.id, version.remark); }}
                                >
                                  修改备注
                                </button>
                                <button 
                                  className="w-full text-left px-4 py-2 text-xs text-red-500 hover:bg-red-50 transition-colors"
                                  onClick={(e) => { e.stopPropagation(); handleDeleteVersion(version.id); }}
                                >
                                  删除版本
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                        <button className="p-1 hover:bg-blue-100 rounded-md text-gray-400 hover:text-gray-600 transition-colors ml-1">
                          {isExpanded ? <ChevronDown size={16}/> : <ChevronRight size={16}/>}
                        </button>
                      </div>
                    </div>

                    {/* Body */}
                    {isExpanded && (
                    <div className="bg-white animate-in slide-in-from-top-2 duration-200 rounded-b-lg overflow-hidden">
                      <div className="mb-0">
                        {version.files.length > 0 ? (
                          <div className="divide-y divide-gray-100 border-y border-gray-100">
                            {/* File Table Header */}
                            <div className="grid grid-cols-[1fr_80px_200px_150px_80px] gap-4 items-center px-[44px] py-1.5 bg-gray-50/50 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                              <span>文件名称</span>
                              <span>大小</span>
                              <span>所属分类 (可多选)</span>
                              <span>上传时间</span>
                              <span className="text-right">操作</span>
                            </div>

                            {version.files.map((file) => (
                              <div key={file.id} className="flex items-center justify-between px-4 py-2 bg-white group hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                  <FileText size={14} className="text-text-tertiary shrink-0" />
                                  <div className="grid grid-cols-[1fr_80px_200px_150px] gap-4 items-center flex-1 min-w-0">
                                    <span className="text-sm font-regular text-text-primary truncate" title={file.name}>{file.name}</span>
                                    <span className="text-xs text-text-tertiary">{formatSize(file.size)}</span>
                                    
                                    {/* Category Multi-select */}
                                    <div className="flex items-center gap-1.5">
                                      {['资信标', '技术标', '经济标'].map(cat => (
                                        <button 
                                          key={cat}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleToggleFileCategory(version.id, file.id, cat);
                                          }}
                                          className={cn(
                                            "px-2 py-0.5 rounded text-[10px] font-bold border transition-all",
                                            file.categories?.includes(cat)
                                              ? "bg-brand/10 border-brand/20 text-brand"
                                              : "bg-gray-50 border-gray-100 text-gray-400 hover:border-gray-300 hover:text-gray-600"
                                          )}
                                        >
                                          {cat}
                                        </button>
                                      ))}
                                    </div>

                                    <span className="text-xs text-gray-400 hidden sm:inline-block">{formatDate(file.uploadTime)}</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-4 shrink-0">
                                  <button className="p-1 text-gray-400 hover:text-brand hover:bg-white rounded transition-colors" title="预览">
                                    <Eye size={14} />
                                  </button>
                                  <button className="p-1 text-gray-400 hover:text-red-500 hover:bg-white rounded transition-colors" title="删除">
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-6 text-gray-400 text-sm border-y border-gray-100 bg-gray-50/30">
                            该版本暂无文件
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      <div className="h-10"></div>
      
      {/* Modals */}
      <AddVersionModal 
        isOpen={isAddVersionModalOpen}
        onClose={() => setIsAddVersionModalOpen(false)}
        onImport={handleImportVersions}
        suggestedVersionName={`V${(project?.versions?.length || 0) + 1}.0`}
      />
      <UnifiedCheckConfirmModal
        isOpen={unifiedCheckModalVersions.length > 0}
        onClose={() => setUnifiedCheckModalVersions([])}
        project={project}
        versions={unifiedCheckModalVersions}
        initialCheckType={initialCheckType}
        onConfirm={(selectedFileIds, checkTypes) => {
          setUnifiedCheckModalVersions([]);
          
          if (selectedFileIds.length > 0 && checkTypes.length > 0) {
            navigate(`/projects/${project.id}/check-progress?type=${checkTypes[0]}&stage=parsing`);
          }
        }}
      />

      {/* Temporary Modal */}
      {showTempModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowTempModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 overflow-hidden text-center">
            <div className="w-16 h-16 bg-brand/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader2 size={32} className="text-brand animate-spin" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">功能开发中</h3>
            <p className="text-sm text-gray-500 mb-8 leading-relaxed">
              添加版本功能正在全力开发中，敬请期待后续更新。
            </p>
            <Button 
              variant="primary" 
              className="w-full" 
              onClick={() => setShowTempModal(false)}
            >
              我知道了
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
