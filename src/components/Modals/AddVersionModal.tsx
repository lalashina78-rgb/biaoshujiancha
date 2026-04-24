import React, { useState, useRef, useEffect } from 'react';
import { X, Plus, Info } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface FileUploadData {
  file: File;
  categories: string[];
}

interface AddVersionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (name: string, remark: string, referenceDocName: string, fileData: FileUploadData[]) => void;
  suggestedVersionName?: string;
}

export const AddVersionModal: React.FC<AddVersionModalProps> = ({ isOpen, onClose, onImport, suggestedVersionName = 'V2.0' }) => {
  const [name, setName] = useState('');
  const [remark, setRemark] = useState('');
  const [referenceDocName, setReferenceDocName] = useState('');
  const [fileDataList, setFileDataList] = useState<FileUploadData[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setName(suggestedVersionName);
      setRemark('');
      setReferenceDocName('招标文件 V1.0');
      setFileDataList([]);
    }
  }, [isOpen, suggestedVersionName]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFileData = Array.from(e.target.files).map(file => ({
        file,
        categories: []
      }));
      setFileDataList(prev => [...prev, ...newFileData]);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    setFileDataList(prev => prev.filter((_, i) => i !== index));
  };

  const toggleCategory = (index: number, category: string) => {
    setFileDataList(prev => prev.map((item, i) => {
      if (i !== index) return item;
      const cats = item.categories;
      const newCats = cats.includes(category) 
        ? cats.filter(c => c !== category)
        : [...cats, category];
      return { ...item, categories: newCats };
    }));
  };

  const isFormValid = name.trim() !== '' && fileDataList.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    onImport(name, remark, referenceDocName, fileDataList);
    onClose();
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl mx-4 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 shrink-0">
          <h2 className="text-lg font-bold text-gray-900">上传新版本标书</h2>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>
        
        {/* Body */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          
          {/* Left Column: File Upload & Configuration */}
          <div className="flex-[3] p-8 border-r border-gray-100 overflow-y-auto flex flex-col gap-6">
            <input 
              type="file" 
              multiple
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.xls,.xlsx"
            />
            {fileDataList.length === 0 ? (
              <div 
                className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 hover:border-gray-400 transition-colors cursor-pointer group flex flex-col items-center justify-center flex-1 min-h-[300px]"
                onClick={() => fileInputRef.current?.click()}
              >
                <Plus size={32} className="text-gray-400 group-hover:text-gray-600 transition-colors mb-4" strokeWidth={1.5} />
                <p className="text-base font-bold text-gray-900 mb-2">将标书文件拖拽至此 或 点击上传</p>
                <p className="text-sm text-gray-500">支持 PDF, Word, Excel (Max 100MB)</p>
              </div>
            ) : (
              <div className="space-y-4 flex flex-col h-full">
                <h3 className="text-sm font-bold text-gray-900 shrink-0">已选文件</h3>
                <div className="space-y-3 pb-4">
                  {fileDataList.map((item, index) => (
                    <div key={index} className="flex flex-col gap-3 p-4 bg-white border border-gray-100 rounded-lg shadow-sm">
                      <div className="flex items-center justify-between gap-4 min-w-0">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0">
                            <span className="text-[11px] font-bold text-gray-600">
                              {item.file.name.split('.').pop()?.toUpperCase() || 'FILE'}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-gray-900 truncate" title={item.file.name}>{item.file.name}</p>
                            <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-3">
                              <span>{formatSize(item.file.size)}</span>
                              <span className="flex items-center gap-1.5 text-brand bg-brand/5 px-2 py-0.5 rounded">
                                等待上传
                              </span>
                            </p>
                          </div>
                        </div>
                        <button 
                          type="button"
                          onClick={() => removeFile(index)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                          title="移除文件"
                        >
                          <X size={16} />
                        </button>
                      </div>

                      {/* Category Selection Row */}
                      <div className="flex items-center gap-3 pt-3 border-t border-gray-50">
                        <span className="text-xs text-gray-500 font-medium whitespace-nowrap">选择分类:</span>
                        <div className="flex flex-wrap items-center gap-2">
                          {['资信标', '技术标', '经济标'].map(cat => (
                            <button 
                              key={cat}
                              onClick={() => toggleCategory(index, cat)}
                              className={cn(
                                "px-3 py-1 rounded-md text-xs font-bold border transition-all",
                                item.categories.includes(cat)
                                  ? "bg-brand/10 border-brand/20 text-brand shadow-sm"
                                  : "bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700 hover:bg-gray-50"
                              )}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Compact Upload Button */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-4 border-2 border-dashed border-gray-200 rounded-lg text-gray-500 hover:text-brand hover:border-brand hover:bg-brand/5 transition-all flex items-center justify-center gap-2 font-medium bg-gray-50/50 mt-4"
                    type="button"
                  >
                    <Plus size={18} />
                    继续添加文件
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Version Info */}
          <div className="flex-[2] p-8 bg-gray-50/50 overflow-y-auto flex flex-col gap-6 border-l border-gray-100">
            <div>
              <label className="flex items-center gap-1.5 text-sm font-bold text-gray-900 mb-2">
                版本名称
                <Info size={14} className="text-gray-400" />
              </label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand outline-none transition-all bg-white"
                placeholder="例如：V2.0"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                检查依据（招标文件/答疑版本）
              </label>
              <input 
                type="text" 
                value={referenceDocName}
                onChange={(e) => setReferenceDocName(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand outline-none transition-all bg-white"
                placeholder="例如：招标文件 V1.0"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                版本差异记录（非必填）
              </label>
              <textarea 
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                rows={4}
                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand outline-none transition-all resize-none bg-white"
                placeholder="例如：修改了报价部分，更新了资质"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-white flex justify-end gap-3 shrink-0">
          <button 
            type="button" 
            onClick={onClose}
            className="px-6 py-2 text-sm border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            取消
          </button>
          <button 
            onClick={handleSubmit}
            disabled={!isFormValid}
            className={`px-6 py-2 text-sm rounded-lg transition-colors shadow-sm flex items-center font-medium ${
              isFormValid 
                ? 'bg-brand text-white hover:bg-brand-dark' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
            }`}
          >
            确定并上传
          </button>
        </div>
      </div>
    </div>
  );
};
