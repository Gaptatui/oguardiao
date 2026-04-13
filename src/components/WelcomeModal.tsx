import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck } from 'lucide-react';

interface WelcomeModalProps {
  show: boolean;
  onClose: () => void;
  t: any;
}

export const WelcomeModal = ({ show, onClose, t }: WelcomeModalProps) => {
  if (!show) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-slate-900 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-[40px] shadow-2xl border border-slate-100 dark:border-slate-800 custom-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-32 bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
          </div>
          <ShieldCheck className="w-16 h-16 text-white/90 relative z-10" />
        </div>
        
        <div className="p-6 space-y-4">
          <div className="text-center space-y-1">
            <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">{t.welcomeTitle}</h2>
            <p className="text-[11px] font-medium text-slate-600 dark:text-slate-400 leading-relaxed">{t.welcomeSubtitle}</p>
          </div>

          <div className="grid grid-cols-1 gap-3 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
            {[
              { title: t.welcomeStep1Title, desc: t.welcomeStep1Desc },
              { title: t.welcomeStep2Title, desc: t.welcomeStep2Desc },
              { title: t.welcomeStep3Title, desc: t.welcomeStep3Desc },
              { title: t.welcomeStep4Title, desc: t.welcomeStep4Desc },
            ].map((step, i) => (
              <div key={`welcome-step-${i}`} className="flex gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="flex-1">
                  <h4 className="text-[10px] font-black text-slate-900 dark:text-slate-100 mb-0.5">{step.title}</h4>
                  <p className="text-[9px] text-slate-500 dark:text-slate-400 font-medium leading-tight">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={onClose}
            className="w-full py-3 bg-indigo-600 dark:bg-indigo-500 text-white rounded-2xl font-black text-sm shadow-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all transform active:scale-95"
          >
            {t.getStarted}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
