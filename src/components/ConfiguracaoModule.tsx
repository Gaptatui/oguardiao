
import React, { useState, useEffect, useRef } from 'react';
import { 
  collection, addDoc, onSnapshot, query, orderBy, where,
  limit, updateDoc, doc, getDoc, setDoc, deleteDoc
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { 
  Language, UserProfile, OperationType 
} from '../types';
import { SettingsView } from './views/SettingsView';

interface ConfiguracaoModuleProps {
  user: any;
  userProfile: UserProfile | null;
  setUserProfile: (profile: UserProfile | null) => void;
  t: any;
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  handleFirestoreError: (error: unknown, operationType: OperationType, path: string | null) => void;
  onDataChange: (data: { 
    personalData: any,
    setPersonalData: (data: any) => void,
    saveSettings: () => void,
    cancelSubscription: () => void
  }) => void;
  showUI: boolean;
  isAdmin: boolean;
  setShowCheckout: (show: boolean) => void;
}

export const ConfiguracaoModule: React.FC<ConfiguracaoModuleProps> = ({
  user, userProfile, setUserProfile, t, language, setLanguage, 
  theme, setTheme, showToast, handleFirestoreError, onDataChange, 
  showUI, isAdmin, setShowCheckout
}) => {
  const [personalData, setPersonalData] = useState({
    name: '',
    email: '',
    phone: '',
    birthDay: '',
    birthMonth: ''
  });

  useEffect(() => {
    if (user) {
      fetchUserSettings(user);
    }
  }, [user]);

  const fetchUserSettings = async (u: any) => {
    try {
      const docRef = doc(db, 'configuracoes_usuario', u.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.language) setLanguage(data.language as Language);
        if (data.personalData) setPersonalData(data.personalData);
      } else {
        const initialData = {
          name: u.displayName || '',
          email: u.email || '',
          phone: '',
          birthDay: '',
          birthMonth: ''
        };
        await setDoc(docRef, {
          language: 'pt',
          personalData: initialData,
          updatedAt: Date.now()
        });
        setPersonalData(initialData);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `configuracoes_usuario/${u.uid}`);
    }
  };

  const saveSettings = async () => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'configuracoes_usuario', user.uid), {
        language,
        personalData,
        updatedAt: Date.now()
      });
      
      await updateDoc(doc(db, 'users', user.uid), {
        name: personalData.name,
        birthDay: parseInt(personalData.birthDay) || 0,
        birthMonth: parseInt(personalData.birthMonth) || 0
      });

      showToast(t.settingsSavedAlert, 'success');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `configuracoes_usuario/${user.uid}`);
    }
  };

  const cancelSubscription = async () => {
    if (!user) return;
    // Note: setConfirmDialog is in App.tsx, so we might need to pass it or handle it here.
    // For simplicity, I'll assume we handle the confirmation logic where it's called.
    // But since the user wants a minimal App.tsx, I'll implement a simple confirm here if possible,
    // or just assume the parent handles it.
    // Actually, I'll just implement the logic and let the parent call it.
    const userRef = doc(db, 'users', user.uid);
    const cancelData = {
      plan: 'free' as 'free' | 'pro',
      subscriptionStatus: 'inactive' as 'active' | 'inactive' | 'past_due',
      nextBillingDate: null
    };
    await updateDoc(userRef, cancelData);
    setUserProfile(userProfile ? { ...userProfile, ...cancelData } : null);
    showToast(t.subscriptionCancelled, "info");
  };

  const lastDataRef = useRef<string>('');

  // Sync Data with App.tsx
  useEffect(() => {
    const dataToSync = {
      personalData,
      setPersonalData,
      saveSettings,
      cancelSubscription
    };

    const dataString = JSON.stringify({ personalData, language });

    if (dataString !== lastDataRef.current) {
      lastDataRef.current = dataString;
      onDataChange(dataToSync);
    }
  }, [personalData, language, onDataChange]);

  return (
    <>
      {showUI && (
        <SettingsView 
          t={t}
          user={user}
          userProfile={userProfile}
          language={language}
          setLanguage={setLanguage}
          theme={theme}
          setTheme={setTheme}
          handleLogout={() => signOut(auth)}
          setShowCheckout={setShowCheckout}
          isAdmin={isAdmin}
          personalData={personalData}
          setPersonalData={setPersonalData}
          saveSettings={saveSettings}
          cancelSubscription={cancelSubscription}
        />
      )}
    </>
  );
};
