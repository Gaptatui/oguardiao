
import React from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, Activity, Mic, Users, MapPin, CheckCircle2, Trash2, Zap } from 'lucide-react';
import { ProGuard } from '../Common';
import { UserProfile } from '../../types';

interface EmergencyViewProps {
  t: any;
  callEmergencyService: (n: string) => void;
  isListeningAudio: boolean;
  setIsListeningAudio: (v: boolean) => void;
  contactAccessPermission: boolean;
  setContactAccessPermission: (v: boolean) => void;
  allowContactLocation: boolean;
  setAllowContactLocation: (v: boolean) => void;
  emergencyContacts: any[];
  toggleContact: (id: string, active: boolean) => void;
  removeContact: (id: string) => void;
  newContactName: string;
  setNewContactName: (v: string) => void;
  newContactPhone: string;
  setNewContactPhone: (v: string) => void;
  newContactRelation: string;
  setNewContactRelation: (v: string) => void;
  addSafeContact: () => void;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  setShowCheckout: (v: boolean) => void;
  setAudioFile: (v: File | null) => void;
  audioFile: File | null;
  analyzeAudio: () => void;
  isAnalyzingAudio: boolean;
  triggerPanic: () => void;
}

export const EmergencyView: React.FC<EmergencyViewProps> = ({
  t, callEmergencyService, isListeningAudio, setIsListeningAudio,
  contactAccessPermission, setContactAccessPermission, allowContactLocation,
  setAllowContactLocation, emergencyContacts, toggleContact, removeContact,
  newContactName, setNewContactName, newContactPhone, setNewContactPhone,
  newContactRelation, setNewContactRelation, addSafeContact, userProfile,
  isAdmin, setShowCheckout, setAudioFile, audioFile, analyzeAudio,
  isAnalyzingAudio, triggerPanic
}) => {
  return (
    <motion.div key="emergency" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">{t.emergency}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t.emergencySubtitle}</p>
        </div>
        <div className="bg-rose-100 dark:bg-rose-900/30 p-3 rounded-2xl">
          <ShieldAlert className="w-6 h-6 text-rose-600 dark:text-rose-400" />
        </div>
      </div>

      {/* Emergency Services Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => callEmergencyService('190')}
          className="p-6 bg-white dark:bg-slate-900 border-2 border-rose-100 dark:border-rose-900/30 rounded-3xl text-left hover:border-rose-500 dark:hover:border-rose-500 transition-all group"
        >
          <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900/30 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-rose-600 dark:group-hover:bg-rose-600 group-hover:text-white transition-colors">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <p className="text-lg font-black text-slate-800 dark:text-slate-100">{t.police190}</p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">{t.directActivation}</p>
        </button>
        <button 
          onClick={() => callEmergencyService('192')}
          className="p-6 bg-white dark:bg-slate-900 border-2 border-rose-100 dark:border-rose-900/30 rounded-3xl text-left hover:border-rose-500 dark:hover:border-rose-500 transition-all group"
        >
          <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900/30 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-rose-600 dark:group-hover:bg-rose-600 group-hover:text-white transition-colors">
            <Activity className="w-6 h-6" />
          </div>
          <p className="text-lg font-black text-slate-800 dark:text-slate-100">{t.samu192}</p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">{t.medicalEmergency}</p>
        </button>
      </div>

      {/* Real-time Audio Listening */}
      <div className="p-6 bg-slate-900 dark:bg-slate-950 rounded-3xl text-white space-y-4 border border-slate-800 dark:border-slate-900 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${isListeningAudio ? 'bg-rose-500 animate-pulse' : 'bg-slate-800 dark:bg-slate-900'}`}>
              <Mic className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-black">{t.realTimeListening}</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">{t.listeningDescription}</p>
            </div>
          </div>
          <button 
            onClick={() => setIsListeningAudio(!isListeningAudio)}
            className={`w-12 h-6 rounded-full transition-all relative ${isListeningAudio ? 'bg-rose-500' : 'bg-slate-700 dark:bg-slate-800'}`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isListeningAudio ? 'left-7' : 'left-1'}`} />
          </button>
        </div>
        {isListeningAudio && (
          <div className="flex items-center gap-2 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">
            <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping" />
            <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">{t.localAudioActive}</span>
          </div>
        )}
      </div>

      {/* Contact Access & Location Permission */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${contactAccessPermission ? 'bg-indigo-100 dark:bg-indigo-900/30' : 'bg-slate-100 dark:bg-slate-800'}`}>
              <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-sm font-black text-slate-800 dark:text-slate-100">{t.contactAccess}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">{t.contactAccessDescription}</p>
            </div>
          </div>
          <button 
            onClick={() => setContactAccessPermission(!contactAccessPermission)}
            className={`w-12 h-6 rounded-full transition-all relative ${contactAccessPermission ? 'bg-indigo-600 dark:bg-indigo-500' : 'bg-slate-200 dark:bg-slate-700'}`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${contactAccessPermission ? 'left-7' : 'left-1'}`} />
          </button>
        </div>

        <div className="h-px bg-slate-100 dark:bg-slate-800" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${allowContactLocation ? 'bg-indigo-100 dark:bg-indigo-900/30' : 'bg-slate-100 dark:bg-slate-800'}`}>
              <MapPin className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-sm font-black text-slate-800 dark:text-slate-100">{t.allowContactLocation}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">{t.contactLocationDescription}</p>
            </div>
          </div>
          <button 
            onClick={() => setAllowContactLocation(!allowContactLocation)}
            className={`w-12 h-6 rounded-full transition-all relative ${allowContactLocation ? 'bg-indigo-600 dark:bg-indigo-500' : 'bg-slate-200 dark:bg-slate-700'}`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${allowContactLocation ? 'left-7' : 'left-1'}`} />
          </button>
        </div>
        
        {(allowContactLocation && contactAccessPermission) && (
          <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">{t.contactLocationActive}</span>
          </div>
        )}
      </div>

      {/* Safe Contacts Management */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">{t.safeContacts}</h3>
          <Users className="w-4 h-4 text-slate-400 dark:text-slate-500" />
        </div>
        
        <div className="grid grid-cols-1 gap-3">
          {emergencyContacts.filter(c => !c.deleted).map((contact, idx) => (
            <div key={`emergency-contact-${contact.id || `idx-${idx}-${contact.nome}`}`} className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xs ${contact.active ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'}`}>
                  {contact.nome.charAt(0)}
                </div>
                <div>
                  <p className="text-xs font-black text-slate-800 dark:text-slate-100">{contact.nome}</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">{contact.telefone} • {contact.parentesco}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => toggleContact(contact.id, contact.active)}
                  className={`p-2 rounded-xl transition-all ${contact.active ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30' : 'text-slate-300 dark:text-slate-600 bg-slate-50 dark:bg-slate-800'}`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => removeContact(contact.id)}
                  className="p-2 text-slate-300 dark:text-slate-600 hover:text-rose-600 dark:hover:text-rose-400 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add New Contact Form */}
        <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-3">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{t.addNewContact}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input 
              type="text" 
              placeholder={t.emergencyContactName} 
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-xs font-medium focus:ring-2 focus:ring-indigo-500 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
              value={newContactName}
              onChange={(e) => setNewContactName(e.target.value)}
            />
            <input 
              type="text" 
              placeholder={t.emergencyContactPhone} 
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-xs font-medium focus:ring-2 focus:ring-indigo-500 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
              value={newContactPhone}
              onChange={(e) => setNewContactPhone(e.target.value)}
            />
            <input 
              type="text" 
              placeholder={t.emergencyContactRelation} 
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-xs font-medium focus:ring-2 focus:ring-indigo-500 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 sm:col-span-2"
              value={newContactRelation}
              onChange={(e) => setNewContactRelation(e.target.value)}
            />
          </div>
          <button 
            onClick={addSafeContact}
            className="w-full py-3 bg-slate-900 dark:bg-slate-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 dark:hover:bg-indigo-500 transition-all"
          >
            {t.saveContact}
          </button>
        </div>
      </div>

        <ProGuard isPro={userProfile?.plan === 'pro' || userProfile?.isVip === true || isAdmin} t={t} setShowCheckout={setShowCheckout}>
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded-xl">
                <Mic className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-800 dark:text-slate-200">{t.aiAudioAnalysis}</h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">{t.audioDescription}</p>
              </div>
            </div>
            <input type="file" accept="audio/*" onChange={(e) => setAudioFile(e.target.files?.[0] || null)} className="w-full text-xs text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-rose-50 dark:file:bg-rose-900/30 file:text-rose-700 dark:file:text-rose-400 hover:file:bg-rose-100 dark:hover:file:bg-rose-900/50" />
            <button 
              onClick={analyzeAudio}
              disabled={isAnalyzingAudio || !audioFile}
              title={t.sendForAnalysis}
              className="w-full mt-4 py-4 bg-rose-600 dark:bg-rose-500 text-white rounded-2xl font-black text-sm shadow-lg shadow-rose-200 dark:shadow-none hover:bg-rose-700 dark:hover:bg-rose-600 transition-all disabled:opacity-50"
            >
              {isAnalyzingAudio ? t.analyzing : t.sendForAnalysis}
            </button>
          </div>
        </ProGuard>

      <div className="space-y-4">
        <button 
          onClick={triggerPanic}
          title={t.panicButton}
          className="w-full py-6 bg-rose-600 dark:bg-rose-500 text-white rounded-3xl font-black text-lg shadow-2xl shadow-rose-200 dark:shadow-none hover:bg-rose-700 dark:hover:bg-rose-600 transition-all transform active:scale-95 flex items-center justify-center gap-4"
        >
          <Zap className="w-6 h-6 animate-pulse" />
          {t.panicButton}
        </button>
        <p className="text-center text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">{t.panicDescription}</p>
      </div>
    </motion.div>
  );
};
