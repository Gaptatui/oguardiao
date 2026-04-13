
import React from 'react';
import { motion } from 'motion/react';
import { 
  Navigation, MapPin, User, Users, Car, Bell, Search, ShieldCheck, 
  ExternalLink, Clock, Heart, Activity, Pill, QrCode, Zap, Trash2,
  Briefcase, Clapperboard, ShoppingBag, Theater, Beer, Utensils,
  ShoppingBasket, Store, Plus, CheckCircle2, Star, ShieldQuestion, Mic, ShieldAlert
} from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { ProGuard } from '../Common';
import { formatDate } from '../../lib/utils';
import { 
  Alerta, NeighborAlert, Medication, TalentService, Device, 
  UserProfile, Expense, Debt 
} from '../../types';

interface DashboardViewProps {
  t: any;
  language: string;
  allowContactLocation: boolean;
  contactAccessPermission: boolean;
  emergencyContacts: any[];
  isWalking: boolean;
  simulateFall: () => void;
  setAllowContactLocation: (v: boolean) => void;
  setContactAccessPermission: (v: boolean) => void;
  carLocation: any;
  saveCarLocation: () => void;
  openCarRoute: () => void;
  carReminderEnabled: boolean;
  setCarReminderEnabled: (v: boolean) => void;
  carReminderInterval: number;
  setCarReminderInterval: (v: number) => void;
  carAutoDisableTime: number;
  setCarAutoDisableTime: (v: number) => void;
  setCarLocation: (v: any) => void;
  setCarSaveTimestamp: (v: any) => void;
  showToast: (m: string, t: any) => void;
  origin: string;
  setOrigin: (v: string) => void;
  getCurrentLocation: () => void;
  destination: string;
  setDestination: (v: string) => void;
  calculateSafeRoute: () => void;
  isCalculatingRoute: boolean;
  safeRouteSuggestion: string;
  mapUrl: string;
  neighborAlerts: NeighborAlert[];
  userProfile: UserProfile | null;
  isAdmin: boolean;
  setShowCheckout: (v: boolean) => void;
  toggleWalking: () => void;
  setView: (v: any) => void;
  callEmergencyService: (n: string) => void;
  services: TalentService[];
  heartRate: number;
  medications: Medication[];
  healthTab: 'PHARMACIES' | 'UNITS';
  setHealthTab: (v: 'PHARMACIES' | 'UNITS') => void;
  fetchNearbyPharmacies: () => void;
  fetchNearbyUnits: () => void;
  isFetchingPharmacies: boolean;
  isFetchingUnits: boolean;
  pharmacies: any[];
  healthUnitsList: any[];
  expenses: Expense[];
  debts: Debt[];
  formatCurrency: (v: number, l: string) => string;
  leisureCategory: string;
  setLeisureCategory: (v: any) => void;
  leisureSubCategory: string;
  setLeisureSubCategory: (v: any) => void;
  isFetchingLeisure: boolean;
  fetchNearbyLeisure: (c: string, s: string) => void;
  user: any;
  devices: Device[];
  removeDevice: (id: string) => void;
  updateDeviceInterval: (id: string, i: number) => void;
  setShowAddDevice: (v: boolean) => void;
  leisureList: any[];
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  t, language, allowContactLocation, contactAccessPermission, emergencyContacts,
  isWalking, simulateFall, setAllowContactLocation, setContactAccessPermission,
  carLocation, saveCarLocation, openCarRoute, carReminderEnabled, setCarReminderEnabled,
  carReminderInterval, setCarReminderInterval, carAutoDisableTime, setCarAutoDisableTime,
  setCarLocation, setCarSaveTimestamp, showToast, origin, setOrigin, getCurrentLocation,
  destination, setDestination, calculateSafeRoute, isCalculatingRoute, safeRouteSuggestion,
  mapUrl, neighborAlerts, userProfile, isAdmin, setShowCheckout, toggleWalking, setView,
  callEmergencyService, services, heartRate, medications, healthTab, setHealthTab,
  fetchNearbyPharmacies, fetchNearbyUnits, isFetchingPharmacies, isFetchingUnits,
  pharmacies, healthUnitsList, expenses, debts, formatCurrency, leisureCategory,
  setLeisureCategory, leisureSubCategory, setLeisureSubCategory, isFetchingLeisure,
  fetchNearbyLeisure, user, devices, removeDevice, updateDeviceInterval, setShowAddDevice,
  leisureList
}) => {
  return (
    <motion.div 
      key="dashboard"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start"
    >
      <div className="space-y-8">
        {/* Block 1: Security */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-800 space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-black flex items-center gap-3 text-slate-900 dark:text-slate-100">
            <Navigation className="w-8 h-8 text-indigo-600 dark:text-indigo-400" /> {t.localSecurity}
          </h2>
          <span className="text-[10px] font-bold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-3 py-1.5 rounded-full uppercase tracking-wider">{t.santosSP}</span>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="space-y-4 flex flex-col">
            <div className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-3xl relative overflow-hidden flex items-center justify-center border border-slate-200 dark:border-slate-700 group shadow-inner">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(79,70,229,0.15),transparent_70%)]" />
              
              {/* Visual Risk Zones on Map */}
              <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-20">
                {t.riskZones?.map((zone: any, idx: number) => (
                  <div key={`risk-zone-map-${zone.name}-${idx}-${zone.level}`} className="flex items-center gap-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className={`w-2 h-2 rounded-full ${zone.color}`} />
                    <span className="text-[8px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-tighter">{zone.name}</span>
                  </div>
                ))}
              </div>

              {/* Safe Contacts on Map */}
              {allowContactLocation && contactAccessPermission && emergencyContacts && emergencyContacts.filter(c => !c.deleted).map((contact, idx) => (
                <motion.div
                  key={`contact-marker-${contact.id || `idx-${idx}-${contact.nome}`}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute z-30 group/marker"
                  style={{ left: `${contact.x}%`, top: `${contact.y}%` }}
                >
                  <div className="relative">
                    <div className="bg-indigo-600 p-1.5 rounded-full shadow-lg border-2 border-white cursor-pointer hover:scale-110 transition-transform">
                      <User className="w-3 h-3 text-white" />
                    </div>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover/marker:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      <div className="bg-slate-900 text-white text-[8px] font-black px-2 py-1 rounded-lg uppercase tracking-widest shadow-xl">
                        {contact.nome}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}

              <div className="text-center space-y-3 relative z-10 p-4">
                <MapPin className="w-10 h-10 text-indigo-500 mx-auto animate-bounce" />
                <p className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-[0.2em]">{t.activeHeatmap}</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">{t.routeSuggestion}</p>
              </div>
              {isWalking && (
                <div className="absolute bottom-4 left-4 right-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur p-3 rounded-xl border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">{t.monitoringPath}</span>
                  </div>
                  <button 
                    onClick={simulateFall} 
                    title={t.simulateFall}
                    className="text-[10px] font-bold text-rose-600 dark:text-rose-400 hover:underline"
                  >
                    {t.simulateFall}
                  </button>
                </div>
              )}
            </div>

            {/* Contact Map Toggle */}
            <div className="flex items-center justify-between p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${contactAccessPermission ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">{t.showContactsOnMap}</p>
                  <p className="text-[8px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-tighter">
                    {contactAccessPermission ? t.contactsSynced : t.contactsNotSynced}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => {
                  if (!contactAccessPermission) {
                    setContactAccessPermission(true);
                    setAllowContactLocation(true);
                  } else {
                    setAllowContactLocation(!allowContactLocation);
                  }
                }}
                title={t.showContactsOnMap}
                className={`w-10 h-5 rounded-full transition-all relative ${allowContactLocation && contactAccessPermission ? 'bg-indigo-600' : 'bg-slate-300'}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${(allowContactLocation && contactAccessPermission) ? 'left-5.5' : 'left-0.5'}`} />
              </button>
            </div>
          </div>

          <div className="space-y-6 flex flex-col">
            {/* Find My Car Section */}
            <div className="flex-1 space-y-5 bg-slate-50 dark:bg-slate-800/50 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 flex flex-col justify-center shadow-sm">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 uppercase tracking-[0.2em]">{t.findMyCar}</h3>
                  <div className="h-1 w-12 bg-indigo-500 rounded-full" />
                </div>
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl">
                  <Car className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-md">
                {t.carLocationDescription}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <button 
                  onClick={saveCarLocation}
                  title={t.markCarLocation}
                  className="group flex flex-col items-center justify-center gap-3 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-[10px] font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest hover:border-indigo-500 hover:shadow-md transition-all active:scale-95"
                >
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 transition-colors">
                    <MapPin className="w-5 h-5 text-indigo-600" />
                  </div>
                  {t.markCarLocation}
                </button>
                <button 
                  onClick={openCarRoute}
                  disabled={!carLocation}
                  title={t.returnToCar}
                  className="group flex flex-col items-center justify-center gap-3 p-6 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none transition-all disabled:opacity-50 disabled:bg-slate-300 dark:disabled:bg-slate-800 active:scale-95"
                >
                  <div className="p-3 bg-white/10 rounded-xl group-hover:bg-white/20 transition-colors">
                    <Navigation className="w-5 h-5" />
                  </div>
                  {t.returnToCar}
                </button>
              </div>
              {carLocation && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 space-y-4"
                >
                  <div className="flex items-center gap-3 px-5 py-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
                    <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                    <span className="text-[11px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">Localização Salva com Sucesso</span>
                  </div>

                  <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-indigo-600" />
                        <span className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">{t.carReminder}</span>
                      </div>
                      <button 
                        onClick={() => setCarReminderEnabled(!carReminderEnabled)}
                        className={`w-10 h-5 rounded-full transition-all relative ${carReminderEnabled ? 'bg-indigo-600' : 'bg-slate-300'}`}
                      >
                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${carReminderEnabled ? 'left-5.5' : 'left-0.5'}`} />
                      </button>
                    </div>

                    {carReminderEnabled && (
                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="space-y-1">
                          <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{t.carReminderInterval}</label>
                          <input 
                            type="number" 
                            value={carReminderInterval}
                            onChange={(e) => setCarReminderInterval(parseInt(e.target.value))}
                            className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{t.carAutoDisable}</label>
                          <input 
                            type="number" 
                            value={carAutoDisableTime}
                            onChange={(e) => setCarAutoDisableTime(parseInt(e.target.value))}
                            className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
                          />
                        </div>
                      </div>
                    )}

                    <button 
                      onClick={() => {
                        setCarLocation(null);
                        setCarSaveTimestamp(null);
                        setCarReminderEnabled(false);
                        localStorage.removeItem('guardian-car-location');
                        localStorage.removeItem('guardian-car-timestamp');
                        showToast(t.carReminderDisabled, "info");
                      }}
                      className="w-full py-2 text-[9px] font-black text-rose-500 uppercase tracking-widest hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all"
                    >
                      Limpar Localização
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Safe Route Planning */}
            <div className="space-y-4 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
              <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">{t.planSafeRoute}</h3>
              <div className="space-y-3">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder={t.fromWhere || "De onde você está saindo?"} 
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-4 pr-12 py-3 text-xs font-medium focus:ring-2 focus:ring-indigo-500 transition-all dark:text-slate-100"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                  />
                  <button 
                    onClick={getCurrentLocation}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-all"
                    title={t.useCurrentLocation || "Usar localização atual"}
                  >
                    <MapPin className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder={t.toWhere || "Para onde você vai?"} 
                    className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs font-medium focus:ring-2 focus:ring-indigo-500 transition-all dark:text-slate-100"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                  />
                  <button 
                    onClick={calculateSafeRoute}
                    disabled={isCalculatingRoute || !destination?.trim() || !origin?.trim()}
                    title={t.calculate || "Calcular Rota Segura"}
                    className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50"
                  >
                    {isCalculatingRoute ? <Clock className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              {safeRouteSuggestion && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 space-y-4"
                >
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> {t.recommendedRoute}
                    </p>
                    <p className="text-xs text-indigo-900 dark:text-indigo-100 leading-relaxed font-medium">{safeRouteSuggestion}</p>
                  </div>

                  {mapUrl && (
                    <div className="space-y-3">
                      <div className="w-full h-40 rounded-xl overflow-hidden border border-indigo-200 shadow-sm bg-white">
                        <iframe
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          loading="lazy"
                          allowFullScreen
                          referrerPolicy="no-referrer"
                          src={mapUrl}
                        />
                      </div>
                      <a 
                        href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-3 bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all"
                      >
                        <ExternalLink className="w-3 h-3" /> {t.openInGoogleMaps}
                      </a>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </div>
        </div>


        {/* Risk Zones List */}
        <div className="space-y-3">
          <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">{t.attentionZones}</h3>
          <div className="grid grid-cols-1 gap-2">
            {t.riskZones?.map((zone: any, idx: number) => (
              <div key={`risk-zone-list-${zone.name}-${idx}-${zone.level}`} className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-sm">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${zone.color}`} />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{zone.name}</span>
                </div>
                <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${zone.level === 'ALTO' || zone.level === 'HIGH' ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'}`}>
                  {t.risk} {zone.level}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">{t.neighborNetwork}</h3>
            <Plus className="w-4 h-4 text-slate-400 dark:text-slate-500 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" />
          </div>
          <div className="space-y-3">
            {neighborAlerts && neighborAlerts.length > 0 ? neighborAlerts.map((alert, idx) => (
              <div key={`neighbor-alert-${alert.id || `idx-${idx}-${alert.titulo}`}`} className="flex gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-indigo-100 dark:hover:border-indigo-900/50 transition-all">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{alert.titulo}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{alert.descricao}</p>
                </div>
              </div>
            )) : (
              <p className="text-xs text-slate-400 dark:text-slate-500 italic">{t.noRecentAlerts}</p>
            )}
          </div>
        </div>
        
          <ProGuard isPro={userProfile?.plan === 'pro' || userProfile?.isVip === true || isAdmin} t={t} setShowCheckout={setShowCheckout}>
            <button 
              onClick={toggleWalking}
              className={`w-full py-5 rounded-2xl font-black text-sm flex items-center justify-center gap-3 transition-all transform active:scale-95 ${
                isWalking ? 'bg-rose-600 text-white shadow-xl shadow-rose-200' : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              {isWalking ? <Zap className="w-5 h-5 animate-pulse" /> : <Navigation className="w-5 h-5" />}
              {isWalking 
                ? `${t.endWalkWithMe} ${destination ? `${t.to} ${destination.toUpperCase()}` : ''}` 
                : `${t.startWalkWithMe} ${destination ? `${t.to} ${destination.toUpperCase()}` : ''}`}
            </button>
          </ProGuard>
      </section>

      {/* Block 4: Quick Actions (Moved below Security) */}
        <section className="bg-indigo-600 rounded-3xl p-8 text-white shadow-2xl flex flex-col justify-between relative overflow-hidden group min-h-[300px]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 transition-transform group-hover:scale-110" />
          <div className="space-y-3 relative z-10">
            <h2 className="text-3xl font-black leading-none tracking-tighter uppercase">{t.welcome}</h2>
            <p className="text-indigo-100 text-sm font-medium">{t.panicDescription}</p>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-12 relative z-10">
            <button 
              onClick={() => setView('SCAM')} 
              title={t.analyzeScam}
              className="bg-white/10 backdrop-blur-md p-6 rounded-3xl text-left hover:bg-white/20 transition-all border border-white/10 group/btn"
            >
              <ShieldQuestion className="w-8 h-8 mb-3 transition-transform group-hover/btn:-rotate-12" />
              <p className="text-sm font-black">{t.analyzeScam}</p>
              <p className="text-[10px] text-indigo-200 mt-1">{t.scamDescription}</p>
            </button>
            <button 
              onClick={() => callEmergencyService('190')} 
              title={t.emergency190}
              className="bg-white/10 backdrop-blur-md p-6 rounded-3xl text-left hover:bg-white/20 transition-all border border-white/10 group/btn"
            >
              <Mic className="w-8 h-8 mb-3 transition-transform group-hover/btn:scale-110" />
              <p className="text-sm font-black">{t.emergency190}</p>
              <p className="text-[10px] text-indigo-200 mt-1">{t.emergencyDescription}</p>
            </button>
          </div>
        </section>

        {/* Block 5: Protection against Scams and Fraud */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-800 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black flex items-center gap-2 text-slate-900 dark:text-slate-100">
              <Briefcase className="w-6 h-6 text-amber-600 dark:text-amber-500" /> {t.financialStability}
            </h2>
          </div>

          <div className="p-6 bg-amber-50 dark:bg-amber-900/20 rounded-3xl border border-amber-100 dark:border-amber-900/30 flex items-start gap-5">
            <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm">
              <ShieldAlert className="w-6 h-6 text-amber-600 dark:text-amber-500" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-black text-amber-900 dark:text-amber-100">{t.antiFraudShieldActive}</p>
              <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">{t.aiMonitoringDescription}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">{t.generalConsultancies}</h3>
              <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer" />
            </div>
            <div className="grid grid-cols-1 gap-4">
              {services && services.length > 0 ? services.map((service, idx) => (
                <div key={`service-${service.id || `idx-${idx}-${service.titulo}`}`} className="p-5 border border-slate-100 dark:border-slate-800 rounded-3xl hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-all cursor-pointer group bg-slate-50/50 dark:bg-slate-800/30">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1 rounded-full text-slate-600 dark:text-slate-300 uppercase tracking-wider">{service.categoria}</span>
                    <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-3 h-3" />
                      <span className="text-[10px] font-bold">{t.safeLabel}</span>
                    </div>
                  </div>
                  <p className="text-base font-black text-slate-800 dark:text-slate-100 mb-1">{service.titulo}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">{service.descricao}</p>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">{service.preco}</span>
                    <button 
                      title={t.hire}
                      className="text-[10px] font-black bg-slate-900 dark:bg-slate-700 text-white px-4 py-2 rounded-xl uppercase tracking-widest hover:bg-indigo-600 dark:hover:bg-indigo-500 transition-colors"
                    >
                      {t.hire}
                    </button>
                  </div>
                </div>
              )) : (
          <ProGuard isPro={userProfile?.plan === 'pro' || userProfile?.isVip === true || isAdmin} t={t} setShowCheckout={setShowCheckout}>
            <div className="p-5 border border-slate-100 dark:border-slate-800 rounded-3xl bg-slate-50/50 dark:bg-slate-800/30">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1 rounded-full text-slate-600 dark:text-slate-300 uppercase tracking-wider">{t.specialist}</span>
                <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-3 h-3" />
                  <span className="text-[10px] font-bold">{t.verified}</span>
                </div>
              </div>
              <p className="text-base font-black text-slate-800 dark:text-slate-100 mb-1">{t.strategicConsultancy}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">{t.consultancyDescription}</p>
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">{t.toBeAgreed}</span>
                <button 
                  title={t.learnMore}
                  className="text-[10px] font-black bg-slate-900 dark:bg-slate-700 text-white px-4 py-2 rounded-xl uppercase tracking-widest"
                >
                  {t.learnMore}
                </button>
              </div>
            </div>
          </ProGuard>
              )}
            </div>
          </div>
        </section>
      </div>

      <div className="space-y-8">
        {/* Block 2: Health */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-800 space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black flex items-center gap-2 text-slate-900 dark:text-slate-100">
            <Heart className="w-6 h-6 text-rose-600 dark:text-rose-400" /> {t.healthWellness}
          </h2>
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30 px-3 py-1.5 rounded-full">
            <Activity className="w-4 h-4" />
            <span className="text-sm font-black tracking-tighter">{heartRate} BPM</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{t.aiCheckup}</p>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-200 leading-tight">{t.heartRateStable}</p>
          </div>
          <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3 relative group">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{t.nextMedication}</p>
              <button 
                onClick={() => setView('SAUDE')}
                className="p-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors opacity-0 group-hover:opacity-100"
                title={t.manageMedications}
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
            {medications && medications.length > 0 ? (
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                  <Pill className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{medications[0].nome}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">{medications[0].horario} • {medications[0].dosagem}</p>
                  <p className="text-[8px] text-indigo-600 dark:text-indigo-400 font-black uppercase tracking-widest mt-0.5">
                    {medications[0].usoContinuo ? t.continuousUse : `${formatDate(medications[0].dataInicio)} - ${formatDate(medications[0].dataFim)}`}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 italic">{t.noActiveReminders}</p>
            )}
          </div>
        </div>

        <div className="bg-indigo-900 dark:bg-indigo-950 rounded-3xl p-8 text-white flex flex-col sm:flex-row items-center gap-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-800 dark:bg-indigo-900 rounded-full -mr-16 -mt-16 opacity-50" />
          <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl shadow-2xl relative z-10">
            <QRCodeCanvas value={user?.uid || 'no-user'} size={80} />
          </div>
          <div className="space-y-2 text-center sm:text-left relative z-10">
            <h3 className="text-lg font-black flex items-center justify-center sm:justify-start gap-2">
              <QrCode className="w-5 h-5" /> {t.universalWallet}
            </h3>
            <p className="text-xs text-indigo-200 dark:text-indigo-300 leading-relaxed max-w-[200px]">{t.qrCodeDescription}</p>
            <button className="text-xs font-bold underline hover:text-white transition-colors">{t.manageMedicalData}</button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">{t.monitoringDevices}</h3>
            <button 
              onClick={() => setShowAddDevice(true)}
              title={t.addDevice || "Adicionar Novo Dispositivo"}
              className="p-1.5 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {devices && devices.length > 0 ? devices.map((device, idx) => (
              <div key={`device-${device.id || `idx-${idx}-${device.name}`}`} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${device.status === 'connected' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500'}`}>
                    {device.type === 'smartwatch' ? <Zap className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{device.name}</p>
                    <div className="flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${device.status === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300 dark:bg-slate-600'}`} />
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">
                        {device.status === 'connected' ? t.connected : t.disconnected}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <Clock className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                      <select 
                        value={device.readingInterval}
                        onChange={(e) => updateDeviceInterval(device.id, parseInt(e.target.value))}
                        className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-transparent border-none p-0 focus:ring-0 cursor-pointer"
                      >
                        {[1, 3, 5, 10, 30, 60].map(val => (
                          <option key={val} value={val} className="dark:bg-slate-800">{val}s</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-black text-slate-800 dark:text-slate-200">{device.value} <span className="text-[10px] text-slate-400 dark:text-slate-500">{device.unit}</span></p>
                    <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase">{t.realTimeData}</p>
                  </div>
                  <button 
                    onClick={() => removeDevice(device.id)}
                    title={t.remove || "Remover Dispositivo"}
                    className="p-1.5 text-slate-300 dark:text-slate-600 hover:text-rose-500 dark:hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )) : (
              <p className="text-xs text-slate-400 dark:text-slate-500 italic text-center py-4">{t.noDevices}</p>
            )}
          </div>
        </div>

        <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-6">
          <button 
            onClick={() => {
              if (healthTab === 'PHARMACIES') fetchNearbyPharmacies();
              else setHealthTab('PHARMACIES');
            }}
            className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${healthTab === 'PHARMACIES' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
          >
            {t.nearbyPharmacies}
          </button>
          <button 
            onClick={() => {
              if (healthTab === 'UNITS') fetchNearbyUnits();
              else setHealthTab('UNITS');
            }}
            className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${healthTab === 'UNITS' ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-sm' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
          >
            {t.nearbyUnits}
          </button>
        </div>

        <div className="flex justify-end mb-4">
            <button 
              onClick={() => healthTab === 'PHARMACIES' ? fetchNearbyPharmacies() : fetchNearbyUnits()}
              disabled={isFetchingPharmacies || isFetchingUnits}
              title={t.refresh}
              className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors disabled:opacity-50"
            >
            <Clock className={`w-3 h-3 ${(isFetchingPharmacies || isFetchingUnits) ? 'animate-spin' : ''}`} />
            {t.refresh}
          </button>
        </div>

        {healthTab === 'PHARMACIES' ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">{t.nearbyPharmacies}</h3>
              {isFetchingPharmacies && <Clock className="w-4 h-4 animate-spin text-indigo-600 dark:text-indigo-400" />}
            </div>
            <div className="space-y-3">
              {pharmacies?.map((pharmacy, idx) => (
                <a 
                  key={`pharmacy-${pharmacy.name}-${idx}`} 
                  href={pharmacy.uri} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-indigo-100 dark:hover:border-indigo-900/50 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                      <Pill className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{pharmacy.name}</span>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">{t.pharmacy}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {pharmacy.distance && (
                      <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-lg">
                        {pharmacy.distance}
                      </span>
                    )}
                    <div className="flex items-center gap-1 text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-tighter group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      <span>{t.openInGoogleMaps || "Ver no Mapa"}</span>
                      <ExternalLink className="w-3 h-3" />
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">{t.nearbyUnits}</h3>
              {isFetchingUnits && <Clock className="w-4 h-4 animate-spin text-rose-600 dark:text-rose-400" />}
            </div>
            <div className="space-y-3">
              {healthUnitsList?.map((unit, idx) => (
                <a 
                  key={`unit-${unit.name}-${idx}`} 
                  href={unit.uri} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-rose-100 dark:hover:border-rose-900/50 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${unit.type === 'Hospital' ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'}`}>
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{unit.name}</span>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">{unit.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {unit.distance && (
                      <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${unit.type === 'Hospital' ? 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30' : 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30'}`}>
                        {unit.distance}
                      </span>
                    )}
                    <div className="flex items-center gap-1 text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-tighter group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                      <span>{t.openInGoogleMaps || "Ver no Mapa"}</span>
                      <ExternalLink className="w-3 h-3" />
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Block 3: Leisure & Culture */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-800 space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black flex items-center gap-2 text-slate-900 dark:text-slate-100">
            <Briefcase className="w-6 h-6 text-emerald-600 dark:text-emerald-400" /> {t.financial}
          </h2>
          <button 
            onClick={() => setView('FINANCEIRO')}
            className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest hover:underline"
          >
            {t.accessModule}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
            <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">{t.expenses}</p>
            <p className="text-xl font-black text-slate-900 dark:text-slate-100">
              {formatCurrency((expenses || []).reduce((acc, curr) => acc + (curr.valor || 0), 0), language)}
            </p>
          </div>
          <div className="p-4 bg-rose-50 dark:bg-rose-900/20 rounded-2xl border border-rose-100 dark:border-rose-900/30">
            <p className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-widest mb-1">{t.debts}</p>
            <p className="text-xl font-black text-slate-900 dark:text-slate-100">
              {formatCurrency((debts || []).reduce((acc, curr) => acc + (curr.valorTotal || 0), 0), language)}
            </p>
          </div>
        </div>
      </section>

      {/* Block 4: Leisure & Culture */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-800 space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black flex items-center gap-2 text-slate-900 dark:text-slate-100">
            <Clapperboard className="w-6 h-6 text-indigo-600 dark:text-indigo-400" /> {t.leisureCulture}
          </h2>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            { id: 'cinema', icon: Clapperboard, label: t.cinema },
            { id: 'mall', icon: ShoppingBag, label: t.mall },
            { id: 'theater', icon: Theater, label: t.theater },
            { id: 'bar', icon: Beer, label: t.bar },
            { id: 'restaurant', icon: Utensils, label: t.restaurant },
            { id: 'supermarket', icon: ShoppingBasket, label: t.supermarket },
            { id: 'bakery', icon: Store, label: t.bakery },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setLeisureCategory(cat.id as any);
                setLeisureSubCategory('');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                leisureCategory === cat.id 
                  ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-lg shadow-indigo-100 dark:shadow-none' 
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <cat.icon className="w-4 h-4" />
              {cat.label}
            </button>
          ))}
        </div>

        {leisureCategory === 'restaurant' && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3"
          >
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
              <Search className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">{t.advancedSearch}</span>
            </div>
            <div className="space-y-1">
              <label htmlFor="food-type" className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                {t.foodType}
              </label>
              <select
                id="food-type"
                value={leisureSubCategory}
                onChange={(e) => setLeisureSubCategory(e.target.value)}
                className="w-full p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-300 dark:focus:border-indigo-500 transition-all cursor-pointer"
              >
                <option value="" className="dark:bg-slate-800">{t.allTypes}</option>
                <option value="italian" className="dark:bg-slate-800">{t.italian}</option>
                <option value="japanese" className="dark:bg-slate-800">{t.japanese}</option>
                <option value="brazilian" className="dark:bg-slate-800">{t.brazilian}</option>
                <option value="fastFood" className="dark:bg-slate-800">{t.fastFood}</option>
                <option value="healthy" className="dark:bg-slate-800">{t.healthy}</option>
                <option value="pizza" className="dark:bg-slate-800">{t.pizza}</option>
                <option value="seafood" className="dark:bg-slate-800">{t.seafood}</option>
              </select>
            </div>
          </motion.div>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">{t.findLeisure}</h3>
            <div className="flex items-center gap-2">
              {isFetchingLeisure && <Clock className="w-4 h-4 animate-spin text-indigo-600 dark:text-indigo-400" />}
              <button 
                onClick={() => fetchNearbyLeisure(leisureCategory, leisureSubCategory)}
                disabled={isFetchingLeisure}
                className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors disabled:opacity-50"
              >
                <Clock className={`w-3 h-3 ${isFetchingLeisure ? 'animate-spin' : ''}`} />
                {t.refresh}
              </button>
            </div>
          </div>
          <div className="space-y-3">
            {leisureList?.map((item, idx) => (
              <a 
                key={`leisure-${item.name}-${idx}`} 
                href={item.uri} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-indigo-100 dark:hover:border-indigo-900/50 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{item.name}</span>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">{item.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {item.distance && (
                    <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-lg">
                      {item.distance}
                    </span>
                  )}
                  <div className="flex items-center gap-1 text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-tighter group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    <span>{t.openInGoogleMaps || "Ver no Mapa"}</span>
                    <ExternalLink className="w-3 h-3" />
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
      </div>
    </motion.div>
  );
};
