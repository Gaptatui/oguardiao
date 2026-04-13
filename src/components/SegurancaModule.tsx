
import React, { useState, useEffect, useRef } from 'react';
import { 
  collection, addDoc, onSnapshot, query, orderBy, where,
  limit, updateDoc, doc, getDoc, deleteDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import { 
  Language, AnalysisResult, Medication, NeighborAlert, Device, 
  OperationType, UserProfile, UsageLog 
} from '../types';
import { ScamView } from './views/ScamView';
import { EmergencyView } from './views/EmergencyView';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, AlertTriangle, Clock } from 'lucide-react';

interface SegurancaModuleProps {
  user: any;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  t: any;
  language: Language;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  handleFirestoreError: (error: unknown, operationType: OperationType, path: string | null) => void;
  onDataChange: (data: { 
    emergencyContacts: any[],
    scamLogs: any[],
    panicActive: boolean,
    triggerPanic: () => void,
    callEmergencyService: (service: string) => void,
    simulateScamNotification: () => void,
    analyzeAudio: () => void,
    analyzeMessage: () => void,
    inputText: string,
    setInputText: (text: string) => void,
    isAnalyzing: boolean,
    result: AnalysisResult | null,
    audioFile: File | null,
    setAudioFile: (file: File | null) => void,
    isAnalyzingAudio: boolean,
    isListeningAudio: boolean,
    setIsListeningAudio: (val: boolean) => void,
    contactAccessPermission: boolean,
    setContactAccessPermission: (val: boolean) => void,
    allowContactLocation: boolean,
    setAllowContactLocation: (val: boolean) => void,
    toggleContact: (id: string, active: boolean) => void,
    removeContact: (id: string) => void,
    addSafeContact: () => void,
    newContactName: string,
    setNewContactName: (val: string) => void,
    newContactPhone: string,
    setNewContactPhone: (val: string) => void,
    newContactRelation: string,
    setNewContactRelation: (val: string) => void,
    handlePanicStart: () => void,
    handlePanicEnd: () => void
  }) => void;
  showUI: 'SCAM' | 'EMERGENCY' | null;
  setView: (view: any) => void;
  genAI: any;
  logModuleUsage: (modulo: UsageLog['modulo']) => void;
  setConfirmDialog: (dialog: any) => void;
  setShowCheckout: (show: boolean) => void;
}

