import React, { useState, useRef, useEffect } from 'react';
import { X, Plus, Info } from 'lucide-react';

interface AddVersionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (name: string, remark: string, referenceDocName: string, files: File[]) => void;
  suggestedVersionName?: string;
}

export const AddVersionModal: React.FC<AddVersionModalProps> = ({ isOpen, onClose, onImport, suggestedVersionName = 'V2.0' }) => {
  const [name, setName] = useState('');
  const [remark, setRemark] = useState('');
  const [referenceDocName, setReferenceDocName] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setName(suggestedVersionName);
      setRemark('');
      setReferenceDocName('招标文件 V1.0');
      setFiles([]);
    }
  }, [isOpen, suggestedVersionName]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const isFormValid = name.trim() !== '' && files.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    onImport(name, remark, referenceDocName, files);
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
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl mx-4 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 shrink-0">
          <h2 className="text-lg font-bold text-gray-900">上传新版本标书</h2>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>
        
        {/* Body */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Left Column: File Upload */}
          <div className="flex-1 p-8 border-r border-gray-100 overflow-y-auto flex flex-col gap-6">
            <div 
              className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center hover:bg-gray-50 hover:border-gray-400 transition-colors cursor-pointer group flex flex-col items-center justify-center min-h-[200px]"
              onClick={() => fileInputRef.current?.click()}
            >
              <Plus size={40} className="text-gray-400 group-hover:text-gray-600 transition-colors mb-4" strokeWidth={1.5} />
              <p className="text-base font-bold text-gray-900 mb-2">将标书文件拖拽至此 或 点击上传</p>
              <p className="text-sm text-gray-500">支持 PDF, Word, Excel (Max 100MB)</p>
              <input 
                type="file" 
                multiple
                className="hidden" 
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.xls,.xlsx"
              />
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div className="space-y-0">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between py-4 border-b border-gray-100 group">
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-lg bg-gray-500 flex items-center justify-center shrink-0">
                        <span className="text-[11px] font-bold text-white">
                          {file.name.split('.').pop()?.toUpperCase() || 'FILE'}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">{file.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{formatSize(file.size)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0 ml-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-600">等待上传</span>
                        <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                      </div>
                      <button 
                        type="button"
                        onClick={() => removeFile(index)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Version Info */}
          <div className="w-full md:w-80 p-8 bg-white overflow-y-auto flex flex-col gap-6">
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
            开始上传
          </button>
        </div>
      </div>
    </div>
  );
};
