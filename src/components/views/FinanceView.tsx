
import React from 'react';
import { motion } from 'motion/react';
import { 
  Briefcase, ArrowUpCircle, Edit2, Trash2, PlusCircle, 
  AlertCircle, ShoppingBag, Search, Clock, RefreshCw, 
  BarChart3, Sparkles, ChevronLeft, Copy, Check
} from 'lucide-react';
import Markdown from 'react-markdown';
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer 
} from 'recharts';
import { ProGuard } from '../Common';
import { 
  Income, Expense, Debt, FinancialProject, UserProfile, Language 
} from '../../types';

interface FinanceViewProps {
  t: any;
  language: Language;
  setView: (v: any) => void;
  formatCurrency: (v: number, l: string) => string;
  expenses: Expense[];
  incomes: Income[];
  debts: Debt[];
  newIncome: any;
  setNewIncome: (v: any) => void;
  addIncome: (v: any) => void;
  updateIncome: (id: string, v: any) => void;
  deleteIncome: (id: string) => void;
  editingIncome: Income | null;
  setEditingIncome: (v: Income | null) => void;
  newExpense: any;
  setNewExpense: (v: any) => void;
  addExpense: (v: any) => void;
  updateExpense: (id: string, v: any) => void;
  deleteExpense: (id: string) => void;
  editingExpense: Expense | null;
  setEditingExpense: (v: Expense | null) => void;
  newDebt: any;
  setNewDebt: (v: any) => void;
  addDebt: (v: any) => void;
  updateDebt: (id: string, v: any) => void;
  deleteDebt: (id: string) => void;
  editingDebt: Debt | null;
  setEditingDebt: (v: Debt | null) => void;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  setShowCheckout: (v: boolean) => void;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  searchProduct: () => void;
  isSearchingProduct: boolean;
  productSearchResult: string | null;
  setProductSearchResult: (v: string | null) => void;
  financingOptions: any[];
  searchFinancingRates: () => void;
  isSearchingRates: boolean;
  isGeneratingProject: boolean;
  generateFinancialProject: () => void;
  financialProject: FinancialProject | null;
}

