import React, { useState, useEffect, useMemo } from 'react';
import { X, Info, Zap, FileCheck, SlidersHorizontal, CheckCircle2, CheckSquare, Square } from 'lucide-react';
import { Project, ProposalVersion, ProjectFile } from '../../types';
import { Button } from '../UI/Button';
import { cn } from '../../utils/cn';

const formatSize = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const formatDate = (date?: Date) => {
  if (!date) return '未设置';
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

interface UnifiedCheckConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedFileIds: string[], checkTypes: string[]) => void;
  project: Project | null;
  versions: ProposalVersion[];
  initialCheckType: 'credit' | 'technical' | 'economic' | null;
}

const checkTypeConfig = [
  { id: 'credit', label: '资信标检查', category: '资信标', icon: Zap },
  { id: 'technical', label: '技术标检查', category: '技术标', icon: FileCheck },
  { id: 'economic', label: '经济标检查', category: '经济标', icon: SlidersHorizontal },
];

export const UnifiedCheckConfirmModal: React.FC<UnifiedCheckConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  project,
  versions,
  initialCheckType
}) => {
  const [selectedCheckTypes, setSelectedCheckTypes] = useState<string[]>([]);
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      const initialTypes = initialCheckType ? [initialCheckType] : ['credit'];
      setSelectedCheckTypes(initialTypes);
      
      // Auto-select files matching the initial check type
      const activeCategories = initialTypes.map(t => checkTypeConfig.find(c => c.id === t)?.category).filter(Boolean);
      const fileIdsToSelect = versions.flatMap(v => 
        v.files.filter(f => f.categories?.some(cat => activeCategories.includes(cat))).map(f => f.id)
      );
      setSelectedFileIds(fileIdsToSelect);
    }
  }, [isOpen, initialCheckType, versions]);

  // Flat list of files with version reference
  const allFiles = useMemo(() => {
    return versions.flatMap(v => 
      v.files.map(f => ({
        ...f,
        versionName: v.name
      }))
    );
  }, [versions]);

  if (!isOpen || !project) return null;

  const activeCategories = selectedCheckTypes.map(t => checkTypeConfig.find(c => c.id === t)?.category).filter(Boolean);
  
  // Which files are enabled
  const getIsFileEnabled = (file: ProjectFile) => {
    return file.categories?.some(cat => activeCategories.includes(cat));
  };

  const enabledFileIds = allFiles.filter(getIsFileEnabled).map(f => f.id);
  const isAllChecked = enabledFileIds.length > 0 && enabledFileIds.every(id => selectedFileIds.includes(id));
  const isSomeChecked = enabledFileIds.some(id => selectedFileIds.includes(id));

  const toggleCheckType = (id: string) => {
    const newTypes = selectedCheckTypes.includes(id)
      ? selectedCheckTypes.filter(t => t !== id)
      : [...selectedCheckTypes, id];
    
    setSelectedCheckTypes(newTypes);

    // Auto-update file selection based on new categories
    const newActiveCategories = newTypes.map(t => checkTypeConfig.find(c => c.id === t)?.category).filter(Boolean);
    const newSelectedFiles = allFiles
      .filter(f => f.categories?.some(cat => newActiveCategories.includes(cat)))
      .map(f => f.id);
    
    // We can choose to retain previously selected files or just reset to match current types
    setSelectedFileIds(newSelectedFiles);
  };

  const toggleAllFiles = () => {
    if (isAllChecked) {
      // Uncheck all currently enabled
      setSelectedFileIds(prev => prev.filter(id => !enabledFileIds.includes(id)));
    } else {
      // Check all enabled
      setSelectedFileIds(prev => Array.from(new Set([...prev, ...enabledFileIds])));
    }
  };

  const toggleFile = (id: string) => {
    setSelectedFileIds(prev => 
      prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]
    );
  };

  const handleConfirm = () => {
    onConfirm(selectedFileIds, selectedCheckTypes);
  };

  const getCategoryTheme = (category: string) => {
    if (category === '资信标') return 'text-blue-600 bg-blue-50 border-blue-200';
    if (category === '技术标') return 'text-orange-600 bg-orange-50 border-orange-200';
    if (category === '经济标') return 'text-purple-600 bg-purple-50 border-purple-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-5xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 shrink-0">
          <h2 className="text-xl font-bold text-gray-900">确认检查文件</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-white">
          
          {/* Info Alert */}
          <div className="bg-indigo-50 border border-indigo-100 text-indigo-700 px-4 py-3 rounded-xl flex items-center text-sm font-medium">
            <Info size={18} className="mr-2 shrink-0" />
            系统将依据以下文件版本进行检查，请确认无误后开始。
          </div>

          {/* Project Info Card */}
          <div>
            <h3 className="text-base font-bold text-gray-900 mb-4">项目信息</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 rounded-xl border border-gray-200 p-6">
              <div className="flex flex-col gap-2">
                <span className="text-sm text-gray-400">项目名称:</span>
                <span className="text-base text-gray-900 break-words leading-snug">{project.name}</span>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-sm text-gray-400">招标编号:</span>
                <span className="text-base text-gray-900">{project.id.toUpperCase()}</span>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-sm text-gray-400">招标人/采购人:</span>
                <span className="text-base text-gray-900">{project.tenderer || 'XXX建设局'}</span>
              </div>
            </div>
          </div>

          {/* Check Scope */}
          <div>
            <h3 className="text-base font-bold text-gray-900 mb-4">检查范围</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {checkTypeConfig.map(({ id, label, icon: Icon }) => {
                const isSelected = selectedCheckTypes.includes(id);
                return (
                  <button
                    key={id}
                    onClick={() => toggleCheckType(id)}
                    className={cn(
                      "relative p-6 rounded-2xl border-2 text-left transition-all overflow-hidden group flex flex-col gap-4",
                      isSelected 
                        ? "border-indigo-600 bg-indigo-50/50" 
                        : "border-gray-200 bg-white hover:border-gray-300"
                    )}
                  >
                    <Icon 
                      size={28} 
                      className={cn(
                        "transition-colors",
                        isSelected ? "text-indigo-600" : "text-gray-400 group-hover:text-gray-600"
                      )} 
                    />
                    <span className={cn(
                      "font-bold text-base",
                      isSelected ? "text-indigo-900" : "text-gray-700"
                    )}>
                      {label}
                    </span>

                    {isSelected && (
                      <div className="absolute top-4 right-4 text-indigo-600">
                        <CheckCircle2 size={24} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Files List */}
          <div>
            <h3 className="text-base font-bold text-gray-900 mb-4">本次检查文件</h3>
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-[60px_2.5fr_1fr_1fr_1fr] bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-500 py-3">
                <div className="flex justify-center items-center">
                  <button 
                    onClick={toggleAllFiles}
                    disabled={enabledFileIds.length === 0}
                    className="text-gray-400 hover:text-indigo-600 disabled:opacity-50"
                  >
                    {isAllChecked ? (
                      <CheckSquare size={18} className="text-indigo-600 fill-indigo-50" />
                    ) : (
                      <Square size={18} />
                    )}
                  </button>
                </div>
                <div className="px-2">文件名</div>
                <div className="px-2">类型</div>
                <div className="px-2">大小</div>
                <div className="px-2">上传时间</div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-gray-100">
                {allFiles.length > 0 ? (
                  allFiles.map((file) => {
                    const isEnabled = getIsFileEnabled(file);
                    const isChecked = selectedFileIds.includes(file.id);
                    
                    return (
                      <div 
                        key={file.id} 
                        className={cn(
                          "grid grid-cols-[60px_2.5fr_1fr_1fr_1fr] py-4 items-center transition-colors",
                          !isEnabled ? "opacity-40 bg-gray-50/50" : "hover:bg-gray-50"
                        )}
                      >
                        <div className="flex justify-center items-center">
                          <button 
                            onClick={() => isEnabled && toggleFile(file.id)}
                            disabled={!isEnabled}
                            className={cn(
                              "text-gray-400 transition-colors",
                              isEnabled ? "hover:text-indigo-600" : "cursor-not-allowed"
                            )}
                          >
                            {isChecked ? (
                              <CheckSquare size={18} className="text-indigo-600 fill-indigo-50" />
                            ) : (
                              <Square size={18} />
                            )}
                          </button>
                        </div>
                        <div className="px-2 font-medium text-gray-900 truncate pr-4">
                          {file.name}
                        </div>
                        <div className="px-2 flex flex-wrap gap-2">
                          {file.categories?.map(cat => (
                            <span 
                              key={cat} 
                              className={cn(
                                "px-2.5 py-0.5 rounded border text-xs font-medium whitespace-nowrap",
                                getCategoryTheme(cat)
                              )}
                            >
                              {cat}
                            </span>
                          )) || <span className="text-gray-400 text-xs italic">无</span>}
                        </div>
                        <div className="px-2 text-sm text-gray-600">
                          {formatSize(file.size)}
                        </div>
                        <div className="px-2 text-sm text-gray-600">
                          {formatDate(file.uploadTime)}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-8 text-center text-gray-500 text-sm">
                    暂无文件信息
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-gray-200 bg-gray-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Info size={16} />
            预计扣费: <span className="font-bold text-gray-900 mx-1">{selectedCheckTypes.length}</span> 次
          </div>
          <div className="flex gap-4">
            <Button variant="outline" onClick={onClose} className="px-8 bg-white border-gray-300 hover:bg-gray-50 text-gray-700">
              取消
            </Button>
            <Button 
              variant="primary" 
              onClick={handleConfirm}
              disabled={selectedFileIds.length === 0 || selectedCheckTypes.length === 0}
              className="px-8 bg-indigo-600 hover:bg-indigo-700 border-none"
            >
              确定
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
