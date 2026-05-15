/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart3, 
  BrainCircuit, 
  CheckCircle2, 
  AlertTriangle, 
  Zap, 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  MessageSquare,
  RefreshCw,
  LayoutDashboard,
  Settings,
  HelpCircle,
  LogOut,
  ChevronRight,
  Sparkles,
  Globe,
  User,
  ShieldCheck,
  Star,
  ExternalLink,
  Copy,
  X,
  Share2,
  Send,
  PieChart as PieChartIcon,
  Search,
  ArrowRight,
  Info
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  BarChart,
  Bar,
  PieChart,
  Cell,
  Pie
} from 'recharts';
import { ShopMetrics, DiagnosticResult, OptimizationAction, ChatMessage } from './types';
import { diagnoseShop, askAssistant } from './services/aiService';
import { translations, Language } from './locales';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const MOCK_TRENDS = Array.from({ length: 30 }, (_, i) => ({
  date: `05-${i + 1}`,
  revenue: Math.floor(Math.random() * 500) + 1000,
  visitors: Math.floor(Math.random() * 2000) + 3000,
}));

export default function App() {
  const [lang, setLang] = useState<Language>('zh');
  const [diagnosis, setDiagnosis] = useState<DiagnosticResult | null>(null);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [notifications, setNotifications] = useState<{id: number, message: string}[]>([]);

  const t = translations[lang];

  const CATEGORY_DATA = [
    { name: t.catFashion, value: 400, color: '#FE2C55' },
    { name: t.catElectronics, value: 300, color: '#25F4EE' },
    { name: t.catHome, value: 300, color: '#FFD700' },
    { name: t.catBeauty, value: 200, color: '#FF00FF' },
  ];

  const MOCK_METRICS: ShopMetrics = {
    revenue: 125400,
    visitors: 45200,
    cr: 2.8,
    orders: 1265,
    avgOrderValue: 99,
    topProducts: [
      { id: '1', name: t.prodVintageTee, sales: 450, trend: '+15%', stock: 124, status: t.inStock, health: 85 },
      { id: '2', name: t.prodCyberJacket, sales: 320, trend: '+22%', stock: 12, status: t.lowStock, health: 45 },
      { id: '3', name: t.prodEthicalDenim, sales: 210, trend: '+5%', stock: 89, status: t.inStock, health: 70 },
    ]
  };

  const [metrics, setMetrics] = useState<ShopMetrics>(MOCK_METRICS);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleString());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date().toLocaleString()), 1000);
    return () => clearInterval(timer);
  }, []);

  const showNotification = (message: string) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: inputMessage };
    setChatMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    
    const response = await askAssistant(inputMessage, JSON.stringify(metrics), lang);
    const aiMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'assistant', content: response };
    setChatMessages(prev => [...prev, aiMsg]);
  };

  const startDiagnosis = async () => {
    setIsDiagnosing(true);
    setActiveTab('diagnosis');
    const result = await diagnoseShop(metrics, lang);
    setDiagnosis(result);
    setIsDiagnosing(false);
  };

  const applyOptimization = (actionId: string, type: string) => {
    if (!diagnosis) return;
    setDiagnosis({
      ...diagnosis,
      actions: diagnosis.actions.map(action => 
        action.id === actionId ? { ...action, status: 'applied' as const } : action
      )
    });
    showNotification(`${t.successUpdate} ${type}!`);
  };

  useEffect(() => {
    // Auto-diagnose on first load
    startDiagnosis();
  }, [lang]);

  return (
    <div className="min-h-screen bg-[#010101] text-white font-sans selection:bg-[#FE2C55]/30">
      {/* Notifications */}
      <div className="fixed top-8 right-8 z-50 space-y-4">
        <AnimatePresence>
          {notifications.map(n => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#25F4EE] text-black px-6 py-3 rounded-full font-bold shadow-lg flex items-center gap-2"
            >
              <CheckCircle2 size={18} />
              {n.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Sidebar - Desktop */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 border-r border-white/10 bg-[#010101] hidden lg:flex flex-col z-20">
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#FE2C55] to-[#25F4EE] flex items-center justify-center">
              <span className="text-[10px] font-black italic">TT</span>
            </div>
            <span className="font-bold text-lg tracking-tight">{t.appName}</span>
          </div>

          <button 
            onClick={() => setActiveTab('profile')}
            className={`w-full group p-4 rounded-2xl transition-all border ${activeTab === 'profile' ? 'bg-white/10 border-white/20' : 'bg-white/5 border-transparent hover:bg-white/10'}`}
          >
            <div className="flex items-center gap-3 text-left">
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100&h=100" 
                  alt="Avatar" 
                  className="w-10 h-10 rounded-full object-crop"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute -bottom-1 -right-1 bg-[#25F4EE] p-0.5 rounded-full border-2 border-[#010101]">
                   <ShieldCheck size={10} className="text-black" />
                </div>
              </div>
              <div>
                <p className="font-bold text-sm truncate w-28">{t.shopName}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{t.shopId}</p>
              </div>
            </div>
          </button>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2">
          <NavItem icon={<LayoutDashboard size={20} />} label={t.overview} active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
          <NavItem icon={<BrainCircuit size={20} />} label={t.diagnosis} active={activeTab === 'diagnosis'} onClick={() => setActiveTab('diagnosis')} />
          <NavItem icon={<TrendingUp size={20} />} label={t.growth} active={activeTab === 'growth'} onClick={() => setActiveTab('growth')} />
          <NavItem icon={<ShoppingBag size={20} />} label={t.products} active={activeTab === 'products'} onClick={() => setActiveTab('products')} />
          <NavItem icon={<MessageSquare size={20} />} label={t.customer} active={activeTab === 'customer'} onClick={() => setActiveTab('customer')} />
        </nav>

        <div className="p-4 mt-auto border-t border-white/5 space-y-2">
          <NavItem icon={<Settings size={18} />} label={t.settings} active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
          <NavItem icon={<HelpCircle size={18} />} label={t.help} active={activeTab === 'help'} onClick={() => setActiveTab('help')} />
          <NavItem icon={<LogOut size={18} />} label={t.logout} className="text-red-400" />
        </div>
      </aside>

      {/* Sidebar - Mobile Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/80 z-30 lg:hidden"
            />
            <motion.aside 
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-[#010101] border-r border-white/10 z-40 lg:hidden flex flex-col"
            >
               <div className="p-6 border-b border-white/5">
                 <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#FE2C55] to-[#25F4EE] flex items-center justify-center">
                        <span className="text-[10px] font-black italic">TT</span>
                      </div>
                      <span className="font-bold text-lg tracking-tight">{t.appName}</span>
                    </div>
                    <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-400">
                      <RefreshCw className="rotate-45" size={24} />
                    </button>
                 </div>

                   <button 
                  onClick={() => { setActiveTab('profile'); setIsMobileMenuOpen(false); }}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/5 mb-4"
                 >
                    <img 
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100&h=100" 
                      alt="Avatar" 
                      className="w-12 h-12 rounded-full"
                      referrerPolicy="no-referrer"
                    />
                    <div className="text-left">
                      <p className="font-bold text-white">{t.shopName}</p>
                      <p className="text-xs text-gray-500">{t.shopId}</p>
                    </div>
                 </button>

                 <div className="grid grid-cols-4 gap-2">
                   {['en', 'zh', 'th', 'vi'].map((l) => (
                     <button
                       key={l}
                       onClick={() => setLang(l as Language)}
                       className={cn(
                         "py-2 rounded-xl text-[10px] font-black border transition-all uppercase",
                         lang === l 
                           ? "bg-[#FE2C55] border-[#FE2C55] text-white" 
                           : "bg-white/5 border-white/10 text-gray-400"
                       )}
                     >
                       {l}
                     </button>
                   ))}
                   {['id', 'ms', 'tl'].map((l) => (
                     <button
                       key={l}
                       onClick={() => setLang(l as Language)}
                       className={cn(
                         "py-2 rounded-xl text-[10px] font-black border transition-all uppercase",
                         lang === l 
                           ? "bg-[#FE2C55] border-[#FE2C55] text-white" 
                           : "bg-white/5 border-white/10 text-gray-400"
                       )}
                     >
                       {l}
                     </button>
                   ))}
                 </div>
               </div>
               
               <nav className="flex-1 p-6 space-y-2">
                  <NavItem icon={<LayoutDashboard size={20} />} label={t.overview} active={activeTab === 'overview'} onClick={() => { setActiveTab('overview'); setIsMobileMenuOpen(false); }} />
                  <NavItem icon={<BrainCircuit size={20} />} label={t.diagnosis} active={activeTab === 'diagnosis'} onClick={() => { setActiveTab('diagnosis'); setIsMobileMenuOpen(false); }} />
                  <NavItem icon={<TrendingUp size={20} />} label={t.growth} active={activeTab === 'growth'} onClick={() => { setActiveTab('growth'); setIsMobileMenuOpen(false); }} />
                  <NavItem icon={<ShoppingBag size={20} />} label={t.products} active={activeTab === 'products'} onClick={() => { setActiveTab('products'); setIsMobileMenuOpen(false); }} />
                  <NavItem icon={<MessageSquare size={20} />} label={t.customer} active={activeTab === 'customer'} onClick={() => { setActiveTab('customer'); setIsMobileMenuOpen(false); }} />
               </nav>
               <div className="p-6 border-t border-white/5">
                  <NavItem icon={<LogOut size={18} />} label={t.logout} className="text-red-400" />
               </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="lg:ml-64 p-4 lg:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 bg-white/5 rounded-lg lg:hidden"
            >
              <LayoutDashboard size={24} />
            </button>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight mb-2">
                {t.title} <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FE2C55] to-[#25F4EE]">{t.titleGradient}</span>
              </h1>
              <div className="flex items-center gap-2 text-gray-400 font-medium">
                <p>{t.subtitle}</p>
                <span className="text-white/20">|</span>
                <p className="text-[10px] font-mono">{t.currentDiagnosisDate} {currentTime}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative group/lang">
              <button className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-xs font-bold text-gray-400 hover:text-white">
                <Globe size={14} className="text-[#25F4EE]" />
                <span className="uppercase">{lang}</span>
              </button>
              <div className="absolute right-0 top-full mt-2 w-48 bg-[#121212] border border-white/10 rounded-2xl py-2 opacity-0 invisible group-hover/lang:opacity-100 group-hover/lang:visible transition-all z-50 shadow-2xl backdrop-blur-xl">
                {[
                  { code: 'en', label: 'English' },
                  { code: 'zh', label: '简体中文' },
                  { code: 'th', label: 'ไทย (Thai)' },
                  { code: 'vi', label: 'Tiếng Việt' },
                  { code: 'id', label: 'Bahasa Indonesia' },
                  { code: 'ms', label: 'Bahasa Melayu' },
                  { code: 'tl', label: 'Filipino' },
                ].map((l) => (
                  <button
                    key={l.code}
                    onClick={() => setLang(l.code as Language)}
                    className={cn(
                      "w-full text-left px-4 py-2 text-xs font-bold transition-colors hover:bg-white/5",
                      lang === l.code ? "text-[#FE2C55]" : "text-gray-400"
                    )}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
            <button 
              onClick={startDiagnosis}
              disabled={isDiagnosing}
              className="flex items-center gap-2 px-6 py-3 bg-white text-black font-semibold rounded-full hover:bg-gray-200 transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
            >
              {isDiagnosing ? <RefreshCw className="animate-spin" size={20} /> : <Zap size={20} fill="currentColor" />}
              {isDiagnosing ? t.analyzing : t.runDiagnosis}
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {activeTab === 'profile' && (
                <motion.div 
                  key="profile"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  className="space-y-8"
                >
                  <div className="bg-[#121212] border border-white/10 rounded-3xl p-8 lg:p-12 relative overflow-hidden group">
                     {/* Background Pattern */}
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                      <User size={240} />
                    </div>

                    <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
                      <div className="relative">
                        <img 
                          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200&h=200" 
                          alt="Large Avatar" 
                          className="w-32 h-32 rounded-3xl object-cover ring-4 ring-white/10"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[#25F4EE] px-3 py-1 rounded-full text-black text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                          {t.verifiedSeller}
                        </div>
                      </div>

                      <div className="text-center md:text-left flex-1">
                        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                          <h2 className="text-3xl font-bold">{t.shopName}</h2>
                          <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                            <Star size={14} className="text-yellow-400 fill-yellow-400" />
                            <span className="text-sm font-bold">{t.shopRating}</span>
                            <span className="text-xs text-[#25F4EE] font-medium">• {t.excellent}</span>
                          </div>
                          <div className="flex items-center gap-2 px-3 py-1 bg-[#25F4EE]/10 rounded-full border border-[#25F4EE]/20">
                             <div className="w-1.5 h-1.5 rounded-full bg-[#25F4EE] animate-pulse" />
                             <span className="text-[10px] text-[#25F4EE] font-bold uppercase tracking-wider">{t.storeStatus}</span>
                          </div>
                        </div>
                        <p className="text-gray-400 mb-6 flex items-center justify-center md:justify-start gap-4">
                          <span className="flex items-center gap-1"><Users size={16} /> {t.followerCount}</span>
                          <span className="flex items-center gap-1 font-mono text-xs">{t.shopId}</span>
                        </p>
                        
                        <div className="flex flex-wrap justify-center md:justify-start gap-3">
                          <a 
                            href="https://shop.tiktok.com" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="px-6 py-2 bg-[#FE2C55] rounded-full text-sm font-bold hover:bg-[#FE2C55]/80 transition-all flex items-center gap-2"
                          >
                             {t.viewStore}
                             <ExternalLink size={14} />
                          </a>
                          <button 
                            onClick={() => setShowShareModal(true)}
                            className="px-6 py-2 bg-white/5 border border-white/10 rounded-full text-sm font-bold hover:bg-white/10 transition-all flex items-center gap-2"
                          >
                            {t.share} <Share2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                      { label: t.shopScore, value: '4.9', icon: <Star className="text-yellow-400" /> },
                      { label: t.chatRate, value: '98%', icon: <MessageSquare className="text-blue-400" /> },
                      { label: t.fulfillment, value: '1.2d', icon: <ShoppingBag className="text-[#25F4EE]" /> },
                      { label: t.healthStatus, value: t.excellent, icon: <ShieldCheck className="text-green-400" /> }
                    ].map((card, idx) => (
                      <div key={idx} className="bg-[#121212] border border-white/10 p-6 rounded-2xl">
                         <div className="p-2 bg-white/5 rounded-lg w-fit mb-4">{card.icon}</div>
                         <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">{card.label}</p>
                         <p className="text-xl font-bold">{card.value}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'overview' && (
                <motion.div 
                  key="overview"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-8"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <StatCard 
                      title={t.revenue} 
                      value={`$${metrics.revenue.toLocaleString()}`} 
                      trend="+12.4%" 
                      trendUp={true} 
                      icon={<BarChart3 size={24} />}
                      tooltip={t.revenueTip}
                    />
                    <StatCard 
                      title={t.cr} 
                      value={`${metrics.cr}%`} 
                      trend="-0.5%" 
                      trendUp={false} 
                      icon={<TrendingUp size={24} />}
                      tooltip={t.crTip}
                    />
                    <StatCard 
                      title={t.visitors} 
                      value={metrics.visitors.toLocaleString()} 
                      trend="+2,400" 
                      trendUp={true} 
                      icon={<Users size={24} />}
                      tooltip={t.visitorsTip}
                    />
                  </div>

                  {/* Trends Chart */}
                  <div className="bg-[#121212] border border-white/10 rounded-3xl p-8 mb-8">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-xl font-bold flex items-center gap-2">
                         <BarChart3 size={20} className="text-[#25F4EE]" />
                         {t.trends}
                      </h3>
                      <div className="flex items-center gap-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-[#FE2C55]" />
                          {t.revenue}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-[#25F4EE]" />
                          {t.visitors}
                        </div>
                      </div>
                    </div>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={MOCK_TRENDS}>
                          <defs>
                            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#FE2C55" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#FE2C55" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorVis" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#25F4EE" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#25F4EE" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                          <XAxis dataKey="date" stroke="#ffffff40" fontSize={10} tickLine={false} axisLine={false} />
                          <YAxis stroke="#ffffff40" fontSize={10} tickLine={false} axisLine={false} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#181818', border: '1px solid #333', borderRadius: '12px' }}
                            itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                          />
                          <Area type="monotone" dataKey="revenue" stroke="#FE2C55" fillOpacity={1} fill="url(#colorRev)" strokeWidth={3} />
                          <Area type="monotone" dataKey="visitors" stroke="#25F4EE" fillOpacity={1} fill="url(#colorVis)" strokeWidth={3} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-[#121212] border border-white/10 rounded-3xl p-8">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                          <Globe size={20} className="text-[#25F4EE]" />
                          {t.salesPerformance}
                        </h3>
                      </div>
                      <div className="grid grid-cols-2 gap-8">
                        {/* Region Progress Bars */}
                        <div className="space-y-6">
                          {[
                            { label: t.indonesia, value: 45, color: '#FE2C55' },
                            { label: t.thailand, value: 30, color: '#25F4EE' },
                            { label: t.vietnam, value: 15, color: '#FFD700' },
                            { label: t.malaysia, value: 10, color: '#888' },
                          ].map((item, idx) => (
                            <div key={idx} className="space-y-2">
                              <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider">
                                <span className="text-gray-400">{item.label}</span>
                                <span className="text-white">{item.value}%</span>
                              </div>
                              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${item.value}%` }}
                                  transition={{ duration: 1, delay: idx * 0.1 }}
                                  className="h-full rounded-full"
                                  style={{ backgroundColor: item.color }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                        {/* Pie Chart for Category */}
                        <div className="flex flex-col items-center">
                          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">{t.categorySales}</p>
                          <div className="h-40 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={CATEGORY_DATA}
                                  innerRadius={40}
                                  outerRadius={60}
                                  paddingAngle={5}
                                  dataKey="value"
                                >
                                  {CATEGORY_DATA.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                  ))}
                                </Pie>
                                <Tooltip />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
                            {CATEGORY_DATA.map((item, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                                <span className="text-[8px] font-bold text-gray-400 uppercase">{item.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-[#121212] border border-white/10 rounded-3xl p-8">
                       <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <AlertTriangle size={20} className="text-[#FE2C55]" />
                        {t.riskTitle}
                      </h3>
                      <div className="space-y-4">
                        <div className="p-4 rounded-2xl bg-[#FE2C55]/5 border border-[#FE2C55]/20">
                          <p className="font-bold text-white mb-1">{t.risk1}</p>
                          <p className="text-xs text-gray-400">{t.risk1Desc}</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-orange-500/5 border border-orange-500/20">
                          <p className="font-bold text-white mb-1">{t.risk2}</p>
                          <p className="text-xs text-gray-400">{t.risk2Desc}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'diagnosis' && (
                <motion.div 
                  key="diagnosis"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-8"
                >
                  <AnimatePresence mode="wait">
                    {isDiagnosing ? (
                      <LoadingSkeleton key="loading" />
                    ) : diagnosis ? (
                      <div className="space-y-8">
                        <div className="bg-[#121212] border border-white/10 rounded-3xl p-8 relative overflow-hidden group">
                          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                            <BrainCircuit size={160} />
                          </div>
                          <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6">
                              <div className="px-3 py-1 bg-[#25F4EE]/10 text-[#25F4EE] rounded-full text-xs font-bold tracking-widest uppercase">
                                {t.summaryTitle}
                              </div>
                              <div className="flex items-center gap-1 text-sm text-gray-400">
                                <Sparkles size={14} className="text-[#FE2C55]" />
                                {t.score}: <span className="font-bold text-white">{diagnosis.overallHealth}/100</span>
                              </div>
                            </div>
                            <p className="text-xl lg:text-2xl leading-relaxed text-gray-200 font-medium italic" style={{ fontFamily: 'Microsoft YaHei, "Microsoft YaHei", sans-serif' }}>
                              "{diagnosis.summary}"
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
                          {[
                            { label: t.storeNameLabel, value: diagnosis.actions[0]?.storeName || 'Global Fashion Hub', icon: <ShoppingBag size={14} /> },
                            { label: t.primaryRegionLabel, value: diagnosis.actions[0]?.region || 'Southeast Asia', icon: <Globe size={14} /> },
                            { label: t.targetMarketLabel, value: 'B2C / Gen Z', icon: <Users size={14} /> },
                            { label: t.optimizationIdLabel, value: diagnosis.actions[0]?.linkId || '#882941', icon: <Copy size={14} /> }
                          ].map((info, idx) => (
                            <div key={idx} className="bg-white/5 border border-white/10 px-4 py-3 rounded-2xl flex items-center gap-3">
                              <div className="p-2 bg-white/5 rounded-lg text-gray-400">{info.icon}</div>
                              <div>
                                <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">{info.label}</p>
                                <p className="text-xs font-bold whitespace-nowrap overflow-hidden text-ellipsis w-full">{info.value}</p>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="space-y-4 text-gray-400 text-sm font-semibold tracking-wider uppercase mb-6 px-2">
                          {t.actionTitle}
                        </div>
                        <div className="space-y-4">
                          {diagnosis.actions.map((action, idx) => (
                            <ActionCard 
                              key={action.id} 
                              action={action} 
                              onApply={() => applyOptimization(action.id, action.type)} 
                              delay={idx * 0.1}
                              t={t}
                            />
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="h-64 border border-dashed border-white/10 rounded-3xl flex items-center justify-center text-gray-500">
                        {t.emptyDiagnosis}
                      </div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}

              {activeTab === 'growth' && (
                <motion.div 
                  key="growth"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-8"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-[#121212] border border-white/10 rounded-3xl p-6">
                       <h3 className="text-lg font-bold mb-4">{t.marketAnalysis}</h3>
                       <div className="space-y-4">
                          {[
                            { country: 'ID', term: t.trendID, trend: '+45%' },
                            { country: 'TH', term: t.trendTH, trend: '+32%' },
                            { country: 'MY', term: t.trendMY, trend: '+28%' },
                            { country: 'VN', term: t.trendVN, trend: '+18%' }
                          ].map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/20 transition-colors">
                              <div className="flex items-center gap-3">
                                <span className="text-xs font-bold text-gray-400">{item.country}</span>
                                <span className="text-sm font-medium">"{item.term}"</span>
                              </div>
                              <span className="text-xs font-bold text-[#25F4EE]">{item.trend}</span>
                            </div>
                          ))}
                       </div>
                    </div>
                    
                    <div className="lg:col-span-2 bg-gradient-to-br from-[#25F4EE]/10 via-transparent to-[#FE2C55]/5 border border-white/10 rounded-3xl p-8 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-8 opacity-5">
                        <Sparkles size={120} />
                      </div>
                      <div className="relative z-10">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                          <Sparkles size={24} className="text-[#25F4EE]" />
                          {t.strategyCenter}
                        </h3>
                        <p className="text-gray-400 mb-8 max-w-lg">{t.subtitle}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                          <div className="p-6 rounded-2xl bg-black/40 border border-white/5">
                            <p className="text-[#25F4EE] font-bold text-xs mb-2 uppercase tracking-wider">{t.influencerRecs}</p>
                            <p className="text-white text-sm">{t.marketAnalysisDesc}</p>
                          </div>
                          <div className="p-6 rounded-2xl bg-black/40 border border-white/5">
                            <p className="text-[#FE2C55] font-bold text-xs mb-2 uppercase tracking-wider">{t.viralPotential}</p>
                            <p className="text-white text-sm">{t.viralPotentialDesc}</p>
                          </div>
                        </div>

                        {/* AI Assistant Chat Preview */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                          <div className="flex items-center justify-between mb-4">
                             <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center">
                                   <BrainCircuit size={12} className="text-[#25F4EE]" />
                                </div>
                                <span className="text-sm font-bold">{t.aiAssistant}</span>
                             </div>
                             <button onClick={() => setIsChatOpen(true)} className="text-xs font-bold text-[#25F4EE] hover:underline">
                                {t.openChat}
                             </button>
                          </div>
                          <div className="p-4 bg-black/40 rounded-xl mb-4 text-xs text-gray-400 italic font-medium">
                            {t.aiPreviewText}
                          </div>
                          <div className="flex flex-wrap gap-2">
                             {[t.suggest1, t.suggest2, t.suggest3].map((tag, i) => (
                               <button 
                                 key={i} 
                                 onClick={() => { setInputMessage(tag); setIsChatOpen(true); }}
                                 className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold text-gray-500 hover:text-white hover:border-white/20 transition-all"
                               >
                                 {tag}
                               </button>
                             ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'products' && (
                <motion.div 
                  key="products"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-8"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                     <div className="lg:col-span-3 bg-[#121212] border border-white/10 rounded-3xl overflow-hidden">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-white/5 bg-white/5">
                              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">{t.products}</th>
                              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">{t.inventoryLevel}</th>
                              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">{t.productHealth}</th>
                              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">{t.actionLabel}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5 text-sm">
                            {[
                              { name: t.prodVintageTee, stock: 450, health: 92, status: t.inStock },
                              { name: t.prodCyberJacket, stock: 24, health: 65, status: t.lowStock },
                              { name: t.prodEthicalDenim, stock: 0, health: 40, status: t.outOfStock },
                            ].map((item, idx) => (
                              <tr key={idx} className="hover:bg-white/5 transition-colors group">
                                <td className="px-6 py-4">
                                  <div className="font-bold text-white group-hover:text-[#25F4EE] transition-colors">{item.name}</div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${item.stock === 0 ? 'bg-[#FE2C55]' : item.stock < 50 ? 'bg-orange-500' : 'bg-[#25F4EE]'}`} />
                                    <span className="font-medium text-gray-300">{item.status}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="w-24 h-2 bg-white/5 rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full transition-all duration-1000 ${item.health > 80 ? 'bg-[#25F4EE]' : item.health > 60 ? 'bg-orange-400' : 'bg-[#FE2C55]'}`} style={{ width: `${item.health}%` }} />
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <button onClick={() => setActiveTab('diagnosis')} className="text-xs font-bold text-[#FE2C55] hover:underline flex items-center gap-1">
                                    {t.diagnosis} <ChevronRight size={12} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                     </div>
                     <div className="bg-[#121212] border border-white/10 rounded-3xl p-6">
                        <h3 className="text-sm font-bold flex items-center gap-2 mb-6 uppercase tracking-widest text-[#25F4EE]">
                           <TrendingUp size={16} />
                           {t.competitorAnalysis}
                        </h3>
                        <div className="space-y-6">
                           {[
                             { name: t.competitor1, price: '$12.9', sales: '2.4k', win: true },
                             { name: t.competitor2, price: '$15.5', sales: '1.2k', win: false },
                             { name: t.competitor3, price: '$11.0', sales: '4.8k', win: false }
                           ].map((shop, i) => (
                             <div key={i} className="space-y-2 group">
                               <div className="flex justify-between items-center text-[11px] uppercase tracking-tighter">
                                  <span className="font-bold text-gray-300">{shop.name}</span>
                                  <span className={shop.win ? 'text-green-400' : 'text-red-400'}>{shop.win ? t.winning : t.losing}</span>
                               </div>
                               <div className="flex gap-2">
                                  <div className="bg-white/5 px-2 py-1 rounded text-[10px] text-gray-500 font-bold tracking-widest whitespace-nowrap">{t.avgPrice} {shop.price}</div>
                                  <div className="bg-white/5 px-2 py-1 rounded text-[10px] text-gray-500 font-bold tracking-widest whitespace-nowrap">{shop.sales} {t.soldCount}</div>
                               </div>
                               <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                  <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: shop.win ? '80%' : '40%' }}
                                    className={`h-full ${shop.win ? 'bg-[#25F4EE]' : 'bg-[#FE2C55]'}`} 
                                  />
                               </div>
                             </div>
                           ))}
                        </div>
                     </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'customer' && (
                <motion.div 
                  key="customer"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-8"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-sm">
                    <div className="lg:col-span-2 space-y-8">
                       <div className="bg-[#121212] border border-white/10 rounded-3xl p-8">
                          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <MessageSquare size={20} className="text-[#25F4EE]" />
                            {t.reviewAnalysis}
                          </h3>
                          <div className="p-6 rounded-2xl bg-[#FE2C55]/5 border border-[#FE2C55]/20 mb-6">
                            <div className="flex items-center gap-3 mb-2">
                              <AlertTriangle className="text-[#FE2C55]" size={18} />
                              <span className="font-bold text-[#FE2C55] uppercase tracking-widest text-xs">{t.negativeHotspots}</span>
                            </div>
                            <p className="text-gray-300 leading-relaxed">
                               {t.shippingDelayIssue} 
                               <span className="text-white font-bold ml-1">{t.recommendation}:</span> {t.recommendationDesc}
                            </p>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                             <div className="space-y-4">
                                <div className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em]">{t.userPersona}</div>
                                <div className="p-6 bg-white/5 rounded-2xl border border-white/10 group hover:border-[#25F4EE]/50 transition-all">
                                   <div className="flex items-center gap-4 mb-4">
                                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-[#25F4EE]/20 flex items-center justify-center text-[#25F4EE] font-black text-xl">Z</div>
                                      <div>
                                         <p className="font-bold text-white uppercase tracking-tight">Gen Z (18-24)</p>
                                         <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t.shoppingPower}: {t.highPriority}</p>
                                      </div>
                                   </div>
                                   <div className="text-[10px] text-gray-400 space-y-2 uppercase font-bold tracking-widest">
                                      <div className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-[#25F4EE]" /> {t.genZDesc.split(', ')[0]}</div>
                                      <div className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-[#25F4EE]" /> {t.genZDesc.split(', ')[1]}</div>
                                      <div className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-[#25F4EE]" /> {t.genZDesc.split(', ')[2]}</div>
                                   </div>
                                </div>
                             </div>
                             <div className="space-y-4">
                                <div className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em]">{t.repurchaseRate}</div>
                                <div className="flex items-end justify-center gap-4 h-32 pt-4 bg-white/5 rounded-2xl border border-white/10 p-4">
                                   {[
                                     { h: '20%', label: 'M1' }, { h: '45%', label: 'M2' }, { h: '35%', label: 'M3' }, { h: '55%', label: 'Current' }
                                   ].map((b, i) => (
                                     <div key={i} className="flex flex-col items-center gap-2 flex-1">
                                        <div className="w-full bg-white/5 rounded-t-lg relative group h-full">
                                           <motion.div 
                                              initial={{ height: 0 }}
                                              animate={{ height: b.h }}
                                              className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#25F4EE]/20 to-[#25F4EE] rounded-t-lg" 
                                           />
                                           <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-[8px] font-black text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-black/80 px-2 py-1 rounded border border-white/10 backdrop-blur-sm z-10">{b.h} Retent.</div>
                                        </div>
                                        <span className="text-[9px] font-black text-gray-500 tracking-tighter uppercase">{b.label}</span>
                                     </div>
                                   ))}
                                </div>
                                <div className="p-3 bg-green-500/10 rounded-xl border border-green-500/20 text-center">
                                   <p className="text-[10px] font-black text-green-400 uppercase tracking-widest">{t.growthSignal}: +12% {t.retentionForecast}</p>
                                </div>
                             </div>
                          </div>
                       </div>
                    </div>
                    
                    <div className="bg-[#121212] border border-white/10 rounded-3xl p-8 h-fit">
                       <h3 className="text-xl font-bold mb-8 uppercase tracking-tight flex items-center gap-2">
                          <Users size={20} className="text-[#FE2C55]" />
                          {t.segmentation}
                       </h3>
                       <div className="space-y-8">
                         {[
                           { label: t.loyalists, value: 35, color: '#FE2C55', desc: t.loyalistsDesc },
                           { label: t.newComers, value: 45, color: '#25F4EE', desc: t.newComersDesc },
                           { label: t.atRisk, value: 20, color: '#FFD700', desc: t.atRiskDesc }
                         ].map((segment, i) => (
                           <div key={i} className="space-y-3 group">
                              <div className="flex justify-between text-xs font-bold items-center">
                                 <div>
                                    <span className="text-white block uppercase tracking-wide">{segment.label}</span>
                                    <span className="text-[9px] text-gray-500 font-bold uppercase">{segment.desc}</span>
                                 </div>
                                 <span className="text-lg font-black" style={{ color: segment.color }}>{segment.value}%</span>
                              </div>
                              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                 <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${segment.value}%` }}
                                    className="h-full rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)]" 
                                    style={{ backgroundColor: segment.color }} 
                                 />
                              </div>
                           </div>
                         ))}
                       </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'settings' && (
                <motion.div 
                  key="settings"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  <div className="bg-[#121212] border border-white/10 rounded-3xl p-8 max-w-2xl">
                    <h2 className="text-2xl font-bold mb-8 tracking-tight uppercase flex items-center gap-3">
                       <Settings size={28} className="text-gray-500" />
                       {t.settingsPanel}
                    </h2>
                    <div className="space-y-8">
                      <div className="space-y-4">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em]">Shop Preferences</label>
                        <div className="p-6 bg-white/5 rounded-2xl flex items-center justify-between border border-white/5 hover:border-white/10 transition-colors cursor-pointer group">
                           <div>
                              <p className="font-bold text-sm text-white group-hover:text-[#25F4EE] transition-colors tracking-tight">Automatic SEO Optimization</p>
                              <p className="text-xs text-gray-500 font-medium">Let AI optimize titles and tags every 24 hours.</p>
                           </div>
                           <div className="w-14 h-7 bg-[#FE2C55] rounded-full relative p-1 shadow-inner">
                              <div className="absolute right-1 top-1 w-5 h-5 bg-white rounded-full shadow-lg" />
                           </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em]">Notification Protocols</label>
                        <div className="p-6 bg-white/5 rounded-2xl flex items-center justify-between border border-white/5 hover:border-white/10 transition-colors cursor-pointer">
                           <div>
                              <p className="font-bold text-sm text-white tracking-tight">Real-time Stock Alerts</p>
                              <p className="text-xs text-gray-500 font-medium">Notify via app and email when stock hits critical level.</p>
                           </div>
                           <div className="w-14 h-7 bg-white/10 rounded-full relative p-1">
                              <div className="absolute left-1 top-1 w-5 h-5 bg-white/30 rounded-full" />
                           </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'help' && (
                <motion.div 
                  key="help"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  <div className="bg-[#121212] border border-white/10 rounded-3xl p-8">
                    <h2 className="text-2xl font-bold mb-8 tracking-tight uppercase flex items-center gap-3">
                       <HelpCircle size={28} className="text-gray-500" />
                       {t.helpCenter}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                       {[
                         { title: t.sellingBasics, icon: <ShoppingBag size={24} />, desc: t.sellingBasicsDesc },
                         { title: t.globalLogistics, icon: <Globe size={24} />, desc: t.globalLogisticsDesc },
                         { title: t.aiAutomation, icon: <BrainCircuit size={24} />, desc: t.aiAutomationDesc }
                       ].map((card, i) => (
                         <button key={i} className="p-8 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 hover:translate-y-[-4px] transition-all text-left group">
                            <div className="text-[#25F4EE] mb-6 group-hover:scale-110 transition-transform origin-left">{card.icon}</div>
                            <h4 className="font-bold text-lg mb-2 text-white group-hover:text-[#25F4EE] transition-colors uppercase tracking-tight">{card.title}</h4>
                            <p className="text-xs text-gray-500 font-medium leading-relaxed">{card.desc}</p>
                         </button>
                       ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* AI Assistant Sidebar / Drawer */}
      <AnimatePresence>
        {isChatOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsChatOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[70]"
            />
            <motion.aside 
               initial={{ x: '100%' }}
               animate={{ x: 0 }}
               exit={{ x: '100%' }}
               transition={{ type: 'spring', damping: 25, stiffness: 200 }}
               className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[#010101] border-l border-white/10 z-[80] flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.8)]"
            >
               <div className="p-6 border-b border-white/10 flex items-center justify-between bg-[#0A0A0A]">
                  <div className="flex items-center gap-3">
                     <div className="p-2.5 bg-[#25F4EE]/10 rounded-xl text-[#25F4EE] shadow-[0_0_15px_rgba(37,244,238,0.2)]">
                        <BrainCircuit size={22} strokeWidth={2.5} />
                     </div>
                     <div className="flex flex-col">
                        <span className="font-bold text-lg tracking-tight uppercase">{t.aiAssistant}</span>
                        <div className="flex items-center gap-1">
                           <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
                           <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{t.online}</span>
                        </div>
                     </div>
                  </div>
                  <button onClick={() => setIsChatOpen(false)} className="p-2 hover:bg-white/5 rounded-xl text-gray-500 transition-colors">
                     <X size={24} />
                  </button>
               </div>

               <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[radial-gradient(circle_at_bottom_right,#FE2C5508,transparent_50%)]">
                  {chatMessages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-8 px-4">
                       <div className="relative">
                          <div className="absolute inset-0 bg-[#FE2C55] blur-[40px] opacity-10 animate-pulse" />
                          <div className="relative w-20 h-20 rounded-[2.5rem] bg-white/5 border border-white/10 flex items-center justify-center shadow-2xl">
                             <Sparkles size={40} className="text-[#FE2C55]" />
                          </div>
                       </div>
                       <div className="space-y-3">
                          <p className="font-bold text-xl text-white tracking-tight uppercase">{t.chatHotKeys}</p>
                          <p className="text-xs text-gray-500 font-medium max-w-[240px] mx-auto leading-relaxed uppercase tracking-wider">
                             {t.chatHelpText}
                          </p>
                       </div>
                       <div className="flex flex-wrap justify-center gap-2 max-w-xs">
                          {[
                            t.suggest1,
                            t.suggest2,
                            t.suggest3
                          ].map((suggest, i) => (
                            <button 
                              key={i} 
                              onClick={() => { setInputMessage(suggest); }}
                              className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-gray-400 hover:text-white hover:border-[#25F4EE]/50 transition-all uppercase tracking-widest"
                            >
                              {suggest}
                            </button>
                          ))}
                       </div>
                    </div>
                  )}
                  {chatMessages.map((msg) => (
                    <motion.div 
                      key={msg.id} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn("flex flex-col", msg.role === 'user' ? "items-end" : "items-start")}
                    >
                      <div className={cn(
                        "max-w-[90%] p-4 rounded-3xl text-sm leading-relaxed shadow-lg",
                        msg.role === 'user' 
                          ? "bg-gradient-to-tr from-[#FE2C55] to-[#FF4D80] text-white font-medium rounded-tr-none" 
                          : "bg-white/10 text-gray-200 border border-white/10 font-medium rounded-tl-none backdrop-blur-md"
                      )}>
                        {msg.content}
                      </div>
                      <span className="text-[9px] text-gray-600 mt-1.5 uppercase font-black tracking-[0.2em]">{msg.role === 'user' ? t.user : t.aiAssistant} • {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </motion.div>
                  ))}
               </div>

               <div className="p-6 bg-[#0F0F0F] border-t border-white/5 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
                  <div className="relative group">
                     <div className="absolute inset-0 bg-[#25F4EE] opacity-0 group-focus-within:opacity-[0.03] blur-xl transition-opacity pointer-events-none" />
                     <input 
                        type="text" 
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder={t.askAi}
                        className="w-full bg-[#010101] border border-white/10 rounded-[2rem] px-8 py-5 pr-16 text-sm font-medium focus:border-[#25F4EE] transition-all outline-none text-white placeholder:text-gray-600 shadow-inner"
                     />
                     <button 
                        onClick={handleSendMessage}
                        disabled={!inputMessage.trim()}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 w-11 h-11 bg-[#FE2C55] text-white rounded-full flex items-center justify-center shadow-lg disabled:opacity-50 disabled:grayscale active:scale-90 transition-all hover:scale-105"
                     >
                        <Send size={18} strokeWidth={2.5} />
                     </button>
                  </div>
               </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Floating AI Bubble (Always visible except when chat is open) */}
      {!isChatOpen && (
        <motion.button 
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-tr from-[#FE2C55] to-[#25F4EE] rounded-[1.8rem] flex items-center justify-center shadow-[0_0_40px_rgba(254,44,85,0.4)] z-50 group border border-white/20"
        >
          <BrainCircuit size={32} className="text-white" strokeWidth={2.5} />
          <div className="absolute -top-1 -right-1 flex h-4 w-4">
             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
             <span className="relative inline-flex rounded-full h-4 w-4 bg-[#25F4EE] border-2 border-[#010101]"></span>
          </div>
          
          {/* Tooltip on hover */}
          <div className="absolute right-20 bg-white text-black text-[10px] font-black px-4 py-2 rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none uppercase tracking-widest shadow-2xl">
             {t.askAi}
          </div>
        </motion.button>
      )}

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowShareModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-[#121212] border border-white/10 rounded-[2.5rem] p-8 z-[110] shadow-[0_0_100px_rgba(0,0,0,0.5)]"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold uppercase tracking-tight">{t.shareStore}</h3>
                <button onClick={() => setShowShareModal(false)} className="p-2 hover:bg-white/5 rounded-full text-gray-500">
                  <X size={20} />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-6 mb-8">
                {[
                  { name: 'WhatsApp', color: '#25D366' },
                  { name: 'WeChat', color: '#07C160' },
                  { name: 'Facebook', color: '#1877F2' }
                ].map((app, i) => (
                  <button key={i} className="flex flex-col items-center gap-3 group">
                    <div 
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-xl transition-transform group-hover:scale-110 active:scale-95"
                      style={{ backgroundColor: app.color }}
                    >
                      <Share2 size={24} />
                    </div>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{app.name}</span>
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 p-3 bg-white/5 rounded-2xl border border-white/10 mb-2">
                <input 
                  readOnly 
                  value="https://shop.tiktok.com/hub" 
                  className="bg-transparent border-none text-xs text-gray-400 w-full outline-none font-mono"
                />
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText("https://shop.tiktok.com/hub");
                    showNotification(t.copySuccess);
                  }}
                  className="p-2 bg-white text-black rounded-lg hover:bg-[#FE2C55] hover:text-white transition-colors"
                >
                  <Copy size={16} />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function NavItem({ icon, label, active = false, onClick, className = '' }: { icon: any, label: string, active?: boolean, onClick?: () => void, className?: string }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
        active ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white hover:bg-white/5'
      } ${className}`}
    >
      {icon}
      <span className="font-medium">{label}</span>
      {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#FE2C55]" />}
    </button>
  );
}

function StatCard({ title, value, trend, trendUp, icon, tooltip }: { title: string, value: string, trend: string, trendUp: boolean, icon: any, tooltip?: string }) {
  return (
    <div className="bg-[#121212] border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all group relative">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-white/5 rounded-xl text-gray-400 group-hover:text-white transition-colors">
          {icon}
        </div>
        <div className={`text-xs font-bold flex items-center gap-1 ${trendUp ? 'text-[#25F4EE]' : 'text-[#FE2C55]'}`}>
          {trend}
          <ChevronRight size={12} className={trendUp ? '-rotate-90' : 'rotate-90'} />
        </div>
      </div>
      <div>
        <div className="flex items-center gap-1.5 mb-1 group/tip">
          <p className="text-gray-400 text-sm font-medium">{title}</p>
          <Info size={12} className="text-gray-600 hover:text-gray-400 cursor-help" />
          {tooltip && (
            <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-black/90 border border-white/10 px-3 py-2 rounded-lg text-[10px] text-gray-300 w-48 opacity-0 pointer-events-none group-hover/tip:opacity-100 transition-opacity z-10 shadow-2xl backdrop-blur-md">
              {tooltip}
            </div>
          )}
        </div>
        <p className="text-2xl font-bold tracking-tight">{value}</p>
      </div>
    </div>
  );
}

function ActionCard({ action, onApply, delay, t }: { action: OptimizationAction, onApply: () => void, delay: number, t: any, key?: string }) {
  const isApplied = action.status === 'applied';

  const severityLabel = action.severity === 'high' ? t.highPriority : 
                        action.severity === 'medium' ? t.mediumPriority : 
                        t.lowPriority;

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className={`bg-[#0A0A0A] border rounded-2xl p-6 transition-all ${isApplied ? 'border-[#25F4EE]/50 bg-[#25F4EE]/5' : 'border-white/10'}`}
    >
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                action.severity === 'high' ? 'bg-[#FE2C55]/20 text-[#FE2C55]' : 
                action.severity === 'medium' ? 'bg-orange-500/20 text-orange-500' : 
                'bg-blue-500/20 text-blue-500'
              }`}>
                {severityLabel}
              </span>
              <span className="text-gray-500 text-xs font-medium uppercase tracking-widest">{action.type}</span>
            </div>
            {isApplied && (
              <div className="flex items-center gap-2 px-3 py-1 bg-[#25F4EE]/10 rounded-full text-[10px] font-bold text-[#25F4EE]">
                 <CheckCircle2 size={12} />
                 {t.resolvedIssue} {action.issue}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2 mb-2 text-xs font-bold text-gray-500 uppercase tracking-widest">
            <span className="text-[#25F4EE]">{action.storeName}</span>
            <span>•</span>
            <span>{action.region}</span>
            <span>•</span>
            <span>{action.linkId}</span>
          </div>

          <h4 className="text-lg font-bold mb-2 text-white">{action.issue}</h4>
          <p className="text-gray-400 text-sm mb-4 leading-relaxed" style={{ fontFamily: 'Microsoft YaHei, "Microsoft YaHei", sans-serif' }}>{action.reason}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`p-4 rounded-xl border border-dashed text-xs ${isApplied ? 'bg-black/20 border-white/5 opacity-50' : 'bg-black/40 border-white/10'}`}>
              <p className="text-gray-500 font-bold uppercase mb-2">{t.original}</p>
              <p className="line-through text-gray-400 break-all">{action.originalValue}</p>
            </div>
            <div className={`p-4 rounded-xl border text-xs ${isApplied ? 'bg-[#25F4EE]/10 border-[#25F4EE]/30' : 'bg-[#FE2C55]/5 border-[#FE2C55]/10'}`}>
              <p className={`font-bold uppercase mb-2 ${isApplied ? 'text-[#25F4EE]' : 'text-[#FE2C55]'}`}>{t.recommendation}</p>
              <p className="text-white font-medium break-all">{action.suggestedValue}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between shrink-0">
          <div className="p-4 bg-white/5 border border-white/10 rounded-2xl mb-4 md:mb-0">
             <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">{t.optimizationDetail}</p>
             <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px]">
                   <span className="text-gray-400">{t.seoScore}</span>
                   <span className="text-[#25F4EE] font-bold">+15%</span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                   <span className="text-gray-400">{t.viralPotentialShort}</span>
                   <span className="text-[#FE2C55] font-bold">{t.highPriority}</span>
                </div>
             </div>
          </div>
          
          <button 
            onClick={onApply}
            disabled={isApplied}
            className={`flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold transition-all ${
              isApplied 
                ? 'bg-[#25F4EE]/20 text-[#25F4EE] cursor-default' 
                : 'bg-white text-black hover:bg-[#FE2C55] hover:text-white group'
            }`}
          >
            {isApplied ? (
              <>
                <CheckCircle2 size={20} />
                {t.optimizationApplied}
              </>
            ) : (
              <>
                <Zap size={20} fill={isApplied ? 'none' : 'currentColor'} className="group-hover:animate-pulse" />
                {t.applyFix}
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-8">
      <div className="h-48 bg-white/5 animate-pulse rounded-3xl" />
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-40 bg-white/5 animate-pulse rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
