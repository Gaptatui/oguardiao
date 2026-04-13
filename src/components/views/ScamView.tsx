
import React from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, Zap, History } from 'lucide-react';

interface ScamViewProps {
  t: any;
  autoMonitoring: boolean;
  setAutoMonitoring: (v: boolean) => void;
  monitoredApps: Record<string, boolean>;
  setMonitoredApps: (v: any) => void;
  actionType: 'MANUAL' | 'AUTOMATIC';
  setActionType: (v: 'MANUAL' | 'AUTOMATIC') => void;
  simulateScamNotification: () => void;
  scamLogs: any[];
  setScamLogs: (v: any[]) => void;
  inputText: string;
  setInputText: (v: string) => void;
  isAnalyzing: boolean;
  analyzeMessage: () => void;
  result: any;
}

export const ScamView: React.FC<ScamViewProps> = ({
  t, autoMonitoring, setAutoMonitoring, monitoredApps, setMonitoredApps,
  actionType, setActionType, simulateScamNotification, scamLogs, setScamLogs,
  inputText, setInputText, isAnalyzing, analyzeMessage, result
}) => {
  return (
    <motion.div key="scam" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto space-y-6">
      {/* Settings Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-800 space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black flex items-center gap-2 text-slate-900 dark:text-slate-100">
            <ShieldAlert className="w-6 h-6 text-indigo-600 dark:text-indigo-400" /> {t.shieldSettings}
          </h2>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-black px-3 py-1 rounded-full ${autoMonitoring ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'}`}>
              {autoMonitoring ? t.protectionActive : t.protectionDisabled}
            </span>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm font-black text-indigo-900 dark:text-indigo-100">{t.globalMonitoring}</p>
                <p className="text-[10px] text-indigo-700 dark:text-indigo-400">{t.globalMonitoringDescription}</p>
              </div>
              <button 
                onClick={() => setAutoMonitoring(!autoMonitoring)}
                className={`w-12 h-6 rounded-full transition-all relative ${autoMonitoring ? 'bg-indigo-600 dark:bg-indigo-500' : 'bg-slate-300 dark:bg-slate-700'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${autoMonitoring ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{t.individualListeningConfig}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(monitoredApps).map(([app, enabled]) => (
                <div 
                  key={app}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                    !autoMonitoring ? 'opacity-40 grayscale pointer-events-none' : 
                    enabled ? 'bg-white dark:bg-slate-800 border-indigo-200 dark:border-indigo-900/50 shadow-sm' : 'bg-slate-50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-800'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className={`text-xs font-black capitalize ${enabled ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400 dark:text-slate-500'}`}>{app}</span>
                    <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">{t.autoListening}</span>
                  </div>
                  <button 
                    onClick={() => setMonitoredApps((prev: any) => ({ ...prev, [app]: !enabled }))}
                    className={`w-10 h-5 rounded-full transition-all relative ${enabled ? 'bg-emerald-500 dark:bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${enabled ? 'left-5.5' : 'left-0.5'}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{t.responseMode}</p>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setActionType('MANUAL')}
                className={`py-3 rounded-xl text-xs font-bold border transition-all ${actionType === 'MANUAL' ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-900 dark:border-slate-100' : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'}`}
              >
                {t.manual}
              </button>
              <button 
                onClick={() => setActionType('AUTOMATIC')}
                className={`py-3 rounded-xl text-xs font-bold border transition-all ${actionType === 'AUTOMATIC' ? 'bg-indigo-600 dark:bg-indigo-500 text-white dark:text-white border-indigo-600 dark:border-indigo-500' : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'}`}
              >
                {t.automatic}
              </button>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 italic">
              {actionType === 'AUTOMATIC' 
                ? t.autoDescription 
                : t.manualDescription}
            </p>
          </div>

          {autoMonitoring && (
            <button 
              onClick={simulateScamNotification}
              className="w-full py-4 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-all flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4" /> {t.simulateNotification}
            </button>
          )}
        </div>
      </div>

      {/* Activity Log */}
      {scamLogs.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black flex items-center gap-2 text-slate-900 dark:text-slate-100">
              <History className="w-6 h-6 text-slate-400 dark:text-slate-500" /> {t.activityLog}
            </h2>
            <button onClick={() => setScamLogs([])} className="text-[10px] font-bold text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 uppercase tracking-widest">{t.clear}</button>
          </div>
          <div className="space-y-4">
            {scamLogs.map((log, idx) => (
              <div key={`scam-log-${log.id || `idx-${idx}-${log.timestamp}`}`} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-start gap-4">
                <div className={`p-2 rounded-xl shrink-0 ${log.action.includes('BLOQUEADO') ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 uppercase tracking-wider">{log.app}</span>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-relaxed">{log.message}</p>
                  <p className={`text-[10px] font-black uppercase tracking-widest ${log.action.includes('BLOQUEADO') ? 'text-indigo-600 dark:text-indigo-400' : log.action.includes('PELO USUÁRIO') ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}>
                    {log.action === "BLOQUEADO AUTOMATICAMENTE" ? t.blockedAuto : 
                     log.action === "BLOQUEADO PELO USUÁRIO" ? t.blockedUser : 
                     log.action === "IGNORADO PELO USUÁRIO" ? t.ignoredUser : log.action}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Manual Analysis Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-800">
        <h2 className="text-xl font-black mb-6 text-slate-900 dark:text-slate-100">{t.manualAnalysis}</h2>
        <textarea
          className="w-full h-48 p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500"
          placeholder={t.placeholderScam}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
        <button
          onClick={analyzeMessage}
          disabled={isAnalyzing || !inputText?.trim()}
          title={t.checkSecurity}
          className="w-full mt-4 py-4 bg-indigo-600 dark:bg-indigo-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all disabled:opacity-50"
        >
          {isAnalyzing ? t.analyzing : t.checkSecurity}
        </button>
      </div>
      {result && (
        <div className={`p-8 rounded-3xl border-2 ${
          result.verdict === 'SEGURO' ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400' :
          result.verdict === 'SUSPEITO' ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-900/30 text-amber-700 dark:text-amber-400' :
          'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-900/30 text-rose-700 dark:text-rose-400'
        }`}>
          <h3 className="text-3xl font-black mb-2">
            {result.verdict === 'SEGURO' ? t.safe : result.verdict === 'SUSPEITO' ? t.suspicious : t.scamConfirmed}
          </h3>
          <p className="text-lg font-medium mb-4">{result.reason}</p>
          <p className="text-sm font-bold uppercase tracking-widest opacity-60">{t.action}</p>
          <p className="text-xl font-bold">{result.action}</p>
        </div>
      )}
    </motion.div>
  );
};
