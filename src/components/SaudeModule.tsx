
import React, { useState, useEffect, useRef } from 'react';
import { 
  collection, addDoc, onSnapshot, query, orderBy, where,
  limit, updateDoc, doc, getDoc, deleteDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import { 
  Language, Medication, NeighborAlert, HealthProfile, Device, 
  OperationType, UserProfile 
} from '../types';
import { HealthView } from './views/HealthView';
import { ConfirmModal } from './Common';
import { motion, AnimatePresence } from 'motion/react';
import { XCircle, Plus, Zap, Activity, Clock } from 'lucide-react';

interface SaudeModuleProps {
  user: any;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  t: any;
  language: Language;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  handleFirestoreError: (error: unknown, operationType: OperationType, path: string | null) => void;
  onDataChange: (data: { 
    medications: Medication[], 
    neighborAlerts: NeighborAlert[], 
    heartRate: number,
    devices: Device[],
    healthTab: 'PHARMACIES' | 'UNITS',
    isFetchingPharmacies: boolean,
    isFetchingUnits: boolean,
    pharmacies: any[],
    healthUnitsList: any[],
    fetchNearbyPharmacies: () => void,
    fetchNearbyUnits: () => void,
    removeDevice: (id: string) => void,
    updateDeviceInterval: (id: string, interval: number) => void,
    setShowAddDevice: (show: boolean) => void,
    simulateFall: () => void,
    isEditingMedication: string | null,
    setIsEditingMedication: (id: string | null) => void,
    newMedication: Medication,
    setNewMedication: (med: Medication) => void,
    updateMedication: () => void,
    addMedication: () => void,
    playAlarmSound: () => void,
    logMedicationAlarm: (med: Medication) => void,
    deleteMedication: (id: string) => void,
    medicationLogs: any[]
  }) => void;
  showUI: boolean;
  setView: (view: any) => void;
  genAI: any;
  logModuleUsage: (modulo: any) => void;
  isWalking: boolean;
}

export const SaudeModule: React.FC<SaudeModuleProps> = ({
  user, userProfile, isAdmin, t, language, showToast, 
  handleFirestoreError, onDataChange, showUI, setView, 
  genAI, logModuleUsage, isWalking
}) => {
  const [neighborAlerts, setNeighborAlerts] = useState<NeighborAlert[]>([]);
  const [healthProfile, setHealthProfile] = useState<HealthProfile | null>(null);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [medicationLogs, setMedicationLogs] = useState<any[]>([]);
  const [heartRate, setHeartRate] = useState(72);
  const [devices, setDevices] = useState<Device[]>([
    { id: '1', name: 'Apple Watch Series 9', type: 'smartwatch', status: 'connected', value: '72', unit: 'BPM', lastUpdate: Date.now(), readingInterval: 3 },
    { id: '2', name: 'Oximetro Bluetooth', type: 'oximeter', status: 'connected', value: '98', unit: '%', lastUpdate: Date.now(), readingInterval: 5 }
  ]);
  const [pharmacies, setPharmacies] = useState<any[]>([]);
  const [isFetchingPharmacies, setIsFetchingPharmacies] = useState(false);
  const [healthUnitsList, setHealthUnitsList] = useState<any[]>([]);
  const [isFetchingUnits, setIsFetchingUnits] = useState(false);
  const [healthTab, setHealthTab] = useState<'PHARMACIES' | 'UNITS'>('PHARMACIES');
  
  const [newMedication, setNewMedication] = useState<Medication>({ 
    nome: '', 
    horario: '', 
    dosagem: '', 
    uid: '',
    usoContinuo: true,
    dataInicio: '',
    dataFim: ''
  });
  const [isEditingMedication, setIsEditingMedication] = useState<string | null>(null);
  const [activeAlarmMedication, setActiveAlarmMedication] = useState<Medication | null>(null);
  const [lastAlarmTime, setLastAlarmTime] = useState<string | null>(null);
  const [showAddDevice, setShowAddDevice] = useState(false);
  const [newDevice, setNewDevice] = useState<{name: string, type: 'smartwatch' | 'heartMonitor' | 'oximeter', readingInterval: number}>({
    name: '',
    type: 'smartwatch',
    readingInterval: 3
  });
  const [medicationToDelete, setMedicationToDelete] = useState<string | null>(null);

  // Listeners
  useEffect(() => {
    if (!user) return;

    const qNeighbors = query(collection(db, 'vizinhos_alertas'), orderBy('timestamp', 'desc'), limit(5));
    const unsubNeighbors = onSnapshot(qNeighbors, (snapshot) => {
      setNeighborAlerts(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as NeighborAlert)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'vizinhos_alertas'));

    const qMeds = isAdmin 
      ? query(collection(db, 'lembretes_medicacao'), orderBy('timestamp', 'desc'), limit(25)) 
      : query(collection(db, 'lembretes_medicacao'), where('uid', '==', user.uid), orderBy('timestamp', 'desc'));
    
    const unsubMeds = onSnapshot(qMeds, (snapshot) => {
      setMedications(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Medication)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'lembretes_medicacao'));

    const qLogs = query(collection(db, 'logs_medicacao'), where('uid', '==', user.uid), orderBy('timestamp', 'desc'), limit(20));
    const unsubLogs = onSnapshot(qLogs, (snapshot) => {
      setMedicationLogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'logs_medicacao'));

    return () => {
      unsubNeighbors();
      unsubMeds();
      unsubLogs();
    };
  }, [user, isAdmin]);

  // Heart Rate Simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setHeartRate(prev => prev + (Math.random() > 0.5 ? 1 : -1));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Devices Simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setDevices(prev => prev.map(device => {
        const now = Date.now();
        const timeSinceLastUpdate = now - device.lastUpdate;
        
        if (device.status === 'connected' && timeSinceLastUpdate >= device.readingInterval * 1000) {
          let newValue = parseFloat(device.value);
          if (device.type === 'smartwatch' || device.type === 'heartMonitor') {
            newValue += (Math.random() - 0.5) * 4;
            newValue = Math.max(60, Math.min(180, newValue));
          } else if (device.type === 'oximeter') {
            newValue += (Math.random() - 0.5) * 1;
            newValue = Math.max(94, Math.min(100, newValue));
          }
          return {
            ...device,
            value: newValue.toFixed(0),
            lastUpdate: now
          };
        }
        return device;
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Medication Alarm Logic
  useEffect(() => {
    if (!user) return;
    
    const checkMedications = () => {
      if (!medications.length) return;
      
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const currentTime = `${hours}:${minutes}`;
      
      const year = now.getFullYear();
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const day = now.getDate().toString().padStart(2, '0');
      const todayStr = `${year}-${month}-${day}`;

      if (currentTime === lastAlarmTime) return;

      medications.forEach(med => {
        if (med.horario === currentTime) {
          let shouldAlarm = false;
          if (med.usoContinuo) {
            shouldAlarm = true;
          } else if (med.dataInicio && med.dataFim) {
            if (todayStr >= med.dataInicio && todayStr <= med.dataFim) {
              shouldAlarm = true;
            }
          }

          if (shouldAlarm) {
            setActiveAlarmMedication(med);
            setLastAlarmTime(currentTime);
            playAlarmSound();
            logMedicationAlarm(med);
          }
        }
      });
    };

    const interval = setInterval(checkMedications, 10000);
    return () => clearInterval(interval);
  }, [medications, lastAlarmTime, user]);

  // Functions
  const playAlarmSound = React.useCallback(() => {
    try {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.play().catch(e => console.warn("Audio play blocked:", e));
    } catch (err) {
      console.error("Error playing alarm:", err);
    }
  }, []);

  const logMedicationAlarm = React.useCallback(async (med: Medication) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'logs_medicacao'), {
        uid: user.uid,
        medicationId: med.id,
        nome: med.nome,
        horario: med.horario,
        timestamp: Date.now(),
        status: 'notificado'
      });
    } catch (err) {
      console.error("Error logging medication alarm:", err);
    }
  }, [user]);

  const addMedication = React.useCallback(async () => {
    if (!user) {
      showToast("Faça login para salvar medicamentos.", "info");
      return;
    }
    if (!newMedication.nome || !newMedication.horario) {
      showToast("Preencha o nome e o horário!", "error");
      return;
    }
    try {
      await addDoc(collection(db, 'lembretes_medicacao'), {
        ...newMedication,
        uid: user.uid,
        timestamp: Date.now()
      });
      showToast(t.medicationAddedAlert, "success");
      setNewMedication({ nome: '', horario: '', dosagem: '', uid: '', usoContinuo: true, dataInicio: '', dataFim: '' });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'lembretes_medicacao');
    }
  }, [user, newMedication, t.medicationAddedAlert, showToast, handleFirestoreError]);

  const updateMedication = React.useCallback(async () => {
    if (!isEditingMedication) return;
    try {
      await updateDoc(doc(db, 'lembretes_medicacao', isEditingMedication), {
        ...newMedication
      });
      showToast(t.medicationUpdatedAlert, "success");
      setIsEditingMedication(null);
      setNewMedication({ nome: '', horario: '', dosagem: '', uid: '', usoContinuo: true, dataInicio: '', dataFim: '' });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `lembretes_medicacao/${isEditingMedication}`);
    }
  }, [isEditingMedication, newMedication, t.medicationUpdatedAlert, showToast, handleFirestoreError]);

  const deleteMedication = React.useCallback(async (id: string) => {
    setMedicationToDelete(id);
  }, []);

  const confirmDeleteMedication = React.useCallback(async () => {
    if (!medicationToDelete) return;
    try {
      await deleteDoc(doc(db, 'lembretes_medicacao', medicationToDelete));
      showToast(t.medicationDeletedAlert, "success");
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `lembretes_medicacao/${medicationToDelete}`);
    } finally {
      setMedicationToDelete(null);
    }
  }, [medicationToDelete, t.medicationDeletedAlert, showToast, handleFirestoreError]);

  const fetchNearbyPharmacies = React.useCallback(async () => {
    setIsFetchingPharmacies(true);
    setPharmacies([]);
    logModuleUsage('saude');
    try {
      let currentLat = -23.9618;
      let currentLng = -46.3322;

      if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
          });
          currentLat = position.coords.latitude;
          currentLng = position.coords.longitude;
        } catch (geoError) {
          console.warn("Geolocation failed, using default:", geoError);
        }
      }

      const response = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ parts: [{ text: t.pharmacyPrompt }] }],
        config: {
          tools: [{ googleMaps: {} }],
          toolConfig: {
            retrievalConfig: {
              latLng: {
                latitude: currentLat,
                longitude: currentLng
              }
            }
          }
        },
      });

      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunks) {
        const uniquePharmacies = new Map();
        chunks
          .filter((chunk: any) => chunk.maps)
          .forEach((chunk: any) => {
            const name = chunk.maps.title;
            if (!uniquePharmacies.has(name)) {
              uniquePharmacies.set(name, {
                id: Math.random().toString(36).substr(2, 9),
                name: name,
                address: chunk.maps.address || "Endereço não disponível",
                distance: "Próximo a você",
                open: true
              });
            }
          });
        setPharmacies(Array.from(uniquePharmacies.values()));
      }
    } catch (err) {
      console.error("Error fetching pharmacies:", err);
      showToast("Erro ao buscar farmácias", "error");
    } finally {
      setIsFetchingPharmacies(false);
    }
  }, [t.pharmacyPrompt, genAI, showToast, logModuleUsage]);

  const fetchNearbyUnits = React.useCallback(async () => {
    setIsFetchingUnits(true);
    setHealthUnitsList([]);
    logModuleUsage('saude');
    try {
      let currentLat = -23.9618;
      let currentLng = -46.3322;

      if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
          });
          currentLat = position.coords.latitude;
          currentLng = position.coords.longitude;
        } catch (geoError) {
          console.warn("Geolocation failed, using default:", geoError);
        }
      }

      const response = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ parts: [{ text: "Encontre unidades de saúde, hospitais e postos de saúde próximos a mim." }] }],
        config: {
          tools: [{ googleMaps: {} }],
          toolConfig: {
            retrievalConfig: {
              latLng: {
                latitude: currentLat,
                longitude: currentLng
              }
            }
          }
        },
      });

      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunks) {
        const uniqueUnits = new Map();
        chunks
          .filter((chunk: any) => chunk.maps)
          .forEach((chunk: any) => {
            const name = chunk.maps.title;
            if (!uniqueUnits.has(name)) {
              uniqueUnits.set(name, {
                id: Math.random().toString(36).substr(2, 9),
                name: name,
                address: chunk.maps.address || "Endereço não disponível",
                type: name.toLowerCase().includes('hospital') ? 'Hospital' : 'Unidade de Saúde'
              });
            }
          });
        setHealthUnitsList(Array.from(uniqueUnits.values()));
      }
    } catch (err) {
      console.error("Error fetching health units:", err);
      showToast("Erro ao buscar unidades de saúde", "error");
    } finally {
      setIsFetchingUnits(false);
    }
  }, [genAI, showToast, logModuleUsage]);

  const addDevice = React.useCallback(() => {
    if (!newDevice.name?.trim()) return;
    const device: Device = {
      id: Math.random().toString(36).substr(2, 9),
      name: newDevice.name,
      type: newDevice.type,
      status: 'connected',
      value: newDevice.type === 'oximeter' ? '98' : '72',
      unit: newDevice.type === 'oximeter' ? '%' : 'BPM',
      lastUpdate: Date.now(),
      readingInterval: newDevice.readingInterval
    };
    setDevices(prev => [...prev, device]);
    setShowAddDevice(false);
    setNewDevice({ name: '', type: 'smartwatch', readingInterval: 3 });
    showToast(t.settingsSavedAlert, 'success');
  }, [newDevice, t.settingsSavedAlert, showToast]);

  const removeDevice = React.useCallback((id: string) => {
    setDevices(prev => prev.filter(d => d.id !== id));
  }, []);

  const updateDeviceInterval = React.useCallback((id: string, interval: number) => {
    setDevices(prev => prev.map(d => d.id === id ? { ...d, readingInterval: interval } : d));
  }, []);

  const simulateFall = React.useCallback(() => {
    if (!isWalking) return;
    showToast(t.fallDetectedAlert, 'error');
  }, [isWalking, t.fallDetectedAlert, showToast]);

  const lastDataRef = useRef<string>('');

  // Sync Data with App.tsx

  // Sync Data with App.tsx
  useEffect(() => {
    const dataToSync = {
      medications,
      neighborAlerts,
      heartRate,
      devices,
      healthTab,
      isFetchingPharmacies,
      isFetchingUnits,
      pharmacies,
      healthUnitsList,
      fetchNearbyPharmacies,
      fetchNearbyUnits,
      removeDevice,
      updateDeviceInterval,
      setShowAddDevice,
      simulateFall,
      isEditingMedication,
      setIsEditingMedication,
      newMedication,
      setNewMedication,
      updateMedication,
      addMedication,
      playAlarmSound,
      logMedicationAlarm,
      deleteMedication,
      medicationLogs
    };

    // Use a stringified version of the data to check for changes
    // We exclude functions from the stringification
    const dataString = JSON.stringify({
      medications, neighborAlerts, heartRate, devices, healthTab,
      isFetchingPharmacies, isFetchingUnits, pharmacies, healthUnitsList,
      isEditingMedication, newMedication, medicationLogs
    });

    if (dataString !== lastDataRef.current) {
      lastDataRef.current = dataString;
      onDataChange(dataToSync);
    }
  }, [
    medications, neighborAlerts, heartRate, devices, healthTab, 
    isFetchingPharmacies, isFetchingUnits, pharmacies, healthUnitsList,
    fetchNearbyPharmacies, fetchNearbyUnits, removeDevice, 
    updateDeviceInterval, setShowAddDevice, simulateFall,
    isEditingMedication, newMedication, medicationLogs, onDataChange,
    updateMedication, addMedication, playAlarmSound, logMedicationAlarm,
    deleteMedication
  ]);

  return (
    <>
      <AnimatePresence>
        {showAddDevice && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white p-8 rounded-3xl max-w-md w-full shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-slate-900">{t.registerDevice}</h3>
                <button onClick={() => setShowAddDevice(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <XCircle className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.deviceName}</label>
                  <input 
                    type="text" 
                    value={newDevice.name}
                    onChange={(e) => setNewDevice({...newDevice, name: e.target.value})}
                    placeholder="Ex: Apple Watch, Garmin..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-medium focus:ring-2 focus:ring-rose-500 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.deviceType}</label>
                  <div className="grid grid-cols-1 gap-2">
                    {(['smartwatch', 'heartMonitor', 'oximeter'] as const).map(type => (
                      <button
                        key={type}
                        onClick={() => setNewDevice({...newDevice, type})}
                        className={`p-4 rounded-2xl border-2 transition-all flex items-center gap-3 ${newDevice.type === type ? 'border-rose-600 bg-rose-50' : 'border-slate-100 bg-slate-50 hover:border-slate-200'}`}
                      >
                        <div className={`p-2 rounded-lg ${newDevice.type === type ? 'bg-rose-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                          {type === 'smartwatch' ? <Zap className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
                        </div>
                        <span className="text-xs font-bold uppercase tracking-widest">{t[type]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.readingInterval}</label>
                  <div className="flex items-center gap-4">
                    <input 
                      type="range" 
                      min="1" 
                      max="60" 
                      value={newDevice.readingInterval}
                      onChange={(e) => setNewDevice({...newDevice, readingInterval: parseInt(e.target.value)})}
                      className="flex-1 accent-rose-600"
                    />
                    <span className="text-xs font-black text-slate-700 w-20 text-right">
                      {newDevice.readingInterval} {t.seconds}
                    </span>
                  </div>
                </div>

                <button 
                  onClick={addDevice}
                  className="w-full py-4 bg-rose-600 text-white rounded-2xl font-black text-sm shadow-lg shadow-rose-200 hover:bg-rose-700 transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" /> {t.addDevice}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeAlarmMedication && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white dark:bg-slate-900 p-8 rounded-[48px] max-w-sm w-full text-center shadow-2xl border border-slate-100 dark:border-slate-800"
            >
              <div className="w-24 h-24 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                <Clock className="w-12 h-12 text-rose-600 dark:text-rose-400" />
              </div>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-2">{t.medicationAlarm}</h3>
              <p className="text-lg font-bold text-rose-600 dark:text-rose-400 mb-6 uppercase tracking-widest">{activeAlarmMedication.nome}</p>
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-3xl mb-8">
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400">{t.dosage}: {activeAlarmMedication.dosagem}</p>
              </div>
              <button 
                onClick={() => setActiveAlarmMedication(null)}
                className="w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-3xl font-black text-lg shadow-xl hover:scale-[1.02] transition-all"
              >
                {t.confirmMedication}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {showUI && (
        <HealthView 
          t={t}
          setView={setView}
          isEditingMedication={isEditingMedication}
          setIsEditingMedication={setIsEditingMedication}
          newMedication={newMedication}
          setNewMedication={setNewMedication}
          updateMedication={updateMedication}
          addMedication={addMedication}
          setActiveAlarmMedication={setActiveAlarmMedication}
          playAlarmSound={playAlarmSound}
          logMedicationAlarm={logMedicationAlarm}
          user={user}
          medications={medications}
          deleteMedication={deleteMedication}
          isAdmin={isAdmin}
          medicationLogs={medicationLogs}
        />
      )}

      <ConfirmModal 
        isOpen={!!medicationToDelete}
        onClose={() => setMedicationToDelete(null)}
        onConfirm={confirmDeleteMedication}
        title={t.deleteMedication}
        message={t.confirmMedicationDeletion || "Tem certeza que deseja excluir este medicamento?"}
        isDanger={true}
      />
    </>
  );
};
