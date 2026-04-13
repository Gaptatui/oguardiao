
import React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Pill, Zap, History, Edit2, Trash2, Clock } from 'lucide-react';
import { Medication } from '../../types';
import { formatDate } from '../../lib/utils';

interface HealthViewProps {
  t: any;
  setView: (v: any) => void;
  isEditingMedication: string | null;
  newMedication: any;
  setNewMedication: (v: any) => void;
  addMedication: () => void;
  updateMedication: () => void;
  setActiveAlarmMedication: (v: any) => void;
  playAlarmSound: () => void;
  logMedicationAlarm: (v: any) => void;
  user: any;
  setIsEditingMedication: (v: string | null) => void;
  medications: Medication[];
  deleteMedication: (id: string) => void;
  isAdmin: boolean;
  medicationLogs: any[];
}

export const HealthView: React.FC<HealthViewProps> = ({
  t, setView, isEditingMedication, newMedication, setNewMedication,
  addMedication, updateMedication, setActiveAlarmMedication, playAlarmSound,
  logMedicationAlarm, user, setIsEditingMedication, medications,
  deleteMedication, isAdmin, medicationLogs
}) => {
  return (
    <motion.div key="saude" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => setView('DASHBOARD')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <ChevronLeft className="w-6 h-6 text-slate-400" />
          </button>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">{t.manageMedications}</h2>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[40px] p-8 shadow-xl border border-slate-100 dark:border-slate-800 space-y-6">
        <div className="flex items-center gap-4 mb-2">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl">
            <Pill className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-slate-100">{isEditingMedication ? t.editMedication : t.addMedication}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">Agenda de Medicamentos</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.medicationName}</label>
            <input 
              type="text" 
              value={newMedication.nome}
              onChange={(e) => setNewMedication({...newMedication, nome: e.target.value})}
              placeholder="Ex: Paracetamol"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.medicationTime}</label>
            <input 
              type="time" 
              value={newMedication.horario}
              onChange={(e) => setNewMedication({...newMedication, horario: e.target.value})}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.medicationDosage}</label>
            <input 
              type="text" 
              value={newMedication.dosagem}
              onChange={(e) => setNewMedication({...newMedication, dosagem: e.target.value})}
              placeholder="Ex: 500mg, 1 comprimido"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <input 
              type="checkbox" 
              id="usoContinuo"
              checked={newMedication.usoContinuo}
              onChange={(e) => setNewMedication({...newMedication, usoContinuo: e.target.checked})}
              className="w-5 h-5 accent-indigo-600 rounded-lg"
            />
            <label htmlFor="usoContinuo" className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-widest cursor-pointer">
              {t.continuousUse}
            </label>
          </div>

          {!newMedication.usoContinuo && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.startDate}</label>
                <input 
                  type="date" 
                  value={newMedication.dataInicio}
                  onChange={(e) => setNewMedication({...newMedication, dataInicio: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.endDate}</label>
                <input 
                  type="date" 
                  value={newMedication.dataFim}
                  onChange={(e) => setNewMedication({...newMedication, dataFim: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button 
            onClick={isEditingMedication ? updateMedication : addMedication}
            className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 dark:shadow-none"
          >
            {isEditingMedication ? t.update : t.save}
          </button>
          <button 
            onClick={() => {
              const testMed: Medication = { 
                nome: "Teste de Alarme", 
                horario: "TEST", 
                dosagem: "1 dose", 
                uid: user?.uid || 'test',
                usoContinuo: true 
              };
              setActiveAlarmMedication(testMed);
              playAlarmSound();
              logMedicationAlarm(testMed);
            }}
            className="px-6 py-4 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-amber-200 transition-all flex items-center gap-2"
          >
            <Zap className="w-4 h-4" /> {t.testAlarm}
          </button>
          {isEditingMedication && (
            <button 
              onClick={() => {
                setIsEditingMedication(null);
                setNewMedication({ nome: '', horario: '', dosagem: '', uid: '' });
              }}
              className="px-8 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
            >
              {t.cancel}
            </button>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[40px] p-8 shadow-xl border border-slate-100 dark:border-slate-800">
        <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2">
          <History className="w-5 h-5 text-indigo-600" /> {t.medications}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {medications.length > 0 ? medications.map((med, idx) => (
            <div key={`med-card-${med.id || `idx-${idx}-${med.nome}`}`} className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800 flex items-center justify-between group hover:border-indigo-100 dark:hover:border-indigo-900/50 transition-all">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white dark:bg-slate-700 rounded-2xl shadow-sm">
                  <Pill className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900 dark:text-slate-100">{med.nome}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase">
                    {med.horario} • {med.dosagem}
                  </p>
                  <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-black uppercase tracking-widest mt-1">
                    {med.usoContinuo ? t.continuousUse : `${formatDate(med.dataInicio)} - ${formatDate(med.dataFim)}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => {
                    setIsEditingMedication(med.id!);
                    setNewMedication({ ...med });
                  }}
                  className="p-2 bg-white dark:bg-slate-700 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl transition-all"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => deleteMedication(med.id!)}
                  className="p-2 bg-white dark:bg-slate-700 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )) : (
            <div className="col-span-full py-12 text-center">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest italic">{t.noMedications}</p>
            </div>
          )}
        </div>
      </div>

      {isAdmin && (
        <div className="bg-white dark:bg-slate-900 rounded-[40px] p-8 shadow-xl border border-slate-100 dark:border-slate-800">
          <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-600" /> {t.medicationLogs}
          </h3>
          <div className="space-y-2">
            {medicationLogs.map((log, idx) => (
              <div key={`med-log-${log.id || `idx-${idx}-${log.timestamp}`}`} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{log.nome}</p>
                  <p className="text-[10px] text-slate-500 uppercase font-black">{log.horario} • {new Date(log.timestamp).toLocaleString()}</p>
                </div>
                <span className="text-[8px] font-black bg-indigo-100 text-indigo-600 px-2 py-1 rounded-full uppercase">{log.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};
