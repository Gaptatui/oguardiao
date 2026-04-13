
import React from 'react';
import { motion } from 'motion/react';
import { User, Mail, ShieldCheck, Globe, Moon, Sun, LogOut, ChevronRight, CreditCard, Zap, ShieldAlert, Star } from 'lucide-react';
import { UserProfile, Language } from '../../types';

interface SettingsViewProps {
  t: any;
  user: any;
  userProfile: UserProfile | null;
  language: Language;
  setLanguage: (l: Language) => void;
  theme: 'light' | 'dark';
  setTheme: (t: 'light' | 'dark') => void;
  handleLogout: () => void;
  setShowCheckout: (v: boolean) => void;
  isAdmin: boolean;
  personalData: {
    name: string;
    email: string;
    phone: string;
    birthDay: string;
    birthMonth: string;
  };
  setPersonalData: (v: any) => void;
  saveSettings: () => void;
  cancelSubscription: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  t, user, userProfile, language, setLanguage, theme, setTheme,
  handleLogout, setShowCheckout, isAdmin, personalData, setPersonalData,
  saveSettings, cancelSubscription
}) => {
  return (
    <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">{t.settings}</h2>
          <p className="text-xs text-slate-500 font-medium">{t.settingsDescription}</p>
        </div>
        <div className="bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-2xl">
          <User className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
        </div>
      </div>

      {/* Plan Management */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-800 space-y-6 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16" />
        <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 flex items-center gap-2 relative z-10">
          <Star className={`w-4 h-4 ${userProfile?.plan === 'pro' ? 'text-amber-500 fill-current' : 'text-slate-400'}`} /> {t.currentPlan}
        </h3>
        
        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 relative z-10">
          <div>
            <p className={`text-lg font-black ${userProfile?.plan === 'pro' ? 'text-amber-600 dark:text-amber-500' : 'text-slate-600 dark:text-slate-400'}`}>
              {userProfile?.plan === 'pro' ? t.proPlan : t.freePlan}
            </p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">{t.currentPlan}</p>
          </div>
          {userProfile?.plan === 'free' && (
            <button 
              onClick={() => setShowCheckout(true)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-amber-200 dark:shadow-none"
            >
              {t.upgradeToPro}
            </button>
          )}
        </div>

        {userProfile?.plan === 'pro' && (
          <div className="space-y-4 pt-2 relative z-10">
            <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">{t.subscriptionDetails}</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                <p className="text-[8px] font-bold text-slate-400 uppercase mb-1">{t.status}</p>
                <p className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase">{t.active}</p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                <p className="text-[8px] font-bold text-slate-400 uppercase mb-1">{t.periodicity}</p>
                <p className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase">{userProfile.subscriptionPeriod === 'monthly' ? t.monthly : t.yearly}</p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                <p className="text-[8px] font-bold text-slate-400 uppercase mb-1">{t.nextBilling}</p>
                <p className="text-xs font-black text-slate-700 dark:text-slate-200">{userProfile.nextBillingDate ? new Date(userProfile.nextBillingDate).toLocaleDateString() : '-'}</p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                <p className="text-[8px] font-bold text-slate-400 uppercase mb-1">{t.paymentMethodLabel}</p>
                <p className="text-[10px] font-black text-slate-700 dark:text-slate-200 truncate">{userProfile.paymentMethod || '-'}</p>
              </div>
            </div>
            <button 
              onClick={cancelSubscription}
              className="w-full py-3 bg-slate-100 dark:bg-slate-800 text-rose-600 dark:text-rose-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all border border-slate-200 dark:border-slate-700"
            >
              {t.cancelSubscription}
            </button>
          </div>
        )}

        {userProfile?.plan === 'free' && (
          <div className="space-y-4 pt-2 relative z-10">
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{t.benefitsPro}</p>
            <div className="grid grid-cols-1 gap-2">
              {[t.benefit1, t.benefit2, t.benefit3, t.benefit4, t.benefit5].map((benefit, i) => (
                <p key={`benefit-${i}`} className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{benefit}</p>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Personal Data */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-800 space-y-6">
        <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> {t.personalData}
        </h3>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.name}</label>
            <input 
              type="text" 
              value={personalData.name}
              onChange={(e) => setPersonalData({...personalData, name: e.target.value})}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs font-medium focus:ring-2 focus:ring-indigo-500 transition-all dark:text-slate-100"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.email}</label>
            <input 
              type="email" 
              value={personalData.email}
              disabled
              className="w-full bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 cursor-not-allowed"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.phone}</label>
            <input 
              type="text" 
              value={personalData.phone}
              onChange={(e) => setPersonalData({...personalData, phone: e.target.value})}
              placeholder="(00) 00000-0000"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs font-medium focus:ring-2 focus:ring-indigo-500 transition-all dark:text-slate-100"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.birthDay}</label>
              <select 
                value={personalData.birthDay}
                onChange={(e) => setPersonalData({...personalData, birthDay: e.target.value})}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs font-medium focus:ring-2 focus:ring-indigo-500 transition-all dark:text-slate-100"
              >
                <option value="">-</option>
                {Array.from({length: 31}, (_, i) => i + 1).map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.birthMonth}</label>
              <select 
                value={personalData.birthMonth}
                onChange={(e) => setPersonalData({...personalData, birthMonth: e.target.value})}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs font-medium focus:ring-2 focus:ring-indigo-500 transition-all dark:text-slate-100"
              >
                <option value="">-</option>
                <option value="1">{t.january}</option>
                <option value="2">{t.february}</option>
                <option value="3">{t.march}</option>
                <option value="4">{t.april}</option>
                <option value="5">{t.may}</option>
                <option value="6">{t.june}</option>
                <option value="7">{t.july}</option>
                <option value="8">{t.august}</option>
                <option value="9">{t.september}</option>
                <option value="10">{t.october}</option>
                <option value="11">{t.november}</option>
                <option value="12">{t.december}</option>
              </select>
            </div>
          </div>
          <button 
            onClick={saveSettings}
            className="w-full py-3 bg-indigo-600 dark:bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all"
          >
            {t.save}
          </button>
        </div>
      </div>

      {/* Language Selection */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-800 space-y-6">
        <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <Globe className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> {t.language}
        </h3>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.selectLanguage}</label>
          <div className="relative">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs font-medium focus:ring-2 focus:ring-indigo-500 transition-all appearance-none cursor-pointer dark:text-slate-100"
            >
              <option value="pt">🇧🇷 Português</option>
              <option value="en">🇺🇸 English</option>
              <option value="es">🇪🇸 Español</option>
              <option value="fr">🇫🇷 Français</option>
              <option value="de">🇩🇪 Deutsch</option>
              <option value="it">🇮🇹 Italiano</option>
              <option value="nl">🇳🇱 Nederlands</option>
              <option value="zh">🇨🇳 中文</option>
              <option value="he">🇮🇱 עברית</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <ChevronRight className="w-4 h-4 text-slate-400 rotate-90" />
            </div>
          </div>
        </div>
      </div>

      {/* Logout */}
      <button 
        onClick={handleLogout}
        className="w-full py-4 bg-slate-900 dark:bg-slate-800 text-white rounded-2xl font-black text-sm shadow-lg hover:bg-slate-800 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
      >
        <LogOut className="w-5 h-5" /> {t.logout}
      </button>
    </motion.div>
  );
};
