
import React, { useState, useEffect, useRef } from 'react';
import { 
  collection, addDoc, onSnapshot, query, orderBy, where,
  updateDoc, doc, deleteDoc, serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import { FinanceView } from './views/FinanceView';
import { 
  Income, Expense, Debt, FinancialProject, UserProfile, Language, OperationType 
} from '../types';
import { GoogleGenAI } from "@google/genai";

interface FinanceiroModuleProps {
  user: any;
  t: any;
  language: Language;
  formatCurrency: (v: number, l: string) => string;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  setShowCheckout: (v: boolean) => void;
  genAI: GoogleGenAI;
  handleFirestoreError: (error: unknown, operationType: OperationType, path: string | null) => void;
  onDataChange?: (data: { expenses: Expense[]; incomes: Income[]; debts: Debt[] }) => void;
  showUI?: boolean;
  setView: (v: any) => void;
}

export const FinanceiroModule: React.FC<FinanceiroModuleProps> = ({
  user, t, language, formatCurrency, userProfile, isAdmin, setShowCheckout, genAI, handleFirestoreError, onDataChange, showUI = true, setView
}) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [financialProject, setFinancialProject] = useState<FinancialProject | null>(null);

  const [newIncome, setNewIncome] = useState({ descricao: '', valor: 0, categoria: 'Variável', data: new Date().toISOString().split('T')[0] });
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  
  const [newExpense, setNewExpense] = useState({ 
    descricao: '', 
    valor: 0, 
    categoria: 'Variável', 
    data: new Date().toISOString().split('T')[0],
    tipo: 'variavel'
  });
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  
  const [newDebt, setNewDebt] = useState({ credor: '', valorTotal: 0, taxaJuros: 0, vencimento: new Date().toISOString().split('T')[0] });
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchingProduct, setIsSearchingProduct] = useState(false);
  const [productSearchResult, setProductSearchResult] = useState<string | null>(null);
  const [isSearchingRates, setIsSearchingRates] = useState(false);
  const [financingOptions, setFinancingOptions] = useState<any[]>([]);
  const [isGeneratingProject, setIsGeneratingProject] = useState(false);

  useEffect(() => {
    if (!user) return;

    const qExpenses = query(collection(db, 'gastos'), where('uid', '==', user.uid), orderBy('timestamp', 'desc'));
    const unsubExpenses = onSnapshot(qExpenses, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Expense));
      setExpenses(data);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'gastos'));

    const qIncomes = query(collection(db, 'receitas'), where('uid', '==', user.uid), orderBy('timestamp', 'desc'));
    const unsubIncomes = onSnapshot(qIncomes, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Income));
      setIncomes(data);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'receitas'));

    const qDebts = query(collection(db, 'dividas'), where('uid', '==', user.uid), orderBy('timestamp', 'desc'));
    const unsubDebts = onSnapshot(qDebts, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Debt));
      setDebts(data);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'dividas'));

    const qProject = query(collection(db, 'projetos_financeiros'), where('uid', '==', user.uid), orderBy('timestamp', 'desc'));
    const unsubProject = onSnapshot(qProject, (snapshot) => {
      if (!snapshot.empty) {
        setFinancialProject({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as FinancialProject);
      }
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'projetos_financeiros'));

    return () => {
      unsubExpenses();
      unsubIncomes();
      unsubDebts();
      unsubProject();
    };
  }, [user]);

  const lastDataRef = useRef<string>('');

  // Functions
  const addIncome = React.useCallback(async (income: Omit<Income, 'id' | 'uid' | 'timestamp'>) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'receitas'), {
        ...income,
        uid: user.uid,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'receitas');
    }
  }, [user, handleFirestoreError]);

  const updateIncome = React.useCallback(async (id: string, income: Partial<Income>) => {
    try {
      const { id: _, ...data } = income as any;
      await updateDoc(doc(db, 'receitas', id), data);
      setEditingIncome(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'receitas');
    }
  }, [handleFirestoreError]);

  const deleteIncome = React.useCallback(async (id: string) => {
    try {
      await deleteDoc(doc(db, 'receitas', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'receitas');
    }
  }, [handleFirestoreError]);

  const addExpense = React.useCallback(async (expense: Omit<Expense, 'id' | 'uid' | 'timestamp'>) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'gastos'), {
        ...expense,
        uid: user.uid,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'gastos');
    }
  }, [user, handleFirestoreError]);

  const updateExpense = React.useCallback(async (id: string, expense: Partial<Expense>) => {
    try {
      const { id: _, ...data } = expense as any;
      await updateDoc(doc(db, 'gastos', id), data);
      setEditingExpense(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'gastos');
    }
  }, [handleFirestoreError]);

  const deleteExpense = React.useCallback(async (id: string) => {
    try {
      await deleteDoc(doc(db, 'gastos', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'gastos');
    }
  }, [handleFirestoreError]);

  const addDebt = React.useCallback(async (debt: Omit<Debt, 'id' | 'uid' | 'timestamp'>) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'dividas'), {
        ...debt,
        uid: user.uid,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'dividas');
    }
  }, [user, handleFirestoreError]);

  const updateDebt = React.useCallback(async (id: string, debt: Partial<Debt>) => {
    try {
      const { id: _, ...data } = debt as any;
      await updateDoc(doc(db, 'dividas', id), data);
      setEditingDebt(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'dividas');
    }
  }, [handleFirestoreError]);

  const deleteDebt = React.useCallback(async (id: string) => {
    try {
      await deleteDoc(doc(db, 'dividas', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'dividas');
    }
  }, [handleFirestoreError]);

  const searchProduct = React.useCallback(async () => {
    if (!searchQuery?.trim()) return;
    setIsSearchingProduct(true);
    try {
      let locationContext = "Santos/SP"; // Fallback
      
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
        });
        const { latitude, longitude } = position.coords;
        locationContext = `latitude ${latitude}, longitude ${longitude}`;
      } catch (geoError) {
        console.warn("Geolocation failed, using fallback:", geoError);
      }

      const prompt = `Como um assistente de compras inteligente, pesquise o melhor preço online e uma opção local próxima a ${locationContext} para o produto: "${searchQuery}". Forneça links (se possível) e uma breve comparação de custo-benefício. Responda em Markdown em português.`;
      
      const response = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt
      });
      setProductSearchResult(response.text || "Nenhum resultado encontrado.");
    } catch (error) {
      console.error("Erro na busca de produto:", error);
    } finally {
      setIsSearchingProduct(false);
    }
  }, [searchQuery, genAI]);

  const generateFinancialProject = React.useCallback(async () => {
    if (!user || expenses.length === 0) return;
    setIsGeneratingProject(true);
    try {
      const prompt = `Com base nos seguintes dados financeiros:
      Gastos: ${JSON.stringify(expenses)}
      Incomes: ${JSON.stringify(incomes)}
      Dívidas: ${JSON.stringify(debts)}
      
      Gere um plano de saúde financeira personalizado. Retorne APENAS um JSON no formato:
      {
        "plano": "string com a descrição do plano",
        "dicas": ["string", "string"],
        "metas": ["string", "string"]
      }`;
      
      const response = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt
      });
      const text = (response.text || "").replace(/```json|```/g, '').trim();
      const projectData = JSON.parse(text);
      
      await addDoc(collection(db, 'projetos_financeiros'), {
        ...projectData,
        uid: user.uid,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error("Erro ao gerar projeto financeiro:", error);
    } finally {
      setIsGeneratingProject(false);
    }
  }, [user, expenses, incomes, debts, genAI]);

  const searchFinancingRates = React.useCallback(async () => {
    if (!user || debts.length === 0) return;
    setIsSearchingRates(true);
    try {
      const prompt = `Com base nestas dívidas: ${JSON.stringify(debts)}, pesquise as melhores taxas de financiamento e consolidação de dívidas atualmente no mercado brasileiro. Retorne APENAS um JSON no formato:
      [
        {"bank": "Nome do Banco", "rate": "X% a.m.", "conditions": "Descrição breve"}
      ]`;
      
      const response = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt
      });
      const text = (response.text || "").replace(/```json|```/g, '').trim();
      setFinancingOptions(JSON.parse(text));
    } catch (error) {
      console.error("Erro ao buscar taxas:", error);
    } finally {
      setIsSearchingRates(false);
    }
  }, [user, debts, genAI]);

  // Sync Data with App.tsx
  useEffect(() => {
    if (onDataChange) {
      const dataToSync = { 
        expenses, 
        incomes, 
        debts,
        addIncome,
        updateIncome,
        deleteIncome,
        addExpense,
        updateExpense,
        deleteExpense,
        addDebt,
        updateDebt,
        deleteDebt,
        generateFinancialProject,
        searchFinancingRates
      };
      
      const dataString = JSON.stringify({ expenses, incomes, debts });
      
      if (dataString !== lastDataRef.current) {
        lastDataRef.current = dataString;
        onDataChange(dataToSync);
      }
    }
  }, [
    expenses, incomes, debts, onDataChange, addIncome, updateIncome, 
    deleteIncome, addExpense, updateExpense, deleteExpense, addDebt, 
    updateDebt, deleteDebt, generateFinancialProject, searchFinancingRates
  ]);

  if (!showUI) return null;

  return (
    <FinanceView 
      t={t}
      language={language}
      setView={setView}
      formatCurrency={formatCurrency}
      expenses={expenses}
      incomes={incomes}
      debts={debts}
      newIncome={newIncome}
      setNewIncome={setNewIncome}
      addIncome={addIncome}
      updateIncome={updateIncome}
      deleteIncome={deleteIncome}
      editingIncome={editingIncome}
      setEditingIncome={setEditingIncome}
      newExpense={newExpense}
      setNewExpense={setNewExpense}
      addExpense={addExpense}
      updateExpense={updateExpense}
      deleteExpense={deleteExpense}
      editingExpense={editingExpense}
      setEditingExpense={setEditingExpense}
      newDebt={newDebt}
      setNewDebt={setNewDebt}
      addDebt={addDebt}
      updateDebt={updateDebt}
      deleteDebt={deleteDebt}
      editingDebt={editingDebt}
      setEditingDebt={setEditingDebt}
      userProfile={userProfile}
      isAdmin={isAdmin}
      setShowCheckout={setShowCheckout}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      searchProduct={searchProduct}
      isSearchingProduct={isSearchingProduct}
      productSearchResult={productSearchResult}
      setProductSearchResult={setProductSearchResult}
      financingOptions={financingOptions}
      searchFinancingRates={searchFinancingRates}
      isSearchingRates={isSearchingRates}
      isGeneratingProject={isGeneratingProject}
      generateFinancialProject={generateFinancialProject}
      financialProject={financialProject}
    />
  );
};
