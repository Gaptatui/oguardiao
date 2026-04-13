import React from 'react';
import { motion } from 'motion/react';
import { 
  ShieldAlert, History, Zap, Trash2, User, 
  BarChart3, RefreshCw, Sparkles, Edit2, Edit,
  ArrowUpCircle, Star, Clock, Activity, Heart,
  Zap as ZapIcon, ShieldCheck, MapPin, Mic
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line 
} from 'recharts';
import { formatCurrency } from '../lib/utils';
import { Language, UserProfile, Transaction, UsageLog, Alerta } from '../types';

interface AdminPanelProps {
  t: any;
  language: Language;
  transactions: Transaction[];
  allUsers: UserProfile[];
  usageLogs: UsageLog[];
  alertasList: Alerta[];
  planConfig: { monthly: number; yearly: number };
  setPlanConfig: (config: { monthly: number; yearly: number }) => void;
  resetDatabase: () => void;
  updateUserPlanManual: (uid: string, plan: 'free' | 'pro') => void;
  updateUserRole: (uid: string, isAdmin: boolean) => void;
  updateUserVip: (uid: string, isVip: boolean) => void;
  updateAlertaStatus: (id: string, status: string) => Promise<void>;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const AdminPanel = ({
  t, language, transactions, allUsers, usageLogs, alertasList,
  planConfig, setPlanConfig, resetDatabase,
  updateUserPlanManual, updateUserRole, updateUserVip,
  updateAlertaStatus, showToast
}: AdminPanelProps) => {
  return (
    <motion.div key="painel" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">{t.controlPanel}</h2>
        <span className="px-4 py-2 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse">
          Monitoramento Ativo
        </span>
      </div>

      {/* Financial & Metrics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] shadow-sm border border-slate-100 dark:border-slate-800">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t.revenue}</p>
          <h3 className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
            {formatCurrency(transactions.reduce((acc, curr) => acc + curr.valor, 0), language)}
          </h3>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] shadow-sm border border-slate-100 dark:border-slate-800">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t.activeSubscribers}</p>
          <h3 className="text-3xl font-black text-indigo-600 dark:text-indigo-400">
            {allUsers.filter(u => u.plan === 'pro').length}
          </h3>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] shadow-sm border border-slate-100 dark:border-slate-800">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Logs</p>
          <h3 className="text-3xl font-black text-slate-900 dark:text-slate-100">
            {usageLogs.length}
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Chart */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] shadow-xl border border-slate-100 dark:border-slate-800">
          <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 mb-6">{t.revenueOverTime}</h3>
          <div className="h-[300px] w-full">
            {transactions.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={transactions.slice().reverse().map(t => ({
                  date: new Date(t.timestamp).toLocaleDateString(),
                  valor: t.valor
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="date" fontSize={10} axisLine={false} tickLine={false} />
                  <YAxis fontSize={10} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line type="monotone" dataKey="valor" stroke="#4f46e5" strokeWidth={4} dot={{ r: 4, fill: '#4f46e5' }} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs font-bold">{t.noData}</div>
            )}
          </div>
        </div>

        {/* Module Usage Chart */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] shadow-xl border border-slate-100 dark:border-slate-800">
          <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 mb-6">{t.modulePopularity}</h3>
          <div className="h-[300px] w-full">
            {usageLogs.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={Object.entries(usageLogs.reduce((acc: any, curr) => {
                  acc[curr.modulo] = (acc[curr.modulo] || 0) + 1;
                  return acc;
                }, {})).map(([name, value]) => ({ name: t[name as keyof typeof t] || name, value }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                  <YAxis fontSize={10} axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="value" fill="#6366f1" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs font-bold">{t.noData}</div>
            )}
          </div>
        </div>
      </div>

      {/* Plan Configuration Section */}
      <div className="bg-white dark:bg-slate-900 rounded-[40px] p-8 shadow-xl border border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-2xl">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">{t.planControl}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">Ajuste os valores dos planos PRO</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.monthlyValue}</label>
            <div className="flex items-center gap-3">
              <span className="text-lg font-black text-slate-400">{formatCurrency(0, language).replace(/[\d.,\s\u00A0]/g, '')}</span>
              <input 
                type="number" 
                value={planConfig.monthly}
                onChange={(e) => setPlanConfig({ ...planConfig, monthly: parseFloat(e.target.value) })}
                className="flex-1 p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xl font-black text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.yearlyValue}</label>
            <div className="flex items-center gap-3">
              <span className="text-lg font-black text-slate-400">{formatCurrency(0, language).replace(/[\d.,\s\u00A0]/g, '')}</span>
              <input 
                type="number" 
                value={planConfig.yearly}
                onChange={(e) => setPlanConfig({ ...planConfig, yearly: parseFloat(e.target.value) })}
                className="flex-1 p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xl font-black text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>
        </div>
        <button 
          onClick={() => {
            localStorage.setItem('guardian-plan-config', JSON.stringify(planConfig));
            showToast("Configurações de plano salvas!", "success");
          }}
          className="mt-6 w-full py-4 bg-slate-900 dark:bg-slate-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-600 transition-all"
        >
          Salvar Configurações
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[40px] p-8 shadow-xl border border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-2xl">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">Resetar Sistema</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">Limpeza total para novos testes</p>
            </div>
          </div>
          <button 
            onClick={resetDatabase}
            className="px-6 py-3 bg-rose-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-700 transition-all shadow-lg shadow-rose-200 dark:shadow-none"
          >
            Zerar Banco de Dados
          </button>
        </div>
      </div>

      {/* User Management Section */}
      <div className="bg-white dark:bg-slate-900 rounded-[40px] p-8 shadow-xl border border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">{t.userManagement}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">{allUsers.length} Usuários Cadastrados</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.userEmail}</th>
                <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.name}</th>
                <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.birthday}</th>
                <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cadastro</th>
                <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.userPlan}</th>
                <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.userRole}</th>
                <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
              {allUsers.map((u, idx) => (
                <tr key={`user-row-${u.uid || `idx-${idx}-${u.email}`}`} className="group">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      {u.photoURL && <img src={u.photoURL} alt="" className="w-8 h-8 rounded-full border border-slate-200" referrerPolicy="no-referrer" />}
                      <div>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{u.email}</p>
                        <p className="text-[8px] text-slate-400 font-mono">{u.uid}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4">
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-300">{u.name || '-'}</p>
                  </td>
                  <td className="py-4">
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                      {u.birthDay && u.birthMonth ? `${u.birthDay}/${u.birthMonth}` : '-'}
                    </p>
                  </td>
                  <td className="py-4">
                    <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                      {u.timestamp ? new Date(u.timestamp).toLocaleDateString() : '-'}
                    </p>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase ${u.plan === 'pro' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>
                        {u.plan}
                      </span>
                      {u.isVip && <span className="px-2 py-1 bg-indigo-100 text-indigo-600 rounded-lg text-[8px] font-black uppercase">{t.vipBadge}</span>}
                    </div>
                  </td>
                  <td className="py-4">
                    <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase ${u.subscriptionStatus === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                      {u.subscriptionStatus || 'inactive'}
                    </span>
                  </td>
                  <td className="py-4">
                    <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase ${u.isAdmin ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-500'}`}>
                      {u.isAdmin ? 'Admin' : 'User'}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => updateUserPlanManual(u.uid, (u.plan === 'pro' ? 'free' : 'pro') as 'free' | 'pro')}
                        className="p-2 bg-slate-50 dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-900/20 text-slate-400 hover:text-amber-600 rounded-xl transition-all"
                        title={u.plan === 'pro' ? t.setFree : t.setPro}
                      >
                        <ArrowUpCircle className={`w-4 h-4 ${u.plan === 'pro' ? 'rotate-180' : ''}`} />
                      </button>
                      <button 
                        onClick={() => updateUserRole(u.uid, !u.isAdmin)}
                        className="p-2 bg-slate-50 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-slate-400 hover:text-rose-600 rounded-xl transition-all"
                        title={u.isAdmin ? t.removeAdmin : t.setAdmin}
                      >
                        <ShieldAlert className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => updateUserVip(u.uid, !u.isVip)}
                        className="p-2 bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-slate-400 hover:text-indigo-600 rounded-xl transition-all"
                        title={u.isVip ? t.removeVip : t.makeVip}
                      >
                        <Star className={`w-4 h-4 ${u.isVip ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {alertasList.length > 0 ? alertasList.map((alerta, idx) => (
          <div key={`admin-alert-${alerta.id || `idx-${idx}-${alerta.timestamp}`}`} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${
                  alerta.gravidade === 'Crítica' ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400' : 
                  alerta.gravidade === 'Alta' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' : 
                  'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                }`}>
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">{alerta.tipo}</h3>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">{new Date(alerta.timestamp).toLocaleString()}</p>
                </div>
              </div>
              <select 
                value={alerta.status}
                onChange={(e) => updateAlertaStatus(alerta.id!, e.target.value)}
                className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-lg border-2 transition-all ${
                  alerta.status === 'Pendente' ? 'border-rose-200 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20' :
                  alerta.status === 'Em Atendimento' ? 'border-amber-200 dark:border-amber-900/30 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20' :
                  'border-emerald-200 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20'
                }`}
              >
                <option value="Pendente">Pendente</option>
                <option value="Em Atendimento">Em Atendimento</option>
                <option value="Resolvido">Resolvido</option>
              </select>
            </div>

            <div className="space-y-3">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed italic">"{alerta.transcricao}"</p>
              </div>
              
              {alerta.sons_fundo && (
                <div className="flex items-start gap-2">
                  <Mic className="w-4 h-4 text-slate-400 dark:text-slate-500 mt-0.5" />
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{alerta.sons_fundo}</p>
                </div>
              )}

              {alerta.analise_ia_audio && (
                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 space-y-2">
                  <div className="flex items-center gap-2">
                    <Zap className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Análise IA</span>
                  </div>
                  <p className="text-[10px] text-indigo-900 dark:text-indigo-200 leading-relaxed">{alerta.analise_ia_audio}</p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">{alerta.userEmail || 'Usuário Anônimo'}</span>
              </div>
              <button 
                onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${alerta.uid}`, '_blank')}
                className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase flex items-center gap-1 hover:underline"
              >
                <MapPin className="w-3 h-3" /> Ver Localização
              </button>
            </div>
          </div>
        )) : (
          <div className="bg-white dark:bg-slate-900 p-12 rounded-[40px] text-center border border-slate-100 dark:border-slate-800">
            <ShieldAlert className="w-12 h-12 text-slate-200 dark:text-slate-800 mx-auto mb-4" />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Nenhum alerta pendente</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};
