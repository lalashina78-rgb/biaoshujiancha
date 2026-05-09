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
  <div className="flex flex-col gap-1.5">
    <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
      {icon}
      {label}
    </div>
    <div className="text-sm font-semibold text-gray-700">{children}</div>
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
        className="border border-dashed border-blue-200 bg-blue-50/30 rounded-xl p-4 flex items-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all group"
      >
        <div className="flex items-center gap-4 min-w-0 w-full">
          <div className="w-12 h-12 rounded-xl bg-white border border-dashed border-blue-200 flex items-center justify-center shrink-0 text-blue-500 group-hover:scale-105 transition-transform shadow-sm">
            <UploadCloud size={20} />
          </div>
          <div className="min-w-0 flex flex-col">
            <span className="text-[13px] font-bold text-blue-600 truncate">点击上传{typeLabel}</span>
            <span className="text-[11px] text-blue-400 mt-1 font-medium">支持 PDF / Excel</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 flex items-center justify-between group hover:border-blue-200 hover:shadow-sm transition-all relative">
      <div className="flex items-center gap-4 min-w-0">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${typeLabel === '招标文件' ? 'bg-blue-50 text-blue-500' : 'bg-emerald-50 text-emerald-500'}`}>
          {icon}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-bold text-gray-800 truncate" title={file.name}>{file.name}</span>
            {typeLabel === '招标文件' && <CheckCircle2 size={14} className="text-green-500 shrink-0" />}
          </div>
          <div className="text-[11px] text-gray-400 mt-1 font-medium">
            {typeLabel} • {formatSize(file.size)}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
        <button className="p-2 text-gray-400 hover:text-brand hover:bg-brand/5 rounded-lg transition-colors" title="下载"><Download size={16}/></button>
        {onDelete && (
          <button 
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" 
            title="删除"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 size={16}/></button>
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
  const manifestFileInputRef = useRef<HTMLInputElement>(null);

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

  const handleManifestFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const newFile: ProjectFile = {
        id: `f_manifest_${Date.now()}`,
        name: file.name,
        size: file.size,
        uploadTime: new Date()
      };
      updateProject(project.id, { manifestFile: newFile });
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

  return (
    <div className="flex flex-col h-full w-full space-y-6">
      {/* Top Banner */}
      <PageHeader
        title={project.name}
        onBack={onBack}
        description={
          <div className="flex items-center gap-4 text-xs mt-1">
            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[11px] font-bold border border-blue-100">
              标书制作中
            </span>
            <div className="flex items-center gap-1.5 text-gray-500">
              <User size={14} className="text-gray-300"/> 
              负责人: <span className="text-gray-700 font-medium">{project.manager || '张建国'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-500">
              <File size={14} className="text-gray-300"/> 
              项目编号: <span className="text-gray-700 font-medium font-mono uppercase">{project.id.toUpperCase()}</span>
            </div>
          </div>
        }
        actions={
          <Button variant="outline" size="sm" className="gap-2 bg-white border-gray-200 text-gray-600 rounded-lg shadow-sm px-4">
            <Edit2 size={14} /> 编辑项目信息
          </Button>
        }
        className="px-0 py-2 shrink-0"
      />

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Column: Info + Versions */}
        <div className="flex-1 space-y-6">
          {/* Basic Info Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              <InfoField label="招标人" icon={<Building2 size={14} />}>{project.tenderer || '上海浦东开发集团'}</InfoField>
              <InfoField label="项目类型" icon={<Briefcase size={14} />}>{project.type || '工程类'}</InfoField>
              <InfoField label="联系人" icon={<User size={14} />}>{project.contactPerson || '王经理'}</InfoField>
              <InfoField label="联系方式" icon={<Phone size={14} />}>{project.contactPhone || '13800138000'}</InfoField>
              <InfoField label="投标截止" icon={<Clock size={14} />}>
                <div className="flex items-center gap-3">
                  <span className="text-red-500 font-bold">{formatDate(project.deadline)}</span>
                  {daysRemaining !== null && daysRemaining >= 0 && (
                    <span className="px-2 py-0.5 bg-red-50 text-red-500 rounded text-[11px] font-bold border border-red-100">
                      剩 {daysRemaining} 天
                    </span>
                  )}
                </div>
              </InfoField>
              <InfoField label="开标时间" icon={<Calendar size={14} />}>
                <div className="text-gray-700 font-semibold">
                  {formatDate(project.openingDate)}
                </div>
              </InfoField>
            </div>
          </div>

          {/* 2. File Management Area (Versions) - Now inside left col */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 flex items-center justify-between border-b border-gray-50 bg-gray-50/10">
               <h2 className="text-lg font-bold text-gray-800">投标文件版本</h2>
               <div className="flex gap-3">
                 <Button 
                   size="sm" 
                   variant="outline" 
                   className="h-9 px-4 gap-2 border-gray-200 text-gray-600 rounded-lg hover:border-blue-200 hover:text-blue-600 transition-all font-bold"
                   onClick={() => setIsAddVersionModalOpen(true)}
                 >
                   <Plus size={16} /> 添加版本
                 </Button>
                 <Button 
                   size="sm" 
                   variant="outline" 
                   className="h-9 px-4 gap-2 border-gray-200 text-gray-600 rounded-lg font-bold"
                   onClick={() => setShowTempModal(true)}
                 >
                   临时按钮
                 </Button>
                 <Button 
                   size="sm" 
                   className="h-9 px-4 gap-2 bg-blue-600 hover:bg-blue-700 text-white border-0 rounded-lg shadow-sm font-bold"
                   onClick={() => {
                     setUnifiedCheckModalVersions(versions);
                     setInitialCheckType('credit');
                   }}
                 >
                   <CheckCircle2 size={16} /> 全部检查
                 </Button>
               </div>
            </div>
              
            <div className="p-6">
              <div className="space-y-4">
                {versions.length === 0 && (
                  <div className="text-center py-16 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                    <p className="text-sm text-gray-400">暂无投标文件版本</p>
                    <button 
                      onClick={() => setIsAddVersionModalOpen(true)}
                      className="mt-4 text-xs font-bold text-blue-600 hover:underline"
                    >
                      立即上传第一个版本
                    </button>
                  </div>
                )}
                
                {versions.map((version) => {
                  const isExpanded = expandedVersions.includes(version.id);
                  
                  // Clean Badge style matching image
                  const renderCheckBadge = (label: string, status: CheckStatus) => {
                    const badgeStyle = {
                      success: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-100', icon: <CheckCircle2 size={14} className="text-green-500" /> },
                      warning: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100', icon: <AlertCircle size={14} className="text-orange-500" /> },
                      processing: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100', icon: <Loader2 size={14} className="text-blue-500 animate-spin" /> },
                      pending: { bg: 'bg-gray-50', text: 'text-gray-400', border: 'border-gray-100', icon: <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-200" /> }
                    }[status.status];

                    return (
                      <div 
                        key={label}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (label === '技术') navigate(`/projects/${project.id}/check-result?type=technical`);
                          else if (label === '资信') navigate(`/projects/${project.id}/check-result?type=credit`);
                          else if (label === '经济') navigate(`/projects/${project.id}/check-result?type=economic`);
                        }}
                        className={cn(
                          "flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all cursor-pointer hover:shadow-md active:scale-95",
                          badgeStyle.bg, badgeStyle.text, badgeStyle.border
                        )}
                      >
                        {badgeStyle.icon}
                        <span className="text-[11px] font-bold tracking-wide">{label}</span>
                      </div>
                    );
                  };

                  return (
                    <div key={version.id} className="group">
                      <div 
                        className={cn(
                          "flex flex-col md:flex-row md:items-center gap-4 md:gap-6 px-6 py-5 rounded-2xl border transition-all cursor-pointer",
                          isExpanded ? "border-blue-200 bg-blue-50/5 shadow-sm" : "border-gray-50 bg-gray-50/30 hover:bg-white hover:border-gray-200 hover:shadow-sm"
                        )}
                        onClick={() => toggleVersion(version.id)}
                      >
                        {/* Version Main Info */}
                        <div className="flex-1 min-w-0 md:pr-4">
                          <h4 className="text-[15px] font-bold text-gray-800 mb-1.5 flex items-center gap-2">
                            {version.name}
                            {version.id === 'v4' && <span className="px-1.5 py-0.5 bg-brand/10 text-brand text-[10px] rounded">最新</span>}
                          </h4>
                          <div className="flex items-center gap-3 text-xs text-gray-400 font-medium">
                            <span className="font-mono">{formatDate(version.uploadTime)}</span>
                            {version.remark && (
                              <>
                                <span className="w-1 h-1 rounded-full bg-gray-200"></span>
                                <span className="truncate">{version.remark}</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Reference Info */}
                        <div className="hidden md:block w-48 px-6 border-l border-gray-100 shrink-0">
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">检查依据</span>
                          <span className="text-[12px] font-bold text-gray-500 truncate block">
                            {version.referenceDocName || '招标文件 V1.0'}
                          </span>
                        </div>

                        {/* Status Badges */}
                        <div className="flex items-center gap-2 md:gap-3 shrink-0">
                          {renderCheckBadge('资信', version.checkStatus.credit)}
                          {renderCheckBadge('技术', version.checkStatus.technical)}
                          {renderCheckBadge('经济', version.checkStatus.economic)}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3 shrink-0 md:ml-4">
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="h-8 px-4 rounded-lg bg-white border-gray-200 text-gray-700 hover:text-blue-600 hover:border-blue-200 shadow-sm text-xs font-bold transition-all"
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
                              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white hover:shadow-sm text-gray-400 transition-all"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuId(activeMenuId === version.id ? null : version.id);
                              }}
                            >
                              <MoreHorizontal size={18}/>
                            </button>
                            {activeMenuId === version.id && (
                              <>
                                <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setActiveMenuId(null); }} />
                                <div className="absolute right-0 mt-2 w-36 bg-white rounded-xl shadow-xl border border-gray-100 z-20 py-1.5 animate-in fade-in zoom-in-95 duration-100">
                                  <button 
                                    className="w-full text-left px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50 hover:text-brand transition-colors flex items-center gap-2"
                                    onClick={(e) => { e.stopPropagation(); handleEditRemark(version.id, version.remark); }}
                                  >
                                    <Edit2 size={14} /> 修改备注
                                  </button>
                                  <button 
                                    className="w-full text-left px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50 transition-colors flex items-center gap-2"
                                    onClick={(e) => { e.stopPropagation(); handleDeleteVersion(version.id); }}
                                  >
                                    <Trash2 size={14} /> 删除版本
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                          <ChevronRight size={18} className={cn("text-gray-300 transition-transform hidden sm:block", isExpanded && "rotate-90 text-blue-400")} />
                        </div>
                      </div>

                      {/* Expansion Area */}
                      {isExpanded && (
                        <div className="mt-3 mx-2 bg-white rounded-2xl border border-blue-100/50 shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-3 duration-300">
                           <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">文件名称</th>
                                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest w-24">大小</th>
                                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest w-64">所属分类 (可多选)</th>
                                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest w-44">上传时间</th>
                                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right w-24">操作</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-50">
                                {version.files.map((file) => (
                                  <tr key={file.id} className="hover:bg-gray-50/30 transition-colors group/row">
                                    <td className="px-6 py-4">
                                      <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 group-hover/row:bg-blue-50 group-hover/row:text-blue-500 transition-colors">
                                          <FileText size={16} />
                                        </div>
                                        <span className="text-[13px] font-bold text-gray-700">{file.name}</span>
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 text-xs text-gray-500 font-mono">{formatSize(file.size)}</td>
                                    <td className="px-6 py-4">
                                      <div className="flex flex-wrap gap-1.5">
                                        {['资信标', '技术标', '经济标'].map(cat => (
                                          <button 
                                            key={cat}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleToggleFileCategory(version.id, file.id, cat);
                                            }}
                                            className={cn(
                                              "px-2.5 py-1 rounded-md text-[10px] font-bold border transition-all",
                                              file.categories?.includes(cat)
                                                ? "bg-blue-50 border-blue-200 text-blue-600 shadow-sm"
                                                : "bg-white border-gray-100 text-gray-400 hover:border-gray-300"
                                            )}
                                          >
                                            {cat}
                                          </button>
                                        ))}
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 text-xs text-gray-400">{formatDate(file.uploadTime)}</td>
                                    <td className="px-6 py-4 text-right">
                                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover/row:opacity-100 transition-opacity">
                                        <button className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all" title="预览"><Eye size={16} /></button>
                                        <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="下载"><Download size={16} /></button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>

        {/* Right: Files Sidebar */}
        <div className="w-full lg:w-[340px] bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col">
          <h3 className="text-[14px] font-bold text-gray-800 mb-5 flex items-center gap-2">
            <Folder size={18} className="text-blue-500"/> 
            招标相关文件
          </h3>
          <div className="space-y-4">
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
            <input 
              type="file" 
              ref={manifestFileInputRef} 
              className="hidden" 
              onChange={handleManifestFileUpload}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.zip"
            />
            <TenderFileCard 
              file={tenderFile} 
              typeLabel="招标文件" 
              icon={<FileText size={24} />} 
              onUpload={() => tenderFileInputRef.current?.click()}
            />
            <TenderFileCard 
              file={project.controlFile} 
              typeLabel="控制价文件" 
              icon={<FileText size={24} />} 
              onUpload={() => controlFileInputRef.current?.click()}
              onDelete={() => updateProject(project.id, { controlFile: undefined })}
            />
            <TenderFileCard 
              file={project.manifestFile} 
              typeLabel="招标清单文件" 
              icon={<FileText size={24} className="text-orange-500" />} 
              onUpload={() => manifestFileInputRef.current?.click()}
              onDelete={() => updateProject(project.id, { manifestFile: undefined })}
            />
          </div>
        </div>
      </div>

      <div className="h-12"></div>
      
      {/* Modals */}
      <AddVersionModal 
        isOpen={isAddVersionModalOpen}
        onClose={() => setIsAddVersionModalOpen(false)}
        onImport={handleImportVersions}
        suggestedVersionName={`V${(versions.length || 0) + 1}.0`}
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
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowTempModal(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 overflow-hidden text-center animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader2 size={32} className="text-blue-500 animate-spin" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">功能开发中</h3>
            <p className="text-sm text-gray-500 mb-8 leading-relaxed">
              添加版本功能正在全力开发中，敬请期待后续更新。
            </p>
            <Button 
              variant="primary" 
              className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200" 
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