export const FinanceView: React.FC<FinanceViewProps> = ({
  t, language, setView, formatCurrency, expenses, debts, incomes,
  newIncome, setNewIncome, addIncome, updateIncome, deleteIncome, editingIncome, setEditingIncome,
  newExpense, setNewExpense, addExpense, updateExpense, deleteExpense, editingExpense, setEditingExpense,
  newDebt, setNewDebt, addDebt, updateDebt, deleteDebt, editingDebt, setEditingDebt,
  userProfile, isAdmin, setShowCheckout,
  searchQuery, setSearchQuery, searchProduct, isSearchingProduct, productSearchResult, setProductSearchResult,
  financingOptions, searchFinancingRates, isSearchingRates,
  isGeneratingProject, generateFinancialProject, financialProject
}) => {
  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = () => {
    if (productSearchResult) {
      navigator.clipboard.writeText(productSearchResult);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <motion.div key="financeiro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">{t.financial}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t.financialDescription}</p>
        </div>
        <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-2xl">
          <Briefcase className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Income Registration (Free) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-800 space-y-6">
          <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <ArrowUpCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> {editingIncome ? t.edit : t.addIncome}
          </h3>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.description}</label>
              <input 
                type="text" 
                value={editingIncome ? editingIncome.descricao : newIncome.descricao}
                onChange={(e) => editingIncome ? setEditingIncome({...editingIncome, descricao: e.target.value}) : setNewIncome({...newIncome, descricao: e.target.value})}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs font-medium focus:ring-2 focus:ring-emerald-500 transition-all dark:text-slate-100"
                placeholder="Ex: Salário, Freelance"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.value}</label>
                <input 
                  type="number" 
                  value={editingIncome ? editingIncome.valor : newIncome.valor}
                  onChange={(e) => editingIncome ? setEditingIncome({...editingIncome, valor: parseFloat(e.target.value) || 0}) : setNewIncome({...newIncome, valor: parseFloat(e.target.value) || 0})}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs font-medium focus:ring-2 focus:ring-emerald-500 transition-all dark:text-slate-100"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.category}</label>
                <select 
                  value={editingIncome ? editingIncome.categoria : newIncome.categoria}
                  onChange={(e) => editingIncome ? setEditingIncome({...editingIncome, categoria: e.target.value as any}) : setNewIncome({...newIncome, categoria: e.target.value as any})}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs font-medium focus:ring-2 focus:ring-emerald-500 transition-all dark:text-slate-100"
                >
                  <option value="Fixa">{t.fixed}</option>
                  <option value="Variável">{t.variable}</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  if (editingIncome) {
                    updateIncome(editingIncome.id, editingIncome);
                  } else {
                    addIncome(newIncome);
                    setNewIncome({ descricao: '', valor: 0, categoria: 'Variável', data: new Date().toISOString().split('T')[0] });
                  }
                }}
                className="flex-1 py-3 bg-emerald-600 dark:bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-all"
              >
                {editingIncome ? t.update : t.save}
              </button>
              {editingIncome && (
                <button 
                  onClick={() => setEditingIncome(null)}
                  className="px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                >
                  {t.cancel}
                </button>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">{t.recentIncomes}</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
              {incomes.map((inc, idx) => (
                <div key={`income-${inc.id || `idx-${idx}-${inc.descricao}`}`} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 group">
                  <div className="flex-1">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{inc.descricao}</p>
                    <p className="text-[8px] text-slate-400 uppercase font-black">{inc.categoria}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-xs font-black text-emerald-600 dark:text-emerald-400 whitespace-nowrap">{formatCurrency(inc.valor, language)}</p>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setEditingIncome(inc)} className="p-1 text-slate-400 hover:text-indigo-500 transition-colors">
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button onClick={() => deleteIncome(inc.id)} className="p-1 text-slate-400 hover:text-rose-500 transition-colors">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {incomes.length === 0 && (
                <p className="text-[10px] text-slate-400 italic">{t.noIncomes}</p>
              )}
            </div>
          </div>
        </div>

        {/* Expense Registration (Free) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-800 space-y-6">
          <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <PlusCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> {editingExpense ? t.edit : t.addExpense}
          </h3>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.description}</label>
              <input 
                type="text" 
                value={editingExpense ? editingExpense.descricao : newExpense.descricao}
                onChange={(e) => editingExpense ? setEditingExpense({...editingExpense, descricao: e.target.value}) : setNewExpense({...newExpense, descricao: e.target.value})}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs font-medium focus:ring-2 focus:ring-emerald-500 transition-all dark:text-slate-100"
                placeholder="Ex: Aluguel, Supermercado"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.value}</label>
                <input 
                  type="number" 
                  value={editingExpense ? editingExpense.valor : newExpense.valor}
                  onChange={(e) => editingExpense ? setEditingExpense({...editingExpense, valor: parseFloat(e.target.value) || 0}) : setNewExpense({...newExpense, valor: parseFloat(e.target.value) || 0})}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs font-medium focus:ring-2 focus:ring-emerald-500 transition-all dark:text-slate-100"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.category}</label>
                <select 
                  value={editingExpense ? editingExpense.categoria : newExpense.categoria}
                  onChange={(e) => editingExpense ? setEditingExpense({...editingExpense, categoria: e.target.value as any}) : setNewExpense({...newExpense, categoria: e.target.value as any})}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs font-medium focus:ring-2 focus:ring-emerald-500 transition-all dark:text-slate-100"
                >
                  <option value="Fixa">{t.fixed}</option>
                  <option value="Variável">{t.variable}</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  if (editingExpense) {
                    updateExpense(editingExpense.id, editingExpense);
                  } else {
                    addExpense(newExpense);
                    setNewExpense({ 
                      descricao: '', 
                      valor: 0, 
                      categoria: 'Variável',
                      data: new Date().toISOString().split('T')[0],
                      tipo: 'variavel'
                    });
                  }
                }}
                className="flex-1 py-3 bg-emerald-600 dark:bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-all"
              >
                {editingExpense ? t.update : t.save}
              </button>
              {editingExpense && (
                <button 
                  onClick={() => setEditingExpense(null)}
                  className="px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                >
                  {t.cancel}
                </button>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">{t.recentExpenses}</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
              {expenses.map((exp, idx) => (
                <div key={`expense-${exp.id || `idx-${idx}-${exp.descricao}`}`} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 group">
                  <div className="flex-1">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{exp.descricao}</p>
                    <p className="text-[8px] text-slate-400 uppercase font-black">{exp.categoria}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-xs font-black text-emerald-600 dark:text-emerald-400 whitespace-nowrap">{formatCurrency(exp.valor, language)}</p>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setEditingExpense(exp)} className="p-1 text-slate-400 hover:text-indigo-500 transition-colors">
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button onClick={() => deleteExpense(exp.id)} className="p-1 text-slate-400 hover:text-rose-500 transition-colors">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Debt Registration (PRO) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-800 space-y-6">
          <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" /> {editingDebt ? t.edit : t.addDebt}
          </h3>
          <ProGuard isPro={userProfile?.plan === 'pro' || userProfile?.isVip === true || isAdmin} t={t} setShowCheckout={setShowCheckout}>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.creditor}</label>
                <input 
                  type="text" 
                  value={editingDebt ? editingDebt.credor : newDebt.credor}
                  onChange={(e) => editingDebt ? setEditingDebt({...editingDebt, credor: e.target.value}) : setNewDebt({...newDebt, credor: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs font-medium focus:ring-2 focus:ring-rose-500 transition-all dark:text-slate-100"
                  placeholder="Ex: Banco X, Cartão Y"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.value}</label>
                  <input 
                    type="number" 
                    value={editingDebt ? editingDebt.valorTotal : newDebt.valorTotal}
                    onChange={(e) => editingDebt ? setEditingDebt({...editingDebt, valorTotal: parseFloat(e.target.value) || 0}) : setNewDebt({...newDebt, valorTotal: parseFloat(e.target.value) || 0})}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs font-medium focus:ring-2 focus:ring-rose-500 transition-all dark:text-slate-100"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.interestRate} (%)</label>
                  <input 
                    type="number" 
                    value={editingDebt ? editingDebt.taxaJuros : newDebt.taxaJuros}
                    onChange={(e) => editingDebt ? setEditingDebt({...editingDebt, taxaJuros: parseFloat(e.target.value) || 0}) : setNewDebt({...newDebt, taxaJuros: parseFloat(e.target.value) || 0})}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs font-medium focus:ring-2 focus:ring-rose-500 transition-all dark:text-slate-100"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    if (editingDebt) {
                      updateDebt(editingDebt.id, editingDebt);
                    } else {
                      addDebt(newDebt);
                      setNewDebt({ credor: '', valorTotal: 0, taxaJuros: 0, vencimento: new Date().toISOString().split('T')[0] });
                    }
                  }}
                  className="flex-1 py-3 bg-rose-600 dark:bg-rose-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-700 dark:hover:bg-rose-600 transition-all"
                >
                  {editingDebt ? t.update : t.save}
                </button>
                {editingDebt && (
                  <button 
                    onClick={() => setEditingDebt(null)}
                    className="px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                  >
                    {t.cancel}
                  </button>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">{t.recentDebts}</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {debts.map((debt, idx) => (
                  <div key={`debt-${debt.id || `idx-${idx}-${debt.credor}`}`} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 group">
                    <div className="flex-1">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{debt.credor}</p>
                      <p className="text-[8px] text-slate-400 uppercase font-black">{debt.taxaJuros}% a.m.</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-xs font-black text-rose-600 dark:text-rose-400 whitespace-nowrap">{formatCurrency(debt.valorTotal, language)}</p>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setEditingDebt(debt)} className="p-1 text-slate-400 hover:text-indigo-500 transition-colors">
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button onClick={() => deleteDebt(debt.id)} className="p-1 text-slate-400 hover:text-rose-500 transition-colors">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ProGuard>
        </div>

        {/* Smart Product Search (PRO) */}
        <ProGuard isPro={userProfile?.plan === 'pro' || userProfile?.isVip === true || isAdmin} t={t} setShowCheckout={setShowCheckout}>
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-800 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Busca Inteligente Preços e Produtos
              </h3>
              <span className="px-2 py-1 bg-amber-100 text-amber-700 text-[8px] font-black rounded uppercase tracking-widest">PRO</span>
            </div>
            
            <div className="flex gap-2">
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchProduct()}
                placeholder={t.searchPlaceholder}
                className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs font-medium focus:ring-2 focus:ring-indigo-500 transition-all dark:text-slate-100"
              />
              <button 
                onClick={searchProduct}
                disabled={isSearchingProduct || !searchQuery?.trim()}
                className="px-6 py-3 bg-indigo-600 dark:bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {isSearchingProduct ? <Clock className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              </button>
            </div>

            {isSearchingProduct && (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                <p className="text-xs font-bold text-slate-500 animate-pulse">{t.searching}</p>
              </div>
            )}

            {productSearchResult && !isSearchingProduct && (
              <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
                <div className="prose prose-slate prose-xs dark:prose-invert max-w-none relative">
                  <button 
                    onClick={copyToClipboard}
                    className="absolute top-0 right-0 p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                    title="Copiar para área de transferência"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <Markdown>{productSearchResult}</Markdown>
                </div>
                <div className="flex justify-end">
                  <button 
                    onClick={() => setProductSearchResult(null)}
                    className="text-[10px] font-black text-slate-400 uppercase hover:text-slate-600 transition-colors"
                  >
                    Limpar
                  </button>
                </div>
              </div>
            )}
          </div>
        </ProGuard>
      </div>

      {/* Expense Consolidation (PRO) */}
      <ProGuard isPro={userProfile?.plan === 'pro' || userProfile?.isVip === true || isAdmin} t={t} setShowCheckout={setShowCheckout}>
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-800 space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> {t.consolidatedExpenses}
            </h3>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: t.fixed, value: expenses.filter(e => e.categoria === 'Fixa').reduce((acc, curr) => acc + curr.valor, 0) },
                      { name: t.variable, value: expenses.filter(e => e.categoria === 'Variável').reduce((acc, curr) => acc + curr.valor, 0) },
                      { name: t.addIncome, value: incomes.reduce((acc, curr) => acc + curr.valor, 0) }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    <Cell key="cell-income" fill="#10b981" />
                    <Cell key="cell-expense-fixed" fill="#f59e0b" />
                    <Cell key="cell-expense-variable" fill="#6366f1" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4 flex flex-col justify-center">
              <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">{t.addIncome}</span>
                <span className="text-lg font-black text-emerald-900 dark:text-emerald-100">
                  {formatCurrency(incomes.reduce((acc, curr) => acc + curr.valor, 0), language)}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{t.fixed}</span>
                </div>
                <span className="text-sm font-black text-slate-900 dark:text-slate-100">
                  {formatCurrency(expenses.filter(e => e.categoria === 'Fixa').reduce((acc, curr) => acc + curr.valor, 0), language)}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{t.variable}</span>
                </div>
                <span className="text-sm font-black text-slate-900 dark:text-slate-100">
                  {formatCurrency(expenses.filter(e => e.categoria === 'Variável').reduce((acc, curr) => acc + curr.valor, 0), language)}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
                <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">{t.total}</span>
                <span className="text-lg font-black text-indigo-900 dark:text-indigo-100">
                  {formatCurrency(incomes.reduce((acc, curr) => acc + curr.valor, 0) - expenses.reduce((acc, curr) => acc + curr.valor, 0), language)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Financing Search & AI Project (PRO) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-800 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Search className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> {t.bestRates}
              </h3>
              <button 
                onClick={searchFinancingRates}
                disabled={isSearchingRates || debts.length === 0}
                className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all disabled:opacity-50"
              >
                {isSearchingRates ? <Clock className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              </button>
            </div>
            <div className="space-y-3">
              {financingOptions.length > 0 ? financingOptions.map((opt, i) => (
                <div key={`financing-opt-${opt.bank}-${i}`} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black text-slate-800 dark:text-slate-200">{opt.bank}</span>
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">{opt.rate}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{opt.conditions}</p>
                </div>
              )) : (
                <p className="text-xs text-slate-400 dark:text-slate-500 italic">{t.noRatesFound}</p>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-800 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" /> {t.financialHealthPlan}
              </h3>
              <button 
                onClick={generateFinancialProject}
                disabled={isGeneratingProject || expenses.length === 0}
                className="px-4 py-2 bg-amber-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-600 transition-all disabled:opacity-50"
              >
                {isGeneratingProject ? t.analyzing : t.generatePlan}
              </button>
            </div>
            
            {financialProject ? (
              <div className="space-y-4">
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-100 dark:border-amber-900/30">
                  <p className="text-xs text-amber-900 dark:text-amber-100 leading-relaxed font-medium">{financialProject.plano}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.tips}</p>
                  <div className="flex flex-wrap gap-2">
                    {financialProject.dicas.map((dica, i) => (
                      <span key={`financial-tip-${i}`} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-[10px] font-bold">{dica}</span>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.goals}</p>
                  <div className="space-y-2">
                    {financialProject.metas.map((meta, i) => (
                      <div key={`financial-goal-${i}`} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">{meta}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center justify-center mx-auto">
                  <Sparkles className="w-8 h-8 text-amber-500" />
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500 italic">{t.noProjectFound}</p>
              </div>
            )}
          </div>
        </div>
      </ProGuard>
    </motion.div>
  );
};
