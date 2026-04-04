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
  Search, Plus, CheckCircle2, XCircle, AlertCircle, ChevronRight,
  ExternalLink, Clapperboard, ShoppingBag, Theater, Beer, Utensils,
  ShoppingBasket, Store, Menu, Star, Moon, Sun, HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  signInWithPopup, GoogleAuthProvider, onAuthStateChanged, 
  User as FirebaseUser, signOut 
} from 'firebase/auth';
import { 
  collection, addDoc, onSnapshot, query, orderBy, where,
  limit, updateDoc, doc, setDoc, getDoc, Timestamp
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { QRCodeCanvas } from 'qrcode.react';

// Initialize Gemini API
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const parseDistance = (distStr: string | null): number => {
  if (!distStr) return Infinity;
  const match = distStr.match(/([\d.,]+)\s*(km|m|metr|quilômetro)/i);
  if (!match) return Infinity;
  let value = parseFloat(match[1].replace(',', '.'));
  const unit = match[2].toLowerCase();
  if (unit.startsWith('k') || unit.startsWith('q')) {
    value *= 1000;
  }
  return value;
};

interface AnalysisResult {
  verdict: 'SEGURO' | 'SUSPEITO' | 'GOLPE CONFIRMADO';
  reason: string;
  action: string;
  originalText: string;
  timestamp: number;
}

import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, Legend 
} from 'recharts';

interface Alerta {
  id?: string;
  tipo: string;
  gravidade: string;
  transcricao: string;
  sons_fundo: string;
  analise_ia_audio: string;
  prioridade: string;
  timestamp: number;
  uid: string;
  status: string;
  userEmail?: string;
}

interface NeighborAlert {
  id?: string;
  titulo: string;
  descricao: string;
  categoria: string;
  timestamp: number;
  uid: string;
  userName: string;
}

interface HealthProfile {
  tipoSanguineo: string;
  alergias: string;
  historico: string;
  medicacoes: string;
}

interface Medication {
  id?: string;
  nome: string;
  horario: string;
  dosagem: string;
  uid: string;
}

interface TalentService {
  id?: string;
  titulo: string;
  descricao: string;
  categoria: string;
  preco: string;
  uid: string;
  userName: string;
}

interface Device {
  id: string;
  name: string;
  type: string;
  status: 'connected' | 'disconnected';
  value: string;
  unit: string;
  lastUpdate: number;
  readingInterval: number; // in seconds
}

interface UserProfile {
  uid: string;
  email: string;
  name?: string;
  plan: 'free' | 'pro';
  isAdmin: boolean;
  isVip?: boolean;
  timestamp: number;
  subscriptionStatus?: 'active' | 'inactive' | 'past_due';
  subscriptionPeriod?: 'monthly' | 'yearly';
  nextBillingDate?: number;
  paymentMethod?: string;
}

interface Transaction {
  id?: string;
  uid: string;
  userEmail: string;
  valor: number;
  moeda: string;
  tipo: 'assinatura_mensal' | 'assinatura_anual';
  status: 'concluido' | 'pendente' | 'falhou';
  timestamp: number;
}

interface UsageLog {
  id?: string;
  uid: string;
  modulo: 'golpes' | 'emergencia' | 'rota_segura' | 'saude' | 'talentos';
  timestamp: number;
}

type Language = 'pt' | 'en' | 'es' | 'fr' | 'de' | 'it' | 'nl' | 'zh' | 'he';

