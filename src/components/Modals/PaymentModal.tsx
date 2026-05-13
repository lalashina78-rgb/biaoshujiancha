import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { Button } from '../UI/Button';
import { cn } from '../../utils/cn';
import { motion, AnimatePresence } from 'framer-motion';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  amount?: number;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onSuccess, amount = 299 }) => {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'single'>('monthly');
  const [paymentMethod, setPaymentMethod] = useState<'wechat' | 'alipay'>('wechat');

  if (!isOpen) return null;

  const currentPrice = selectedPlan === 'monthly' ? 299 : 20;
  const originalPrice = selectedPlan === 'monthly' ? 399 : 30;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <AnimatePresence>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
          onClick={onClose} 
        />
      </AnimatePresence>

      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-[720px] overflow-hidden flex flex-col font-sans"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h2 className="text-lg font-bold text-gray-800">充值</h2>
          <button 
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 bg-white overflow-y-auto">
          {/* Top Banner */}
          <div className="bg-[#4D84F5] rounded-xl px-5 py-3 flex items-center justify-between text-white mb-5">
            <h3 className="text-base font-bold">请选择购买方案</h3>
            <div className="flex items-center gap-4 text-xs opacity-90">
              <button className="hover:underline transition-all">对公转账</button>
            </div>
          </div>

          <div className="px-1">
            {/* Product Section */}
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-[#1E5AF9] rounded-xl flex items-center justify-center shrink-0 shadow-md shadow-blue-100">
                <span className="text-white text-xl font-bold">T</span>
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-bold text-gray-900 leading-tight">资信标检查</h4>
                <p className="text-[13px] text-gray-500 font-medium mt-0.5">解析招标文件自动提取评审点AI评审招标文件</p>
              </div>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Monthly Plan */}
              <div 
                onClick={() => setSelectedPlan('monthly')}
                className={cn(
                  "relative p-5 rounded-2xl border-2 transition-all cursor-pointer group flex flex-col justify-between h-32",
                  selectedPlan === 'monthly' 
                    ? "border-[#1E5AF9] bg-blue-50/10 shadow-sm shadow-blue-50" 
                    : "border-gray-100 bg-white hover:border-blue-200 hover:bg-gray-50/50"
                )}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-lg font-bold text-gray-900">包月套餐</span>
                    {selectedPlan === 'monthly' && (
                      <div className="w-5 h-5 bg-[#1E5AF9] rounded flex items-center justify-center">
                        <Check size={12} className="text-white" strokeWidth={3} />
                      </div>
                    )}
                  </div>
                  <span className="text-[13px] text-gray-400 font-medium">30天内不限次比对</span>
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-bold text-[#1E5AF9]">¥299</span>
                  <span className="text-xs text-gray-400 line-through mb-1 font-medium">¥399</span>
                  <span className="text-[11px] text-gray-400 mb-1 ml-0.5 font-medium italic">约9.9元/天</span>
                </div>
              </div>

              {/* Single Plan */}
              <div 
                onClick={() => setSelectedPlan('single')}
                className={cn(
                  "relative p-5 rounded-2xl border-2 transition-all cursor-pointer group flex flex-col justify-between h-32",
                  selectedPlan === 'single' 
                    ? "border-[#1E5AF9] bg-blue-50/10 shadow-sm shadow-blue-50" 
                    : "border-gray-100 bg-white hover:border-blue-200 hover:bg-gray-50/50"
                )}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-lg font-bold text-gray-900">单次套餐</span>
                    {selectedPlan === 'single' && (
                      <div className="w-5 h-5 bg-[#1E5AF9] rounded flex items-center justify-center">
                        <Check size={12} className="text-white" strokeWidth={3} />
                      </div>
                    )}
                  </div>
                  <span className="text-[13px] text-gray-400 font-medium">单次项目比对</span>
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-bold text-[#1E5AF9]">¥20</span>
                  <span className="text-xs text-gray-400 line-through mb-1 font-medium">¥30</span>
                  <span className="text-[11px] text-gray-400 mb-1 ml-0.5 font-medium">20元/次</span>
                </div>
              </div>
            </div>

            {/* Form Section */}
            <div className="flex flex-col md:flex-row items-center justify-start gap-4 pb-4 border-b border-gray-50">
              <div className="flex items-center gap-3 w-full md:w-auto">
                <span className="text-xs font-bold text-gray-500 whitespace-nowrap">推广码：</span>
                <input 
                  type="text" 
                  placeholder="选填" 
                  className="bg-gray-50/50 border border-gray-100 rounded-xl px-3 py-2 text-[13px] font-bold text-gray-600 outline-none focus:border-blue-200 w-full md:w-48"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Payment Section */}
        <div className="px-6 py-6 bg-white mt-auto">
          <div className="border border-gray-100 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-8">
            {/* QR Code */}
            <div 
              className="w-28 h-28 bg-white border border-gray-100 p-1.5 rounded-2xl shadow-sm hover:shadow-md hover:scale-105 transition-all cursor-pointer group relative shrink-0"
              onClick={onSuccess} // Simulate payment
            >
              <img 
                src="https://img02.huawei.com/pms/product/6901443315802/800_800_D2D50EC560249F5AFBC73EFEF99A52CB.jpg" 
                alt="QR Code" 
                className="w-full h-full object-contain blur-[0.5px] group-hover:blur-0 transition-all opacity-80"
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all bg-black/5 rounded-2xl">
                <span className="text-[9px] font-bold text-blue-600 bg-white px-1.5 py-0.5 rounded shadow-sm">点击模拟支付</span>
              </div>
            </div>

            {/* Payment Details */}
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-500">需支付:</span>
                <span className="text-3xl font-bold text-[#F57C00]">¥{currentPrice}</span>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <button 
                  onClick={() => setPaymentMethod('wechat')}
                  className={cn(
                    "flex items-center gap-2.5 px-4 py-2 rounded-xl border-2 font-bold transition-all text-[13px]",
                    paymentMethod === 'wechat' 
                      ? "border-[#2ECC71] bg-[#2ECC71]/5 text-gray-800 shadow-sm" 
                      : "border-gray-50 bg-white text-gray-400 hover:border-gray-200"
                  )}
                >
                  <div className={cn(
                    "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                    paymentMethod === 'wechat' ? "border-[#2ECC71]" : "border-gray-200"
                  )}>
                    {paymentMethod === 'wechat' && <div className="w-2 h-2 rounded-full bg-[#2ECC71]" />}
                  </div>
                  <img src="https://open.weixin.qq.com/zh_CN/htmledition/res/assets/res-design-download/icon64_appwx_logo.png" className="w-4 h-4" alt="Wechat" />
                  微信支付
                </button>

                <button 
                  onClick={() => setPaymentMethod('alipay')}
                  className={cn(
                    "flex items-center gap-2.5 px-4 py-2 rounded-xl border-2 font-bold transition-all text-[13px]",
                    paymentMethod === 'alipay' 
                      ? "border-blue-500 bg-blue-50/5 text-gray-800 shadow-sm" 
                      : "border-gray-100 bg-white text-gray-400 hover:border-gray-200"
                  )}
                >
                  <div className={cn(
                    "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                    paymentMethod === 'alipay' ? "border-blue-500" : "border-gray-200"
                  )}>
                    {paymentMethod === 'alipay' && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                  </div>
                  <span className="text-[#1588FE] font-serif italic text-base px-0.5 leading-none">支</span>
                  支付宝
                </button>
              </div>
            </div>

            <button className="text-gray-400 hover:text-blue-500 font-bold text-xs transition-all flex items-center gap-0.5 shrink-0">
              我要对公转账 <span className="text-base">›</span>
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-[10px] text-gray-400 font-medium tracking-tight">
              支付即代表你同意 <button className="text-blue-500 hover:underline">《用户协议》</button> 及 <button className="text-blue-500 hover:underline">《隐私协议》</button> ，购买后不支持7天无理由退货
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
