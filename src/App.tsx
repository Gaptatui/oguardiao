/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { 
  ShieldAlert, ShieldCheck, ShieldQuestion, Send, AlertTriangle, 
  Info, History, Trash2, Mic, FileAudio, LayoutDashboard, 
  User, LogIn, LogOut, Bell, Clock, MapPin, Activity, Car,
  Heart, Zap, Users, Navigation, QrCode, Pill, Briefcase,
  Search, Plus, CheckCircle2, XCircle, AlertCircle, ChevronRight, ChevronLeft,
  ExternalLink, Clapperboard, ShoppingBag, Theater, Beer, Utensils,
  ShoppingBasket, Store, Menu, Star, Moon, Sun, HelpCircle,
  PlusCircle, BarChart3, RefreshCw, Sparkles, Edit2, Edit,
  ArrowUpCircle
} from 'lucide-react';
import Markdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import { 
  signInWithPopup, GoogleAuthProvider, onAuthStateChanged, 
  User as FirebaseUser, signOut 
} from 'firebase/auth';
import { 
  collection, addDoc, onSnapshot, query, orderBy, where,
  limit, updateDoc, doc, setDoc, getDoc, Timestamp,
  serverTimestamp, deleteDoc, getDocs, writeBatch
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { QRCodeCanvas } from 'qrcode.react';

import { translations } from './translations';

// Initialize Gemini API
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

import { parseDistance, formatDate, formatCurrency, cn } from './lib/utils';

import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, Legend 
} from 'recharts';

import { 
  Language, AnalysisResult, Alerta, NeighborAlert, HealthProfile, 
  Medication, TalentService, Device, UserProfile, Transaction, 
  UsageLog, Expense, Debt, Income,
  OperationType, FirestoreErrorInfo 
} from './types';


import { PLAN_CONFIG, RISK_ZONES } from './constants';
import { WelcomeModal } from './components/WelcomeModal';
import { CheckoutModal } from './components/CheckoutModal';
import { AdminModule } from './components/AdminModule';
import { ShortcutSuggestionModal } from './components/ShortcutSuggestionModal';
import { PermissionGuideModal } from './components/PermissionGuideModal';
import { MedicationAlarmModal } from './components/MedicationAlarmModal';
import { ProGuard, ErrorBoundary } from './components/Common';
import { FinanceiroModule } from './components/FinanceiroModule';
import { SaudeModule } from './components/SaudeModule';
import { SegurancaModule } from './components/SegurancaModule';
import { LazerModule } from './components/LazerModule';
import { MobilidadeModule } from './components/MobilidadeModule';
import { ConfiguracaoModule } from './components/ConfiguracaoModule';
import { DashboardView } from './components/views/DashboardView';
import { EmergencyView } from './components/views/EmergencyView';
import { HealthView } from './components/views/HealthView';
import { ScamView } from './components/views/ScamView';
import { SettingsView } from './components/views/SettingsView';