export const SegurancaModule: React.FC<SegurancaModuleProps> = ({
  user, userProfile, isAdmin, t, language, showToast, 
  handleFirestoreError, onDataChange, showUI, setView, 
  genAI, logModuleUsage, setConfirmDialog, setShowCheckout
}) => {
  // Scam State
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [autoMonitoring, setAutoMonitoring] = useState(true);
  const [actionType, setActionType] = useState<'AUTOMATIC' | 'MANUAL'>('MANUAL');
  const [monitoredApps, setMonitoredApps] = useState({
    whatsapp: true,
    telegram: true,
    sms: true,
    email: false
  });
  const [scamLogs, setScamLogs] = useState<{id: string, app: string, message: string, action: string, timestamp: number}[]>([]);

  // Emergency State
  const [emergencyContacts, setEmergencyContacts] = useState<any[]>([]);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isAnalyzingAudio, setIsAnalyzingAudio] = useState(false);
  const [isListeningAudio, setIsListeningAudio] = useState(false);
  const [contactAccessPermission, setContactAccessPermission] = useState(false);
  const [allowContactLocation, setAllowContactLocation] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactRelation, setNewContactRelation] = useState('');
  const [panicActive, setPanicActive] = useState(false);
  const panicTimer = useRef<NodeJS.Timeout | null>(null);

  // Listeners
  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'contatos_emergencia'), where('uid', '==', user.uid));
    const unsub = onSnapshot(q, (snapshot) => {
      setEmergencyContacts(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'contatos_emergencia'));

    return () => unsub();
  }, [user]);

  // Functions
  const handlePanicStart = React.useCallback(() => {
    panicTimer.current = setTimeout(() => {
      setPanicActive(true);
      triggerPanic();
    }, 2000);
  }, []);

  const handlePanicEnd = React.useCallback(() => {
    if (panicTimer.current) clearTimeout(panicTimer.current);
  }, []);

  const callEmergencyService = React.useCallback(async (service: string) => {
    if (!user) return;
    setIsListeningAudio(true);
    logModuleUsage('emergencia');
    const path = 'alertas';
    try {
      const activeContacts = emergencyContacts.filter(c => c.active).map(c => c.nome).join(', ');
      const alertData = {
        tipo: t.emergencyAlert.replace('{service}', service),
        gravidade: 'Crítica',
        transcricao: t.directActivationMsg.replace('{service}', service),
        sons_fundo: t.listeningActiveMsg.replace('{contacts}', activeContacts || 'Nenhum contato ativo'),
        prioridade: 'CRÍTICA',
        timestamp: Date.now(),
        uid: user.uid,
        status: 'Pendente',
        userEmail: user.email
      };
      await addDoc(collection(db, path), alertData);
      setView('EMERGENCY');
      const message = t.emergencyCallAlert.replace('{service}', service);
      showToast(message, 'error');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  }, [user, emergencyContacts, t, setView, showToast, handleFirestoreError, logModuleUsage]);

  const triggerPanic = React.useCallback(async () => {
    if (!user) return;
    const path = 'alertas';
    try {
      const activeContacts = emergencyContacts.filter(c => c.active).map(c => c.nome).join(', ');
      const alertData = {
        tipo: t.localSecurity,
        gravidade: 'Crítica',
        transcricao: t.panicAlert,
        sons_fundo: t.locationSentMsg.replace('{contacts}', activeContacts || 'Nenhum contato ativo'),
        prioridade: 'CRÍTICA',
        timestamp: Date.now(),
        uid: user.uid,
        status: 'Pendente',
        userEmail: user.email
      };
      await addDoc(collection(db, path), alertData);
      setPanicActive(true);
      setTimeout(() => setPanicActive(false), 5000);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  }, [user, emergencyContacts, t, handleFirestoreError]);

  const analyzeAudio = React.useCallback(async () => {
    if (!audioFile || !user) return;
    if (userProfile?.plan !== 'pro' && userProfile?.isVip !== true) {
      setShowCheckout(true);
      return;
    }
    setIsAnalyzingAudio(true);
    logModuleUsage('emergencia');
    try {
      const model = "gemini-3-flash-preview";
      const prompt = "Analise este áudio de emergência (simulado). Identifique se há pedidos de socorro, sons de violência ou disparos. Responda com um veredito curto e recomendações em português.";
      
      const response = await genAI.models.generateContent({
        model,
        contents: [{ parts: [{ text: prompt }] }],
      });
      
      const path = 'alertas';
      await addDoc(collection(db, path), {
        tipo: 'Áudio',
        gravidade: 'Alta',
        transcricao: 'Análise de áudio solicitada pelo usuário.',
        analise_ia_audio: response.text,
        timestamp: Date.now(),
        uid: user.uid,
        status: 'Pendente'
      });
      
      showToast(t.audioAnalyzedAlert, 'success');
      setAudioFile(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzingAudio(false);
    }
  }, [audioFile, user, userProfile, t, genAI, showToast, logModuleUsage, setShowCheckout]);

  const analyzeMessage = React.useCallback(async () => {
    if (!inputText?.trim()) return;
    setIsAnalyzing(true);
    logModuleUsage('golpes');
    try {
      const model = "gemini-3-flash-preview";
      const response = await genAI.models.generateContent({
        model,
        contents: [{ parts: [{ text: `Analise esta mensagem para golpes: "${inputText}"` }] }],
        config: { responseMimeType: "application/json", systemInstruction: "Você é o Analista do O GUARDIAO. Responda em JSON: {verdict, reason, action}" },
      });
      setResult(JSON.parse(response.text || "{}"));
    } catch (error) { console.error(error); }
    finally { setIsAnalyzing(false); }
  }, [inputText, genAI, logModuleUsage]);

  const simulateScamNotification = React.useCallback(() => {
    const apps = Object.entries(monitoredApps).filter(([_, enabled]) => enabled).map(([app]) => app);
    if (apps.length === 0) {
      showToast(t.activateMonitoringAlert, 'info');
      return;
    }
    
    const randomApp = apps[Math.floor(Math.random() * apps.length)];
    const messages = t.scamMessages;
    const randomMsg = messages[Math.floor(Math.random() * messages.length)];

    if (actionType === 'AUTOMATIC') {
      const newLog = {
        id: Math.random().toString(36).substr(2, 9),
        app: randomApp,
        message: randomMsg,
        action: t.blockedAuto,
        timestamp: Date.now()
      };
      setScamLogs(prev => [newLog, ...prev]);
      const message = t.scamDetectedAlert.replace('{app}', randomApp.toUpperCase());
      showToast(message, 'error');
    } else {
      setConfirmDialog({
        title: t.scamConfirmTitle.replace('{app}', randomApp.toUpperCase()),
        message: t.scamConfirmMessage.replace('{msg}', randomMsg),
        onConfirm: () => {
          const newLog = {
            id: Math.random().toString(36).substr(2, 9),
            app: randomApp,
            message: randomMsg,
            action: t.blockedUser,
            timestamp: Date.now()
          };
          setScamLogs(prev => [newLog, ...prev]);
          setConfirmDialog(null);
        },
        onCancel: () => {
          const newLog = {
            id: Math.random().toString(36).substr(2, 9),
            app: randomApp,
            message: randomMsg,
            action: t.ignoredUser,
            timestamp: Date.now()
          };
          setScamLogs(prev => [newLog, ...prev]);
          setConfirmDialog(null);
        }
      });
    }
  }, [monitoredApps, actionType, t, showToast, setConfirmDialog]);

  const addSafeContact = React.useCallback(async () => {
    if (!user) {
      showToast("Faça login para salvar contatos.", "info");
      return;
    }
    if (newContactName && newContactPhone) {
      try {
        await addDoc(collection(db, 'contatos_emergencia'), {
          uid: user.uid,
          nome: newContactName,
          telefone: newContactPhone,
          parentesco: newContactRelation,
          active: true,
          x: Math.floor(Math.random() * 80) + 10,
          y: Math.floor(Math.random() * 80) + 10,
          timestamp: Date.now()
        });
        setNewContactName('');
        setNewContactPhone('');
        setNewContactRelation('');
        showToast("Contato adicionado com sucesso!", "success");
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, 'contatos_emergencia');
      }
    }
  }, [newContactName, newContactPhone, newContactRelation, user, showToast, handleFirestoreError]);

  const toggleContact = React.useCallback(async (id: string, active: boolean) => {
    try {
      await updateDoc(doc(db, 'contatos_emergencia', id), {
        active: !active
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'contatos_emergencia');
    }
  }, [handleFirestoreError]);

  const removeContact = React.useCallback(async (id: string) => {
    try {
      await updateDoc(doc(db, 'contatos_emergencia', id), {
        deleted: true
      });
      showToast("Contato removido.", "info");
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'contatos_emergencia');
    }
  }, [showToast, handleFirestoreError]);

  const lastDataRef = useRef<string>('');

  // Sync Data with App.tsx
  useEffect(() => {
    const dataToSync = {
      emergencyContacts,
      scamLogs,
      panicActive,
      triggerPanic,
      callEmergencyService,
      simulateScamNotification,
      analyzeAudio,
      analyzeMessage,
      inputText,
      setInputText,
      isAnalyzing,
      result,
      audioFile,
      setAudioFile,
      isAnalyzingAudio,
      isListeningAudio,
      setIsListeningAudio,
      contactAccessPermission,
      setContactAccessPermission,
      allowContactLocation,
      setAllowContactLocation,
      toggleContact,
      removeContact,
      addSafeContact,
      newContactName,
      setNewContactName,
      newContactPhone,
      setNewContactPhone,
      newContactRelation,
      setNewContactRelation,
      handlePanicStart,
      handlePanicEnd
    };

    const dataString = JSON.stringify({
      emergencyContacts, scamLogs, panicActive, inputText, isAnalyzing, 
      result, audioFile, isAnalyzingAudio, isListeningAudio, 
      contactAccessPermission, allowContactLocation, newContactName, 
      newContactPhone, newContactRelation
    });

    if (dataString !== lastDataRef.current) {
      lastDataRef.current = dataString;
      onDataChange(dataToSync);
    }
  }, [
    emergencyContacts, scamLogs, panicActive, inputText, isAnalyzing, 
    result, audioFile, isAnalyzingAudio, isListeningAudio, 
    contactAccessPermission, allowContactLocation, newContactName, 
    newContactPhone, newContactRelation, onDataChange, triggerPanic, 
    callEmergencyService, simulateScamNotification, analyzeAudio, 
    analyzeMessage, setInputText, setAudioFile, setIsListeningAudio, 
    setContactAccessPermission, setAllowContactLocation, toggleContact, 
    removeContact, addSafeContact, setNewContactName, setNewContactPhone, 
    setNewContactRelation, handlePanicStart, handlePanicEnd
  ]);

  return (
    <>
      {showUI === 'SCAM' && (
        <ScamView 
          t={t}
          autoMonitoring={autoMonitoring}
          setAutoMonitoring={setAutoMonitoring}
          monitoredApps={monitoredApps}
          setMonitoredApps={setMonitoredApps}
          actionType={actionType}
          setActionType={setActionType}
          simulateScamNotification={simulateScamNotification}
          scamLogs={scamLogs}
          setScamLogs={setScamLogs}
          inputText={inputText}
          setInputText={setInputText}
          isAnalyzing={isAnalyzing}
          analyzeMessage={analyzeMessage}
          result={result}
        />
      )}

      {showUI === 'EMERGENCY' && (
        <EmergencyView 
          t={t}
          callEmergencyService={callEmergencyService}
          isListeningAudio={isListeningAudio}
          setIsListeningAudio={setIsListeningAudio}
          contactAccessPermission={contactAccessPermission}
          setContactAccessPermission={setContactAccessPermission}
          allowContactLocation={allowContactLocation}
          setAllowContactLocation={setAllowContactLocation}
          emergencyContacts={emergencyContacts}
          toggleContact={toggleContact}
          removeContact={removeContact}
          newContactName={newContactName}
          setNewContactName={setNewContactName}
          newContactPhone={newContactPhone}
          setNewContactPhone={setNewContactPhone}
          newContactRelation={newContactRelation}
          setNewContactRelation={setNewContactRelation}
          addSafeContact={addSafeContact}
          userProfile={userProfile}
          isAdmin={isAdmin}
          setShowCheckout={setShowCheckout}
          setAudioFile={setAudioFile}
          audioFile={audioFile}
          analyzeAudio={analyzeAudio}
          isAnalyzingAudio={isAnalyzingAudio}
          triggerPanic={triggerPanic}
        />
      )}

      <AnimatePresence>
        {panicActive && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-rose-600/90 backdrop-blur-xl">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center text-white"
            >
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-ping">
                <AlertTriangle className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-4xl font-black mb-4 uppercase tracking-tighter">{t.panicAlertTitle}</h3>
              <p className="text-xl font-bold opacity-80">{t.panicAlertSubtitle}</p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