const translations = {
  pt: {
    appName: "O GUARDIAO",
    dashboard: "Início",
    emergency: "Emergência",
    scam: "Golpes",
    settings: "Configurações",
    adminPanel: "Administração",
    personalData: "Dados Pessoais",
    language: "Idioma",
    name: "Nome",
    email: "E-mail",
    phone: "Telefone",
    theme: "Tema",
    light: "Claro",
    dark: "Escuro",
    save: "Salvar",
    selectLanguage: "Selecione o Idioma",
    welcome: "Bem-vindo ao O GUARDIAO",
    quotaExceeded: "Cota da API excedida. Tente novamente em alguns instantes.",
    refresh: "Atualizar",
    sentinelActive: "SENTINELA ATIVO",
    protectionLevel: "Nível de Proteção",
    high: "ALTO",
    panicButton: "BOTÃO DE PÂNICO",
    analyzeScam: "Analisar Golpe",
    emergency190: "Emergência 190",
    scamAnalysis: "Análise de Golpes",
    activeShield: "ESCUDO ATIVO",
    automatic: "AUTOMÁTICO",
    manual: "MANUAL",
    monitoredApps: "Apps Monitorados",
    scamLogs: "Logs de Golpes",
    back: "Voltar",
    logout: "Sair",
    login: "Entrar com Google",
    healthProfile: "Perfil de Saúde",
    medications: "Medicações",
    neighborAlerts: "Alertas da Vizinhança",
    talentMarket: "Mercado de Talentos",
    safeRoute: "Rota Segura",
    calculating: "Calculando...",
    calculate: "Calcular Rota",
    panicDescription: "Aciona polícia e contatos seguros imediatamente",
    scamDescription: "Links e SMS",
    emergencyDescription: "Análise de Áudio",
    settingsDescription: "Perfil e Preferências",
    autoListening: "Escuta Automática",
    responseMode: "Modo de Resposta",
    autoDescription: "* O GUARDIAO bloqueará links e notificará contatos automaticamente ao detectar golpes.",
    manualDescription: "* Você será notificado para decidir a ação a cada ameaça detectada.",
    simulateNotification: "Simular Notificação Suspeita",
    activityLog: "LOG DE ATIVIDADES",
    clear: "Limpar",
    blockedAuto: "BLOQUEADO AUTOMATICAMENTE",
    blockedUser: "BLOQUEADO PELO USUÁRIO",
    ignoredUser: "IGNORADO PELO USUÁRIO",
    manualAnalysis: "Análise Manual",
    placeholderScam: "Cole o link ou mensagem suspeita aqui...",
    checkSecurity: "Verificar Segurança",
    analyzing: "Analisando...",
    emergencySubtitle: "Acionamento imediato e contatos seguros.",
    police190: "POLÍCIA 190",
    samu192: "SAMU 192",
    directActivation: "Acionamento Direto",
    medicalEmergency: "Emergência Médica",
    realTimeListening: "Escuta em Tempo Real",
    listeningDescription: "O GUARDIAO ouvirá o áudio local em emergências.",
    localAudioActive: "Áudio Local Ativo",
    safeContacts: "Contatos de Segurança",
    addNewContact: "Adicionar Novo Contato",
    saveContact: "Salvar Contato",
    aiAudioAnalysis: "Análise de Áudio IA",
    audioDescription: "Envie um áudio para análise imediata de perigo.",
    sendForAnalysis: "ENVIAR PARA ANÁLISE",
    controlPanel: "Painel de Controle",
    monitoringAlerts: "Monitoramento de alertas em tempo real...",
    footer: "SENTINELA • O GUARDIAO © 2026",
    verdict: "Veredito",
    reason: "Motivo",
    action: "Ação",
    safe: "SEGURO",
    suspicious: "SUSPEITO",
    scamConfirmed: "GOLPE CONFIRMADO",
    localSecurity: "SEGURANÇA LOCAL",
    santosSP: "SANTOS, SP",
    activeHeatmap: "Mapa de Calor Ativo",
    routeSuggestion: "Sugestão: Rota via Av. Ana Costa (Mais segura)",
    monitoringPath: "MONITORANDO TRAJETO",
    simulateFall: "Simular Queda",
    planSafeRoute: "Planejar Rota Segura",
    fromWhere: "De onde você está saindo?",
    toWhere: "Para onde você vai?",
    useCurrentLocation: "Usar localização atual",
    whereTo: "Para onde você vai?",
    recommendedRoute: "Rota Recomendada",
    attentionZones: "Zonas de Atenção (Santos)",
    risk: "RISCO",
    neighborNetwork: "Rede de Vizinhos",
    noRecentAlerts: "Nenhum alerta recente na sua área.",
    endWalkWithMe: "ENCERRAR CAMINHE COMIGO",
    startWalkWithMe: "ATIVAR CAMINHE COMIGO",
    to: "PARA",
    healthWellness: "BEM-ESTAR & SAÚDE",
    aiCheckup: "Check-up IA",
    heartRateStable: "Ritmo cardíaco estável. Nenhuma arritmia detectada.",
    nextMedication: "Próximo Remédio",
    noActiveReminders: "Sem lembretes ativos.",
    universalWallet: "Carteira Universal",
    qrCodeDescription: "QR Code criptografado com seu histórico vital para socorristas.",
    manageMedicalData: "Gerenciar Dados Médicos",
    nearbyUnits: "Unidades de Saúde Próximas em Santos",
    nearbyPharmacies: "Farmácias Próximas",
    findPharmacies: "Buscar Farmácias",
    findMyCar: "Onde deixei meu carro?",
    markCarLocation: "Marcar Localização do Carro",
    carLocationSaved: "Localização do carro salva!",
    returnToCar: "Rota de Retorno ao Carro",
    carNotMarked: "Nenhuma localização de carro marcada.",
    carLocationDescription: "Salve a localização atual para encontrar seu veículo depois.",
    carReminder: "Lembrete de Retorno",
    carReminderInterval: "Intervalo de Lembrete (min)",
    carAutoDisable: "Desativar Automaticamente (min)",
    carReminderActive: "Monitoramento de Estacionamento Ativo",
    carReminderDisabled: "Monitoramento Desativado",
    carReminderToast: "Lembrete: Seu carro está estacionado. Deseja retornar agora?",
    carAutoDisabledToast: "Monitoramento de estacionamento encerrado automaticamente.",
    fontSize: "Tamanho da Letra",
    signLanguage: "Língua de Sinais",
    emergencyContacts: "Contatos de Emergência",
    addShortcut: "Adicionar Atalho",
    shortcutSuggestion: "Deseja adicionar um atalho do O GUARDIAO à sua tela inicial para acesso rápido?",
    permissionsGuide: "Guia de Permissões",
    permissionsDescription: "Para sua total segurança, precisamos de acesso à localização, microfone e contatos.",
    openSettings: "Abrir Configurações",
    pixPayment: "Pagamento via Pix",
    creditCard: "Cartão de Crédito",
    planControl: "Controle de Planos",
    monthlyValue: "Valor Mensal",
    yearlyValue: "Valor Anual",
    emergencyContactName: "Nome do Contato",
    emergencyContactPhone: "Telefone",
    emergencyContactRelation: "Parentesco",
    deleteContact: "Excluir Contato",
    later: "Mais tarde",
    okUnderstood: "Ok, entendi",
    leisureCulture: "LAZER E CULTURA",
    findLeisure: "Encontrar Lazer",
    cinema: "Cinema",
    mall: "Shopping",
    theater: "Teatro",
    bar: "Bar",
    restaurant: "Restaurante",
    supermarket: "Supermercado",
    bakery: "Padaria",
    pharmacy: "Farmácia",
    advancedSearch: "Pesquisa Avançada",
    foodType: "Tipo de Comida",
    allTypes: "Todos os Tipos",
    italian: "Italiana",
    japanese: "Japonesa",
    brazilian: "Brasileira",
    fastFood: "Fast Food",
    healthy: "Saudável",
    pizza: "Pizza",
    seafood: "Frutos do Mar",
    freePlan: "Plano Grátis",
    proPlan: "Plano PRO",
    upgradeToPro: "Upgrade para PRO",
    proFeatureTitle: "Funcionalidade PRO",
    proFeatureDescription: "Esta funcionalidade está disponível apenas para usuários PRO. Faça o upgrade agora para ter proteção total!",
    upgradeNow: "Fazer Upgrade Agora",
    currentPlan: "Plano Atual",
    benefitsPro: "Benefícios do Plano PRO:",
    benefit1: "• Análise de Áudio IA Ilimitada",
    benefit2: "• Planejamento de Rotas Seguras Avançado",
    benefit3: "• Monitoramento de Dispositivos Ilimitado",
    benefit4: "• Consultoria Estratégica Exclusiva",
    benefit5: "• Suporte Prioritário 24/7",
    checkoutTitle: "Finalizar Assinatura PRO",
    checkoutSubtitle: "Você está a um passo da proteção total.",
    cardNumber: "Número do Cartão",
    expiryDate: "Validade",
    cvv: "CVV",
    confirmPurchase: "Confirmar Assinatura",
    processing: "Processando...",
    purchaseSuccess: "Assinatura PRO ativada com sucesso!",
    proBadge: "PRO",
    pricePro: "R$ 29,90/mês",
    priceProYearly: "R$ 299,00/ano",
    saveYearly: "Economize 15%",
    subscriptionDetails: "Detalhes da Assinatura",
    status: "Status",
    active: "Ativa",
    inactive: "Inativa",
    periodicity: "Periodicidade",
    monthly: "Mensal",
    yearly: "Anual",
    nextBilling: "Próximo Faturamento",
    paymentMethodLabel: "Forma de Pagamento",
    cancelSubscription: "Cancelar Assinatura",
    cancelConfirmTitle: "Cancelar Plano PRO?",
    cancelConfirmMessage: "Você perderá acesso a todas as funcionalidades exclusivas ao final do período atual. Tem certeza?",
    subscriptionCancelled: "Sua assinatura foi cancelada.",
    userManagement: "Gestão de Usuários",
    userEmail: "E-mail do Usuário",
    userPlan: "Plano",
    userRole: "Cargo",
    makeAdmin: "Tornar Admin",
    removeAdmin: "Remover Admin",
    makeVip: "Marcar como VIP",
    removeVip: "Remover VIP",
    setPro: "Definir como PRO",
    setFree: "Definir como Grátis",
    userUpdated: "Usuário atualizado com sucesso!",
    vipBadge: "VIP",
    financeMetrics: "Financeiro & Métricas",
    revenue: "Receita Total",
    activeSubscribers: "Assinantes Ativos",
    modulePopularity: "Popularidade dos Módulos",
    revenueOverTime: "Receita ao Longo do Tempo",
    usageLogs: "Logs de Uso",
    noData: "Sem dados para exibir.",
    welcomeTitle: "Bem-vindo ao O GUARDIÃO",
    welcomeSubtitle: "Sua segurança inteligente começa aqui.",
    welcomeStep1Title: "🛡️ Proteção contra Golpes",
    welcomeStep1Desc: "Cole mensagens suspeitas no módulo 'Escudo' para análise instantânea por IA.",
    welcomeStep2Title: "🚨 Botão de Pânico",
    welcomeStep2Desc: "Em emergências, o app grava áudio, analisa a situação e alerta contatos de confiança.",
    welcomeStep3Title: "🗺️ Rota Segura",
    welcomeStep3Desc: "Planeje caminhos evitando áreas de risco com base em dados em tempo real.",
    welcomeStep4Title: "🏥 Saúde & Comunidade",
    welcomeStep4Desc: "Encontre farmácias, hospitais e serviços locais rapidamente.",
    getStarted: "Começar Agora",
    tutorial: "Tutorial",
    pharmacyPrompt: "Quais são as 3 farmácias mais próximas de mim? Liste-as no formato 'Nome (Distância)'.",
    unitsPrompt: "Quais são as 5 unidades de saúde (UPAs, postos de saúde, hospitais, policlínicas) mais próximas de mim? Liste-as no formato 'Nome (Distância)'.",
    leisurePrompt: "Quais são os 3 {category} mais próximos de mim? Elenque-os no formato 'Nome (Distância) [Avaliação]'. A avaliação deve ser um número de 0 a 5.",
    financialStability: "ESTABILIDADE FINANCEIRA",
    antiFraudShieldActive: "Escudo Anti-Fraude Ativo",
    aiMonitoringDescription: "IA monitorando links e mensagens suspeitas em tempo real.",
    generalConsultancies: "Consultorias em geral",
    safeLabel: "Seguro",
    hire: "Contratar",
    specialist: "Especialista",
    verified: "Verificado",
    strategicConsultancy: "Consultoria Estratégica",
    consultancyDescription: "Compartilhe sua experiência e monetize seu conhecimento com total segurança e suporte jurídico.",
    toBeAgreed: "A combinar",
    learnMore: "Saiba Mais",
    shieldSettings: "CONFIGURAÇÕES DO ESCUDO",
    protectionActive: "PROTEÇÃO ATIVA",
    protectionDisabled: "PROTEÇÃO DESATIVADA",
    globalMonitoring: "Monitoramento Global",
    globalMonitoringDescription: "Ative para permitir que O GUARDIAO analise notificações.",
    individualListeningConfig: "Configuração Individual de Escuta",
    silentAlertActive: "ALERTA SILENCIOSO ATIVADO",
    trustZone: "Você está em uma zona de confiança",
    logoutLabel: "Sair",
    loginLabel: "Entrar",
    activateMonitoringAlert: "Ative o monitoramento de pelo menos um aplicativo para simular.",
    scamDetectedAlert: "[ESCUDO ATIVO] Golpe detectado no {app} e bloqueado automaticamente!",
    settingsSavedAlert: "Configurações salvas!",
    emergencyCallAlert: "Chamando {service}... Escuta de ambiente ativada para sua segurança.",
    audioAnalyzedAlert: "Áudio enviado e analisado. Autoridades e contatos seguros foram notificados.",
    fallDetectedAlert: "QUEDA DETECTADA! Iniciando protocolo de emergência em 10 segundos...",
    scamConfirmTitle: "[ALERTA] Mensagem suspeita detectada no {app}",
    scamConfirmMessage: "\"{msg}\"\n\nDeseja bloquear este contato e denunciar?",
    confirmYes: "Sim, Bloquear",
    confirmNo: "Ignorar",
    allowContactLocation: "Permitir Localização de Contatos",
    contactLocationDescription: "Mostrar localização exata dos contatos seguros no mapa",
    contactLocationActive: "Localização de contatos ativa",
    safeContactMarker: "Contato Seguro: {name}",
    contactAccess: "Acesso aos Contatos",
    contactAccessDescription: "Permitir acesso aos contatos cadastrados no telefone e no mapa",
    showContactsOnMap: "Mostrar Contatos no Mapa",
    contactsSynced: "Contatos Sincronizados",
    contactsNotSynced: "Acesso aos Contatos Desativado",
    monitoringDevices: "Dispositivos de Monitoramento",
    registerDevice: "Cadastrar Dispositivo",
    deviceName: "Nome do Dispositivo",
    deviceType: "Tipo",
    connected: "Conectado",
    disconnected: "Desconectado",
    realTimeData: "Dados em Tempo Real",
    addDevice: "Adicionar Dispositivo",
    smartwatch: "Smartwatch",
    heartMonitor: "Monitor Cardíaco",
    oximeter: "Oxímetro",
    noDevices: "Nenhum dispositivo cadastrado.",
    readingInterval: "Intervalo de Leitura",
    seconds: "segundos",
    updateInterval: "Atualizar Intervalo",
    openInGoogleMaps: "Abrir no Google Maps",
    riskZones: [
      { name: "Zona Portuária - Trecho Norte", level: "ALTO", color: "bg-rose-500" },
      { name: "Centro Histórico - Entorno do Mercado", level: "MÉDIO", color: "bg-amber-500" },
      { name: "Área de Encosta - Morro do José Menino", level: "ALTO", color: "bg-rose-500" }
    ],
    scamMessages: [
      "Parabéns! Você ganhou um Pix de R$ 5.000. Clique aqui: http://pix-premiado.xyz",
      "Sua conta bancária será bloqueada em 2h. Regularize agora: http://banco-seguro-app.com",
      "Vaga de emprego home office: R$ 800/dia. Chame no link: http://vagas-urgentes.net"
    ],
    routePrompt: "Como um assistente de segurança local em Santos, SP, trace uma rota segura saindo de \"{origin}\" para o destino: \"{dest}\". Considere evitar áreas de risco conhecidas como a Zona Portuária Norte e o Centro Histórico à noite. Sugira uma rota principal e explique por que ela é mais segura. Responda de forma concisa em português.",
    routeSystemInstruction: "Você é o Especialista em Rotas Seguras do O GUARDIAO. Sua missão é proteger o cidadão sugerindo caminhos iluminados e movimentados.",
    routeFallback: "Erro ao calcular rota. Siga pelas avenidas principais e bem iluminadas.",
    routeSuccess: "Rota calculada com sucesso via vias principais.",
    emergencyAlert: "Emergência {service}",
    panicAlert: "ALERTA DE PÂNICO SILENCIOSO ATIVADO",
    directActivationMsg: "ACIONAMENTO DIRETO: {service}",
    listeningActiveMsg: "Escuta automática ativada. Contatos notificados: {contacts}",
    locationSentMsg: "Localização enviada. Contatos notificados: {contacts}",
    mother: "Mãe",
    father: "Pai",
  },
  en: {
    appName: "O GUARDIAO",
    dashboard: "Home",
    emergency: "Emergency",
    scam: "Scams",
    settings: "Settings",
    adminPanel: "Administration",
    personalData: "Personal Data",
    language: "Language",
    name: "Name",
    email: "Email",
    phone: "Phone",
    theme: "Theme",
    light: "Light",
    dark: "Dark",
    save: "Save",
    selectLanguage: "Select Language",
    welcome: "Welcome to O GUARDIAO",
    quotaExceeded: "API quota exceeded. Please try again in a few moments.",
    refresh: "Refresh",
    sentinelActive: "SENTINEL ACTIVE",
    protectionLevel: "Protection Level",
    high: "HIGH",
    panicButton: "PANIC BUTTON",
    analyzeScam: "Analyze Scam",
    emergency190: "Emergency 190",
    scamAnalysis: "Scam Analysis",
    activeShield: "ACTIVE SHIELD",
    automatic: "AUTOMATIC",
    manual: "MANUAL",
    monitoredApps: "Monitored Apps",
    scamLogs: "Scam Logs",
    back: "Back",
    logout: "Logout",
    login: "Login with Google",
    healthProfile: "Health Profile",
    medications: "Medications",
    neighborAlerts: "Neighbor Alerts",
    talentMarket: "Talent Market",
    safeRoute: "Safe Route",
    calculating: "Calculating...",
    calculate: "Calculate Route",
    panicDescription: "Triggers police and safe contacts immediately",
    scamDescription: "Links and SMS",
    emergencyDescription: "Audio Analysis",
    settingsDescription: "Profile and Preferences",
    autoListening: "Auto Listening",
    responseMode: "Response Mode",
    autoDescription: "* O GUARDIAO will block links and notify contacts automatically when scams are detected.",
    manualDescription: "* You will be notified to decide the action for each detected threat.",
    simulateNotification: "Simulate Suspicious Notification",
    activityLog: "ACTIVITY LOG",
    clear: "Clear",
    blockedAuto: "AUTOMATICALLY BLOCKED",
    blockedUser: "BLOCKED BY USER",
    ignoredUser: "IGNORED BY USER",
    manualAnalysis: "Manual Analysis",
    placeholderScam: "Paste the link or suspicious message here...",
    checkSecurity: "Check Security",
    analyzing: "Analyzing...",
    emergencySubtitle: "Immediate activation and safe contacts.",
    police190: "POLICE 190",
    samu192: "SAMU 192",
    directActivation: "Direct Activation",
    medicalEmergency: "Medical Emergency",
    realTimeListening: "Real-time Listening",
    listeningDescription: "O GUARDIAO will listen to local audio in emergencies.",
    localAudioActive: "Local Audio Active",
    safeContacts: "Safe Contacts",
    addNewContact: "Add New Contact",
    saveContact: "Save Contact",
    aiAudioAnalysis: "AI Audio Analysis",
    audioDescription: "Send audio for immediate danger analysis.",
    sendForAnalysis: "SEND FOR ANALYSIS",
    controlPanel: "Control Panel",
    monitoringAlerts: "Real-time alert monitoring...",
    footer: "SENTINELA • O GUARDIAO © 2026",
    verdict: "Verdict",
    reason: "Reason",
    action: "Action",
    safe: "SAFE",
    suspicious: "SUSPICIOUS",
    scamConfirmed: "SCAM CONFIRMED",
    localSecurity: "LOCAL SECURITY",
    santosSP: "SANTOS, SP",
    activeHeatmap: "Active Heatmap",
    routeSuggestion: "Suggestion: Route via Av. Ana Costa (Safer)",
    monitoringPath: "MONITORING PATH",
    simulateFall: "Simulate Fall",
    planSafeRoute: "Plan Safe Route",
    fromWhere: "Where are you leaving from?",
    toWhere: "Where are you going?",
    useCurrentLocation: "Use current location",
    whereTo: "Where are you going?",
    recommendedRoute: "Recommended Route",
    attentionZones: "Attention Zones (Santos)",
    risk: "RISK",
    neighborNetwork: "Neighbor Network",
    noRecentAlerts: "No recent alerts in your area.",
    endWalkWithMe: "END WALK WITH ME",
    startWalkWithMe: "START WALK WITH ME",
    to: "TO",
    healthWellness: "HEALTH & WELLNESS",
    aiCheckup: "AI Check-up",
    heartRateStable: "Stable heart rate. No arrhythmia detected.",
    nextMedication: "Next Medication",
    noActiveReminders: "No active reminders.",
    universalWallet: "Universal Wallet",
    qrCodeDescription: "Encrypted QR Code with your vital history for responders.",
    manageMedicalData: "Manage Medical Data",
    nearbyUnits: "Nearby Health Units in Santos",
    nearbyPharmacies: "Nearby Pharmacies",
    findPharmacies: "Find Pharmacies",
    findMyCar: "Find my car",
    markCarLocation: "Mark Car Location",
    carLocationSaved: "Car location saved!",
    returnToCar: "Return Route to Car",
    carNotMarked: "No car location marked.",
    carLocationDescription: "Save current location to find your vehicle later.",
    carReminder: "Return Reminder",
    carReminderInterval: "Reminder Interval (min)",
    carAutoDisable: "Auto Disable (min)",
    carReminderActive: "Parking Monitoring Active",
    carReminderDisabled: "Monitoring Disabled",
    carReminderToast: "Reminder: Your car is parked. Do you want to return now?",
    carAutoDisabledToast: "Parking monitoring ended automatically.",
    fontSize: "Font Size",
    signLanguage: "Sign Language",
    emergencyContacts: "Emergency Contacts",
    addShortcut: "Add Shortcut",
    shortcutSuggestion: "Would you like to add a shortcut for O GUARDIAO to your home screen for quick access?",
    permissionsGuide: "Permissions Guide",
    permissionsDescription: "For your full safety, we need access to location, microphone, and contacts.",
    openSettings: "Open Settings",
    pixPayment: "Pix Payment",
    creditCard: "Credit Card",
    planControl: "Plan Control",
    monthlyValue: "Monthly Value",
    yearlyValue: "Yearly Value",
    emergencyContactName: "Contact Name",
    emergencyContactPhone: "Phone",
    emergencyContactRelation: "Relationship",
    deleteContact: "Delete Contact",
    later: "Later",
    okUnderstood: "Ok, understood",
    leisureCulture: "LEISURE & CULTURE",
    findLeisure: "Find Leisure",
    cinema: "Cinema",
    mall: "Mall",
    theater: "Theater",
    bar: "Bar",
    restaurant: "Restaurant",
    supermarket: "Supermarket",
    bakery: "Bakery",
    pharmacy: "Pharmacy",
    advancedSearch: "Advanced Search",
    foodType: "Food Type",
    allTypes: "All Types",
    italian: "Italian",
    japanese: "Japanese",
    brazilian: "Brazilian",
    fastFood: "Fast Food",
    healthy: "Healthy",
    pizza: "Pizza",
    seafood: "Seafood",
    freePlan: "Free Plan",
    proPlan: "PRO Plan",
    upgradeToPro: "Upgrade to PRO",
    proFeatureTitle: "PRO Feature",
    proFeatureDescription: "This feature is only available for PRO users. Upgrade now for full protection!",
    upgradeNow: "Upgrade Now",
    currentPlan: "Current Plan",
    benefitsPro: "PRO Plan Benefits:",
    benefit1: "• Unlimited AI Audio Analysis",
    benefit2: "• Advanced Safe Route Planning",
    benefit3: "• Unlimited Device Monitoring",
    benefit4: "• Exclusive Strategic Consultancy",
    benefit5: "• 24/7 Priority Support",
    checkoutTitle: "Complete PRO Subscription",
    checkoutSubtitle: "You are one step away from full protection.",
    cardNumber: "Card Number",
    expiryDate: "Expiry Date",
    cvv: "CVV",
    confirmPurchase: "Confirm Subscription",
    processing: "Processing...",
    purchaseSuccess: "PRO Subscription activated successfully!",
    proBadge: "PRO",
    pricePro: "$ 9.90/month",
    priceProYearly: "$ 99.00/year",
    saveYearly: "Save 15%",
    subscriptionDetails: "Subscription Details",
    status: "Status",
    active: "Active",
    inactive: "Inactive",
    periodicity: "Periodicity",
    monthly: "Monthly",
    yearly: "Yearly",
    nextBilling: "Next Billing",
    paymentMethodLabel: "Payment Method",
    cancelSubscription: "Cancel Subscription",
    cancelConfirmTitle: "Cancel PRO Plan?",
    cancelConfirmMessage: "You will lose access to all exclusive features at the end of the current period. Are you sure?",
    subscriptionCancelled: "Your subscription has been cancelled.",
    userManagement: "User Management",
    userEmail: "User Email",
    userPlan: "Plan",
    userRole: "Role",
    makeAdmin: "Make Admin",
    removeAdmin: "Remove Admin",
    makeVip: "Mark as VIP",
    removeVip: "Remove VIP",
    setPro: "Set as PRO",
    setFree: "Set as Free",
    userUpdated: "User updated successfully!",
    vipBadge: "VIP",
    financeMetrics: "Finance & Metrics",
    revenue: "Total Revenue",
    activeSubscribers: "Active Subscribers",
    modulePopularity: "Module Popularity",
    revenueOverTime: "Revenue Over Time",
    usageLogs: "Usage Logs",
    noData: "No data to display.",
    welcomeTitle: "Welcome to THE GUARDIAN",
    welcomeSubtitle: "Your smart security starts here.",
    welcomeStep1Title: "🛡️ Scam Protection",
    welcomeStep1Desc: "Paste suspicious messages in the 'Shield' module for instant AI analysis.",
    welcomeStep2Title: "🚨 Panic Button",
    welcomeStep2Desc: "In emergencies, the app records audio, analyzes the situation, and alerts trusted contacts.",
    welcomeStep3Title: "🗺️ Safe Route",
    welcomeStep3Desc: "Plan paths avoiding risk areas based on real-time data.",
    welcomeStep4Title: "🏥 Health & Community",
    welcomeStep4Desc: "Find pharmacies, hospitals, and local services quickly.",
    getStarted: "Get Started",
    tutorial: "Tutorial",
    pharmacyPrompt: "What are the 3 nearest pharmacies to me? List them in the format 'Name (Distance)'.",
    unitsPrompt: "What are the 5 nearest health units (UPAs, health centers, hospitals, polyclinics) to me? List them in the format 'Name (Distance)'.",
    leisurePrompt: "What are the 3 nearest {category} to me? List them in the format 'Name (Distance) [Rating]'. The rating should be a number from 0 to 5.",
    financialStability: "FINANCIAL STABILITY",
    antiFraudShieldActive: "Anti-Fraud Shield Active",
    aiMonitoringDescription: "AI monitoring links and suspicious messages in real-time.",
    generalConsultancies: "General Consultancies",
    safeLabel: "Safe",
    hire: "Hire",
    specialist: "Specialist",
    verified: "Verified",
    strategicConsultancy: "Strategic Consultancy",
    consultancyDescription: "Share your experience and monetize your knowledge with total security and legal support.",
    toBeAgreed: "To be agreed",
    learnMore: "Learn More",
    shieldSettings: "SHIELD SETTINGS",
    protectionActive: "PROTECTION ACTIVE",
    protectionDisabled: "PROTECTION DISABLED",
    globalMonitoring: "Global Monitoring",
    globalMonitoringDescription: "Activate to allow O GUARDIAO to analyze notifications.",
    individualListeningConfig: "Individual Listening Config",
    silentAlertActive: "SILENT ALERT ACTIVATED",
    trustZone: "You are in a trust zone",
    logoutLabel: "Logout",
    loginLabel: "Login",
    activateMonitoringAlert: "Activate monitoring for at least one app to simulate.",
    scamDetectedAlert: "[ACTIVE SHIELD] Scam detected in {app} and automatically blocked!",
    settingsSavedAlert: "Settings saved!",
    emergencyCallAlert: "Calling {service}... Ambient listening activated for your safety.",
    audioAnalyzedAlert: "Audio sent and analyzed. Authorities and safe contacts have been notified.",
    fallDetectedAlert: "FALL DETECTED! Starting emergency protocol in 10 seconds...",
    scamConfirmTitle: "[ALERT] Suspicious message detected in {app}",
    scamConfirmMessage: "\"{msg}\"\n\nDo you want to block this contact and report it?",
    confirmYes: "Yes, Block",
    confirmNo: "Ignore",
    allowContactLocation: "Allow Contact Location",
    contactLocationDescription: "Show exact location of safe contacts on the map",
    contactLocationActive: "Contact location active",
    safeContactMarker: "Safe Contact: {name}",
    contactAccess: "Contact Access",
    contactAccessDescription: "Allow access to registered contacts on phone and map",
    showContactsOnMap: "Show Contacts on Map",
    contactsSynced: "Contacts Synced",
    contactsNotSynced: "Contact Access Disabled",
    monitoringDevices: "Monitoring Devices",
    registerDevice: "Register Device",
    deviceName: "Device Name",
    deviceType: "Type",
    connected: "Connected",
    disconnected: "Disconnected",
    realTimeData: "Real-time Data",
    addDevice: "Add Device",
    smartwatch: "Smartwatch",
    heartMonitor: "Heart Monitor",
    oximeter: "Oximeter",
    noDevices: "No devices registered.",
    readingInterval: "Reading Interval",
    seconds: "seconds",
    updateInterval: "Update Interval",
    openInGoogleMaps: "Open in Google Maps",
    riskZones: [
      { name: "Port Zone - North Section", level: "HIGH", color: "bg-rose-500" },
      { name: "Historic Center - Market Surroundings", level: "MEDIUM", color: "bg-amber-500" },
      { name: "Slope Area - José Menino Hill", level: "HIGH", color: "bg-rose-500" }
    ],
    scamMessages: [
      "Congratulations! You won a Pix of R$ 5,000. Click here: http://pix-premiado.xyz",
      "Your bank account will be blocked in 2h. Regularize now: http://banco-seguro-app.com",
      "Home office job opening: R$ 800/day. Call at the link: http://vagas-urgentes.net"
    ],
    routePrompt: "As a local security assistant in Santos, SP, trace a safe route from \"{origin}\" to the destination: \"{dest}\". Consider avoiding known risk areas such as the North Port Zone and the Historic Center at night. Suggest a main route and explain why it is safer. Answer concisely in English.",
    routeSystemInstruction: "You are the O GUARDIAO's Safe Route Specialist. Your mission is to protect the citizen by suggesting lit and busy paths.",
    routeFallback: "Error calculating route. Follow the main and well-lit avenues.",
    routeSuccess: "Route successfully calculated via main roads.",
    emergencyAlert: "Emergency {service}",
    panicAlert: "SILENT PANIC ALERT ACTIVATED",
    directActivationMsg: "DIRECT ACTIVATION: {service}",
    listeningActiveMsg: "Automatic listening activated. Contacts notified: {contacts}",
    locationSentMsg: "Location sent. Contacts notified: {contacts}",
    mother: "Mother",
    father: "Father",
  },
  es: {
    appName: "O GUARDIAO",
    dashboard: "Panel",
    emergency: "Emergencia",
    scam: "Estafas",
    settings: "Configuración",
    personalData: "Datos Personales",
    language: "Idioma",
    name: "Nombre",
    email: "Correo electrónico",
    phone: "Teléfono",
    theme: "Tema",
    light: "Claro",
    dark: "Oscuro",
    save: "Guardar",
    selectLanguage: "Seleccione el Idioma",
    welcome: "Bienvenido al O GUARDIAO",
    sentinelActive: "SENTINELA ACTIVO",
    protectionLevel: "Nivel de Protección",
    high: "ALTO",
    panicButton: "BOTÓN DE PÂNICO",
    analyzeScam: "Analizar Estafa",
    emergency190: "Emergencia 190",
    scamAnalysis: "Análisis de Estafas",
    activeShield: "ESCUDO ATIVO",
    automatic: "AUTOMÁTICO",
    manual: "MANUAL",
    monitoredApps: "Apps Monitoreadas",
    scamLogs: "Logs de Estafas",
    back: "Volver",
    logout: "Cerrar sesión",
    login: "Entrar con Google",
    healthProfile: "Perfil de Salud",
    medications: "Medicamentos",
    neighborAlerts: "Alertas de Vecindad",
    talentMarket: "Mercado de Talentos",
    safeRoute: "Ruta Segura",
    calculating: "Calculando...",
    calculate: "Calcular Rota",
    panicDescription: "Activa policía y contactos seguros inmediatamente",
    scamDescription: "Links y SMS",
    emergencyDescription: "Análisis de Audio",
    settingsDescription: "Perfil e Preferencias",
    autoListening: "Escucha Automática",
    responseMode: "Modo de Respuesta",
    autoDescription: "* O GUARDIAO bloqueará enlaces e notificará contactos automáticamente al detectar estafas.",
    manualDescription: "* Se le notificará para decidir la acción ante cada amenaza detectada.",
    simulateNotification: "Simular Notificación Sospechosa",
    activityLog: "REGISTRO DE ACTIVIDADES",
    clear: "Limpar",
    blockedAuto: "BLOQUEADO AUTOMÁTICAMENTE",
    blockedUser: "BLOQUEADO POR EL USUARIO",
    ignoredUser: "IGNORADO POR EL USUARIO",
    manualAnalysis: "Análisis Manual",
    placeholderScam: "Pegue el enlace o mensaje sospechoso aquí...",
    checkSecurity: "Verificar Seguridad",
    analyzing: "Analizando...",
    emergencySubtitle: "Activación inmediata y contactos seguros.",
    police190: "POLICÍA 190",
    samu192: "SAMU 192",
    directActivation: "Activación Directa",
    medicalEmergency: "Emergencia Médica",
    realTimeListening: "Escucha en Tiempo Real",
    listeningDescription: "O GUARDIAO escuchará o áudio local en emergencias.",
    localAudioActive: "Audio Local Ativo",
    safeContacts: "Contactos de Seguridad",
    addNewContact: "Agregar Nuevo Contacto",
    saveContact: "Guardar Contacto",
    aiAudioAnalysis: "Análisis de Audio IA",
    audioDescription: "Envíe un audio para análisis inmediato de peligro.",
    sendForAnalysis: "ENVIAR PARA ANÁLISIS",
    controlPanel: "Panel de Control",
    monitoringAlerts: "Monitoreo de alertas en tiempo real...",
    footer: "SENTINELA • O GUARDIAO © 2026",
    verdict: "Veredicto",
    reason: "Motivo",
    action: "Acción",
    safe: "SEGURO",
    suspicious: "SOSPECHOSO",
    scamConfirmed: "ESTAFA CONFIRMADA",
    localSecurity: "SEGURIDAD LOCAL",
    santosSP: "SANTOS, SP",
    activeHeatmap: "Mapa de Calor Activo",
    routeSuggestion: "Sugerencia: Ruta vía Av. Ana Costa (Más segura)",
    monitoringPath: "MONITOREANDO TRAYECTO",
    simulateFall: "Simular Caída",
    planSafeRoute: "Planificar Ruta Segura",
    fromWhere: "¿De dónde sales?",
    toWhere: "¿A dónde vas?",
    useCurrentLocation: "Usar ubicación actual",
    whereTo: "¿A dónde vas?",
    recommendedRoute: "Ruta Recomendada",
    attentionZones: "Zonas de Atención (Santos)",
    risk: "RIESGO",
    neighborNetwork: "Red de Vecinos",
    noRecentAlerts: "No hay alertas recientes en su área.",
    endWalkWithMe: "TERMINAR CAMINA CONMIGO",
    startWalkWithMe: "ACTIVAR CAMINA CONMIGO",
    to: "PARA",
    healthWellness: "BIENESTAR Y SALUD",
    aiCheckup: "Chequeo IA",
    heartRateStable: "Ritmo cardíaco estable. No se detectó arritmia.",
    nextMedication: "Próximo Medicamento",
    noActiveReminders: "Sin recordatorios activos.",
    universalWallet: "Billetera Universal",
    qrCodeDescription: "Código QR cifrado con su historial vital para socorristas.",
    manageMedicalData: "Gestionar Datos Médicos",
    nearbyUnits: "Unidades de Salud Cercanas en Santos",
    nearbyPharmacies: "Farmacias Cercanas",
    findPharmacies: "Buscar Farmacias",
    leisureCulture: "OCIO Y CULTURA",
    findLeisure: "Encontrar Ocio",
    cinema: "Cine",
    mall: "Centro Comercial",
    theater: "Teatro",
    bar: "Bar",
    restaurant: "Restaurante",
    supermarket: "Supermercado",
    bakery: "Panadería",
    pharmacy: "Farmacia",
    advancedSearch: "Búsqueda Avanzada",
    foodType: "Tipo de Comida",
    allTypes: "Todos los Tipos",
    italian: "Italiana",
    japanese: "Japonesa",
    brazilian: "Brasileña",
    fastFood: "Comida Rápida",
    healthy: "Saludable",
    pizza: "Pizza",
    seafood: "Mariscos",
    pharmacyPrompt: "¿Cuáles son las 3 farmacias más cercanas a mí? Enuméralas en el formato 'Nombre (Distancia)'.",
    unitsPrompt: "¿Cuáles son las 5 unidades de salud (UPAs, centros de salud, hospitales, policlínicas) más cercanas a mí? Enuméralas en el formato 'Nombre (Distancia)'.",
    leisurePrompt: "¿Cuáles son los 3 {category} más cercanos a mí? Enuméralos en el formato 'Nombre (Distancia) [Calificación]'. La calificación debe ser un número de 0 a 5.",
    financialStability: "ESTABILIDAD FINANCIERA",
    antiFraudShieldActive: "Escudo Anti-Fraude Activo",
    aiMonitoringDescription: "IA monitoreando enlaces y mensajes sospechosos en tiempo real.",
    generalConsultancies: "Consultorías en general",
    safeLabel: "Seguro",
    hire: "Contratar",
    specialist: "Especialista",
    verified: "Verificado",
    strategicConsultancy: "Consultoría Estratégica",
    consultancyDescription: "Comparta su experiencia y monetice su conocimiento con total seguridad y apoyo legal.",
    toBeAgreed: "A convenir",
    learnMore: "Saber Más",
    shieldSettings: "CONFIGURACIÓN DEL ESCUDO",
    protectionActive: "PROTECCIÓN ACTIVA",
    protectionDisabled: "PROTECCIÓN DESACTIVADA",
    globalMonitoring: "Monitoreo Global",
    globalMonitoringDescription: "Active para permitir que O GUARDIAO analice notificaciones.",
    individualListeningConfig: "Configuración Individual de Escucha",
    silentAlertActive: "ALERTA SILENCIOSA ACTIVADA",
    trustZone: "Estás en una zona de confianza",
    logoutLabel: "Cerrar sesión",
    loginLabel: "Entrar",
    activateMonitoringAlert: "Active el monitoreo de al menos una aplicación para simular.",
    scamDetectedAlert: "[ESCUDO ACTIVO] ¡Estafa detectada en {app} y bloqueada automáticamente!",
    settingsSavedAlert: "¡Configuraciones guardadas!",
    emergencyCallAlert: "Llamando a {service}... Escucha de ambiente activada para su seguridad.",
    audioAnalyzedAlert: "Audio enviado y analizado. Las autoridades y los contactos seguros han sido notificados.",
    fallDetectedAlert: "¡CAÍDA DETECTADA! Iniciando protocolo de emergencia en 10 segundos...",
    scamConfirmTitle: "[ALERTA] Mensaje sospechoso detectado en {app}",
    scamConfirmMessage: "\"{msg}\"\n\n¿Desea bloquear este contacto y denunciar?",
    confirmYes: "Sí, Bloquear",
    confirmNo: "Ignorar",
    allowContactLocation: "Permitir Localización de Contactos",
    contactLocationDescription: "Mostrar ubicación exacta de los contactos seguros en el mapa",
    contactLocationActive: "Ubicación de contactos activa",
    safeContactMarker: "Contacto Seguro: {name}",
    contactAccess: "Acceso a Contactos",
    contactAccessDescription: "Permitir el acceso a los contactos registrados en el teléfono y el mapa",
    showContactsOnMap: "Mostrar Contactos en el Mapa",
    contactsSynced: "Contactos Sincronizados",
    contactsNotSynced: "Acceso a Contactos Desactivado",
    monitoringDevices: "Dispositivos de Monitoreo",
    registerDevice: "Registrar Dispositivo",
    deviceName: "Nombre del Dispositivo",
    deviceType: "Tipo",
    connected: "Conectado",
    disconnected: "Desconectado",
    realTimeData: "Datos en Tiempo Real",
    addDevice: "Agregar Dispositivo",
    smartwatch: "Smartwatch",
    heartMonitor: "Monitor Cardíaco",
    oximeter: "Oxímetro",
    noDevices: "Ningún dispositivo registrado.",
    readingInterval: "Intervalo de Lectura",
    seconds: "segundos",
    updateInterval: "Actualizar Intervalo",
    openInGoogleMaps: "Abrir en Google Maps",
    riskZones: [
      { name: "Zona Portuaria - Tramo Norte", level: "ALTO", color: "bg-rose-500" },
      { name: "Centro Histórico - Alrededores del Mercado", level: "MEDIO", color: "bg-amber-500" },
      { name: "Área de Pendiente - Cerro José Menino", level: "ALTO", color: "bg-rose-500" }
    ],
    scamMessages: [
      "¡Felicidades! Ganaste un Pix de R$ 5.000. Haz clic aquí: http://pix-premiado.xyz",
      "Su cuenta bancaria será bloqueada en 2h. Regularice ahora: http://banco-seguro-app.com",
      "Vacante de empleo home office: R$ 800/día. Llame en el enlace: http://vagas-urgentes.net"
    ],
    routePrompt: "Como asistente de seguridad local en Santos, SP, trace una ruta segura desde \"{origin}\" hacia el destino: \"{dest}\". Considere evitar áreas de riesgo conocidas como la Zona Portuaria Norte e el Centro Histórico por la noche. Sugiera una ruta principal y explique por qué es más segura. Responda de forma concisa en español.",
    routeSystemInstruction: "Eres el Especialista en Rutas Seguras del Guardián. Tu misión es proteger al ciudadano sugiriendo caminos iluminados y concurridos.",
    routeFallback: "Error al calcular la ruta. Siga las avenidas principales y bien iluminadas.",
    routeSuccess: "Ruta calculada con éxito a través de las vías principales.",
    emergencyAlert: "Emergencia {service}",
    panicAlert: "ALERTA DE PÁNICO SILENCIOSO ACTIVADO",
    directActivationMsg: "ACTIVACIÓN DIRECTA: {service}",
    listeningActiveMsg: "Escucha automática activada. Contactos notificados: {contacts}",
    locationSentMsg: "Ubicación enviada. Contactos notificados: {contacts}",
    mother: "Madre",
    father: "Padre",
  },
  fr: {
    appName: "O GUARDIAO",
    dashboard: "Tableau de bord",
    emergency: "Urgence",
    scam: "Arnaques",
    settings: "Paramètres",
    personalData: "Données personnelles",
    language: "Langue",
    name: "Nom",
    email: "E-mail",
    phone: "Téléphone",
    theme: "Thème",
    light: "Clair",
    dark: "Sombre",
    save: "Enregistrer",
    selectLanguage: "Sélectionner la langue",
    welcome: "Bienvenue sur O GUARDIAO",
    sentinelActive: "SENTINELLE ACTIVE",
    protectionLevel: "Niveau de protection",
    high: "ÉLEVÉ",
    panicButton: "BOUTON PANIQUE",
    analyzeScam: "Analyser l'arnaque",
    emergency190: "Urgence 190",
    scamAnalysis: "Analyse d'arnaque",
    activeShield: "BOUCLIER ACTIF",
    automatic: "AUTOMATIQUE",
    manual: "MANUEL",
    monitoredApps: "Apps surveillées",
    scamLogs: "Logs d'arnaques",
    back: "Retour",
    logout: "Déconnexion",
    login: "Se connecter avec Google",
    healthProfile: "Profil de santé",
    medications: "Médicaments",
    neighborAlerts: "Alertes voisinage",
    talentMarket: "Marché des talents",
    safeRoute: "Route sûre",
    calculating: "Calcul en cours...",
    calculate: "Calculer l'itinéraire",
    panicDescription: "Alerte la police et les contacts de sécurité immédiatement",
    scamDescription: "Liens et SMS",
    emergencyDescription: "Analyse audio",
    settingsDescription: "Profil et préférences",
    autoListening: "Écoute automatique",
    responseMode: "Mode de réponse",
    autoDescription: "* O GUARDIAO bloquera les liens et notifiera les contacts automatiquement lors de la détection d'arnaques.",
    manualDescription: "* Vous serez notifié pour décider de l'action pour chaque menace détectée.",
    simulateNotification: "Simuler une notification suspecte",
    activityLog: "LOG D'ACTIVITÉ",
    clear: "Effacer",
    blockedAuto: "BLOQUÉ AUTOMATIQUEMENT",
    blockedUser: "BLOQUÉ PAR L'UTILISATEUR",
    ignoredUser: "IGNORÉ PAR L'UTILISATEUR",
    manualAnalysis: "Analyse manuelle",
    placeholderScam: "Collez le lien ou le message suspect ici...",
    checkSecurity: "Vérifier la sécurité",
    analyzing: "Analyse en cours...",
    emergencySubtitle: "Activation immédiate et contacts de sécurité.",
    police190: "POLICE 190",
    samu192: "SAMU 192",
    directActivation: "Activation directe",
    medicalEmergency: "Urgence médicale",
    realTimeListening: "Écoute en temps réel",
    listeningDescription: "O GUARDIAO écoutera l'audio local en cas d'urgence.",
    localAudioActive: "Audio local actif",
    safeContacts: "Contacts de sécurité",
    addNewContact: "Ajouter un contact",
    saveContact: "Enregistrer le contact",
    aiAudioAnalysis: "Analyse audio IA",
    audioDescription: "Envoyez l'audio pour une analyse de danger immédiate.",
    sendForAnalysis: "ENVOYER POUR ANALYSE",
    controlPanel: "Panneau de contrôle",
    monitoringAlerts: "Surveillance des alertes en temps réel...",
    footer: "SENTINELLE • O GUARDIAO © 2026",
    verdict: "Verdict",
    reason: "Raison",
    action: "Action",
    safe: "SÛR",
    suspicious: "SUSPECT",
    scamConfirmed: "ARNAQUE CONFIRMÉE",
    localSecurity: "SÉCURITÉ LOCALE",
    santosSP: "SANTOS, SP",
    activeHeatmap: "Carte thermique active",
    routeSuggestion: "Suggestion : Route via Av. Ana Costa (Plus sûre)",
    monitoringPath: "SURVEILLANCE DU TRAJET",
    simulateFall: "Simuler une chute",
    planSafeRoute: "Planifier une route sûre",
    fromWhere: "D'où partez-vous ?",
    toWhere: "Où allez-vous ?",
    useCurrentLocation: "Utiliser la position actuelle",
    whereTo: "Où allez-vous ?",
    recommendedRoute: "Route recommandée",
    attentionZones: "Zones d'attention (Santos)",
    risk: "RISQUE",
    neighborNetwork: "Réseau de voisins",
    noRecentAlerts: "Aucune alerte récente dans votre zone.",
    endWalkWithMe: "ARRÊTER MARCHE AVEC MOI",
    startWalkWithMe: "DÉMARRER MARCHE AVEC MOI",
    to: "VERS",
    healthWellness: "SANTÉ ET BIEN-ÊTRE",
    aiCheckup: "Bilan IA",
    heartRateStable: "Rythme cardiaque stable. Aucune arythmie détectée.",
    nextMedication: "Prochain médicament",
    noActiveReminders: "Aucun rappel actif.",
    universalWallet: "Portefeuille universel",
    qrCodeDescription: "Code QR crypté avec votre historique vital pour les secouristes.",
    manageMedicalData: "Gérer les données médicales",
    nearbyUnits: "Unités de santé à proximité à Santos",
    nearbyPharmacies: "Pharmacies à proximité",
    findPharmacies: "Trouver des pharmacies",
    leisureCulture: "LOISIRS ET CULTURE",
    findLeisure: "Trouver des Loisirs",
    cinema: "Cinéma",
    mall: "Centre Commercial",
    theater: "Théâtre",
    bar: "Bar",
    restaurant: "Restaurant",
    pharmacy: "Pharmacie",
    advancedSearch: "Recherche Avancée",
    foodType: "Type de Cuisine",
    allTypes: "Tous les Types",
    italian: "Italienne",
    japanese: "Japonaise",
    brazilian: "Brésilienne",
    fastFood: "Fast Food",
    healthy: "Sain",
    pizza: "Pizza",
    seafood: "Fruits de Mer",
    pharmacyPrompt: "Quelles sont les 3 pharmacies les plus proches de moi ? Énumérez-les au format 'Nom (Distance)'.",
    unitsPrompt: "Quelles sont les 5 unités de santé (UPAs, centres de santé, hôpitaux, polycliniques) les plus proches de moi ? Énumérez-les au format 'Nom (Distance)'.",
    leisurePrompt: "Quels sont les 3 {category} les plus proches de moi ? Énumérez-les au format 'Nom (Distance)'.",
    financialStability: "STABILITÉ FINANCIÈRE",
    antiFraudShieldActive: "Bouclier anti-fraude actif",
    aiMonitoringDescription: "IA surveillant les liens et messages suspects en temps réel.",
    generalConsultancies: "Consultations générales",
    safeLabel: "Sûr",
    hire: "Engager",
    specialist: "Spécialiste",
    verified: "Vérifié",
    strategicConsultancy: "Consultance stratégique",
    consultancyDescription: "Partagez votre expérience et monétisez vos connaissances en toute sécurité.",
    toBeAgreed: "À convenir",
    learnMore: "En savoir plus",
    shieldSettings: "PARAMÈTRES DU BOUCLIER",
    protectionActive: "PROTECTION ACTIVE",
    protectionDisabled: "PROTECTION DÉSACTIVÉE",
    globalMonitoring: "Surveillance globale",
    globalMonitoringDescription: "Activer pour permettre à O GUARDIAO d'analyser les notifications.",
    individualListeningConfig: "Config d'écoute individuelle",
    silentAlertActive: "ALERTE SILENCIEUSE ACTIVÉE",
    trustZone: "Vous êtes dans une zone de confiance",
    logoutLabel: "Déconnexion",
    loginLabel: "Connexion",
    activateMonitoringAlert: "Activez la surveillance pour au moins une app pour simuler.",
    scamDetectedAlert: "[BOUCLIER ACTIF] Arnaque détectée dans {app} et bloquée automatiquement !",
    settingsSavedAlert: "Paramètres enregistrés !",
    emergencyCallAlert: "Appel de {service} en cours... Écoute ambiante activée pour votre sécurité.",
    audioAnalyzedAlert: "Audio envoyé et analysé. Les autorités et les contacts de sécurité ont été notifiés.",
    fallDetectedAlert: "CHUTE DÉTECTÉE ! Démarrage du protocole d'urgence dans 10 secondes...",
    scamConfirmTitle: "[ALERTE] Message suspect détecté dans {app}",
    scamConfirmMessage: "\"{msg}\"\n\nVoulez-vous bloquer ce contact et le signaler ?",
    confirmYes: "Oui, bloquer",
    confirmNo: "Ignorer",
    allowContactLocation: "Autoriser la localisation des contacts",
    contactLocationDescription: "Afficher la localisation exacte des contacts de sécurité sur la carte",
    contactLocationActive: "Localisation des contacts active",
    safeContactMarker: "Contact de sécurité : {name}",
    contactAccess: "Accès aux contacts",
    contactAccessDescription: "Autoriser l'accès aux contacts enregistrés sur le téléphone et la carte",
    showContactsOnMap: "Afficher les contacts sur la carte",
    contactsSynced: "Contacts synchronisés",
    contactsNotSynced: "Accès aux contacts désactivé",
    monitoringDevices: "Appareils de surveillance",
    registerDevice: "Enregistrer l'appareil",
    deviceName: "Nom de l'appareil",
    deviceType: "Type",
    connected: "Connecté",
    disconnected: "Déconnecté",
    realTimeData: "Données en temps réel",
    addDevice: "Ajouter un appareil",
    smartwatch: "Smartwatch",
    heartMonitor: "Moniteur cardiaque",
    oximeter: "Oxymètre",
    noDevices: "Aucun appareil enregistré.",
    readingInterval: "Intervalle de lecture",
    seconds: "secondes",
    updateInterval: "Mettre à jour l'intervalle",
    openInGoogleMaps: "Ouvrir dans Google Maps",
    riskZones: [
      { name: "Zone portuaire - Section Nord", level: "ÉLEVÉ", color: "bg-rose-500" },
      { name: "Centre historique - Environs du marché", level: "MOYEN", color: "bg-amber-500" },
      { name: "Zone de pente - Colline José Menino", level: "ÉLEVÉ", color: "bg-rose-500" }
    ],
    scamMessages: [
      "Félicitations ! Vous avez gagné un Pix de 5 000 R$. Cliquez ici : http://pix-premiado.xyz",
      "Votre compte bancaire sera bloqué dans 2h. Régularisez maintenant : http://banco-seguro-app.com",
      "Offre d'emploi en télétravail : 800 R$/jour. Appelez au lien : http://vagas-urgentes.net"
    ],
    routePrompt: "En tant qu'assistant de sécurité local à Santos, SP, tracez un itinéraire sûr de \"{origin}\" vers la destination : \"{dest}\". Évitez les zones à risque connues comme la zone portuaire nord et le centre historique la nuit. Suggérez un itinéraire principal et expliquez pourquoi il est plus sûr. Répondez de manière concise en français.",
    routeSystemInstruction: "Vous êtes le spécialiste des itinéraires sûrs de O GUARDIAO. Votre mission est de protéger le citoyen en suggérant des chemins éclairés et fréquentés.",
    routeFallback: "Erreur lors du calcul de l'itinéraire. Suivez les avenues principales et bien éclairées.",
    routeSuccess: "Itinéraire calculé avec succès via les routes principales.",
    emergencyAlert: "Urgence {service}",
    panicAlert: "ALERTE PANIQUE SILENCIEUSE ACTIVÉE",
    directActivationMsg: "ACTIVATION DIRECTE : {service}",
    listeningActiveMsg: "Écoute automatique activée. Contacts notifiés : {contacts}",
    locationSentMsg: "Localisation envoyée. Contacts notifiés : {contacts}",
    mother: "Mère",
    father: "Père",
  },
  de: {
    appName: "O GUARDIAO",
    dashboard: "Dashboard",
    emergency: "Notfall",
    scam: "Betrug",
    settings: "Einstellungen",
    personalData: "Persönliche Daten",
    language: "Sprache",
    name: "Name",
    email: "E-Mail",
    phone: "Telefon",
    theme: "Thema",
    light: "Hell",
    dark: "Dunkel",
    save: "Speichern",
    selectLanguage: "Sprache auswählen",
    welcome: "Willkommen bei O GUARDIAO",
    sentinelActive: "SENTINEL AKTIV",
    protectionLevel: "Schutzniveau",
    high: "HOCH",
    panicButton: "PANIK-BUTTON",
    analyzeScam: "Betrug analysieren",
    emergency190: "Notfall 190",
    scamAnalysis: "Betrugsanalyse",
    activeShield: "AKTIVER SCHILD",
    automatic: "AUTOMATISCH",
    manual: "MANUELL",
    monitoredApps: "Überwachte Apps",
    scamLogs: "Betrugs-Logs",
    back: "Zurück",
    logout: "Abmelden",
    login: "Mit Google anmelden",
    healthProfile: "Gesundheitsprofil",
    medications: "Medikamente",
    neighborAlerts: "Nachbarschaftswarnungen",
    talentMarket: "Talentmarkt",
    safeRoute: "Sichere Route",
    calculating: "Berechnung...",
    calculate: "Route berechnen",
    panicDescription: "Alarmiert sofort Polizei und Sicherheitskontakte",
    scamDescription: "Links und SMS",
    emergencyDescription: "Audio-Analyse",
    settingsDescription: "Profil und Präferenzen",
    autoListening: "Automatisches Zuhören",
    responseMode: "Antwortmodus",
    autoDescription: "* O GUARDIAO blockiert Links und benachrichtigt Kontakte automatisch bei Betrugserkennung.",
    manualDescription: "* Sie werden benachrichtigt, um über die Aktion bei jeder Bedrohung zu entscheiden.",
    simulateNotification: "Verdächtige Benachrichtigung simulieren",
    activityLog: "AKTIVITÄTSPROTOKOLL",
    clear: "Löschen",
    blockedAuto: "AUTOMATISCH BLOCKIERT",
    blockedUser: "VOM BENUTZER BLOCKIERT",
    ignoredUser: "VOM BENUTZER IGNORIERT",
    manualAnalysis: "Manuelle Analyse",
    placeholderScam: "Fügen Sie den Link oder die verdächtige Nachricht hier ein...",
    checkSecurity: "Sicherheit prüfen",
    analyzing: "Analyse...",
    emergencySubtitle: "Sofortige Aktivierung und Sicherheitskontakte.",
    police190: "POLIZEI 190",
    samu192: "SAMU 192",
    directActivation: "Direkte Aktivierung",
    medicalEmergency: "Medizinischer Notfall",
    realTimeListening: "Echtzeit-Zuhören",
    listeningDescription: "O GUARDIAO hört im Notfall lokales Audio ab.",
    localAudioActive: "Lokales Audio aktiv",
    safeContacts: "Sicherheitskontakte",
    addNewContact: "Neuen Kontakt hinzufügen",
    saveContact: "Kontakt speichern",
    aiAudioAnalysis: "KI-Audioanalyse",
    audioDescription: "Senden Sie Audio zur sofortigen Gefahrenanalyse.",
    sendForAnalysis: "ZUR ANALYSE SENDEN",
    controlPanel: "Kontrollzentrum",
    monitoringAlerts: "Echtzeit-Warnungsüberwachung...",
    footer: "SENTINELA • O GUARDIAO © 2026",
    verdict: "Urteil",
    reason: "Grund",
    action: "Aktion",
    safe: "SICHER",
    suspicious: "VERDÄCHTIG",
    scamConfirmed: "BETRUG BESTÄTIGT",
    localSecurity: "LOKALE SICHERHEIT",
    santosSP: "SANTOS, SP",
    activeHeatmap: "Aktive Heatmap",
    routeSuggestion: "Vorschlag: Route über Av. Ana Costa (Sicherer)",
    monitoringPath: "ÜBERWACHUNG DES WEGES",
    simulateFall: "Sturz simulieren",
    planSafeRoute: "Sichere Route planen",
    fromWhere: "Von wo fahren Sie ab?",
    toWhere: "Wohin gehen Sie?",
    useCurrentLocation: "Aktuellen Standort verwenden",
    whereTo: "Wohin gehen Sie?",
    recommendedRoute: "Empfohlene Route",
    attentionZones: "Aufmerksamkeitszonen (Santos)",
    risk: "RISIKO",
    neighborNetwork: "Nachbarschaftsnetzwerk",
    noRecentAlerts: "Keine aktuellen Warnungen in Ihrem Bereich.",
    endWalkWithMe: "BEGLEITUNG BEENDEN",
    startWalkWithMe: "BEGLEITUNG STARTEN",
    to: "NACH",
    healthWellness: "GESUNDHEIT & WOHLBEFINDEN",
    aiCheckup: "KI-Check-up",
    heartRateStable: "Herzfrequenz stabil. Keine Arrhythmie erkannt.",
    nextMedication: "Nächstes Medikament",
    noActiveReminders: "Keine aktiven Erinnerungen.",
    universalWallet: "Universelle Brieftasche",
    qrCodeDescription: "Verschlüsselter QR-Code mit Ihrer Vitalhistorie für Ersthelfer.",
    manageMedicalData: "Medizinische Daten verwalten",
    nearbyUnits: "Nahegelegene Gesundheitseinheiten in Santos",
    nearbyPharmacies: "Apotheken in der Nähe",
    findPharmacies: "Apotheken finden",
    leisureCulture: "FREIZEIT & KULTUR",
    findLeisure: "Freizeit finden",
    cinema: "Kino",
    mall: "Einkaufszentrum",
    theater: "Theater",
    bar: "Bar",
    restaurant: "Restaurant",
    pharmacy: "Apotheke",
    advancedSearch: "Erweiterte Suche",
    foodType: "Art der Küche",
    allTypes: "Alle Typen",
    italian: "Italienisch",
    japanese: "Japanisch",
    brazilian: "Brasilianisch",
    fastFood: "Fast Food",
    healthy: "Gesund",
    pizza: "Pizza",
    seafood: "Meeresfrüchte",
    pharmacyPrompt: "Was sind die 3 nächsten Apotheken in meiner Nähe? Listen Sie sie im Format 'Name (Entfernung)' auf.",
    unitsPrompt: "Was sind die 5 nächsten Gesundheitseinrichtungen (UPAs, Gesundheitszentren, Krankenhäuser, Polikliniken) in meiner Nähe? Listen Sie sie im Format 'Name (Entfernung)' auf.",
    leisurePrompt: "Was sind die 3 nächstgelegenen {category} für mich? Listen Sie sie im Format 'Name (Entfernung)' auf.",
    financialStability: "FINANZIELLE STABILITÄT",
    antiFraudShieldActive: "Anti-Betrugs-Schild aktiv",
    aiMonitoringDescription: "KI überwacht Links und verdächtige Nachrichten in Echtzeit.",
    generalConsultancies: "Allgemeine Beratungen",
    safeLabel: "Sicher",
    hire: "Einstellen",
    specialist: "Spezialist",
    verified: "Verifiziert",
    strategicConsultancy: "Strategische Beratung",
    consultancyDescription: "Teilen Sie Ihre Erfahrung und monetarisieren Sie Ihr Wissen sicher.",
    toBeAgreed: "Zu vereinbaren",
    learnMore: "Mehr erfahren",
    shieldSettings: "SCHILD-EINSTELLUNGEN",
    protectionActive: "SCHUTZ AKTIV",
    protectionDisabled: "SCHUTZ DEAKTIVIERT",
    globalMonitoring: "Globale Überwachung",
    globalMonitoringDescription: "Aktivieren, damit O GUARDIAO Benachrichtigungen analysieren kann.",
    individualListeningConfig: "Individuelle Zuhör-Konfig",
    silentAlertActive: "STILLER ALARM AKTIVIERT",
    trustZone: "Sie befinden sich in einer Vertrauenszone",
    logoutLabel: "Abmelden",
    loginLabel: "Anmelden",
    activateMonitoringAlert: "Aktivieren Sie die Überwachung für mindestens eine App zum Simulieren.",
    scamDetectedAlert: "[AKTIVER SCHILD] Betrug in {app} erkannt und automatisch blockiert!",
    settingsSavedAlert: "Einstellungen gespeichert!",
    emergencyCallAlert: "Rufe {service} an... Umgebungszuhören zu Ihrer Sicherheit aktiviert.",
    audioAnalyzedAlert: "Audio gesendet und analysiert. Behörden und Sicherheitskontakte wurden benachrichtigt.",
    fallDetectedAlert: "STURZ ERKANNT! Starte Notfallprotokoll in 10 Sekunden...",
    scamConfirmTitle: "[ALARM] Verdächtige Nachricht in {app} erkannt",
    scamConfirmMessage: "\"{msg}\"\n\nMöchten Sie diesen Kontakt blockieren und melden?",
    confirmYes: "Ja, blockieren",
    confirmNo: "Ignorieren",
    allowContactLocation: "Kontaktstandort zulassen",
    contactLocationDescription: "Genaue Standorte der Sicherheitskontakte auf der Karte anzeigen",
    contactLocationActive: "Kontaktstandort aktiv",
    safeContactMarker: "Sicherheitskontakt: {name}",
    contactAccess: "Kontaktzugriff",
    contactAccessDescription: "Zugriff auf registrierte Kontakte auf Telefon und Karte zulassen",
    showContactsOnMap: "Kontakte auf Karte anzeigen",
    contactsSynced: "Kontakte synchronisiert",
    contactsNotSynced: "Kontaktzugriff deaktiviert",
    monitoringDevices: "Überwachungsgeräte",
    registerDevice: "Gerät registrieren",
    deviceName: "Gerätename",
    deviceType: "Typ",
    connected: "Verbunden",
    disconnected: "Getrennt",
    realTimeData: "Echtzeitdaten",
    addDevice: "Gerät hinzufügen",
    smartwatch: "Smartwatch",
    heartMonitor: "Herzfrequenzmesser",
    oximeter: "Oximeter",
    noDevices: "Keine Geräte registriert.",
    readingInterval: "Leseintervall",
    seconds: "Sekunden",
    updateInterval: "Intervall aktualisieren",
    openInGoogleMaps: "In Google Maps öffnen",
    riskZones: [
      { name: "Hafenbereich - Nordabschnitt", level: "HOCH", color: "bg-rose-500" },
      { name: "Historisches Zentrum - Marktumgebung", level: "MITTEL", color: "bg-amber-500" },
      { name: "Hangbereich - José Menino Hügel", level: "HOCH", color: "bg-rose-500" }
    ],
    scamMessages: [
      "Herzlichen Glückwunsch! Sie haben einen Pix von 5.000 R$ gewonnen. Klicken Sie hier: http://pix-premiado.xyz",
      "Ihr Bankkonto wird in 2 Stunden gesperrt. Jetzt regulieren: http://banco-seguro-app.com",
      "Home-Office-Stellenangebot: 800 R$/Tag. Rufen Sie unter dem Link an: http://vagas-urgentes.net"
    ],
    routePrompt: "Erstellen Sie als lokaler Sicherheitsassistent in Santos, SP, eine sichere Route von \"{origin}\" zum Ziel: \"{dest}\". Vermeiden Sie bekannte Risikogebiete wie die nördliche Hafenzone und das historische Zentrum bei Nacht. Schlagen Sie eine Hauptroute vor und erklären Sie, warum sie sicherer ist. Antworten Sie prägnant auf Deutsch.",
    routeSystemInstruction: "Sie sind der Spezialist für sichere Routen von O GUARDIAO. Ihre Mission ist es, den Bürger zu schützen, indem Sie beleuchtete und belebte Wege vorschlagen.",
    routeFallback: "Fehler bei der Routenberechnung. Folgen Sie den Haupt- und gut beleuchteten Alleen.",
    routeSuccess: "Route erfolgreich über Hauptstraßen berechnet.",
    emergencyAlert: "Notfall {service}",
    panicAlert: "STILLER PANIKALARM AKTIVIERT",
    directActivationMsg: "DIREKTE AKTIVIERUNG: {service}",
    listeningActiveMsg: "Automatisches Zuhören aktiviert. Kontakte benachrichtigt: {contacts}",
    locationSentMsg: "Standort gesendet. Kontatos benachrichtigt: {contacts}",
    mother: "Mutter",
    father: "Vater",
  },
  it: {
    appName: "O GUARDIAO",
    dashboard: "Dashboard",
    emergency: "Emergenza",
    scam: "Truffe",
    settings: "Impostazioni",
    personalData: "Dati personali",
    language: "Lingua",
    name: "Nome",
    email: "E-mail",
    phone: "Telefono",
    theme: "Tema",
    light: "Chiaro",
    dark: "Scuro",
    save: "Salva",
    selectLanguage: "Seleziona lingua",
    welcome: "Benvenuto in O GUARDIAO",
    sentinelActive: "SENTINELLA ATTIVA",
    protectionLevel: "Livello di protezione",
    high: "ALTO",
    panicButton: "PULSANTE PANICO",
    analyzeScam: "Analizza truffa",
    emergency190: "Emergenza 190",
    scamAnalysis: "Analisi truffe",
    activeShield: "SCUDO ATTIVO",
    automatic: "AUTOMATICO",
    manual: "MANUALE",
    monitoredApps: "App monitorate",
    scamLogs: "Log truffe",
    back: "Indietro",
    logout: "Disconnetti",
    login: "Accedi con Google",
    healthProfile: "Profilo salute",
    medications: "Farmaci",
    neighborAlerts: "Avvisi vicinato",
    talentMarket: "Mercato dei talenti",
    safeRoute: "Percorso sicuro",
    calculating: "Calcolo in corso...",
    calculate: "Calcola percorso",
    panicDescription: "Allerta polizia e contatti di sicurezza immediatamente",
    scamDescription: "Link e SMS",
    emergencyDescription: "Analisi audio",
    settingsDescription: "Profilo e preferenze",
    autoListening: "Ascolto automatico",
    responseMode: "Modalità di risposta",
    autoDescription: "* O GUARDIAO bloccherà i link e notificherà i contatti automaticamente quando vengono rilevate truffe.",
    manualDescription: "* Verrai notificato per decidere l'azione per ogni minaccia rilevata.",
    simulateNotification: "Simula notifica sospetta",
    activityLog: "LOG ATTIVITÀ",
    clear: "Cancella",
    blockedAuto: "BLOCCATO AUTOMATICAMENTE",
    blockedUser: "BLOCCATO DALL'UTENTE",
    ignoredUser: "IGNORATO DALL'UTENTE",
    manualAnalysis: "Analisi manuale",
    placeholderScam: "Incolla il link o il messaggio sospetto qui...",
    checkSecurity: "Verifica sicurezza",
    analyzing: "Analisi in corso...",
    emergencySubtitle: "Attivazione immediata e contatti di sicurezza.",
    police190: "POLIZIA 190",
    samu192: "SAMU 192",
    directActivation: "Attivazione diretta",
    medicalEmergency: "Emergenza medica",
    realTimeListening: "Ascolto in tempo reale",
    listeningDescription: "O GUARDIAO ascolterà l'audio locale in caso di emergenza.",
    localAudioActive: "Audio locale attivo",
    safeContacts: "Contatti di sicurezza",
    addNewContact: "Aggiungi nuovo contatto",
    saveContact: "Salva contatto",
    aiAudioAnalysis: "Analisi audio IA",
    audioDescription: "Invia audio per un'analisi immediata del pericolo.",
    sendForAnalysis: "INVIA PER ANALISI",
    controlPanel: "Pannello di controllo",
    monitoringAlerts: "Monitoraggio avvisi in tempo reale...",
    footer: "SENTINELA • O GUARDIAO © 2026",
    verdict: "Verdetto",
    reason: "Motivo",
    action: "Azione",
    safe: "SICURO",
    suspicious: "SOSPETTO",
    scamConfirmed: "TRUFFA CONFERMATA",
    localSecurity: "SICUREZZA LOCALE",
    santosSP: "SANTOS, SP",
    activeHeatmap: "Mappa di calore attiva",
    routeSuggestion: "Suggerimento: Percorso via Av. Ana Costa (Più sicuro)",
    monitoringPath: "MONITORAGGIO PERCORSO",
    simulateFall: "Simula caduta",
    planSafeRoute: "Pianifica percorso sicuro",
    fromWhere: "Da dove stai partendo?",
    toWhere: "Dove stai andando?",
    useCurrentLocation: "Usa posizione attuale",
    whereTo: "Dove stai andando?",
    recommendedRoute: "Percorso consigliato",
    attentionZones: "Zone di attenzione (Santos)",
    risk: "RISCHIO",
    neighborNetwork: "Rete dei vicini",
    noRecentAlerts: "Nessun avviso recente nella tua zona.",
    endWalkWithMe: "TERMINA CAMMINA CON ME",
    startWalkWithMe: "AVVIA CAMMINA CON ME",
    to: "A",
    healthWellness: "SALUTE E BENESSERE",
    aiCheckup: "Check-up IA",
    heartRateStable: "Ritmo cardiaco stabile. Nessuna aritmia rilevata.",
    nextMedication: "Prossimo farmaco",
    noActiveReminders: "Nessun promemoria attivo.",
    universalWallet: "Portafoglio universale",
    qrCodeDescription: "Codice QR crittografato with la tua storia vitale per i soccorritori.",
    manageMedicalData: "Gestisci dati medici",
    nearbyUnits: "Unità sanitarie vicine a Santos",
    nearbyPharmacies: "Farmacie vicine",
    findPharmacies: "Trova farmacie",
    leisureCulture: "SVAGO E CULTURA",
    findLeisure: "Trova Svago",
    cinema: "Cinema",
    mall: "Centro Commerciale",
    theater: "Teatro",
    bar: "Bar",
    restaurant: "Ristorante",
    pharmacy: "Farmacia",
    advancedSearch: "Ricerca Avanzata",
    foodType: "Tipo di Cucina",
    allTypes: "Tutti i Tipi",
    italian: "Italiana",
    japanese: "Giapponese",
    brazilian: "Brasiliana",
    fastFood: "Fast Food",
    healthy: "Salutare",
    pizza: "Pizza",
    seafood: "Frutti di Mare",
    pharmacyPrompt: "Quali sono le 3 farmacie più vicine a me? Elencale nel formato 'Nome (Distanza)'.",
    unitsPrompt: "Quali sono le 5 unità sanitarie (UPA, centri sanitari, ospedali, policlinici) più vicine a me? Elencale nel formato 'Nome (Distanza)'.",
    leisurePrompt: "Quali sono i 3 {category} più vicini a me? Elencali nel formato 'Nome (Distanza)'.",
    financialStability: "STABILITÀ FINANZIARIA",
    antiFraudShieldActive: "Scudo anti-frode attivo",
    aiMonitoringDescription: "IA che monitora link e messaggi sospetti in tempo reale.",
    generalConsultancies: "Consulenze generali",
    safeLabel: "Sicuro",
    hire: "Assumi",
    specialist: "Specialista",
    verified: "Verificato",
    strategicConsultancy: "Consulenza strategica",
    consultancyDescription: "Condividi la tua esperienza e monetizza le tue conoscenze in sicurezza.",
    toBeAgreed: "Da concordare",
    learnMore: "Scopri di più",
    shieldSettings: "IMPOSTAZIONI SCUDO",
    protectionActive: "PROTEZIONE ATTIVA",
    protectionDisabled: "PROTEZIONE DISATTIVATA",
    globalMonitoring: "Monitoraggio globale",
    globalMonitoringDescription: "Attiva per consentire a O GUARDIAO di analizzare le notifiche.",
    individualListeningConfig: "Config ascolto individuale",
    silentAlertActive: "ALLERTA SILENZIOSA ATTIVATA",
    trustZone: "Sei in una zona di fiducia",
    logoutLabel: "Disconnetti",
    loginLabel: "Accedi",
    activateMonitoringAlert: "Attiva il monitoraggio per almeno un'app per simulare.",
    scamDetectedAlert: "[SCUDO ATTIVO] Truffa rilevata in {app} e bloccata automaticamente!",
    settingsSavedAlert: "Impostazioni salvate!",
    emergencyCallAlert: "Chiamata a {service} in corso... Ascolto ambientale attivato per la tua sicurezza.",
    audioAnalyzedAlert: "Audio inviato e analizzato. Le autorità e i contatti di sicurezza sono stati notificati.",
    fallDetectedAlert: "CADUTA RILEVATA! Avvio protocollo di emergenza in 10 secondi...",
    scamConfirmTitle: "[ALLERTA] Messaggio sospetto rilevato in {app}",
    scamConfirmMessage: "\"{msg}\"\n\nVuoi bloccare questo contatto e segnalarlo?",
    confirmYes: "Sì, blocca",
    confirmNo: "Ignora",
    allowContactLocation: "Consenti posizione contatti",
    contactLocationDescription: "Mostra la posizione esatta dei contatti di sicurezza sulla mappa",
    contactLocationActive: "Posizione contatti attiva",
    safeContactMarker: "Contatto di sicurezza: {name}",
    contactAccess: "Accesso ai contatti",
    contactAccessDescription: "Consenti l'accesso ai contatti registrati sul telefono e sulla mappa",
    showContactsOnMap: "Mostra contatti sulla mappa",
    contactsSynced: "Contatti sincronizzati",
    contactsNotSynced: "Accesso ai contatti disattivato",
    monitoringDevices: "Dispositivi di monitoraggio",
    registerDevice: "Registra dispositivo",
    deviceName: "Nome dispositivo",
    deviceType: "Tipo",
    connected: "Connesso",
    disconnected: "Disconnesso",
    realTimeData: "Dati in tempo reale",
    addDevice: "Aggiungi dispositivo",
    smartwatch: "Smartwatch",
    heartMonitor: "Monitor cardiaco",
    oximeter: "Ossimetro",
    noDevices: "Nessun dispositivo registrato.",
    readingInterval: "Intervallo di lettura",
    seconds: "secondi",
    updateInterval: "Aggiorna intervallo",
    openInGoogleMaps: "Apri in Google Maps",
    riskZones: [
      { name: "Zona portuale - Sezione Nord", level: "ALTO", color: "bg-rose-500" },
      { name: "Centro storico - Dintorni del mercato", level: "MEDIO", color: "bg-amber-500" },
      { name: "Area di pendio - Collina José Menino", level: "ALTO", color: "bg-rose-500" }
    ],
    scamMessages: [
      "Congratulazioni! Hai vinto un Pix di R$ 5.000. Clicca qui: http://pix-premiado.xyz",
      "Il tuo conto bancario verrà bloccato tra 2 ore. Regolarizza ora: http://banco-seguro-app.com",
      "Offerta di lavoro da casa: R$ 800/giorno. Chiama al link: http://vagas-urgentes.net"
    ],
    routePrompt: "In qualità di assistente alla sicurezza locale a Santos, SP, traccia un percorso sicuro da \"{origin}\" verso la destinazione: \"{dest}\". Evita le zone a rischio note come la zona portuale settentrionale e il centro storico di notte. Suggerisci un percorso principale e spiega perché è più sicuro. Rispondi in modo conciso in italiano.",
    routeSystemInstruction: "Sei lo specialista dei percorsi sicuri di O GUARDIAO. La tua missione è proteggere il cittadino suggerendo percorsi illuminati e frequentati.",
    routeFallback: "Errore nel calcolo del percorso. Segui i viali principali e ben illuminati.",
    routeSuccess: "Percorso calcolato con successo tramite le strade principali.",
    emergencyAlert: "Emergenza {service}",
    panicAlert: "ALLERTA PANICO SILENZIOSA ATTIVATA",
    directActivationMsg: "ATTIVAZIONE DIRETTA: {service}",
    listeningActiveMsg: "Ascolto automatico attivato. Contatti notificati: {contacts}",
    locationSentMsg: "Posizione inviata. Contatti notificati: {contacts}",
    mother: "Madre",
    father: "Padre",
  },
  nl: {
    appName: "O GUARDIAO",
    dashboard: "Dashboard",
    emergency: "Noodgeval",
    scam: "Fraude",
    settings: "Instellingen",
    personalData: "Persoonlijke gegevens",
    language: "Taal",
    name: "Naam",
    email: "E-mail",
    phone: "Telefoon",
    theme: "Thema",
    light: "Licht",
    dark: "Donker",
    save: "Opslaan",
    selectLanguage: "Selecteer taal",
    welcome: "Welkom bij O GUARDIAO",
    sentinelActive: "SENTINEL ACTIEF",
    protectionLevel: "Beschermingsniveau",
    high: "HOOG",
    panicButton: "PANIEKKNOP",
    analyzeScam: "Fraude analyseren",
    emergency190: "Noodgeval 190",
    scamAnalysis: "Fraudeanalyse",
    activeShield: "ACTIEF SCHILD",
    automatic: "AUTOMATISCH",
    manual: "HANDMATIG",
    monitoredApps: "Gemonitorde apps",
    scamLogs: "Fraude-logs",
    back: "Terug",
    logout: "Uitloggen",
    login: "Inloggen met Google",
    healthProfile: "Gezondheidsprofiel",
    medications: "Medicijnen",
    neighborAlerts: "Buurtwaarschuwingen",
    talentMarket: "Talentenmarkt",
    safeRoute: "Veilige route",
    calculating: "Berekenen...",
    calculate: "Route berekenen",
    panicDescription: "Alarmeert onmiddellijk politie en veiligheidscontacten",
    scamDescription: "Links en SMS",
    emergencyDescription: "Audio-analyse",
    settingsDescription: "Profiel en voorkeuren",
    autoListening: "Automatisch luisteren",
    responseMode: "Reactiemodus",
    autoDescription: "* O GUARDIAO blokkeert links en stelt contacten automatisch op de hoogte wanneer fraude wordt gedetecteerd.",
    manualDescription: "* U krijgt een melding om de actie te bepalen voor elke gedetecteerde dreiging.",
    simulateNotification: "Simuleer verdachte melding",
    activityLog: "ACTIVITEITENLOG",
    clear: "Wissen",
    blockedAuto: "AUTOMATISCH GEBLOKKEERD",
    blockedUser: "GEBLOKKEERD DOOR GEBRUIKER",
    ignoredUser: "GENEGEERD DOOR GEBRUIKER",
    manualAnalysis: "Handmatige analyse",
    placeholderScam: "Plak de link of het verdachte bericht hier...",
    checkSecurity: "Beveiliging controleren",
    analyzing: "Analyseren...",
    emergencySubtitle: "Onmiddellijke activering en veiligheidscontacten.",
    police190: "POLITIE 190",
    samu192: "SAMU 192",
    directActivation: "Directe activering",
    medicalEmergency: "Medisch noodgeval",
    realTimeListening: "Real-time luisteren",
    listeningDescription: "O GUARDIAO luistert naar lokale audio in noodgevallen.",
    localAudioActive: "Lokale audio actief",
    safeContacts: "Veiligheidscontacten",
    addNewContact: "Nieuw contact toevoegen",
    saveContact: "Contact opslaan",
    aiAudioAnalysis: "AI audio-analyse",
    audioDescription: "Stuur audio voor onmiddellijke gevaaranalyse.",
    sendForAnalysis: "STUUR VOOR ANALYSE",
    controlPanel: "Controlepaneel",
    monitoringAlerts: "Real-time waarschuwingsmonitoring...",
    footer: "SENTINELA • O GUARDIAO © 2026",
    verdict: "Oordeel",
    reason: "Reden",
    action: "Actie",
    safe: "VEILIG",
    suspicious: "VERDACHT",
    scamConfirmed: "FRAUDE BEVESTIGD",
    localSecurity: "LOKALE VEILIGHEID",
    santosSP: "SANTOS, SP",
    activeHeatmap: "Actieve heatmap",
    routeSuggestion: "Suggestie: Route via Av. Ana Costa (Veiliger)",
    monitoringPath: "ROUTE MONITOREN",
    simulateFall: "Simuleer val",
    planSafeRoute: "Veilige route plannen",
    fromWhere: "Van waar vertrek je?",
    toWhere: "Waar ga je heen?",
    useCurrentLocation: "Huidige locatie gebruiken",
    whereTo: "Waar ga je heen?",
    recommendedRoute: "Aanbevolen route",
    attentionZones: "Aandachtszones (Santos)",
    risk: "RISICO",
    neighborNetwork: "Buurtnetwerk",
    noRecentAlerts: "Geen recente waarschuwingen in uw omgeving.",
    endWalkWithMe: "STOP LOOP MET MIJ",
    startWalkWithMe: "START LOOP MET MIJ",
    to: "NAAR",
    healthWellness: "GEZONDHEID & WELZIJN",
    aiCheckup: "AI Check-up",
    heartRateStable: "Stabiele hartslag. Geen aritmie gedetecteerd.",
    nextMedication: "Volgende medicijn",
    noActiveReminders: "Geen actieve herinneringen.",
    universalWallet: "Universele portemonnee",
    qrCodeDescription: "Gecodeerde QR-code met uw vitale geschiedenis voor hulpverleners.",
    manageMedicalData: "Medische gegevens beheren",
    nearbyUnits: "Nabijgelegen gezondheidseenheden in Santos",
    nearbyPharmacies: "Apotheken in de buurt",
    findPharmacies: "Apotheken zoeken",
    leisureCulture: "VRIJE TIJD & CULTUUR",
    findLeisure: "Vrije tijd vinden",
    cinema: "Bioscoop",
    mall: "Winkelcentrum",
    theater: "Theater",
    bar: "Bar",
    restaurant: "Restaurant",
    pharmacy: "Apotheek",
    advancedSearch: "Geavanceerd Zoeken",
    foodType: "Type Keuken",
    allTypes: "Alle Types",
    italian: "Italiaans",
    japanese: "Japans",
    brazilian: "Braziliaans",
    fastFood: "Fast Food",
    healthy: "Gezond",
    pizza: "Pizza",
    seafood: "Zeevruchten",
    pharmacyPrompt: "Wat zijn de 3 dichtstbijzijnde apotheken bij mij? Vermeld ze in het formaat 'Naam (Afstand)'.",
    unitsPrompt: "Wat zijn de 5 dichtstbijzijnde gezondheidscentra (UPA's, gezondheidscentra, ziekenhuizen, poliklinieken) bij mij? Vermeld ze in het formaat 'Naam (Afstand)'.",
    leisurePrompt: "Wat zijn de 3 dichtstbijzijnde {category} bij mij? Vermeld ze in het formaat 'Naam (Afstand)'.",
    financialStability: "FINANCIËLE STABILITEIT",
    antiFraudShieldActive: "Anti-fraude schild actief",
    aiMonitoringDescription: "AI monitort links en verdachte berichten in real-time.",
    generalConsultancies: "Algemene consulten",
    safeLabel: "Veilig",
    hire: "Inhuren",
    specialist: "Specialist",
    verified: "Geverifieerd",
    strategicConsultancy: "Strategisch advies",
    consultancyDescription: "Deel uw ervaring en verdien geld met uw kennis op een veilige manier.",
    toBeAgreed: "Nader overeen te komen",
    learnMore: "Meer informatie",
    shieldSettings: "SCHILDINSTELLINGEN",
    protectionActive: "BESCHERMING ACTIEF",
    protectionDisabled: "BESCHERMING UITGESCHAKELD",
    globalMonitoring: "Globale monitoring",
    globalMonitoringDescription: "Activeer om O GUARDIAO toe te staan meldingen te analyseren.",
    individualListeningConfig: "Individuele luisterconfiguratie",
    silentAlertActive: "STIL ALARM GEACTIVEERD",
    trustZone: "U bevindt zich in een vertrouwenszone",
    logoutLabel: "Uitloggen",
    loginLabel: "Inloggen",
    activateMonitoringAlert: "Activeer monitoring voor ten minste één app om te simuleren.",
    scamDetectedAlert: "[ACTIEF SCHILD] Fraude gedetecteerd in {app} and automatisch geblokkeerd!",
    settingsSavedAlert: "Instellingen opgeslagen!",
    emergencyCallAlert: "Bellen naar {service}... Omgevingsluisteren geactiveerd voor uw veiligheid.",
    audioAnalyzedAlert: "Audio verzonden en geanalyseerd. Autoriteiten en veiligheidscontacten zijn op de hoogte gesteld.",
    fallDetectedAlert: "VAL GEDETECTEERD! Noodprotocol start over 10 seconden...",
    scamConfirmTitle: "[ALARM] Verdacht bericht gedetecteerd in {app}",
    scamConfirmMessage: "\"{msg}\"\n\nWilt u dit contact blokkeren en rapporteren?",
    confirmYes: "Ja, blokkeren",
    confirmNo: "Negeren",
    allowContactLocation: "Contactlocatie toestaan",
    contactLocationDescription: "Toon exacte locatie van veiligheidscontacten op de kaart",
    contactLocationActive: "Contactlocatie actief",
    safeContactMarker: "Veiligheidscontact: {name}",
    contactAccess: "Toegang tot contacten",
    contactAccessDescription: "Toegang verlenen tot geregistreerde contacten op telefoon en kaart",
    showContactsOnMap: "Contacten op kaart tonen",
    contactsSynced: "Contacten gesynchroniseerd",
    contactsNotSynced: "Toegang tot contacten uitgeschakeld",
    monitoringDevices: "Monitoringsapparaten",
    registerDevice: "Apparaat registreren",
    deviceName: "Apparaatnaam",
    deviceType: "Type",
    connected: "Verbonden",
    disconnected: "Niet verbonden",
    realTimeData: "Real-time gegevens",
    addDevice: "Apparaat toevoegen",
    smartwatch: "Smartwatch",
    heartMonitor: "Hartslagmeter",
    oximeter: "Oximeter",
    noDevices: "Geen apparaten geregistreerd.",
    readingInterval: "Leesinterval",
    seconds: "seconden",
    updateInterval: "Interval bijwerken",
    openInGoogleMaps: "Openen in Google Maps",
    riskZones: [
      { name: "Havengebied - Noordelijk deel", level: "HOOG", color: "bg-rose-500" },
      { name: "Historisch centrum - Omgeving markt", level: "GEMIDDELD", color: "bg-amber-500" },
      { name: "Hellingsgebied - José Menino heuvel", level: "HOOG", color: "bg-rose-500" }
    ],
    scamMessages: [
      "Gefeliciteerd! U heeft een Pix van R$ 5.000 gewonnen. Klik hier: http://pix-premiado.xyz",
      "Uw bankrekening wordt over 2 uur geblokkeerd. Regel het nu: http://banco-seguro-app.com",
      "Vacature voor thuiswerk: R$ 800/dag. Bel via de link: http://vagas-urgentes.net"
    ],
    routePrompt: "Als lokale veiligheidsassistent in Santos, SP, stippel je een veilige route uit van \"{origin}\" naar de bestemming: \"{dest}\". Vermijd bekende risicogebieden zoals de noordelijke havenzone en het historische centrum 's nachts. Stel een hoofdroute voor en leg uit waarom deze veiliger is. Antwoord beknopt in het Nederlands.",
    routeSystemInstruction: "U bent de specialist voor veilige routes van O GUARDIAO. Uw missie is om de burger te beschermen door verlichte en drukke paden voor te stellen.",
    routeFallback: "Fout bij het berekenen van de route. Volg de hoofd- en goed verlichte lanen.",
    routeSuccess: "Route succesvol berekend via hoofdwegen.",
    emergencyAlert: "Noodgeval {service}",
    panicAlert: "STIL PANIEKALARM GEACTIVEERD",
    directActivationMsg: "DIRECTE ACTIVERING: {service}",
    listeningActiveMsg: "Automatisch luisteren geactiveerd. Contacten op de hoogte gesteld: {contacts}",
    locationSentMsg: "Locatie verzonden. Contacten op de hoogte gesteld: {contacts}",
    mother: "Moeder",
    father: "Vader",
  },
  zh: {
    appName: "O GUARDIAO",
    dashboard: "仪表板",
    emergency: "紧急情况",
    scam: "诈骗",
    settings: "设置",
    personalData: "个人资料",
    language: "语言",
    name: "姓名",
    email: "电子邮件",
    phone: "电话",
    theme: "主题",
    light: "浅色",
    dark: "深色",
    save: "保存",
    selectLanguage: "选择语言",
    welcome: "欢迎来到 O GUARDIAO",
    sentinelActive: "哨兵激活",
    protectionLevel: "保护级别",
    high: "高",
    panicButton: "紧急按钮",
    analyzeScam: "分析诈骗",
    emergency190: "紧急情况 190",
    scamAnalysis: "诈骗分析",
    activeShield: "活动护盾",
    automatic: "自动",
    manual: "手动",
    monitoredApps: "监控的应用",
    scamLogs: "诈骗日志",
    back: "返回",
    logout: "登出",
    login: "使用 Google 登录",
    healthProfile: "健康档案",
    medications: "药物",
    neighborAlerts: "邻里警报",
    talentMarket: "人才市场",
    safeRoute: "安全路线",
    calculating: "正在计算...",
    calculate: "计算路线",
    panicDescription: "立即警报警察和安全联系人",
    scamDescription: "链接和短信",
    emergencyDescription: "音频分析",
    settingsDescription: "个人资料和偏好",
    autoListening: "自动监听",
    responseMode: "响应模式",
    autoDescription: "* 当检测到诈骗时，O GUARDIAO 将自动阻止链接并通知联系人。",
    manualDescription: "* 您将收到通知，以决定对每个检测到的威胁采取的行动。",
    simulateNotification: "模拟可疑通知",
    activityLog: "活动日志",
    clear: "清除",
    blockedAuto: "自动阻止",
    blockedUser: "用户阻止",
    ignoredUser: "用户忽略",
    manualAnalysis: "手动分析",
    placeholderScam: "在此粘贴链接或可疑消息...",
    checkSecurity: "检查安全性",
    analyzing: "正在分析...",
    emergencySubtitle: "立即激活和安全联系人。",
    police190: "警察 190",
    samu192: "SAMU 192",
    directActivation: "直接激活",
    medicalEmergency: "医疗紧急情况",
    realTimeListening: "实时监听",
    listeningDescription: "O GUARDIAO 将在紧急情况下监听本地音频。",
    localAudioActive: "本地音频激活",
    safeContacts: "安全联系人",
    addNewContact: "添加新联系人",
    saveContact: "保存联系人",
    aiAudioAnalysis: "AI 音频分析",
    audioDescription: "发送音频进行即时危险分析。",
    sendForAnalysis: "发送进行分析",
    controlPanel: "控制面板",
    monitoringAlerts: "实时警报监控...",
    footer: "SENTINELA • O GUARDIAO © 2026",
    verdict: "结论",
    reason: "原因",
    action: "行动",
    safe: "安全",
    suspicious: "可疑",
    scamConfirmed: "确认诈骗",
    localSecurity: "本地安全",
    santosSP: "桑托斯, SP",
    activeHeatmap: "活动热图",
    routeSuggestion: "建议：经由 Av. Ana Costa 的路线（更安全）",
    monitoringPath: "监控路径",
    simulateFall: "模拟跌倒",
    planSafeRoute: "规划安全路线",
    fromWhere: "你从哪里出发？",
    toWhere: "你要去哪里？",
    useCurrentLocation: "使用当前位置",
    whereTo: "你要去哪里？",
    recommendedRoute: "推荐路线",
    attentionZones: "关注区域 (桑托斯)",
    risk: "风险",
    neighborNetwork: "邻里网络",
    noRecentAlerts: "您所在地区最近没有警报。",
    endWalkWithMe: "结束陪我走",
    startWalkWithMe: "开始陪我走",
    to: "到",
    healthWellness: "健康与福祉",
    aiCheckup: "AI 检查",
    heartRateStable: "心率稳定。未检测到心律失常。",
    nextMedication: "下一次药物",
    noActiveReminders: "没有活动的提醒。",
    universalWallet: "通用钱包",
    qrCodeDescription: "为救援人员准备的包含您生命史的加密二维码。",
    manageMedicalData: "管理医疗数据",
    nearbyUnits: "桑托斯附近的卫生单位",
    nearbyPharmacies: "附近药店",
    findPharmacies: "查找药店",
    leisureCulture: "休闲与文化",
    findLeisure: "寻找休闲",
    cinema: "电影院",
    mall: "购物中心",
    theater: "剧院",
    bar: "酒吧",
    restaurant: "餐厅",
    pharmacy: "药店",
    advancedSearch: "高级搜索",
    foodType: "食物类型",
    allTypes: "所有类型",
    italian: "意大利菜",
    japanese: "日本料理",
    brazilian: "巴西菜",
    fastFood: "快餐",
    healthy: "健康食品",
    pizza: "比萨",
    seafood: "海鲜",
    pharmacyPrompt: "离我最近的3家药店有哪些？请按“名称 (距离)”的格式列出。",
    unitsPrompt: "离我最近的5家医疗机构（UPA、卫生中心、医院、综合诊所）有哪些？请按“名称 (距离)”的格式列出。",
    leisurePrompt: "离我最近的3家{category}有哪些？请按“名称 (距离)”的格式列出。",
    financialStability: "财务稳定",
    antiFraudShieldActive: "反欺诈护盾激活",
    aiMonitoringDescription: "AI 实时监控链接和可疑消息。",
    generalConsultancies: "一般咨询",
    safeLabel: "安全",
    hire: "雇佣",
    specialist: "专家",
    verified: "已验证",
    strategicConsultancy: "战略咨询",
    consultancyDescription: "以安全的方式分享您的经验并从您的知识中获利。",
    toBeAgreed: "待商定",
    learnMore: "了解更多",
    shieldSettings: "护盾设置",
    protectionActive: "保护激活",
    protectionDisabled: "保护禁用",
    globalMonitoring: "全球监控",
    globalMonitoringDescription: "激活以允许 O GUARDIAO 分析通知。",
    individualListeningConfig: "个人监听配置",
    silentAlertActive: "静默警报激活",
    trustZone: "您处于信任区域",
    logoutLabel: "登出",
    loginLabel: "登录",
    activateMonitoringAlert: "请至少为一个应用激活监控以进行模拟。",
    scamDetectedAlert: "[活动护盾] 在 {app} 中检测到诈骗并自动阻止！",
    settingsSavedAlert: "设置已保存！",
    emergencyCallAlert: "正在呼叫 {service}... 为了您的安全，环境监听已激活。",
    audioAnalyzedAlert: "音频已发送并分析。当局和安全联系人已收到通知。",
    fallDetectedAlert: "检测到跌倒！紧急协议将在 10 秒内启动...",
    scamConfirmTitle: "[警报] 在 {app} 中检测到可疑消息",
    scamConfirmMessage: "\"{msg}\"\n\n您要阻止此联系人并举报吗？",
    confirmYes: "是的，阻止",
    confirmNo: "忽略",
    allowContactLocation: "允许联系人位置",
    contactLocationDescription: "在地图上显示安全联系人的确切位置",
    contactLocationActive: "联系人位置激活",
    safeContactMarker: "安全联系人：{name}",
    contactAccess: "联系人访问",
    contactAccessDescription: "允许访问手机和地图上注册的联系人",
    showContactsOnMap: "在地图上显示联系人",
    contactsSynced: "联系人已同步",
    contactsNotSynced: "联系人访问已禁用",
    monitoringDevices: "监控设备",
    registerDevice: "注册设备",
    deviceName: "设备名称",
    deviceType: "类型",
    connected: "已连接",
    disconnected: "已断开",
    realTimeData: "实时数据",
    addDevice: "添加设备",
    smartwatch: "智能手表",
    heartMonitor: "心脏监测器",
    oximeter: "血氧仪",
    noDevices: "没有注册的设备。",
    readingInterval: "读取间隔",
    seconds: "秒",
    updateInterval: "更新间隔",
    openInGoogleMaps: "在 Google 地图上打开",
    riskZones: [
      { name: "港口区 - 北部", level: "高", color: "bg-rose-500" },
      { name: "历史中心 - 市场周围", level: "中", color: "bg-amber-500" },
      { name: "斜坡区域 - José Menino 山", level: "高", color: "bg-rose-500" }
    ],
    scamMessages: [
      "恭喜！您赢得了 R$ 5,000 的 Pix。点击此处：http://pix-premiado.xyz",
      "您的银行账户将在 2 小时内被冻结。请立即处理：http://banco-seguro-app.com",
      "居家办公职位：R$ 800/天。通过链接致电：http://vagas-urgentes.net"
    ],
    routePrompt: "作为桑托斯 (SP) 的本地安全助手，请规划一条从 \"{origin}\" 前往目的地 \"{dest}\" 的安全路线。避开已知的风险区域，如北部港口区和夜间的历史中心。建议一条主要路线并解释为什么它更安全。请用中文简明扼要地回答。",
    routeSystemInstruction: "你是 O GUARDIAO 的安全路线专家。你的任务是通过建议光线充足且人流较多的路径来保护公民。",
    routeFallback: "计算路线时出错。请沿着主要且光线充足的大道行驶。",
    routeSuccess: "已成功通过主要道路计算出路线。",
    emergencyAlert: "紧急情况 {service}",
    panicAlert: "静默紧急警报激活",
    directActivationMsg: "直接激活：{service}",
    listeningActiveMsg: "自动监听激活。已通知联系人：{contacts}",
    locationSentMsg: "位置已发送。已通知联系人：{contacts}",
    mother: "母亲",
    father: "父亲",
  },
  he: {
    appName: "O GUARDIAO",
    dashboard: "לוח בקרה",
    emergency: "חירום",
    scam: "הונאות",
    settings: "הגדרות",
    personalData: "נתונים אישיים",
    language: "שפה",
    name: "שם",
    email: "אימייל",
    phone: "טלפון",
    theme: "ערכת נושא",
    light: "בהיר",
    dark: "כהה",
    save: "שמור",
    selectLanguage: "בחר שפה",
    welcome: "ברוכים הבאים ל-O GUARDIAO",
    sentinelActive: "סנטינל פעיל",
    protectionLevel: "רמת הגנה",
    high: "גבוהה",
    panicButton: "לחצן מצוקה",
    analyzeScam: "נתח הונאה",
    emergency190: "חירום 190",
    scamAnalysis: "ניתוח הונאות",
    activeShield: "מגן פעיל",
    automatic: "אוטומטי",
    manual: "ידני",
    monitoredApps: "אפליקציות מנוטרות",
    scamLogs: "יומני הונאות",
    back: "חזור",
    logout: "התנתק",
    login: "התחבר עם גוגל",
    healthProfile: "פרופיל בריאות",
    medications: "תרופות",
    neighborAlerts: "התראות שכנים",
    talentMarket: "שוק כישרונות",
    safeRoute: "מסלול בטוח",
    calculating: "מחשב...",
    calculate: "חשב מסלול",
    panicDescription: "מתריע מיד למשטרה ולאנשי קשר לשעת חירום",
    scamDescription: "קישורים ו-SMS",
    emergencyDescription: "ניתוח שמע",
    settingsDescription: "פרופיל והעדפות",
    autoListening: "האזנה אוטומטית",
    responseMode: "מצב תגובה",
    autoDescription: "* O GUARDIAO יחסום קישורים ויודיע לאנשי קשר באופן אוטומטי כאשר תזוהה הונאה.",
    manualDescription: "* תקבל הודעה כדי להחליט על הפעולה עבור כל איום שיזוהה.",
    simulateNotification: "סמלץ הודעה חשודה",
    activityLog: "יומן פעילות",
    clear: "נקה",
    blockedAuto: "נחסם אוטומטית",
    blockedUser: "נחסם על ידי המשתמש",
    ignoredUser: "התעלמות על ידי המשתמש",
    manualAnalysis: "ניתוח ידני",
    placeholderScam: "הדבק את הקישור או ההודעה החשודה כאן...",
    checkSecurity: "בדוק אבטחה",
    analyzing: "מנתח...",
    emergencySubtitle: "הפעלה מיידית ואנשי קשר לשעת חירום.",
    police190: "משטרה 190",
    samu192: "מד\"א 192",
    directActivation: "הפעלה ישירה",
    medicalEmergency: "מצב חירום רפואי",
    realTimeListening: "האזנה בזמן אמת",
    listeningDescription: "O GUARDIAO יאזין לשמע מקומי במקרה חירום.",
    localAudioActive: "שמע מקומי פעיל",
    safeContacts: "אנשי קשר לשעת חירום",
    addNewContact: "הוסף איש קשר חדש",
    saveContact: "שמור איש קשר",
    aiAudioAnalysis: "ניתוח שמע AI",
    audioDescription: "שלח שמע לניתוח סכנה מיידי.",
    sendForAnalysis: "שלח לניתוח",
    controlPanel: "לוח בקרה",
    monitoringAlerts: "ניטור התראות בזמן אמת...",
    footer: "SENTINELA • O GUARDIAO © 2026",
    verdict: "פסק דין",
    reason: "סיבה",
    action: "פעולה",
    safe: "בטוח",
    suspicious: "חשוד",
    scamConfirmed: "הונאה מאושרת",
    localSecurity: "אבטחה מקומית",
    santosSP: "סנטוס, SP",
    activeHeatmap: "מפת חום פעילה",
    routeSuggestion: "הצעה: מסלול דרך Av. Ana Costa (בטוח יותר)",
    monitoringPath: "ניטור מסלול",
    simulateFall: "סמלץ נפילה",
    planSafeRoute: "תכנן מסלול בטוח",
    fromWhere: "מאיפה אתה יוצא?",
    toWhere: "לאן אתה הולך?",
    useCurrentLocation: "השתמש במיקום הנוכחי",
    whereTo: "לאן אתה הולך?",
    recommendedRoute: "מסלול מומלץ",
    attentionZones: "אזורי תשומת לב (סנטוס)",
    risk: "סיכון",
    neighborNetwork: "רשת שכנים",
    noRecentAlerts: "אין התראות אחרונות באזור שלך.",
    endWalkWithMe: "סיים 'לך איתי'",
    startWalkWithMe: "התחל 'לך איתי'",
    to: "אל",
    healthWellness: "בריאות ורווחה",
    aiCheckup: "בדיקת AI",
    heartRateStable: "קצב לב יציב. לא זוהתה הפרעת קצב.",
    nextMedication: "תרופה הבאה",
    noActiveReminders: "אין תזכורות פעילות.",
    universalWallet: "ארנק אוניברסלי",
    qrCodeDescription: "קוד QR מוצפן עם ההיסטוריה הרפואית שלך למגיבים ראשונים.",
    manageMedicalData: "נהל נתונים רפואיים",
    nearbyUnits: "יחידות בריאות קרובות בסנטוס",
    nearbyPharmacies: "בתי מרקחת קרובים",
    findPharmacies: "חפש בתי מרקחת",
    leisureCulture: "פנאי ותרבות",
    findLeisure: "מצא פנאי",
    cinema: "קולנוע",
    mall: "קניון",
    theater: "תיאטרון",
    bar: "בר",
    restaurant: "מסעדה",
    pharmacy: "בית מרקחת",
    advancedSearch: "חיפוש מתקדם",
    foodType: "סוג אוכל",
    allTypes: "כל הסוגים",
    italian: "איטלקי",
    japanese: "יפני",
    brazilian: "ברזילאי",
    fastFood: "אוכל מהיר",
    healthy: "בריא",
    pizza: "פיצה",
    seafood: "פירות ים",
    pharmacyPrompt: "מהם 3 בתי המרקחת הקרובים ביותר אלי? רשום אותם בפורמט 'שם (מרחק)'.",
    unitsPrompt: "מהן 5 יחידות הבריאות (UPA, מרכזי בריאות, בתי חולים, פוליקליניקות) הקרובות ביותר אלי? רשום אותם בפורמט 'שם (מרחק)'.",
    leisurePrompt: "מהם 3 ה-{category} הקרובים ביותר אלי? רשום אותם בפורמט 'שם (מרחק)'.",
    financialStability: "יציבות פיננסית",
    antiFraudShieldActive: "מגן נגד הונאות פעיל",
    aiMonitoringDescription: "AI מנטר קישורים והודעות חשודות בזמן אמת.",
    generalConsultancies: "ייעוץ כללי",
    safeLabel: "בטוח",
    hire: "שכור",
    specialist: "מומחה",
    verified: "מאומת",
    strategicConsultancy: "ייעוץ אסטרטגי",
    consultancyDescription: "שתף את הניסיון שלך והרווח מהידע שלך בצורה בטוחה.",
    toBeAgreed: "לסיכום",
    learnMore: "למד עוד",
    shieldSettings: "הגדרות מגן",
    protectionActive: "הגנה פעילה",
    protectionDisabled: "הגנה מושבתת",
    globalMonitoring: "ניטור גלובלי",
    globalMonitoringDescription: "הפעל כדי לאפשר ל-O GUARDIAO לנתח התראות.",
    individualListeningConfig: "הגדרות האזנה אישיות",
    silentAlertActive: "התראת שקטה הופעלה",
    trustZone: "אתה באזור בטוח",
    logoutLabel: "התנתק",
    loginLabel: "התחבר",
    activateMonitoringAlert: "הפעל ניטור לפחות לאפליקציה אחת כדי לסמלץ.",
    scamDetectedAlert: "[מגן פעיל] הונאה זוהתה ב-{app} ונחסמה אוטומטית!",
    settingsSavedAlert: "ההגדרות נשמרו!",
    emergencyCallAlert: "מתקשר ל-{service}... האזנה סביבתית הופעלה למען ביטחונך.",
    audioAnalyzedAlert: "השמע נשלח ונותח. הרשויות ואנשי הקשר לשעת חירום עודכנו.",
    fallDetectedAlert: "זוהתה נפילה! פרוטוקול חירום יופעל בעוד 10 שניות...",
    scamConfirmTitle: "[התראה] הודעה חשודה זוהתה ב-{app}",
    scamConfirmMessage: "\"{msg}\"\n\nהאם ברצונך לחסום איש קשר זה ולדווח עליו?",
    confirmYes: "כן, חסום",
    confirmNo: "התעלם",
    allowContactLocation: "אפשר מיקום אנשי קשר",
    contactLocationDescription: "הצג מיקום מדויק של אנשי קשר לשעת חירום על המפה",
    contactLocationActive: "מיקום אנשי קשר פעיל",
    safeContactMarker: "איש קשר לשעת חירום: {name}",
    contactAccess: "גישה לאנשי קשר",
    contactAccessDescription: "אפשר גישה לאנשי קשר הרשומים בטלפון ובמפה",
    showContactsOnMap: "הצג אנשי קשר על המפה",
    contactsSynced: "אנשי קשר סונכרנו",
    contactsNotSynced: "הגישה לאנשי קשר מושבתת",
    monitoringDevices: "מכשירי ניטור",
    registerDevice: "רשום מכשיר",
    deviceName: "שם המכשיר",
    deviceType: "סוג",
    connected: "מחובר",
    disconnected: "מנותק",
    realTimeData: "נתונים בזמן אמת",
    addDevice: "הוסף מכשיר",
    smartwatch: "שעון חכם",
    heartMonitor: "מד דופק",
    oximeter: "אוקסימטר",
    noDevices: "אין מכשירים רשומים.",
    readingInterval: "מרווח קריאה",
    seconds: "שניות",
    updateInterval: "עדכן מרווח",
    openInGoogleMaps: "פתח ב-Google Maps",
    riskZones: [
      { name: "אזור הנמל - חלק צפוני", level: "גבוהה", color: "bg-rose-500" },
      { name: "מרכז היסטורי - סביבת השוק", level: "בינונית", color: "bg-amber-500" },
      { name: "אזור מדרון - גבעת חוסה מנינו", level: "גבוהה", color: "bg-rose-500" }
    ],
    scamMessages: [
      "מזל טוב! זכית ב-Pix של R$ 5,000. לחץ כאן: http://pix-premiado.xyz",
      "חשבון הבנק שלך ייחסם בעוד שעתיים. הסדר זאת כעת: http://banco-seguro-app.com",
      "הצעת עבודה מהבית: R$ 800 ליום. התקשר דרך הקישור: http://vagas-urgentes.net"
    ],
    routePrompt: "כעוזר בטיחות מקומי בסנטוס, SP, התווה מסלול בטוח מ-\"{origin}\" ליעד: \"{dest}\". הימנע מאזורי סיכון ידועים כמו אזור הנמל הצפוני והמרכז ההיסטורי בלילה. הצע מסלול עיקרי והסבר מדוע הוא בטוח יותר. ענה בקצרה בעברית.",
    routeSystemInstruction: "אתה המומחה למסלולים בטוחים של O GUARDIAO. המשימה שלך היא להגן על האזרח על ידי הצעה של נתיבים מוארים ועמוסים.",
    routeFallback: "שגיאה בחישוב המסלול. עקוב אחר השדרות הראשיות והמוארות היטב.",
    routeSuccess: "המסלול חושב בהצלחה דרך הדרכים הראשיות.",
    emergencyAlert: "חירום {service}",
    panicAlert: "התראת מצוקה שקטה הופעלה",
    directActivationMsg: "הפעלה ישירה: {service}",
    listeningActiveMsg: "האזנה אוטומטית הופעלה. אנשי קשר עודכנו: {contacts}",
    locationSentMsg: "מיקום נשלח. אנשי קשר עודכנו: {contacts}",
    mother: "אמא",
    father: "אבא",
  },
};

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: any;
}