export default function App() {
  const [view, setView] = useState<'DASHBOARD' | 'SCAM' | 'EMERGENCY' | 'PAINEL' | 'SETTINGS' | 'FINANCEIRO' | 'SAUDE'>('DASHBOARD');
  const [language, setLanguage] = useState<Language>('pt');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('guardian-theme');
    return (saved as 'light' | 'dark') || 'light';
  });
  const t = translations[language];

  // Global State
  const [toast, setToast] = useState<{ message: string; type: 'info' | 'success' | 'error' } | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ title: string; message: string; onConfirm: () => void; onCancel: () => void } | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [isProcessingPurchase, setIsProcessingPurchase] = useState(false);
  const [showWelcome, setShowWelcome] = useState(() => !localStorage.getItem('guardian-welcome-seen'));
  const [showShortcutSuggestion, setShowShortcutSuggestion] = useState(false);
  const [showPermissionGuide, setShowPermissionGuide] = useState(false);
  const [showBirthdayModal, setShowBirthdayModal] = useState(false);
  const [hasShownBirthdayMessage, setHasShownBirthdayMessage] = useState(false);
  const [showSignLanguage, setShowSignLanguage] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [os, setOs] = useState<'ios' | 'android' | 'other'>('other');
  const [fontSizeMultiplier, setFontSizeMultiplier] = useState(() => {
    const saved = localStorage.getItem('guardian-font-size');
    return saved ? parseFloat(saved) : 1;
  });

  // Module Data (Separated for better performance)
  const [medications, setMedications] = useState<Medication[]>([]);
  const [neighborAlerts, setNeighborAlerts] = useState<NeighborAlert[]>([]);
  const [pharmacies, setPharmacies] = useState<any[]>([]);
  const [healthUnitsList, setHealthUnitsList] = useState<any[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [heartRate, setHeartRate] = useState(72);
  const [healthTab, setHealthTab] = useState<'PHARMACIES' | 'UNITS'>('PHARMACIES');
  const [isFetchingPharmacies, setIsFetchingPharmacies] = useState(false);
  const [isFetchingUnits, setIsFetchingUnits] = useState(false);

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);

  const [emergencyContacts, setEmergencyContacts] = useState<any[]>([]);
  const [allowContactLocation, setAllowContactLocation] = useState(false);
  const [contactAccessPermission, setContactAccessPermission] = useState(false);
  const [panicActive, setPanicActive] = useState(false);

  const [leisureList, setLeisureList] = useState<any[]>([]);
  const [leisureCategory, setLeisureCategory] = useState('cinema');
  const [leisureSubCategory, setLeisureSubCategory] = useState('');
  const [isFetchingLeisure, setIsFetchingLeisure] = useState(false);

  const [carLocation, setCarLocation] = useState<any>(null);
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [safeRouteSuggestion, setSafeRouteSuggestion] = useState<string | null>(null);
  const [mapUrl, setMapUrl] = useState<string | null>(null);

  const [isWalking, setIsWalking] = useState(false);
  const [activeAlarmMedication, setActiveAlarmMedication] = useState<Medication | null>(null);
  const [configuracaoData, setConfiguracaoData] = useState<any>({});

  // Module Actions
  const [healthActions, setHealthActions] = useState<any>({});
  const [financeiroActions, setFinanceiroActions] = useState<any>({});
  const [segurancaActions, setSegurancaActions] = useState<any>({});
  const [lazerActions, setLazerActions] = useState<any>({});
  const [mobilidadeActions, setMobilidadeActions] = useState<any>({});

  const panicTimer = useRef<NodeJS.Timeout | null>(null);

  // Auth State
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const isAdmin = user?.email === 'gersonproenca@gmail.com' || userProfile?.isAdmin === true;

  useEffect(() => {
    localStorage.setItem('guardian-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, [theme]);

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(ua);
    const isAndroid = /android/.test(ua);
    const isWindows = /windows/.test(ua);
    const isMac = /macintosh/.test(ua);
    const isLinux = /linux/.test(ua) && !isAndroid;
    const isDesktop = isWindows || isMac || isLinux;

    if (isIOS) setOs('ios');
    else if (isAndroid && !isDesktop) setOs('android');
    else setOs('other');
  }, []);

  useEffect(() => {
    if (user && isAuthReady) {
      const firstLogin = !localStorage.getItem(`guardian-shortcut-seen-${user.uid}`);
      if (firstLogin) {
        setShowShortcutSuggestion(true);
        setShowPermissionGuide(true);
        localStorage.setItem(`guardian-shortcut-seen-${user.uid}`, 'true');
      }
    }
  }, [user, isAuthReady]);

  useEffect(() => {
    if (showSignLanguage && language === 'pt') {
      const scriptId = 'vlibras-script';
      if (!document.getElementById(scriptId)) {
        const script = document.createElement('script');
        script.id = scriptId;
        script.src = 'https://vlibras.gov.br/app/vlibras-plugin.js';
        script.async = true;
        script.onload = () => {
          // @ts-ignore
          if (window.VLibras) {
            // @ts-ignore
            new window.VLibras.Widget('https://vlibras.gov.br/app');
          }
        };
        document.body.appendChild(script);
      }
    }
  }, [showSignLanguage, language]);

  useEffect(() => {
    localStorage.setItem('guardian-font-size', fontSizeMultiplier.toString());
    document.documentElement.style.fontSize = `${fontSizeMultiplier * 16}px`;
  }, [fontSizeMultiplier]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = React.useCallback((message: string, type: 'info' | 'success' | 'error' = 'info') => {
    setToast({ message, type });
  }, []);

  const closeWelcome = React.useCallback(() => {
    setShowWelcome(false);
    localStorage.setItem('guardian-welcome-seen', 'true');
  }, []);

  const handleFirestoreError = React.useCallback((error: unknown, operationType: OperationType, path: string | null) => {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isPermissionError = errorMessage.toLowerCase().includes('permission-denied') || 
                             errorMessage.toLowerCase().includes('insufficient permissions');

    const errInfo: FirestoreErrorInfo = {
      error: errorMessage,
      authInfo: {
        userId: auth.currentUser?.uid || 'unauthenticated',
        email: auth.currentUser?.email || 'none',
        emailVerified: auth.currentUser?.emailVerified || false,
        isAnonymous: auth.currentUser?.isAnonymous || false,
        tenantId: auth.currentUser?.tenantId || 'none',
        providerInfo: auth.currentUser?.providerData.map(provider => ({
          providerId: provider.providerId,
          displayName: provider.displayName || '',
          email: provider.email || '',
          photoUrl: provider.photoURL || ''
        })) || []
      },
      operationType,
      path
    }
    
    console.error('Firestore Error: ', JSON.stringify(errInfo));
    
    if (isPermissionError) {
      throw new Error(JSON.stringify(errInfo));
    } else {
      showToast(`Erro no Firestore (${operationType} em ${path}): ${errorMessage}`, 'error');
    }
  }, [showToast]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      try {
        if (u) {
          setUser(u);
          const userRef = doc(db, 'users', u.uid);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            setUserProfile(userSnap.data() as UserProfile);
          } else {
            // Create initial profile for new user
            const initialProfile: UserProfile = {
              uid: u.uid,
              email: u.email || '',
              name: u.displayName || '',
              plan: 'free',
              isAdmin: u.email === 'gersonproenca@gmail.com',
              isVip: false,
              timestamp: Date.now()
            };
            await setDoc(userRef, initialProfile);
            setUserProfile(initialProfile);
          }
        } else {
          setUser(null);
          setUserProfile({
            uid: 'guest',
            email: '',
            name: 'Convidado',
            plan: 'free',
            isAdmin: false,
            isVip: false,
            timestamp: Date.now()
          });
        }
      } catch (error) {
        console.error("Auth error:", error);
      } finally {
        setIsAuthReady(true);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (userProfile && userProfile.birthDay && userProfile.birthMonth && !hasShownBirthdayMessage) {
      const today = new Date();
      const day = today.getDate();
      const month = today.getMonth() + 1;
      if (userProfile.birthDay === day && userProfile.birthMonth === month) {
        setShowBirthdayModal(true);
        setHasShownBirthdayMessage(true);
      }
    }
  }, [userProfile, hasShownBirthdayMessage]);

  const upgradeToPro = React.useCallback(async (period: 'monthly' | 'yearly', method: 'card' | 'pix') => {
    if (!user) return;
    setIsProcessingPurchase(true);
    const userRef = doc(db, 'users', user.uid);
    const days = period === 'monthly' ? 30 : 365;
    const nextBilling = Date.now() + (days * 24 * 60 * 60 * 1000);
    const subData = {
      plan: 'pro' as 'free' | 'pro',
      subscriptionStatus: 'active' as 'active' | 'inactive' | 'past_due',
      subscriptionPeriod: period,
      nextBillingDate: nextBilling,
      paymentMethod: method === 'card' ? 'Cartão de Crédito (Visa **** 4242)' : 'Pix (QR Code)'
    };
    try {
      await updateDoc(userRef, subData);
      await addDoc(collection(db, 'transacoes'), {
        uid: user.uid,
        userEmail: user.email,
        valor: period === 'monthly' ? PLAN_CONFIG.monthly : PLAN_CONFIG.yearly,
        moeda: 'BRL',
        tipo: period === 'monthly' ? 'assinatura_mensal' : 'assinatura_anual',
        meioPagamento: method,
        status: 'concluido',
        timestamp: Date.now()
      });
      setUserProfile(prev => prev ? { ...prev, ...subData } : null);
      setIsProcessingPurchase(false);
      setShowCheckout(false);
      showToast(t.purchaseSuccess, "success");
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
      setIsProcessingPurchase(false);
    }
  }, [user, t.purchaseSuccess, showToast, handleFirestoreError]);

  const logModuleUsage = React.useCallback(async (modulo: UsageLog['modulo']) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'logs_uso'), {
        uid: user.uid,
        modulo,
        timestamp: Date.now()
      });
    } catch (err) {
      console.error("Error logging usage:", err);
    }
  }, [user]);

  const handleLogin = React.useCallback(async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) { 
      console.error("Login error:", error); 
      showToast("Erro ao fazer login. Tente novamente.", "error");
    }
  }, [showToast]);

  const toggleWalking = React.useCallback(() => {
    if (userProfile?.plan !== 'pro' && userProfile?.isVip !== true) {
      setShowCheckout(true);
      return;
    }
    if (!isWalking) logModuleUsage('rota_segura');
    setIsWalking(!isWalking);
  }, [userProfile, isWalking, logModuleUsage]);

  // Module Data Update Handlers
  const handleHealthDataChange = React.useCallback((data: any) => {
    if (data.medications) setMedications(prev => JSON.stringify(prev) !== JSON.stringify(data.medications) ? data.medications : prev);
    if (data.neighborAlerts) setNeighborAlerts(prev => JSON.stringify(prev) !== JSON.stringify(data.neighborAlerts) ? data.neighborAlerts : prev);
    if (data.heartRate !== undefined) setHeartRate(prev => prev !== data.heartRate ? data.heartRate : prev);
    if (data.devices) setDevices(prev => JSON.stringify(prev) !== JSON.stringify(data.devices) ? data.devices : prev);
    if (data.healthTab) setHealthTab(prev => prev !== data.healthTab ? data.healthTab : prev);
    if (data.isFetchingPharmacies !== undefined) setIsFetchingPharmacies(prev => prev !== data.isFetchingPharmacies ? data.isFetchingPharmacies : prev);
    if (data.isFetchingUnits !== undefined) setIsFetchingUnits(prev => prev !== data.isFetchingUnits ? data.isFetchingUnits : prev);
    if (data.pharmacies) setPharmacies(prev => JSON.stringify(prev) !== JSON.stringify(data.pharmacies) ? data.pharmacies : prev);
    if (data.healthUnitsList) setHealthUnitsList(prev => JSON.stringify(prev) !== JSON.stringify(data.healthUnitsList) ? data.healthUnitsList : prev);
    
    setHealthActions(prev => {
      const next = {
        fetchNearbyPharmacies: data.fetchNearbyPharmacies,
        fetchNearbyUnits: data.fetchNearbyUnits,
        simulateFall: data.simulateFall,
        removeDevice: data.removeDevice,
        updateDeviceInterval: data.updateDeviceInterval,
        setShowAddDevice: data.setShowAddDevice,
        handlePanicStart: data.handlePanicStart,
        handlePanicEnd: data.handlePanicEnd
      };
      // Simple check to avoid unnecessary state updates for functions
      // We check if the keys exist and are functions
      return prev.fetchNearbyPharmacies === next.fetchNearbyPharmacies && 
             prev.simulateFall === next.simulateFall ? prev : next;
    });
  }, []);

  const handleFinanceiroDataChange = React.useCallback((data: any) => {
    if (data.expenses) setExpenses(prev => JSON.stringify(prev) !== JSON.stringify(data.expenses) ? data.expenses : prev);
    if (data.incomes) setIncomes(prev => JSON.stringify(prev) !== JSON.stringify(data.incomes) ? data.incomes : prev);
    if (data.debts) setDebts(prev => JSON.stringify(prev) !== JSON.stringify(data.debts) ? data.debts : prev);
    
    setFinanceiroActions(prev => {
      const next = {
        addIncome: data.addIncome,
        updateIncome: data.updateIncome,
        deleteIncome: data.deleteIncome,
        addExpense: data.addExpense,
        updateExpense: data.updateExpense,
        deleteExpense: data.deleteExpense,
        addDebt: data.addDebt,
        updateDebt: data.updateDebt,
        deleteDebt: data.deleteDebt,
        generateFinancialProject: data.generateFinancialProject,
        searchFinancingRates: data.searchFinancingRates
      };
      return prev.addIncome === next.addIncome && prev.addExpense === next.addExpense ? prev : next;
    });
  }, []);

  const handleSegurancaDataChange = React.useCallback((data: any) => {
    if (data.emergencyContacts) setEmergencyContacts(prev => JSON.stringify(prev) !== JSON.stringify(data.emergencyContacts) ? data.emergencyContacts : prev);
    if (data.allowContactLocation !== undefined) setAllowContactLocation(prev => prev !== data.allowContactLocation ? data.allowContactLocation : prev);
    if (data.contactAccessPermission !== undefined) setContactAccessPermission(prev => prev !== data.contactAccessPermission ? data.contactAccessPermission : prev);
    if (data.panicActive !== undefined) setPanicActive(prev => prev !== data.panicActive ? data.panicActive : prev);

    setSegurancaActions(prev => {
      const next = {
        triggerPanic: data.triggerPanic,
        callEmergencyService: data.callEmergencyService,
        simulateScamNotification: data.simulateScamNotification,
        handlePanicStart: data.handlePanicStart,
        handlePanicEnd: data.handlePanicEnd
      };
      return prev.triggerPanic === next.triggerPanic && prev.handlePanicStart === next.handlePanicStart ? prev : next;
    });
  }, []);

  const handleLazerDataChange = React.useCallback((data: any) => {
    if (data.leisureList) setLeisureList(prev => JSON.stringify(prev) !== JSON.stringify(data.leisureList) ? data.leisureList : prev);
    if (data.leisureCategory) setLeisureCategory(prev => prev !== data.leisureCategory ? data.leisureCategory : prev);
    if (data.leisureSubCategory !== undefined) setLeisureSubCategory(prev => prev !== data.leisureSubCategory ? data.leisureSubCategory : prev);
    if (data.isFetchingLeisure !== undefined) setIsFetchingLeisure(prev => prev !== data.isFetchingLeisure ? data.isFetchingLeisure : prev);

    setLazerActions(prev => {
      const next = {
        fetchNearbyLeisure: data.fetchNearbyLeisure
      };
      return prev.fetchNearbyLeisure === next.fetchNearbyLeisure ? prev : next;
    });
  }, []);

  const handleMobilidadeDataChange = React.useCallback((data: any) => {
    if (data.carLocation !== undefined) setCarLocation(prev => JSON.stringify(prev) !== JSON.stringify(data.carLocation) ? data.carLocation : prev);
    if (data.origin !== undefined) setOrigin(prev => prev !== data.origin ? data.origin : prev);
    if (data.destination !== undefined) setDestination(prev => prev !== data.destination ? data.destination : prev);
    if (data.isCalculatingRoute !== undefined) setIsCalculatingRoute(prev => prev !== data.isCalculatingRoute ? data.isCalculatingRoute : prev);
    if (data.safeRouteSuggestion !== undefined) setSafeRouteSuggestion(prev => prev !== data.safeRouteSuggestion ? data.safeRouteSuggestion : prev);
    if (data.mapUrl !== undefined) setMapUrl(prev => prev !== data.mapUrl ? data.mapUrl : prev);

    setMobilidadeActions(prev => {
      const next = {
        saveCarLocation: data.saveCarLocation,
        openCarRoute: data.openCarRoute,
        getCurrentLocation: data.getCurrentLocation,
        calculateSafeRoute: data.calculateSafeRoute
      };
      return prev.saveCarLocation === next.saveCarLocation && prev.calculateSafeRoute === next.calculateSafeRoute ? prev : next;
    });
  }, []);

  const handleConfigDataChange = React.useCallback((data: any) => {
    setConfiguracaoData(prev => {
      const dataString = JSON.stringify({ personalData: data.personalData });
      const prevString = JSON.stringify({ personalData: prev.personalData });
      return dataString !== prevString ? data : prev;
    });
  }, []);

  useEffect(() => {
    const handleTriggerLogin = () => {
      handleLogin();
    };
    window.addEventListener('trigger-login', handleTriggerLogin);
    return () => window.removeEventListener('trigger-login', handleTriggerLogin);
  }, [handleLogin]);

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-xs font-black text-indigo-500 uppercase tracking-[0.3em] animate-pulse">SENTINELA ATIVO</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#F1F5F9] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-100">
      <WelcomeModal show={showWelcome} onClose={closeWelcome} t={t} />
      {/* Sentinel Bar */}
      <div 
        className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 cursor-pointer select-none"
        onMouseDown={segurancaActions.handlePanicStart}
        onMouseUp={segurancaActions.handlePanicEnd}
        onTouchStart={segurancaActions.handlePanicStart}
        onTouchEnd={segurancaActions.handlePanicEnd}
      >
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full animate-pulse ${panicActive ? 'bg-rose-600' : 'bg-emerald-500'}`} />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              {panicActive ? t.silentAlertActive : t.trustZone}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowWelcome(true)}
              className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700"
              title={t.tutorial}
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700"
              title={theme === 'light' ? t.dark : t.light}
            >
              {theme === 'light' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
            </button>
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {user.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt={user.displayName || ''} 
                      className="w-6 h-6 rounded-full border border-slate-200 dark:border-slate-700"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  )}
                  <span className="text-[10px] font-bold text-slate-400 hidden sm:inline">{user.email}</span>
                </div>
                <button onClick={() => signOut(auth)} className="text-[10px] font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest">{t.logoutLabel}</button>
              </div>
            ) : (
              <button onClick={handleLogin} className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">{t.loginLabel}</button>
            )}
          </div>
        </div>
        {/* Visual feedback for long press */}
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: panicTimer.current ? '100%' : 0 }}
          transition={{ duration: 2 }}
          className="absolute bottom-0 left-0 h-0.5 bg-rose-500/30"
        />
      </div>

      {/* Main Navigation */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-14 z-[100]">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('DASHBOARD')}>
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <h1 className="font-black text-xl tracking-tighter text-slate-800 dark:text-slate-100 uppercase">{t.appName}</h1>
              {userProfile?.plan === 'pro' && (
                <span className="bg-amber-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-md shadow-sm animate-pulse">
                  {t.proBadge}
                </span>
              )}
            </div>
          </div>
          
          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <button onClick={() => setView('DASHBOARD')} title={t.dashboard} className={`text-sm font-bold transition-colors ${view === 'DASHBOARD' ? 'text-indigo-600' : 'text-slate-500 hover:text-indigo-400'}`}>{t.dashboard}</button>
            <button onClick={() => setView('FINANCEIRO')} title={t.financial} className={`text-sm font-bold transition-colors ${view === 'FINANCEIRO' ? 'text-indigo-600' : 'text-slate-500 hover:text-indigo-400'}`}>{t.financial}</button>
            <button onClick={() => setView('SCAM')} title={t.scam} className={`text-sm font-bold transition-colors ${view === 'SCAM' ? 'text-indigo-600' : 'text-slate-500 hover:text-indigo-400'}`}>{t.scam}</button>
            <button onClick={() => setView('EMERGENCY')} title={t.emergency} className={`text-sm font-bold transition-colors ${view === 'EMERGENCY' ? 'text-indigo-600' : 'text-slate-500 hover:text-indigo-400'}`}>{t.emergency}</button>
            {isAdmin && <button onClick={() => setView('PAINEL')} title={t.adminPanel} className={`text-sm font-bold transition-colors ${view === 'PAINEL' ? 'text-indigo-600' : 'text-slate-500 hover:text-indigo-400'}`}>{t.adminPanel}</button>}
            <button onClick={() => setView('SETTINGS')} title={t.settings} className={`text-sm font-bold transition-colors ${view === 'SETTINGS' ? 'text-indigo-600' : 'text-slate-500 hover:text-indigo-400'}`}>{t.settings}</button>
          </nav>

          <div className="flex items-center gap-2">
            {/* Font Size Control */}
            <button 
              onClick={() => {
                const next = fontSizeMultiplier === 1 ? 1.2 : fontSizeMultiplier === 1.2 ? 1.5 : 1;
                setFontSizeMultiplier(next);
              }}
              title={t.fontSize}
              className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all flex items-center gap-1"
            >
              <span className="text-[10px] font-black">A</span>
              <span className="text-xs font-black">A</span>
            </button>

            {/* Sign Language Toggle */}
            {language === 'pt' && (
              <button 
                onClick={() => setShowSignLanguage(!showSignLanguage)}
                title={t.signLanguage}
                className={`p-2 rounded-xl transition-all flex items-center gap-1 ${showSignLanguage ? 'bg-indigo-600 text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
              >
                <div className="w-4 h-4 flex items-center justify-center font-black text-[8px]">🤟</div>
              </button>
            )}

            {/* Mobile Nav Toggle */}
            <div className="md:hidden flex items-center gap-2">
              <button 
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {showMobileMenu && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-slate-100 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900"
            >
              <div className="p-4 space-y-2">
                {[
                  { id: 'DASHBOARD', label: t.dashboard, icon: LayoutDashboard },
                  { id: 'FINANCEIRO', label: t.financial, icon: Briefcase },
                  { id: 'SCAM', label: t.scam, icon: ShieldAlert },
                  { id: 'EMERGENCY', label: t.emergency, icon: AlertTriangle },
                  ...(isAdmin ? [{ id: 'PAINEL', label: t.adminPanel, icon: Activity }] : []),
                  { id: 'SETTINGS', label: t.settings, icon: User },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setView(item.id as any);
                      setShowMobileMenu(false);
                    }}
                    title={item.label}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl text-sm font-bold transition-all ${
                      view === item.id 
                        ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600' 
                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Birthday Modal */}
        <AnimatePresence>
          {showBirthdayModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-slate-900 rounded-[40px] p-8 max-w-sm w-full text-center shadow-2xl border border-slate-100 dark:border-slate-800 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500" />
                <div className="mb-6 inline-flex p-4 bg-pink-100 dark:bg-pink-900/30 rounded-full">
                  <Sparkles className="w-10 h-10 text-pink-600 dark:text-pink-400" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 mb-2">{t.happyBirthday}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium mb-8 leading-relaxed">
                  {t.birthdayMessage}
                </p>
                <button 
                  onClick={() => setShowBirthdayModal(false)}
                  className="w-full py-4 bg-slate-900 dark:bg-slate-800 text-white rounded-2xl font-black text-sm shadow-lg hover:bg-slate-800 dark:hover:bg-slate-700 transition-all"
                >
                  Obrigado!
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {view === 'DASHBOARD' && (
            <DashboardView 
              t={t}
              language={language}
              allowContactLocation={allowContactLocation}
              contactAccessPermission={contactAccessPermission}
              emergencyContacts={emergencyContacts}
              isWalking={isWalking}
              simulateFall={healthActions.simulateFall || (() => {})}
              setAllowContactLocation={setAllowContactLocation}
              setContactAccessPermission={setContactAccessPermission}
              carLocation={carLocation}
              saveCarLocation={mobilidadeActions.saveCarLocation || (() => {})}
              openCarRoute={mobilidadeActions.openCarRoute || (() => {})}
              carReminderEnabled={false} // Placeholder
              setCarReminderEnabled={() => {}} // Placeholder
              carReminderInterval={30} // Placeholder
              setCarReminderInterval={() => {}} // Placeholder
              carAutoDisableTime={120} // Placeholder
              setCarAutoDisableTime={() => {}} // Placeholder
              setCarLocation={setCarLocation}
              setCarSaveTimestamp={() => {}} // Placeholder
              showToast={showToast}
              origin={origin}
              setOrigin={setOrigin}
              getCurrentLocation={mobilidadeActions.getCurrentLocation || (() => {})}
              destination={destination}
              setDestination={setDestination}
              calculateSafeRoute={mobilidadeActions.calculateSafeRoute || (() => {})}
              isCalculatingRoute={isCalculatingRoute}
              safeRouteSuggestion={safeRouteSuggestion}
              mapUrl={mapUrl}
              neighborAlerts={neighborAlerts}
              userProfile={userProfile}
              isAdmin={isAdmin}
              toggleWalking={toggleWalking}
              setView={setView}
              callEmergencyService={segurancaActions.callEmergencyService || (() => {})}
              services={[]}
              heartRate={heartRate}
              medications={medications}
              healthTab={healthTab}
              setHealthTab={setHealthTab}
              fetchNearbyPharmacies={healthActions.fetchNearbyPharmacies || (() => {})}
              fetchNearbyUnits={healthActions.fetchNearbyUnits || (() => {})}
              isFetchingPharmacies={isFetchingPharmacies}
              isFetchingUnits={isFetchingUnits}
              pharmacies={pharmacies}
              healthUnitsList={healthUnitsList}
              expenses={expenses}
              debts={debts}
              formatCurrency={formatCurrency}
              leisureCategory={leisureCategory}
              setLeisureCategory={setLeisureCategory}
              leisureSubCategory={leisureSubCategory}
              setLeisureSubCategory={setLeisureSubCategory}
              isFetchingLeisure={isFetchingLeisure}
              fetchNearbyLeisure={lazerActions.fetchNearbyLeisure || (() => {})}
              user={user}
              devices={devices}
              removeDevice={healthActions.removeDevice || (() => {})}
              updateDeviceInterval={healthActions.updateDeviceInterval || (() => {})}
              setShowAddDevice={healthActions.setShowAddDevice || (() => {})}
              leisureList={leisureList}
              setShowCheckout={setShowCheckout}
            />
          )}

          <SegurancaModule 
            user={user}
            userProfile={userProfile}
            isAdmin={isAdmin}
            t={t}
            language={language}
            showToast={showToast}
            handleFirestoreError={handleFirestoreError}
            onDataChange={handleSegurancaDataChange}
            showUI={view === 'SCAM' ? 'SCAM' : view === 'EMERGENCY' ? 'EMERGENCY' : null}
            setView={setView}
            genAI={genAI}
            logModuleUsage={logModuleUsage}
            setConfirmDialog={setConfirmDialog}
            setShowCheckout={setShowCheckout}
          />

          <SaudeModule 
            user={user}
            userProfile={userProfile}
            isAdmin={isAdmin}
            t={t}
            language={language}
            showToast={showToast}
            handleFirestoreError={handleFirestoreError}
            logModuleUsage={logModuleUsage}
            onDataChange={handleHealthDataChange}
            isWalking={isWalking}
            showUI={view === 'SAUDE'}
            setView={setView}
            genAI={genAI}
          />

          <MobilidadeModule 
            user={user}
            userProfile={userProfile}
            t={t}
            language={language}
            showToast={showToast}
            onDataChange={handleMobilidadeDataChange}
            genAI={genAI}
            logModuleUsage={logModuleUsage}
          />

          <LazerModule 
            user={user}
            userProfile={userProfile}
            t={t}
            language={language}
            showToast={showToast}
            onDataChange={handleLazerDataChange}
            genAI={genAI}
            logModuleUsage={logModuleUsage}
          />

          <FinanceiroModule 
            user={user}
            t={t}
            language={language}
            formatCurrency={formatCurrency}
            userProfile={userProfile}
            isAdmin={isAdmin}
            setShowCheckout={setShowCheckout}
            genAI={genAI}
            handleFirestoreError={handleFirestoreError}
            onDataChange={handleFinanceiroDataChange}
            showUI={view === 'FINANCEIRO'}
            setView={setView}
          />

          <ConfiguracaoModule 
            user={user}
            userProfile={userProfile}
            setUserProfile={setUserProfile}
            t={t}
            language={language}
            setLanguage={setLanguage}
            theme={theme}
            setTheme={setTheme}
            showToast={showToast}
            handleFirestoreError={handleFirestoreError}
            onDataChange={handleConfigDataChange}
            showUI={view === 'SETTINGS'}
            isAdmin={isAdmin}
            setShowCheckout={setShowCheckout}
          />

          <AdminModule 
            user={user}
            isAdmin={isAdmin}
            t={t}
            language={language}
            showToast={showToast}
            handleFirestoreError={handleFirestoreError}
            showUI={view === 'PAINEL'}
          />
        </AnimatePresence>
      </main>

      <footer className="max-w-6xl mx-auto px-4 py-12 text-center">
        <p className="text-[10px] text-slate-400 uppercase tracking-[0.4em] font-bold">{t.footer}</p>
      </footer>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 left-4 right-4 z-[100] flex justify-center pointer-events-none"
          >
            <div className={`px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-md border flex items-center gap-3 pointer-events-auto ${
              toast.type === 'success' ? 'bg-emerald-600/90 border-emerald-500 text-white' :
              toast.type === 'error' ? 'bg-rose-600/90 border-rose-500 text-white' :
              'bg-slate-900/90 border-slate-800 text-white'
            }`}>
              {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : 
               toast.type === 'error' ? <AlertCircle className="w-5 h-5" /> : 
               <Info className="w-5 h-5" />}
              <p className="text-xs font-bold uppercase tracking-widest">{toast.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmDialog && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 p-8 rounded-3xl max-w-md w-full shadow-2xl"
            >
              <div className="flex items-center gap-4 mb-6 text-rose-500">
                <AlertCircle className="w-8 h-8" />
                <h3 className="text-xl font-bold uppercase tracking-tighter">{confirmDialog.title}</h3>
              </div>
              <p className="text-slate-300 mb-8 leading-relaxed">{confirmDialog.message}</p>
              <div className="flex gap-4">
                <button
                  onClick={confirmDialog.onConfirm}
                  className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-bold py-4 rounded-2xl transition-colors uppercase tracking-widest text-xs"
                >
                  {t.confirmYes}
                </button>
                <button
                  onClick={confirmDialog.onCancel}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-2xl transition-colors uppercase tracking-widest text-xs"
                >
                  {t.confirmNo}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <CheckoutModal 
        show={showCheckout} 
        onClose={() => setShowCheckout(false)} 
        onConfirm={upgradeToPro} 
        t={t} 
        language={language} 
      />

      <ShortcutSuggestionModal 
        show={showShortcutSuggestion} 
        onClose={() => setShowShortcutSuggestion(false)} 
        t={t} 
      />

      <PermissionGuideModal 
        show={showPermissionGuide} 
        onClose={() => setShowPermissionGuide(false)} 
        os={os} 
        t={t} 
      />

      <MedicationAlarmModal 
        medication={activeAlarmMedication} 
        onClose={() => setActiveAlarmMedication(null)} 
        t={t} 
      />
    </div>
    </ErrorBoundary>
  );
}