export default function App() {
  const [view, setView] = useState<'DASHBOARD' | 'SCAM' | 'EMERGENCY' | 'PAINEL' | 'SETTINGS'>('DASHBOARD');
  const [language, setLanguage] = useState<Language>('pt');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('guardian-theme');
    return (saved as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    console.log('Theme changed to:', theme);
    localStorage.setItem('guardian-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, [theme]);
  const [personalData, setPersonalData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const t = translations[language];

  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [usageLogs, setUsageLogs] = useState<UsageLog[]>([]);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const isAdmin = user?.email === 'gersonproenca@gmail.com' || userProfile?.isAdmin === true;
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [isProcessingPurchase, setIsProcessingPurchase] = useState(false);
  
  // Sentinel State
  const [panicActive, setPanicActive] = useState(false);
  const panicTimer = useRef<NodeJS.Timeout | null>(null);

  // Scam State
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  // Emergency State
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isAnalyzingAudio, setIsAnalyzingAudio] = useState(false);
  const [fontSizeMultiplier, setFontSizeMultiplier] = useState(() => {
    const saved = localStorage.getItem('guardian-font-size');
    return saved ? parseFloat(saved) : 1;
  });
  const [showSignLanguage, setShowSignLanguage] = useState(false);
  const [emergencyContacts, setEmergencyContacts] = useState<any[]>([]);
  const [showShortcutSuggestion, setShowShortcutSuggestion] = useState(false);
  const [showPermissionGuide, setShowPermissionGuide] = useState(false);
  const [os, setOs] = useState<'ios' | 'android' | 'other'>('other');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'pix'>('card');
  const [planConfig, setPlanConfig] = useState(() => {
    const saved = localStorage.getItem('guardian-plan-config');
    return saved ? JSON.parse(saved) : { monthly: 9.90, yearly: 99.00 };
  });

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) setOs('ios');
    else if (/android/.test(ua)) setOs('android');
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
    if (user) {
      const q = query(collection(db, 'contatos_emergencia'), where('uid', '==', user.uid));
      const unsub = onSnapshot(q, (snapshot) => {
        setEmergencyContacts(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      });
      return unsub;
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('guardian-font-size', fontSizeMultiplier.toString());
    document.documentElement.style.fontSize = `${fontSizeMultiplier * 16}px`;
  }, [fontSizeMultiplier]);

  const [showWelcome, setShowWelcome] = useState(() => {
    return !localStorage.getItem('guardian-welcome-seen');
  });
  const [toast, setToast] = useState<{ message: string; type: 'info' | 'success' | 'error' } | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ title: string; message: string; onConfirm: () => void; onCancel: () => void } | null>(null);
  const [allowContactLocation, setAllowContactLocation] = useState(false);
  const [contactAccessPermission, setContactAccessPermission] = useState(false);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    setToast({ message, type });
  };

  const closeWelcome = () => {
    console.log("Closing welcome modal");
    setShowWelcome(false);
    localStorage.setItem('guardian-welcome-seen', 'true');
  };

  const saveCarLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLoc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          const now = Date.now();
          setCarLocation(newLoc);
          setCarSaveTimestamp(now);
          setCarReminderEnabled(true);
          localStorage.setItem('guardian-car-location', JSON.stringify(newLoc));
          localStorage.setItem('guardian-car-timestamp', now.toString());
          showToast(t.carLocationSaved, "success");
        },
        (error) => {
          console.error("Error getting location for car:", error);
          let errorMsg = "Erro ao obter localização atual.";
          if (error.code === 1) errorMsg = "Permissão de localização negada pelo navegador.";
          else if (error.code === 2) errorMsg = "Localização indisponível no momento.";
          else if (error.code === 3) errorMsg = "Tempo esgotado ao tentar obter localização.";
          
          showToast(errorMsg, "error");
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    } else {
      showToast("Seu navegador não suporta geolocalização.", "error");
    }
  };

  const openCarRoute = () => {
    if (carLocation) {
      const url = `https://www.google.com/maps/search/?api=1&query=${carLocation.lat},${carLocation.lng}`;
      window.open(url, '_blank');
    } else {
      showToast(t.carNotMarked, "error");
    }
  };
  
  // Dashboard Data
  const [neighborAlerts, setNeighborAlerts] = useState<NeighborAlert[]>([]);
  const [healthProfile, setHealthProfile] = useState<HealthProfile | null>(null);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [services, setServices] = useState<TalentService[]>([]);
  const [isWalking, setIsWalking] = useState(false);
  const toggleWalking = () => {
    if (userProfile?.plan !== 'pro' && userProfile?.isVip !== true) {
      setShowCheckout(true);
      return;
    }
    if (!isWalking) logModuleUsage('rota_segura');
    setIsWalking(!isWalking);
  };
  const [heartRate, setHeartRate] = useState(72);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [destination, setDestination] = useState('');
  const [origin, setOrigin] = useState('');
  const [pharmacies, setPharmacies] = useState<any[]>([]);
  const [carLocation, setCarLocation] = useState<{lat: number, lng: number} | null>(() => {
    const saved = localStorage.getItem('guardian-car-location');
    return saved ? JSON.parse(saved) : null;
  });
  const [carReminderEnabled, setCarReminderEnabled] = useState(() => {
    return localStorage.getItem('guardian-car-reminder-enabled') === 'true';
  });
  const [carReminderInterval, setCarReminderInterval] = useState(() => {
    const saved = localStorage.getItem('guardian-car-reminder-interval');
    return saved ? parseInt(saved) : 30;
  });
  const [carAutoDisableTime, setCarAutoDisableTime] = useState(() => {
    const saved = localStorage.getItem('guardian-car-auto-disable');
    return saved ? parseInt(saved) : 120;
  });

  useEffect(() => {
    localStorage.setItem('guardian-car-reminder-enabled', carReminderEnabled.toString());
    localStorage.setItem('guardian-car-reminder-interval', carReminderInterval.toString());
    localStorage.setItem('guardian-car-auto-disable', carAutoDisableTime.toString());
  }, [carReminderEnabled, carReminderInterval, carAutoDisableTime]);
  const [carSaveTimestamp, setCarSaveTimestamp] = useState<number | null>(() => {
    const saved = localStorage.getItem('guardian-car-timestamp');
    return saved ? parseInt(saved) : null;
  });

  useEffect(() => {
    let reminderInterval: NodeJS.Timeout | null = null;
    let autoDisableTimeout: NodeJS.Timeout | null = null;

    if (carLocation && carReminderEnabled && carSaveTimestamp) {
      // Reminder every X minutes
      reminderInterval = setInterval(() => {
        showToast(t.carReminderToast, "info");
      }, carReminderInterval * 60 * 1000);

      // Auto disable after Y minutes
      const timeSinceSave = Date.now() - carSaveTimestamp;
      const remainingTime = (carAutoDisableTime * 60 * 1000) - timeSinceSave;

      if (remainingTime > 0) {
        autoDisableTimeout = setTimeout(() => {
          setCarReminderEnabled(false);
          setCarLocation(null);
          setCarSaveTimestamp(null);
          localStorage.removeItem('guardian-car-location');
          localStorage.removeItem('guardian-car-timestamp');
          showToast(t.carAutoDisabledToast, "info");
        }, remainingTime);
      } else {
        // Already expired
        setCarReminderEnabled(false);
        setCarLocation(null);
        setCarSaveTimestamp(null);
        localStorage.removeItem('guardian-car-location');
        localStorage.removeItem('guardian-car-timestamp');
      }
    }

    return () => {
      if (reminderInterval) clearInterval(reminderInterval);
      if (autoDisableTimeout) clearTimeout(autoDisableTimeout);
    };
  }, [carLocation, carReminderEnabled, carReminderInterval, carAutoDisableTime, carSaveTimestamp, t]);
  const [isFetchingPharmacies, setIsFetchingPharmacies] = useState(false);
  const [healthUnitsList, setHealthUnitsList] = useState<any[]>([]);
  const [isFetchingUnits, setIsFetchingUnits] = useState(false);
  const [healthTab, setHealthTab] = useState<'PHARMACIES' | 'UNITS'>('PHARMACIES');
  const [leisureList, setLeisureList] = useState<any[]>([]);
  const [isFetchingLeisure, setIsFetchingLeisure] = useState(false);
  const [leisureCache, setLeisureCache] = useState<Record<string, any[]>>({});
  const [leisureCategory, setLeisureCategory] = useState<'cinema' | 'mall' | 'theater' | 'bar' | 'restaurant' | 'supermarket' | 'bakery'>('cinema');
  const [leisureSubCategory, setLeisureSubCategory] = useState<string>('');
  const [alertasList, setAlertasList] = useState<Alerta[]>([]);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const fetchNearbyPharmacies = async () => {
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
        contents: t.pharmacyPrompt,
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

      const text = response.text || "";
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunks) {
        const uniquePharmacies = new Map();
        chunks
          .filter((chunk: any) => chunk.maps)
          .forEach((chunk: any) => {
            const name = chunk.maps.title;
            if (!uniquePharmacies.has(name)) {
              const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
              const distanceRegex = new RegExp(`${escapedName}.*?\\((.*?)\\)`, 'i');
              const match = text.match(distanceRegex);
              uniquePharmacies.set(name, {
                name: name,
                uri: chunk.maps.uri,
                distance: match ? match[1] : null
              });
            }
          });
        const foundPharmacies = Array.from(uniquePharmacies.values())
          .sort((a: any, b: any) => parseDistance(a.distance) - parseDistance(b.distance))
          .slice(0, 3); // Ensure only 3
        setPharmacies(foundPharmacies);
      }
    } catch (error: any) {
      console.error("Error fetching pharmacies:", error);
      const errStr = JSON.stringify(error);
      if (errStr.includes("429") || errStr.includes("RESOURCE_EXHAUSTED")) {
        showToast(t.quotaExceeded, "error");
      }
    } finally {
      setIsFetchingPharmacies(false);
    }
  };

  const fetchNearbyUnits = async () => {
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
        contents: t.unitsPrompt,
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

      const text = response.text || "";
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunks) {
        const foundUnits = chunks
          .filter((chunk: any) => chunk.maps)
          .map((chunk: any) => {
            const name = chunk.maps.title;
            // Try to find distance in text response: Name (Distance)
            const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const distanceRegex = new RegExp(`${escapedName}.*?\\((.*?)\\)`, 'i');
            const match = text.match(distanceRegex);
            
            let type = "Unidade de Saúde";
            const lowerName = name.toLowerCase();
            if (lowerName.includes('hospital')) type = "Hospital";
            else if (lowerName.includes('upa')) type = "UPA";
            else if (lowerName.includes('posto') || lowerName.includes('ubs')) type = "Posto de Saúde";
            else if (lowerName.includes('policlinica') || lowerName.includes('policlínica')) type = "Policlínica";

            return {
              name: name,
              uri: chunk.maps.uri,
              type: type,
              distance: match ? match[1] : null
            };
          })
          .sort((a: any, b: any) => parseDistance(a.distance) - parseDistance(b.distance))
          .slice(0, 5); // Increased to 5
        setHealthUnitsList(foundUnits);
      }
    } catch (error: any) {
      console.error("Error fetching units:", error);
      const errStr = JSON.stringify(error);
      if (errStr.includes("429") || errStr.includes("RESOURCE_EXHAUSTED")) {
        showToast(t.quotaExceeded, "error");
      }
    } finally {
      setIsFetchingUnits(false);
    }
  };

  const fetchNearbyLeisure = async (category: string, subCategory?: string) => {
    setIsFetchingLeisure(true);
    setLeisureList([]);
    logModuleUsage('talentos');
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

      const categoryName = t[category as keyof typeof t] || category;
      let finalCategory = categoryName;
      if (subCategory && subCategory !== '') {
        const subCategoryName = t[subCategory as keyof typeof t] || subCategory;
        finalCategory = `${subCategoryName} (${categoryName})`;
      }
      const prompt = t.leisurePrompt.replace('{category}', finalCategory);

      const response = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
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

      const text = response.text || "";
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunks) {
        const foundLeisure = chunks
          .filter((chunk: any) => chunk.maps)
          .map((chunk: any) => {
            const name = chunk.maps.title;
            const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const infoRegex = new RegExp(`${escapedName}.*?\\((.*?)\\).*?\\[(.*?)\\]`, 'i');
            const match = text.match(infoRegex);
            
            // Fallback to just distance if rating not found in text
            let distance = null;
            let rating = 0;
            
            if (match) {
              distance = match[1];
              rating = parseFloat(match[2]) || 0;
            } else {
              const distanceOnlyRegex = new RegExp(`${escapedName}.*?\\((.*?)\\)`, 'i');
              const distMatch = text.match(distanceOnlyRegex);
              distance = distMatch ? distMatch[1] : null;
            }

            return {
              name: name,
              uri: chunk.maps.uri,
              distance: distance,
              rating: rating
            };
          })
          .sort((a: any, b: any) => b.rating - a.rating)
          .slice(0, 3);
        
        setLeisureList(foundLeisure);
        setLeisureCache(prev => ({
          ...prev,
          [`${category}-${subCategory || ''}`]: foundLeisure
        }));
      }
    } catch (error: any) {
      console.error("Error fetching leisure:", error);
      const errStr = JSON.stringify(error);
      if (errStr.includes("429") || errStr.includes("RESOURCE_EXHAUSTED")) {
        showToast(t.quotaExceeded, "error");
      }
    } finally {
      setIsFetchingLeisure(false);
    }
  };

  useEffect(() => {
    if (healthTab === 'PHARMACIES' && pharmacies.length === 0) {
      fetchNearbyPharmacies();
    } else if (healthTab === 'UNITS' && healthUnitsList.length === 0) {
      fetchNearbyUnits();
    }
  }, [healthTab]);

  useEffect(() => {
    const cacheKey = `${leisureCategory}-${leisureSubCategory}`;
    if (!leisureCache[cacheKey]) {
      fetchNearbyLeisure(leisureCategory, leisureSubCategory);
    } else {
      setLeisureList(leisureCache[cacheKey]);
    }
  }, [leisureCategory, leisureSubCategory]);

  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [safeRouteSuggestion, setSafeRouteSuggestion] = useState<string | null>(null);
  const [mapUrl, setMapUrl] = useState<string | null>(null);
  const [devices, setDevices] = useState<Device[]>([
    { id: '1', name: 'Apple Watch', type: 'smartwatch', status: 'connected', value: '72', unit: 'BPM', lastUpdate: Date.now(), readingInterval: 3 },
    { id: '2', name: 'Heart Strap', type: 'heartMonitor', status: 'connected', value: '74', unit: 'BPM', lastUpdate: Date.now(), readingInterval: 5 }
  ]);
  const [showAddDevice, setShowAddDevice] = useState(false);
  const [newDevice, setNewDevice] = useState({ name: '', type: 'smartwatch', readingInterval: 3 });

  const RISK_ZONES = [
    { name: "Zona Portuária - Trecho Norte", level: "ALTO", color: "bg-rose-500" },
    { name: "Centro Histórico - Entorno do Mercado", level: "MÉDIO", color: "bg-amber-500" },
    { name: "Área de Encosta - Morro do José Menino", level: "ALTO", color: "bg-rose-500" }
  ];

  const calculateSafeRoute = async () => {
    if (!destination.trim() || !origin.trim()) return;
    setIsCalculatingRoute(true);
    logModuleUsage('rota_segura');
    setSafeRouteSuggestion(null);
    setMapUrl(null);
    
    try {
      const model = "gemini-3-flash-preview";
      const prompt = t.routePrompt.replace('{origin}', origin).replace('{dest}', destination);
      
      const response = await genAI.models.generateContent({
        model,
        contents: [{ parts: [{ text: prompt }] }],
        config: { systemInstruction: t.routeSystemInstruction },
      });
      
      setSafeRouteSuggestion(response.text || t.routeSuccess);
      setMapUrl(`https://maps.google.com/maps?saddr=${encodeURIComponent(origin)}&daddr=${encodeURIComponent(destination)}&output=embed`);
    } catch (error) {
      console.error(error);
      setSafeRouteSuggestion(t.routeFallback);
      setMapUrl(`https://maps.google.com/maps?saddr=${encodeURIComponent(origin)}&daddr=${encodeURIComponent(destination)}&output=embed`);
    } finally {
      setIsCalculatingRoute(false);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setOrigin(`${latitude}, ${longitude}`);
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  };

  // Emergency Settings
  const [isListeningAudio, setIsListeningAudio] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactRelation, setNewContactRelation] = useState('');

  const addSafeContact = async () => {
    if (newContactName && newContactPhone && user) {
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
  };

  const toggleContact = async (id: string, active: boolean) => {
    try {
      await updateDoc(doc(db, 'contatos_emergencia', id), {
        active: !active
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'contatos_emergencia');
    }
  };

  const removeContact = async (id: string) => {
    try {
      await updateDoc(doc(db, 'contatos_emergencia', id), {
        deleted: true
      });
      showToast("Contato removido.", "info");
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'contatos_emergencia');
    }
  };
  const [autoMonitoring, setAutoMonitoring] = useState(true);
  const [actionType, setActionType] = useState<'AUTOMATIC' | 'MANUAL'>('MANUAL');
  const [monitoredApps, setMonitoredApps] = useState({
    whatsapp: true,
    telegram: true,
    sms: true,
    email: false
  });
  const [scamLogs, setScamLogs] = useState<{id: string, app: string, message: string, action: string, timestamp: number}[]>([]);

  const simulateScamNotification = () => {
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
  };

  const handleFirestoreError = (error: unknown, operationType: OperationType, path: string | null) => {
    const errInfo: FirestoreErrorInfo = {
      error: error instanceof Error ? error.message : String(error),
      authInfo: {
        userId: auth.currentUser?.uid,
        email: auth.currentUser?.email,
      },
      operationType,
      path
    };
    console.error('Firestore Error: ', JSON.stringify(errInfo));
    // In a real app, show a toast or error boundary
  };

  const saveSettings = async () => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'configuracoes_usuario', user.uid), {
        language,
        personalData,
        updatedAt: Date.now()
      });
      showToast(t.settingsSavedAlert, 'success');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `configuracoes_usuario/${user.uid}`);
    }
  };

  const fetchUserSettings = async (u: FirebaseUser) => {
    try {
      const docRef = doc(db, 'configuracoes_usuario', u.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.language) setLanguage(data.language as Language);
        if (data.personalData) setPersonalData(data.personalData);
      } else {
        // AUTO-REGISTER: Create settings with Google Info
        const initialData = {
          name: u.displayName || '',
          email: u.email || '',
          phone: ''
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setIsAuthReady(true);
      if (u) {
        // Fetch or create user profile
        const userRef = doc(db, 'users', u.uid);
        try {
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const data = userSnap.data() as UserProfile;
            // Update name if missing or changed
            if (!data.name && u.displayName) {
              await updateDoc(userRef, { name: u.displayName });
              data.name = u.displayName;
            }
            setUserProfile(data);
          } else {
            const newProfile: UserProfile = {
              uid: u.uid,
              email: u.email || "",
              name: u.displayName || "",
              plan: 'free',
              isAdmin: u.email === "gersonproenca@gmail.com",
              isVip: false,
              timestamp: Date.now()
            };
            await setDoc(userRef, newProfile);
            setUserProfile(newProfile);
          }
        } catch (err) {
          console.error("Error fetching/creating user profile:", err);
          handleFirestoreError(err, OperationType.WRITE, `users/${u.uid}`);
        }

        fetchHealthProfile(u.uid);
        fetchUserSettings(u);
        setPersonalData(prev => ({
          ...prev,
          name: u.displayName || prev.name,
          email: u.email || prev.email
        }));
      } else {
        setUserProfile(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const upgradeToPro = async () => {
    if (!user) return;
    setIsProcessingPurchase(true);
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const userRef = doc(db, 'users', user.uid);
    const days = selectedPeriod === 'monthly' ? 30 : 365;
    const nextBilling = Date.now() + (days * 24 * 60 * 60 * 1000);
    
    const subData = {
      plan: 'pro',
      subscriptionStatus: 'active',
      subscriptionPeriod: selectedPeriod,
      nextBillingDate: nextBilling,
      paymentMethod: paymentMethod === 'card' ? 'Cartão de Crédito (Visa **** 4242)' : 'Pix (QR Code)'
    };
    
    try {
      await updateDoc(userRef, subData);
      
      // Record Financial Transaction
      await addDoc(collection(db, 'transacoes'), {
        uid: user.uid,
        userEmail: user.email,
        valor: selectedPeriod === 'monthly' ? planConfig.monthly : planConfig.yearly,
        moeda: 'BRL',
        tipo: selectedPeriod === 'monthly' ? 'assinatura_mensal' : 'assinatura_anual',
        meioPagamento: paymentMethod,
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
  };

  const updateUserRole = async (targetUid: string, isAdminStatus: boolean) => {
    try {
      const userRef = doc(db, 'users', targetUid);
      await updateDoc(userRef, { isAdmin: isAdminStatus });
      showToast(t.userUpdated, 'success');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${targetUid}`);
    }
  };

  const updateUserVip = async (targetUid: string, isVipStatus: boolean) => {
    try {
      const userRef = doc(db, 'users', targetUid);
      const updateData: any = { isVip: isVipStatus };
      if (isVipStatus) updateData.plan = 'pro';
      await updateDoc(userRef, updateData);
      showToast(t.userUpdated, 'success');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${targetUid}`);
    }
  };

  const updateUserPlanManual = async (targetUid: string, newPlan: 'free' | 'pro') => {
    try {
      const userRef = doc(db, 'users', targetUid);
      await updateDoc(userRef, { plan: newPlan });
      showToast(t.userUpdated, 'success');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${targetUid}`);
    }
  };

  const logModuleUsage = async (modulo: UsageLog['modulo']) => {
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
  };

  const cancelSubscription = async () => {
    if (!user) return;
    setConfirmDialog({
      title: t.cancelConfirmTitle,
      message: t.cancelConfirmMessage,
      onConfirm: async () => {
        const userRef = doc(db, 'users', user.uid);
        const cancelData = {
          plan: 'free',
          subscriptionStatus: 'inactive',
          nextBillingDate: null
        };
        await updateDoc(userRef, cancelData);
        setUserProfile(prev => prev ? { ...prev, ...cancelData } : null);
        setConfirmDialog(null);
        showToast(t.subscriptionCancelled, "info");
      },
      onCancel: () => setConfirmDialog(null)
    });
  };

  const ProGuard = ({ children }: { children: React.ReactNode }) => {
    const isPro = userProfile?.plan === 'pro' || userProfile?.isVip === true;
    
    if (isPro) return <>{children}</>;
    
    return (
      <div className="relative group/pro">
        <div className="filter blur-[2px] pointer-events-none select-none opacity-50">
          {children}
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/10 dark:bg-slate-900/10 backdrop-blur-[1px] rounded-3xl p-6 text-center z-20">
          <div className="bg-amber-500 text-white p-2 rounded-full mb-3 shadow-lg">
            <Star className="w-5 h-5 fill-current" />
          </div>
          <h4 className="text-sm font-black text-slate-900 dark:text-slate-100 mb-1">{t.proFeatureTitle}</h4>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-4 max-w-[200px]">{t.proFeatureDescription}</p>
          <button 
            onClick={() => setShowCheckout(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-md"
          >
            {t.upgradeNow}
          </button>
        </div>
      </div>
    );
  };

  useEffect(() => {
    if (!user) return;
    
    // Neighbor Alerts
    const qNeighbors = query(collection(db, 'vizinhos_alertas'), orderBy('timestamp', 'desc'), limit(5));
    const unsubNeighbors = onSnapshot(qNeighbors, (snapshot) => {
      setNeighborAlerts(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as NeighborAlert)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'vizinhos_alertas'));

    // Medications
    const qMeds = isAdmin 
      ? query(collection(db, 'lembretes_medicacao'), orderBy('timestamp', 'desc'))
      : query(collection(db, 'lembretes_medicacao'), where('uid', '==', user.uid), orderBy('timestamp', 'desc'));
    
    const unsubMeds = onSnapshot(qMeds, (snapshot) => {
      setMedications(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Medication)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'lembretes_medicacao'));

    // Talent Market
    const qServices = query(collection(db, 'mercado_talentos'), orderBy('timestamp', 'desc'), limit(10));
    const unsubServices = onSnapshot(qServices, (snapshot) => {
      setServices(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as TalentService)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'mercado_talentos'));

    // Admin Alerts Monitoring
    let unsubAlerts = () => {};
    let unsubUsers = () => {};
    let unsubTransactions = () => {};
    let unsubLogs = () => {};

    if (isAdmin) {
      const qAlerts = query(collection(db, 'alertas'), orderBy('timestamp', 'desc'), limit(20));
      unsubAlerts = onSnapshot(qAlerts, (snapshot) => {
        setAlertasList(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Alerta)));
      }, (err) => handleFirestoreError(err, OperationType.LIST, 'alertas'));

      const qUsers = query(collection(db, 'users'));
      unsubUsers = onSnapshot(qUsers, (snapshot) => {
        const users = snapshot.docs.map(d => ({ uid: d.id, ...d.data() } as UserProfile));
        // Sort manually to avoid excluding users without timestamp
        users.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        setAllUsers(users);
      }, (err) => handleFirestoreError(err, OperationType.LIST, 'users'));

      const qTransactions = query(collection(db, 'transacoes'), orderBy('timestamp', 'desc'));
      unsubTransactions = onSnapshot(qTransactions, (snapshot) => {
        setTransactions(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Transaction)));
      }, (err) => handleFirestoreError(err, OperationType.LIST, 'transacoes'));

      const qLogs = query(collection(db, 'logs_uso'), orderBy('timestamp', 'desc'), limit(1000));
      unsubLogs = onSnapshot(qLogs, (snapshot) => {
        setUsageLogs(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as UsageLog)));
      }, (err) => handleFirestoreError(err, OperationType.LIST, 'logs_uso'));
    }

    return () => {
      unsubNeighbors();
      unsubMeds();
      unsubServices();
      unsubAlerts();
      unsubUsers();
      unsubTransactions();
      unsubLogs();
    };
  }, [user, isAdmin]);

  useEffect(() => {
    const interval = setInterval(() => {
      setHeartRate(prev => prev + (Math.random() > 0.5 ? 1 : -1));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Simulation of real-time device data
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

  // Walk With Me Logic
  useEffect(() => {
    let walkInterval: NodeJS.Timeout;
    if (isWalking) {
      walkInterval = setInterval(() => {
        // Simulate location updates
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition((pos) => {
            setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            // Simulate random deviation check
            if (Math.random() > 0.95) {
              console.warn("Desvio de rota detectado!");
              // In real app, trigger a check-in notification
            }
          });
        }
      }, 5000);
    }
    return () => clearInterval(walkInterval);
  }, [isWalking]);

  const fetchHealthProfile = async (uid: string) => {
    try {
      const docRef = doc(db, 'perfis_saude', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setHealthProfile(docSnap.data() as HealthProfile);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `perfis_saude/${uid}`);
    }
  };

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) { console.error(error); }
  };

  const handlePanicStart = () => {
    panicTimer.current = setTimeout(() => {
      setPanicActive(true);
      triggerPanic();
    }, 2000);
  };

  const handlePanicEnd = () => {
    if (panicTimer.current) clearTimeout(panicTimer.current);
  };

  const callEmergencyService = async (service: string) => {
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
  };

  const triggerPanic = async () => {
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
  };

  const analyzeAudio = async () => {
    if (!audioFile || !user) return;
    if (userProfile?.plan !== 'pro' && userProfile?.isVip !== true) {
      setShowCheckout(true);
      return;
    }
    setIsAnalyzingAudio(true);
    logModuleUsage('emergencia');
    try {
      // Simulation of audio analysis with Gemini
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
  };

  const simulateFall = () => {
    if (!isWalking) return;
    showToast(t.fallDetectedAlert, 'error');
    // In real app, this would trigger triggerPanic() if not cancelled
  };

  const addDevice = () => {
    if (!newDevice.name.trim()) return;
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
  };

  const removeDevice = (id: string) => {
    setDevices(prev => prev.filter(d => d.id !== id));
  };

  const updateDeviceInterval = (id: string, interval: number) => {
    setDevices(prev => prev.map(d => d.id === id ? { ...d, readingInterval: interval } : d));
  };

  const analyzeMessage = async () => {
    if (!inputText.trim()) return;
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
  };


  return (
    <div className="min-h-screen bg-[#F1F5F9] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-100">
      {/* Welcome Modal */}
      {showWelcome && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm"
          onClick={closeWelcome}
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-slate-900 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-[40px] shadow-2xl border border-slate-100 dark:border-slate-800 custom-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-32 bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
              </div>
              <ShieldCheck className="w-16 h-16 text-white/90 relative z-10" />
            </div>
            
            <div className="p-6 space-y-4">
              <div className="text-center space-y-1">
                <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">{t.welcomeTitle}</h2>
                <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">{t.welcomeSubtitle}</p>
              </div>

              <div className="grid grid-cols-1 gap-3 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                {[
                  { title: t.welcomeStep1Title, desc: t.welcomeStep1Desc },
                  { title: t.welcomeStep2Title, desc: t.welcomeStep2Desc },
                  { title: t.welcomeStep3Title, desc: t.welcomeStep3Desc },
                  { title: t.welcomeStep4Title, desc: t.welcomeStep4Desc },
                ].map((step, i) => (
                  <div key={i} className="flex gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className="flex-1">
                      <h4 className="text-[10px] font-black text-slate-900 dark:text-slate-100 mb-0.5">{step.title}</h4>
                      <p className="text-[9px] text-slate-500 dark:text-slate-400 font-medium leading-tight">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button 
                onClick={closeWelcome}
                className="w-full py-3 bg-indigo-600 dark:bg-indigo-500 text-white rounded-2xl font-black text-sm shadow-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all transform active:scale-95"
              >
                {t.getStarted}
              </button>
            </div>
          </motion.div>
        </div>
      )}
      {/* Sentinel Bar */}
      <div 
        className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 cursor-pointer select-none"
        onMouseDown={handlePanicStart}
        onMouseUp={handlePanicEnd}
        onTouchStart={handlePanicStart}
        onTouchEnd={handlePanicEnd}
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
                <span className="text-[10px] font-bold text-slate-400 hidden sm:inline">{user.email}</span>
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
        <AnimatePresence mode="wait">
          {view === 'DASHBOARD' && (
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
                        {t.riskZones.map((zone: any, idx: number) => (
                          <div key={idx} className="flex items-center gap-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                            <div className={`w-2 h-2 rounded-full ${zone.color}`} />
                            <span className="text-[8px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-tighter">{zone.name}</span>
                          </div>
                        ))}
                      </div>

                      {/* Safe Contacts on Map */}
                      {allowContactLocation && contactAccessPermission && emergencyContacts.filter(c => !c.deleted).map(contact => (
                        <motion.div
                          key={contact.id}
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
                            disabled={isCalculatingRoute || !destination.trim() || !origin.trim()}
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
                    {t.riskZones.map((zone: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-sm">
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
                    {neighborAlerts.length > 0 ? neighborAlerts.map(alert => (
                      <div key={alert.id} className="flex gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-indigo-100 dark:hover:border-indigo-900/50 transition-all">
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
                
                  <ProGuard>
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

                {/* Block 5: Financial Stability */}
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
                      {services.length > 0 ? services.map(service => (
                        <div key={service.id} className="p-5 border border-slate-100 dark:border-slate-800 rounded-3xl hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-all cursor-pointer group bg-slate-50/50 dark:bg-slate-800/30">
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
                  <ProGuard>
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
                  <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3">
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{t.nextMedication}</p>
                    {medications.length > 0 ? (
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                          <Pill className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{medications[0].nome}</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">{medications[0].horario} • {medications[0].dosagem}</p>
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
                      title={t.addNewDevice || "Adicionar Novo Dispositivo"}
                      className="p-1.5 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {devices.length > 0 ? devices.map(device => (
                      <div key={device.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between group">
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
                      {pharmacies.map((pharmacy, idx) => (
                        <a 
                          key={idx} 
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
                      {healthUnitsList.map((unit, idx) => (
                        <a 
                          key={idx} 
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
                    {leisureList.length > 0 ? leisureList.map((item, idx) => (
                      <a 
                        key={idx} 
                        href={item.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-indigo-100 dark:hover:border-indigo-900/50 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                            {leisureCategory === 'cinema' && <Clapperboard className="w-5 h-5" />}
                            {leisureCategory === 'mall' && <ShoppingBag className="w-5 h-5" />}
                            {leisureCategory === 'theater' && <Theater className="w-5 h-5" />}
                            {leisureCategory === 'bar' && <Beer className="w-5 h-5" />}
                            {leisureCategory === 'restaurant' && <Utensils className="w-5 h-5" />}
                            {leisureCategory === 'supermarket' && <ShoppingBasket className="w-5 h-5" />}
                            {leisureCategory === 'bakery' && <Store className="w-5 h-5" />}
                          </div>
                          <div>
                            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{item.name}</span>
                            <div className="flex items-center gap-2">
                              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">{t[leisureCategory]}</p>
                              {item.rating > 0 && (
                                <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded-md border border-amber-100 dark:border-amber-900/30">
                                  <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                                  <span className="text-[9px] font-black text-amber-700 dark:text-amber-400">{item.rating}</span>
                                </div>
                              )}
                            </div>
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
                    )) : !isFetchingLeisure && (
                      <p className="text-xs text-slate-400 dark:text-slate-500 italic text-center py-4">{t.noRecentAlerts}</p>
                    )}
                  </div>
                </div>
              </section>
            </div>
          </motion.div>
          )}

          {view === 'SCAM' && (
            <motion.div key="scam" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto space-y-6">
              {/* Settings Section */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-800 space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-black flex items-center gap-2 text-slate-900 dark:text-slate-100">
                    <ShieldAlert className="w-6 h-6 text-indigo-600 dark:text-indigo-400" /> {t.shieldSettings}
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full ${autoMonitoring ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'}`}>
                      {autoMonitoring ? t.protectionActive : t.protectionDisabled}
                    </span>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-sm font-black text-indigo-900 dark:text-indigo-100">{t.globalMonitoring}</p>
                        <p className="text-[10px] text-indigo-700 dark:text-indigo-400">{t.globalMonitoringDescription}</p>
                      </div>
                      <button 
                        onClick={() => setAutoMonitoring(!autoMonitoring)}
                        className={`w-12 h-6 rounded-full transition-all relative ${autoMonitoring ? 'bg-indigo-600 dark:bg-indigo-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${autoMonitoring ? 'left-7' : 'left-1'}`} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{t.individualListeningConfig}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {Object.entries(monitoredApps).map(([app, enabled]) => (
                        <div 
                          key={app}
                          className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                            !autoMonitoring ? 'opacity-40 grayscale pointer-events-none' : 
                            enabled ? 'bg-white dark:bg-slate-800 border-indigo-200 dark:border-indigo-900/50 shadow-sm' : 'bg-slate-50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-800'
                          }`}
                        >
                          <div className="flex flex-col">
                            <span className={`text-xs font-black capitalize ${enabled ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400 dark:text-slate-500'}`}>{app}</span>
                            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">{t.autoListening}</span>
                          </div>
                          <button 
                            onClick={() => setMonitoredApps(prev => ({ ...prev, [app]: !enabled }))}
                            className={`w-10 h-5 rounded-full transition-all relative ${enabled ? 'bg-emerald-500 dark:bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                          >
                            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${enabled ? 'left-5.5' : 'left-0.5'}`} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{t.responseMode}</p>
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => setActionType('MANUAL')}
                        className={`py-3 rounded-xl text-xs font-bold border transition-all ${actionType === 'MANUAL' ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-900 dark:border-slate-100' : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'}`}
                      >
                        {t.manual}
                      </button>
                      <button 
                        onClick={() => setActionType('AUTOMATIC')}
                        className={`py-3 rounded-xl text-xs font-bold border transition-all ${actionType === 'AUTOMATIC' ? 'bg-indigo-600 dark:bg-indigo-500 text-white dark:text-white border-indigo-600 dark:border-indigo-500' : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'}`}
                      >
                        {t.automatic}
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 italic">
                      {actionType === 'AUTOMATIC' 
                        ? t.autoDescription 
                        : t.manualDescription}
                    </p>
                  </div>

                  {autoMonitoring && (
                    <button 
                      onClick={simulateScamNotification}
                      className="w-full py-4 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-all flex items-center justify-center gap-2"
                    >
                      <Zap className="w-4 h-4" /> {t.simulateNotification}
                    </button>
                  )}
                </div>
              </div>

              {/* Activity Log */}
              {scamLogs.length > 0 && (
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-800 space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black flex items-center gap-2 text-slate-900 dark:text-slate-100">
                      <History className="w-6 h-6 text-slate-400 dark:text-slate-500" /> {t.activityLog}
                    </h2>
                    <button onClick={() => setScamLogs([])} className="text-[10px] font-bold text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 uppercase tracking-widest">{t.clear}</button>
                  </div>
                  <div className="space-y-4">
                    {scamLogs.map(log => (
                      <div key={log.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-start gap-4">
                        <div className={`p-2 rounded-xl shrink-0 ${log.action.includes('BLOQUEADO') ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
                          <ShieldAlert className="w-4 h-4" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 uppercase tracking-wider">{log.app}</span>
                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                          </div>
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-relaxed">{log.message}</p>
                          <p className={`text-[10px] font-black uppercase tracking-widest ${log.action.includes('BLOQUEADO') ? 'text-indigo-600 dark:text-indigo-400' : log.action.includes('PELO USUÁRIO') ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}>
                            {log.action === "BLOQUEADO AUTOMATICAMENTE" ? t.blockedAuto : 
                             log.action === "BLOQUEADO PELO USUÁRIO" ? t.blockedUser : 
                             log.action === "IGNORADO PELO USUÁRIO" ? t.ignoredUser : log.action}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Manual Analysis Section */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-800">
                <h2 className="text-xl font-black mb-6 text-slate-900 dark:text-slate-100">{t.manualAnalysis}</h2>
                <textarea
                  className="w-full h-48 p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500"
                  placeholder={t.placeholderScam}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />
                <button
                  onClick={analyzeMessage}
                  disabled={isAnalyzing || !inputText.trim()}
                  title={t.checkSecurity}
                  className="w-full mt-4 py-4 bg-indigo-600 dark:bg-indigo-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all disabled:opacity-50"
                >
                  {isAnalyzing ? t.analyzing : t.checkSecurity}
                </button>
              </div>
              {result && (
                <div className={`p-8 rounded-3xl border-2 ${
                  result.verdict === 'SEGURO' ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400' :
                  result.verdict === 'SUSPEITO' ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-900/30 text-amber-700 dark:text-amber-400' :
                  'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-900/30 text-rose-700 dark:text-rose-400'
                }`}>
                  <h3 className="text-3xl font-black mb-2">
                    {result.verdict === 'SEGURO' ? t.safe : result.verdict === 'SUSPEITO' ? t.suspicious : t.scamConfirmed}
                  </h3>
                  <p className="text-lg font-medium mb-4">{result.reason}</p>
                  <p className="text-sm font-bold uppercase tracking-widest opacity-60">{t.action}</p>
                  <p className="text-xl font-bold">{result.action}</p>
                </div>
              )}
            </motion.div>
          )}

          {view === 'EMERGENCY' && (
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
                  {emergencyContacts.filter(c => !c.deleted).map(contact => (
                    <div key={contact.id} className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center justify-between shadow-sm">
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

                <ProGuard>
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
          )}

          {view === 'SETTINGS' && (
            <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">{t.settings}</h2>
                  <p className="text-xs text-slate-500 font-medium">{t.settingsDescription}</p>
                </div>
                <div className="bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-2xl">
                  <User className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
              </div>

              {/* Plan Management */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-800 space-y-6 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16" />
                <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 flex items-center gap-2 relative z-10">
                  <Star className={`w-4 h-4 ${userProfile?.plan === 'pro' ? 'text-amber-500 fill-current' : 'text-slate-400'}`} /> {t.currentPlan}
                </h3>
                
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 relative z-10">
                  <div>
                    <p className={`text-lg font-black ${userProfile?.plan === 'pro' ? 'text-amber-600 dark:text-amber-500' : 'text-slate-600 dark:text-slate-400'}`}>
                      {userProfile?.plan === 'pro' ? t.proPlan : t.freePlan}
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">{t.currentPlan}</p>
                  </div>
                  {userProfile?.plan === 'free' && (
                    <button 
                      onClick={() => setShowCheckout(true)}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-amber-200 dark:shadow-none"
                    >
                      {t.upgradeToPro}
                    </button>
                  )}
                </div>

                {userProfile?.plan === 'pro' && (
                  <div className="space-y-4 pt-2 relative z-10">
                    <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">{t.subscriptionDetails}</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                        <p className="text-[8px] font-bold text-slate-400 uppercase mb-1">{t.status}</p>
                        <p className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase">{t.active}</p>
                      </div>
                      <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                        <p className="text-[8px] font-bold text-slate-400 uppercase mb-1">{t.periodicity}</p>
                        <p className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase">{userProfile.subscriptionPeriod === 'monthly' ? t.monthly : t.yearly}</p>
                      </div>
                      <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                        <p className="text-[8px] font-bold text-slate-400 uppercase mb-1">{t.nextBilling}</p>
                        <p className="text-xs font-black text-slate-700 dark:text-slate-200">{userProfile.nextBillingDate ? new Date(userProfile.nextBillingDate).toLocaleDateString() : '-'}</p>
                      </div>
                      <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                        <p className="text-[8px] font-bold text-slate-400 uppercase mb-1">{t.paymentMethodLabel}</p>
                        <p className="text-[10px] font-black text-slate-700 dark:text-slate-200 truncate">{userProfile.paymentMethod || '-'}</p>
                      </div>
                    </div>
                    <button 
                      onClick={cancelSubscription}
                      className="w-full py-3 bg-slate-100 dark:bg-slate-800 text-rose-600 dark:text-rose-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all border border-slate-200 dark:border-slate-700"
                    >
                      {t.cancelSubscription}
                    </button>
                  </div>
                )}

                {userProfile?.plan === 'free' && (
                  <div className="space-y-4 pt-2 relative z-10">
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{t.benefitsPro}</p>
                    <div className="grid grid-cols-1 gap-2">
                      {[t.benefit1, t.benefit2, t.benefit3, t.benefit4, t.benefit5].map((benefit, i) => (
                        <p key={i} className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{benefit}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Personal Data */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-800 space-y-6">
                <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> {t.personalData}
                </h3>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.name}</label>
                    <input 
                      type="text" 
                      value={personalData.name}
                      onChange={(e) => setPersonalData({...personalData, name: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs font-medium focus:ring-2 focus:ring-indigo-500 transition-all dark:text-slate-100"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.email}</label>
                    <input 
                      type="email" 
                      value={personalData.email}
                      disabled
                      className="w-full bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.phone}</label>
                    <input 
                      type="text" 
                      value={personalData.phone}
                      onChange={(e) => setPersonalData({...personalData, phone: e.target.value})}
                      placeholder="(00) 00000-0000"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs font-medium focus:ring-2 focus:ring-indigo-500 transition-all dark:text-slate-100"
                    />
                  </div>
                  <button 
                    onClick={saveSettings}
                    className="w-full py-3 bg-indigo-600 dark:bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all"
                  >
                    {t.save}
                  </button>
                </div>
              </div>

              {/* Language Selection */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-800 space-y-6">
                <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> {t.language}
                </h3>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.selectLanguage}</label>
                  <div className="relative">
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value as Language)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs font-medium focus:ring-2 focus:ring-indigo-500 transition-all appearance-none cursor-pointer dark:text-slate-100"
                    >
                      <option value="pt">🇧🇷 Português</option>
                      <option value="en">🇺🇸 English</option>
                      <option value="es">🇪🇸 Español</option>
                      <option value="fr">🇫🇷 Français</option>
                      <option value="de">🇩🇪 Deutsch</option>
                      <option value="it">🇮🇹 Italiano</option>
                      <option value="nl">🇳🇱 Nederlands</option>
                      <option value="zh">🇨🇳 中文</option>
                      <option value="he">🇮🇱 עברית</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <ChevronRight className="w-4 h-4 text-slate-400 rotate-90" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Logout */}
              <button 
                onClick={() => signOut(auth)}
                className="w-full py-4 bg-slate-900 dark:bg-slate-800 text-white rounded-2xl font-black text-sm shadow-lg hover:bg-slate-800 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
              >
                <LogOut className="w-5 h-5" /> {t.logout}
              </button>
            </motion.div>
          )}

          {view === 'PAINEL' && isAdmin && (
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
                  R$ {transactions.reduce((acc, curr) => acc + curr.valor, 0).toFixed(2)}
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
                    <span className="text-lg font-black text-slate-400">R$</span>
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
                    <span className="text-lg font-black text-slate-400">R$</span>
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
                        <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.userPlan}</th>
                        <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.userRole}</th>
                        <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                      {allUsers.map((u) => (
                        <tr key={u.uid} className="group">
                          <td className="py-4">
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{u.email}</p>
                            <p className="text-[8px] text-slate-400 font-mono">{u.uid}</p>
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
                            <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase ${u.isAdmin ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-500'}`}>
                              {u.isAdmin ? 'Admin' : 'User'}
                            </span>
                          </td>
                          <td className="py-4 text-right">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => updateUserPlanManual(u.uid, u.plan === 'pro' ? 'free' : 'pro')}
                                className="p-2 bg-slate-50 dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-900/20 text-slate-400 hover:text-amber-600 rounded-xl transition-all"
                                title={u.plan === 'pro' ? t.setFree : t.setPro}
                              >
                                <Star className={`w-4 h-4 ${u.plan === 'pro' ? 'fill-current' : ''}`} />
                              </button>
                              <button 
                                onClick={() => updateUserVip(u.uid, !u.isVip)}
                                className="p-2 bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-slate-400 hover:text-indigo-600 rounded-xl transition-all"
                                title={u.isVip ? t.removeVip : t.makeVip}
                              >
                                <ShieldCheck className={`w-4 h-4 ${u.isVip ? 'fill-current' : ''}`} />
                              </button>
                              <button 
                                onClick={() => updateUserRole(u.uid, !u.isAdmin)}
                                className="p-2 bg-slate-50 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-slate-400 hover:text-rose-600 rounded-xl transition-all"
                                title={u.isAdmin ? t.removeAdmin : t.makeAdmin}
                              >
                                <Activity className="w-4 h-4" />
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
                {alertasList.length > 0 ? alertasList.map((alerta) => (
                  <div key={alerta.id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
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
                        onChange={async (e) => {
                          try {
                            await updateDoc(doc(db, 'alertas', alerta.id!), { status: e.target.value });
                            showToast("Status atualizado!", "success");
                          } catch (err) {
                            handleFirestoreError(err, OperationType.UPDATE, `alertas/${alerta.id}`);
                          }
                        }}
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
                  <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-[40px] border-2 border-dashed border-slate-200 dark:border-slate-800">
                    <History className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                    <p className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Nenhum alerta ativo no momento</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="max-w-6xl mx-auto px-4 py-12 text-center">
        <p className="text-[10px] text-slate-400 uppercase tracking-[0.4em] font-bold">{t.footer}</p>
      </footer>

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
      <AnimatePresence>
        {showCheckout && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[40px] p-8 shadow-2xl border border-slate-200 dark:border-slate-800"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100">{t.checkoutTitle}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t.checkoutSubtitle}</p>
                </div>
                <button 
                  onClick={() => setShowCheckout(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                >
                  <XCircle className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Plan Options */}
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setSelectedPeriod('monthly')}
                    className={`p-4 rounded-2xl border-2 transition-all text-left ${
                      selectedPeriod === 'monthly' 
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' 
                        : 'border-slate-100 dark:border-slate-800 hover:border-indigo-200'
                    }`}
                  >
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{t.monthly}</p>
                    <p className="text-lg font-black text-slate-900 dark:text-slate-100">R$ {planConfig.monthly.toFixed(2)}</p>
                  </button>
                  <button 
                    onClick={() => setSelectedPeriod('yearly')}
                    className={`p-4 rounded-2xl border-2 transition-all text-left relative overflow-hidden ${
                      selectedPeriod === 'yearly' 
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' 
                        : 'border-slate-100 dark:border-slate-800 hover:border-indigo-200'
                    }`}
                  >
                    <div className="absolute top-0 right-0 bg-amber-500 text-white text-[7px] font-black px-2 py-1 rounded-bl-lg uppercase">
                      {t.saveYearly}
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{t.yearly}</p>
                    <p className="text-lg font-black text-slate-900 dark:text-slate-100">R$ {planConfig.yearly.toFixed(2)}</p>
                  </button>
                </div>

                {/* Payment Method Toggle */}
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
                  <button 
                    onClick={() => setPaymentMethod('card')}
                    className={`flex-1 py-2 rounded-xl text-[10px] font-black transition-all ${paymentMethod === 'card' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`}
                  >
                    {t.creditCard}
                  </button>
                  <button 
                    onClick={() => setPaymentMethod('pix')}
                    className={`flex-1 py-2 rounded-xl text-[10px] font-black transition-all ${paymentMethod === 'pix' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`}
                  >
                    Pix
                  </button>
                </div>

                {paymentMethod === 'card' ? (
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.cardNumber}</label>
                      <div className="relative">
                        <input 
                          type="text" 
                          placeholder="0000 0000 0000 0000"
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs font-medium focus:ring-2 focus:ring-indigo-500 transition-all dark:text-slate-100"
                        />
                        <Briefcase className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.expiryDate}</label>
                        <input 
                          type="text" 
                          placeholder="MM/AA"
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs font-medium focus:ring-2 focus:ring-indigo-500 transition-all dark:text-slate-100"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.cvv}</label>
                        <input 
                          type="text" 
                          placeholder="000"
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs font-medium focus:ring-2 focus:ring-indigo-500 transition-all dark:text-slate-100"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800">
                    <div className="bg-white p-4 rounded-2xl shadow-sm">
                      <QRCodeCanvas 
                        value={`00020126360014BR.GOV.BCB.PIX0114000000000000005204000053039865404${selectedPeriod === 'monthly' ? planConfig.monthly.toFixed(2) : planConfig.yearly.toFixed(2)}5802BR5910O GUARDIAO6009SAO PAULO62070503***6304`}
                        size={160}
                      />
                    </div>
                    <p className="text-[10px] font-bold text-slate-500 text-center uppercase tracking-widest">Escaneie o QR Code para pagar via Pix</p>
                  </div>
                )}

                <button 
                  onClick={upgradeToPro}
                  disabled={isProcessingPurchase}
                  className="w-full py-4 bg-indigo-600 dark:bg-indigo-500 text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {isProcessingPurchase ? (
                    <>
                      <Clock className="w-5 h-5 animate-spin" />
                      {t.processing}
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5" />
                      {t.confirmPurchase}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {showShortcutSuggestion && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800"
          >
            <div className="p-8 text-center space-y-6">
              <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-3xl flex items-center justify-center mx-auto">
                <Plus className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-slate-900 dark:text-slate-100">{t.addShortcut}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                  {t.shortcutSuggestion}
                </p>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <button 
                  onClick={() => setShowShortcutSuggestion(false)}
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-lg hover:bg-indigo-700 transition-all"
                >
                  {t.addShortcut}
                </button>
                <button 
                  onClick={() => setShowShortcutSuggestion(false)}
                  className="w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-black text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                >
                  {t.later}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {showPermissionGuide && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800"
          >
            <div className="p-8 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-slate-900 dark:text-slate-100">{t.permissionsGuide}</h3>
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                  <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                {t.permissionsDescription}
              </p>
              
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Sistema Detectado</p>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{os === 'ios' ? 'Apple iOS' : 'Android OS'}</p>
                </div>
                
                <div className="space-y-3">
                  <p className="text-[10px] font-black text-slate-400 uppercase">Passos para ativar:</p>
                  <ul className="space-y-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                    <li className="flex gap-2"><span>1.</span> {os === 'ios' ? 'Vá em Ajustes > Safari > Configurações do Site' : 'Vá em Configurações > Apps > O GUARDIAO'}</li>
                    <li className="flex gap-2"><span>2.</span> {os === 'ios' ? 'Permita Localização e Microfone' : 'Permita Localização, Microfone e Contatos'}</li>
                  </ul>
                </div>
              </div>

              <button 
                onClick={() => setShowPermissionGuide(false)}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-lg hover:bg-indigo-700 transition-all"
              >
                {t.okUnderstood}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
