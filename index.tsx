import React, { useState, useEffect, useContext, createContext } from "react";
import { createRoot } from "react-dom/client";
import { motion, AnimatePresence } from "framer-motion";

// --- Utils ---

const scrollToSection = (e: React.MouseEvent, id: string) => {
  e.preventDefault();
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: "smooth" });
  }
};

// --- Auth Context ---

type User = {
    email: string;
    name?: string;
};

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string) => void;
    signup: (email: string) => void;
    logout: () => void;
    showAuthModal: boolean;
    setShowAuthModal: (show: boolean) => void;
    authView: 'login' | 'signup';
    setAuthView: (view: 'login' | 'signup') => void;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    isLoading: false,
    login: () => {},
    signup: () => {},
    logout: () => {},
    showAuthModal: false,
    setShowAuthModal: () => {},
    authView: 'signup',
    setAuthView: () => {},
});

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authView, setAuthView] = useState<'login' | 'signup'>('signup');

    // Simulate session check on mount
    useEffect(() => {
        const storedUser = localStorage.getItem('viralAuditUser');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setIsLoading(false);
    }, []);

    const login = (email: string) => {
        const newUser = { email };
        setUser(newUser);
        localStorage.setItem('viralAuditUser', JSON.stringify(newUser));
        setShowAuthModal(false);
    };

    const signup = (email: string) => {
        // In a real app, this would create the user in DB
        const newUser = { email };
        setUser(newUser);
        localStorage.setItem('viralAuditUser', JSON.stringify(newUser));
        setShowAuthModal(false);
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('viralAuditUser');
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            isLoading, 
            login, 
            signup, 
            logout,
            showAuthModal,
            setShowAuthModal,
            authView,
            setAuthView
        }}>
            {children}
        </AuthContext.Provider>
    );
};

const useAuth = () => useContext(AuthContext);

// --- Components ---

const AuthModal = () => {
    const { showAuthModal, setShowAuthModal, login, signup, authView, setAuthView } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    if (!showAuthModal) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (authView === 'login') {
            login(email);
        } else {
            signup(email);
        }
        setLoading(false);
        setEmail("");
        setPassword("");
    };

    return (
        <AnimatePresence>
            {showAuthModal && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowAuthModal(false)}
                        className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[200] cursor-pointer"
                    />
                    <div className="fixed inset-0 z-[201] flex items-center justify-center pointer-events-none p-4">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-[#111] w-full max-w-md rounded-2xl border border-white/10 shadow-2xl pointer-events-auto overflow-hidden"
                        >
                            {/* Header */}
                            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#151515]">
                                <h3 className="font-heading font-bold text-xl">
                                    {authView === 'login' ? 'Welcome Back' : 'Create Account'}
                                </h3>
                                <button 
                                    onClick={() => setShowAuthModal(false)}
                                    className="text-gray-500 hover:text-white transition-colors"
                                >
                                    <i className="fa-solid fa-xmark text-lg"></i>
                                </button>
                            </div>

                            {/* Body */}
                            <div className="p-8">
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-mono text-gray-500 uppercase mb-2">Email Address</label>
                                        <input 
                                            type="email" 
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors"
                                            placeholder="name@company.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-mono text-gray-500 uppercase mb-2">Password</label>
                                        <input 
                                            type="password" 
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors"
                                            placeholder="••••••••"
                                        />
                                    </div>

                                    <button 
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-white text-black font-bold py-3.5 rounded-lg hover:bg-gray-200 transition-all mt-4 flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            <i className="fa-solid fa-circle-notch fa-spin"></i>
                                        ) : (
                                            authView === 'login' ? 'Sign In' : 'Create Free Account'
                                        )}
                                    </button>
                                </form>

                                <div className="mt-6 text-center text-sm text-gray-500">
                                    {authView === 'login' ? (
                                        <>
                                            Don't have an account?{' '}
                                            <button onClick={() => setAuthView('signup')} className="text-white hover:underline font-medium">
                                                Sign up
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            Already have an account?{' '}
                                            <button onClick={() => setAuthView('login')} className="text-white hover:underline font-medium">
                                                Sign in
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};

const VideoModal = ({ onClose }: { onClose: () => void }) => {
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [onClose]);

    return (
        <>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] cursor-pointer"
            />
            <div className="fixed inset-0 z-[101] flex items-center justify-center pointer-events-none p-4 md:p-10">
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="relative w-full max-w-7xl aspect-video bg-black rounded-2xl border border-white/10 shadow-2xl overflow-hidden pointer-events-auto flex items-center justify-center"
                >
                    <button 
                        onClick={onClose} 
                        className="absolute top-4 right-4 z-20 w-10 h-10 bg-black/50 hover:bg-black/80 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-colors border border-white/10"
                    >
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                    
                    <video 
                        className="w-full h-full object-contain bg-black"
                        controls
                        autoPlay
                        playsInline
                    >
                        <source src="https://videos.pexels.com/video-files/3129671/3129671-uhd_2560_1440_30fps.mp4" type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                    
                </motion.div>
            </div>
        </>
    );
};

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const { user, logout, setShowAuthModal, setAuthView } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleInstallClick = (e: React.MouseEvent) => {
      e.preventDefault();
      if (user) {
          // If logged in, go to install link
          window.open("https://google.com", "_blank");
      } else {
          // If not, open signup
          setAuthView('signup');
          setShowAuthModal(true);
      }
  };

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-black/80 backdrop-blur-xl border-b border-white/10 py-3"
          : "bg-transparent py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-10">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2 z-10 group" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                 <i className="fa-solid fa-bolt text-black text-sm"></i>
            </div>
            <span className="font-heading font-bold text-xl tracking-tight text-white group-hover:text-gray-200 transition-colors">ViralAudit</span>
        </a>

        {/* Centered Links */}
        <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 gap-8 text-sm font-medium text-gray-400">
          <a href="#features" onClick={(e) => scrollToSection(e, "features")} className="hover:text-white transition-colors">Features</a>
          <a href="#how-it-works" onClick={(e) => scrollToSection(e, "how-it-works")} className="hover:text-white transition-colors">How it Works</a>
          <a href="#pricing" onClick={(e) => scrollToSection(e, "pricing")} className="hover:text-white transition-colors">Pricing</a>
        </div>

        {/* Right Button / Account */}
        <div className="z-10 flex items-center gap-4">
          {user ? (
             <>
                 <span className="text-xs text-gray-400 hidden sm:block">{user.email}</span>
                 <button 
                    onClick={logout}
                    className="text-sm font-medium text-white hover:text-gray-300 transition-colors"
                 >
                    Logout
                 </button>
                 <a
                    href="#"
                    onClick={handleInstallClick}
                    className="bg-white text-black px-4 py-2 rounded-lg font-bold text-xs hover:bg-gray-200 transition-all"
                  >
                    Download
                  </a>
             </>
          ) : (
             <>
                <button 
                    onClick={() => { setAuthView('login'); setShowAuthModal(true); }}
                    className="text-sm font-medium text-gray-300 hover:text-white transition-colors hidden sm:block"
                >
                    Login
                </button>
                <a
                    href="#"
                    onClick={handleInstallClick}
                    className="bg-white text-black px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-gray-200 transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)]"
                >
                    Install Extension
                </a>
             </>
          )}
        </div>
      </div>
    </nav>
  );
};

const Background = () => {
    return (
        <div className="fixed inset-0 z-0 pointer-events-none">
            {/* Dark Noise Texture */}
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
            
            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
            
            {/* Ambient Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-900/20 blur-[120px] rounded-full"></div>
            <div className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] bg-blue-900/10 blur-[120px] rounded-full"></div>
            <div className="absolute bottom-[-10%] left-[20%] w-[500px] h-[500px] bg-emerald-900/10 blur-[120px] rounded-full"></div>
        </div>
    )
}

const DashboardMockup = () => {
  return (
    <div className="relative w-full max-w-6xl mx-auto perspective-1000 mt-12">
        {/* Glow Effect behind mockup */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-indigo-500/10 blur-[100px] rounded-full -z-10"></div>

        {/* Browser Window Frame */}
        <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="bg-[#1c1c1d] rounded-xl border border-white/10 shadow-2xl overflow-hidden relative"
        >
            {/* Browser Header */}
            <div className="h-10 bg-[#2d2d2d] border-b border-white/5 flex items-center px-4 gap-2">
                <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
                </div>
                <div className="flex-1 flex justify-center">
                    <div className="bg-[#1c1c1d] px-3 py-1 rounded-md text-[10px] text-gray-400 border border-white/5 font-mono flex items-center gap-2 w-64 justify-center">
                        <i className="fa-solid fa-lock text-[8px]"></i>
                        adsmanager.facebook.com
                    </div>
                </div>
            </div>

            {/* Browser Content - Meta Ads Manager Replica */}
            <div className="relative h-[650px] bg-[#18191a] overflow-hidden flex font-sans text-white">
                
                {/* 1. Left Sidebar (Global Nav) */}
                <div className="w-[60px] border-r border-[#2f3031] flex flex-col items-center py-4 gap-6 bg-[#242526] shrink-0 z-10">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs">f</div>
                    
                    <div className="flex flex-col gap-6 mt-4 w-full items-center">
                        <div className="w-9 h-9 rounded-lg hover:bg-white/10 flex items-center justify-center cursor-pointer text-gray-400 hover:text-white transition-colors">
                             <i className="fa-solid fa-house text-lg"></i>
                        </div>
                        <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center cursor-pointer text-white relative">
                             <i className="fa-solid fa-layer-group text-lg"></i>
                             <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                        </div>
                         <div className="w-9 h-9 rounded-lg hover:bg-white/10 flex items-center justify-center cursor-pointer text-gray-400 hover:text-white transition-colors">
                             <i className="fa-solid fa-chart-simple text-lg"></i>
                        </div>
                         <div className="w-9 h-9 rounded-lg hover:bg-white/10 flex items-center justify-center cursor-pointer text-gray-400 hover:text-white transition-colors">
                             <i className="fa-solid fa-gear text-lg"></i>
                        </div>
                    </div>
                    
                    <div className="mt-auto mb-4 w-8 h-8 rounded-full bg-gray-600"></div>
                </div>

                {/* 2. Secondary Sidebar (Campaign Structure) */}
                <div className="w-[240px] border-r border-[#2f3031] bg-[#1c1c1d] flex flex-col shrink-0 hidden md:flex opacity-40 blur-[1px]">
                     <div className="p-4 border-b border-[#2f3031]">
                          <div className="h-6 w-32 bg-[#3a3b3c] rounded mb-2"></div>
                          <div className="h-4 w-20 bg-[#3a3b3c] rounded opacity-60"></div>
                     </div>
                     <div className="p-2 space-y-1">
                          {[1,2,3,4,5,6].map(i => (
                              <div key={i} className={`p-2 rounded flex items-center gap-3 ${i===2 ? 'bg-[#2d88ff]/20' : ''}`}>
                                  <div className="w-4 h-4 rounded bg-[#3a3b3c]"></div>
                                  <div className="h-2 w-24 bg-[#3a3b3c] rounded"></div>
                              </div>
                          ))}
                     </div>
                </div>

                {/* 3. Main Content Area (Ad Preview/Edit) */}
                <div className="flex-1 flex flex-col bg-[#18191a] relative">
                    
                    {/* Top Toolbar */}
                    <div className="h-14 border-b border-[#2f3031] flex items-center justify-between px-6 bg-[#242526]">
                        <div className="flex items-center gap-4 text-sm text-gray-300">
                             <span className="text-gray-500">Campaigns</span>
                             <i className="fa-solid fa-chevron-right text-[10px] text-gray-600"></i>
                             <span className="text-gray-500">Ad Set</span>
                             <i className="fa-solid fa-chevron-right text-[10px] text-gray-600"></i>
                             <span className="text-white font-medium">New Video Ad</span>
                             <span className="ml-2 px-2 py-0.5 bg-gray-700 rounded text-[10px]">Draft</span>
                        </div>
                        <div className="flex gap-3">
                             <div className="px-4 py-1.5 bg-[#2f3031] rounded-md text-sm text-white">Discard</div>
                             <div className="px-4 py-1.5 bg-[#2d88ff] rounded-md text-sm text-white font-medium">Publish</div>
                        </div>
                    </div>

                    {/* Preview Canvas */}
                    <div className="flex-1 p-8 flex justify-center overflow-hidden relative">
                         {/* Controls Top */}
                         <div className="absolute top-4 left-0 right-0 flex justify-center gap-6 text-sm text-gray-400">
                              <span className="text-[#2d88ff] border-b-2 border-[#2d88ff] pb-1 cursor-pointer">Facebook Feed</span>
                              <span className="cursor-pointer hover:text-gray-300">Instagram Feed</span>
                              <span className="cursor-pointer hover:text-gray-300">Stories & Reels</span>
                         </div>

                         {/* The Ad Card */}
                         <div className="mt-8 w-[500px] bg-[#242526] rounded-lg border border-[#2f3031] p-4 shadow-sm opacity-50 blur-[1px]">
                              {/* Header */}
                              <div className="flex items-center gap-3 mb-3">
                                   <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600"></div>
                                   <div>
                                        <div className="h-3 w-32 bg-[#3a3b3c] rounded mb-1"></div>
                                        <div className="flex items-center gap-1">
                                             <div className="h-2 w-16 bg-[#3a3b3c] rounded"></div>
                                             <i className="fa-solid fa-earth-americas text-[10px] text-gray-500"></i>
                                        </div>
                                   </div>
                                   <i className="fa-solid fa-ellipsis text-gray-500 ml-auto"></i>
                              </div>

                              {/* Primary Text */}
                              <div className="space-y-2 mb-3">
                                   <div className="h-2 w-full bg-[#3a3b3c] rounded"></div>
                                   <div className="h-2 w-[90%] bg-[#3a3b3c] rounded"></div>
                                   <div className="h-2 w-[60%] bg-[#3a3b3c] rounded"></div>
                              </div>

                              {/* Media (Video) */}
                              <div className="aspect-[4/5] w-full bg-black rounded border border-[#2f3031] relative flex items-center justify-center overflow-hidden">
                                   <div className="absolute inset-0 bg-gradient-to-tr from-gray-900 to-gray-800"></div>
                                   <i className="fa-solid fa-play text-4xl text-white/10"></i>
                              </div>

                              {/* CTA Bar */}
                              <div className="bg-[#2f3031] p-3 flex justify-between items-center mt-[-4px] rounded-b-lg border-x border-b border-[#2f3031]">
                                   <div>
                                        <div className="h-2 w-24 bg-[#3a3b3c] rounded mb-1"></div>
                                        <div className="h-2 w-48 bg-[#3a3b3c] rounded"></div>
                                   </div>
                                   <div className="px-4 py-2 bg-[#3a3b3c] rounded text-xs text-gray-400 font-semibold border border-white/5">Learn More</div>
                              </div>

                              {/* Social Proof */}
                              <div className="flex justify-between items-center mt-3 px-1">
                                   <div className="flex items-center gap-1">
                                        <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-[8px] text-white"><i className="fa-solid fa-thumbs-up"></i></div>
                                        <div className="h-2 w-8 bg-[#3a3b3c] rounded"></div>
                                   </div>
                                   <div className="flex gap-3">
                                        <div className="h-2 w-12 bg-[#3a3b3c] rounded"></div>
                                        <div className="h-2 w-12 bg-[#3a3b3c] rounded"></div>
                                   </div>
                              </div>
                         </div>
                    </div>
                </div>

                {/* ViralAudit Extension Popup (Overlay) */}
                <div className="absolute top-1/2 -translate-y-1/2 right-12 w-[400px] bg-[#111] rounded-xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col z-20 overflow-hidden font-inter max-h-[85%]">
                    
                    {/* Header */}
                    <div className="px-5 py-4 border-b border-white/5 flex justify-between items-center bg-[#111111] shrink-0">
                         <div className="font-bold text-lg tracking-tight">
                             <span className="text-[#ff2e63]">ViralAudit</span> <span className="text-[#08d9d6]">AI</span>
                         </div>
                         <button className="text-gray-500 hover:text-white transition-colors">
                             <i className="fa-solid fa-xmark"></i>
                         </button>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-5 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
                         
                         {/* Score Box */}
                         <div className="bg-[#181818] rounded-xl p-5 border border-white/5 flex items-center gap-5 mb-6 relative overflow-hidden">
                             <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
                                  <svg className="w-full h-full -rotate-90" viewBox="0 0 60 60">
                                       <circle cx="30" cy="30" r="26" stroke="#333" strokeWidth="4" fill="transparent" />
                                       <circle 
                                            cx="30" cy="30" r="26" 
                                            stroke="#ff2e63" strokeWidth="4" 
                                            fill="transparent" 
                                            strokeDasharray="163.36" 
                                            strokeDashoffset="114.35" 
                                            strokeLinecap="round" 
                                       />
                                  </svg>
                                  <span className="absolute text-white font-bold text-xl">3</span>
                             </div>
                             <div>
                                  <div className="text-white font-bold text-base mb-1">Viral Potential Score</div>
                                  <div className="text-gray-500 text-[11px] leading-tight">AI Analysis based on hook, pacing & copy.</div>
                             </div>
                         </div>

                         {/* Text Content */}
                         <div className="space-y-6 text-[13px] leading-relaxed text-gray-300">
                              <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">#SCORE: 3/10</div>

                              {/* HOOK */}
                              <div>
                                  <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-2">#HOOK</div>
                                  <p className="mb-3"><strong className="text-white font-semibold">The Problem:</strong> At 0:00, the opening is a slow, generic setup. "After baby comes" is a weak, drawn-out qualifier. The visual of a vaguely stressed man and a woman reading is not a strong visual representation of a "hot house" or "harder sleep." It doesn't grab attention. It assumes the audience knows the problem without showing it. The lighting is warm, but it doesn't convey discomfort or heat.</p>
                                  <p className="mb-3"><strong className="text-white font-semibold">The Visual:</strong> Muted lighting lacks impact. It's a typical bedroom scene, not a scroll-stopper. There's no immediate visual tension or unique element to differentiate it from countless other bedroom ads.</p>
                                  <p><strong className="text-white font-semibold">The Fix:</strong> Cut the fat. Start with a direct visual of the problem: show immediate discomfort, sweat, tossing, turning. "Is your sleep stolen by night sweats?" paired with a visual of someone visibly struggling in bed. Or a stark contrast: "HOT nights?" immediately followed by the solution. Get to the point in under 1 second.</p>
                              </div>

                              {/* BODY */}
                              <div>
                                  <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-2">#BODY</div>
                                  <p className="mb-2"><strong className="text-white font-semibold">Pacing/Visuals:</strong></p>
                                  <ul className="space-y-2 mb-3 pl-1">
                                      <li>- At 0:03, the pacing drops hard with the slow-motion reveal of a comforter. "WE GET IT" as a text overlay is useless filler; don't tell me you get it, *show* me you solved it.</li>
                                      <li>- From 0:05-0:09, the slow-motion shots of bedding and pillows are pretty but don't convey "cool" or "breathable" effectively. They're generic product shots. There's no *demonstration* of the unique benefit. This is a product showcase, not a problem solver.</li>
                                      <li>- At 0:09, the transition to the sleeping couple is a standard, uninspired "happy ending" shot. It lacks punch and doesn't explicitly connect to *how* the bedding achieved this peaceful sleep beyond the voiceover. The crib is a nice touch for context but doesn't elevate the visual impact.</li>
                                  </ul>
                                  <p><strong className="text-white font-semibold">The Fix:</strong> Speed up. Drastically. Cut the "WE GET IT" entirely. Show, don't tell. Visually demonstrate the cooling effect: show sweat evaporating, a "cool touch" test, a thermometer dropping, or a stark before/after of uncomfortable vs. serene sleep *directly attributed* to the product's function. The product shots need to highlight the *texture* or *material science* that makes it cool, not just look fluffy.</p>
                              </div>

                               {/* AUDIO */}
                              <div>
                                  <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-2">#AUDIO</div>
                                  <p><strong className="text-white font-semibold">Copyright claim:</strong> No obvious copyright claim risk from the background sounds. The voiceover is clear. However, bland, forgettable audio *will* affect CPM by reducing engagement and watch time. The audio isn't memorable or impactful enough to drive attention.</p>
                              </div>
                              
                              {/* SCRIPT */}
                              <div>
                                  <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-2">#SCRIPT</div>
                                  <p><strong className="text-white font-semibold">The Problem:</strong> The script is too conversational, too soft, and lacks urgency. It wastes precious seconds establishing a problem that could be shown in a fraction of the time. "After baby comes, the house gets hotter. And sleep gets harder" is vague and slow. "We get it" is completely unnecessary. "Helps stop the night sweats" is weak; "stops" is stronger. The entire script lacks a clear, commanding call to action or a strong unique selling proposition that screams "buy this now." It's...</p>
                              </div>
                         </div>
                    </div>

                    {/* Footer */}
                    <div className="p-5 border-t border-white/5 bg-[#111111] shrink-0">
                        <button className="w-full bg-white text-black py-3 rounded-lg font-bold text-sm hover:bg-gray-200 transition-colors">
                            Copy Report
                        </button>
                    </div>

                </div>
            </div>
        </motion.div>
    </div>
  );
};

const Hero = () => {
  const [videoOpen, setVideoOpen] = useState(false);
  const { user, setShowAuthModal, setAuthView } = useAuth();

  const handleInstallClick = (e: React.MouseEvent) => {
      e.preventDefault();
      if (user) {
          // If logged in, go to install link
          window.open("https://google.com", "_blank");
      } else {
          // If not, open signup
          setAuthView('signup');
          setShowAuthModal(true);
      }
  };

  return (
    <section className="relative pt-32 pb-12 px-6 md:pt-48 md:pb-24 overflow-hidden">
      
      <div className="max-w-7xl mx-auto text-center mb-10 relative z-10">
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs font-medium text-gray-300 mb-8 backdrop-blur-sm cursor-pointer hover:bg-white/10 transition-colors"
        >
            <span className="bg-gradient-to-r from-pink-500 to-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-lg">NEW</span>
            <span className="text-gray-300">Competitor Benchmarking Engine</span>
        </motion.div>

        <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold font-heading tracking-tight mb-6 leading-[1.1]"
        >
          Stop Guessing.
Audit Your Ads Before You Spend.
        </motion.h1>
        
        <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Stop burning budget on weak creatives. The ViralAudit extension analyzes your hooks, pacing, and copy instantly while you browse Facebook Ads Manager.
        </motion.p>
        
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row justify-center gap-4"
        >
            <a 
                href="#" 
                onClick={handleInstallClick}
                className="bg-white text-black px-8 py-4 rounded-xl font-bold text-lg hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.3)]"
            >
                {user ? 'Download Extension' : 'Install Free Extension'}
            </a>
            <button 
                onClick={() => setVideoOpen(true)}
                className="px-8 py-4 rounded-xl border border-white/10 hover:bg-white/5 transition-colors font-medium flex items-center justify-center gap-2 group cursor-pointer backdrop-blur-sm bg-black/30"
            >
                <i className="fa-solid fa-play text-xs group-hover:text-[#08d9d6] transition-colors"></i> Watch Demo
            </button>
        </motion.div>
      </div>

      <motion.div
        id="how-it-works"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.8 }}
        className="scroll-mt-32"
      >
        <DashboardMockup />
      </motion.div>

      {/* Trusted By */}
      <div className="mt-24 text-center">
        <p className="text-xs font-mono text-gray-600 uppercase tracking-widest mb-6">Trusted by media buyers at</p>
        <div className="flex flex-wrap justify-center gap-12 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Simple Text Logos for Demo */}
            <span className="text-xl font-bold font-heading">AGENCY<span className="font-light">ONE</span></span>
            <span className="text-xl font-bold font-heading tracking-tight">SCALE<span className="text-emerald-500">.IO</span></span>
            <span className="text-xl font-bold font-heading italic">Dropify</span>
            <span className="text-xl font-bold font-heading">MEDIA<span className="border-b-2 border-white">LAB</span></span>
        </div>
      </div>
      
      <AnimatePresence>
        {videoOpen && <VideoModal onClose={() => setVideoOpen(false)} />}
      </AnimatePresence>
    </section>
  );
};

const FeatureCard = ({ icon, title, desc, delay }) => (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay }}
        whileHover={{ y: -5 }}
        className="p-8 rounded-2xl bg-[#0a0a0a]/80 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-colors group"
    >
        <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-6 text-xl group-hover:bg-white group-hover:text-black transition-all duration-300">
            <i className={icon}></i>
        </div>
        <h3 className="text-xl font-bold mb-3 font-heading">{title}</h3>
        <p className="text-gray-400 leading-relaxed text-sm">{desc}</p>
    </motion.div>
);

const Features = () => {
    return (
        <section id="features" className="py-24 relative z-10 scroll-mt-24">
            <div className="max-w-6xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold font-heading mb-6">Audits that feel like magic.</h2>
                    <p className="text-gray-400 max-w-2xl mx-auto">We don't just tell you "good" or "bad". We analyze every frame, second, and word to tell you exactly how to fix it.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    <FeatureCard 
                        icon="fa-solid fa-list-check"
                        title="Frame-by-Frame Audit"
                        desc="Detailed breakdown of your hook, body, and CTA. We pinpoint the exact second you lose the viewer's attention."
                        delay={0.1}
                    />
                    <FeatureCard 
                        icon="fa-solid fa-wand-magic-sparkles"
                        title="Actionable Fixes"
                        desc="Don't just get a score. Get a 'Fix List'—cut the fat, speed up pacing, or rewrite the hook entirely."
                        delay={0.2}
                    />
                    <FeatureCard 
                        icon="fa-solid fa-shield-halved"
                        title="Policy & Audio Check"
                        desc="Scan for copyright claims on audio tracks and flag potential ad policy violations before you publish."
                        delay={0.3}
                    />
                </div>
            </div>
        </section>
    );
};

const PricingCard = ({ plan, price, description, features, isPro, delay, checkoutUrl }) => {
    const { user, setShowAuthModal, setAuthView } = useAuth();
    
    const handleCheckout = (e: React.MouseEvent) => {
        if (!user) {
            e.preventDefault();
            setAuthView('signup');
            setShowAuthModal(true);
        }
        // If user is logged in, the <a> tag default behavior works (opens checkoutUrl)
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay }}
            className={`relative p-8 rounded-2xl border flex flex-col h-full ${isPro ? 'bg-[#0f0f0f]/90 backdrop-blur-md border-white/30 shadow-[0_0_30px_rgba(255,255,255,0.05)]' : 'bg-[#0a0a0a]/80 backdrop-blur-sm border-white/10'}`}
        >
            {isPro && (
                <div className="absolute top-0 right-0 bg-white text-black text-[10px] font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl">
                    RECOMMENDED
                </div>
            )}
            <div className="mb-8">
                <h3 className="text-lg font-bold font-heading mb-2">{plan}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-4xl font-bold">{price}</span>
                    <span className="text-sm text-gray-500">/mo</span>
                </div>
                <p className="text-sm text-gray-400">{description}</p>
            </div>
            
            <ul className="space-y-4 mb-8 flex-1">
                {features.map((feature, i) => (
                    <li key={i} className={`flex items-center gap-3 text-sm ${feature.included ? 'text-gray-200' : 'text-gray-600'}`}>
                        <i className={`fa-solid ${feature.included ? 'fa-check text-emerald-500' : 'fa-xmark text-gray-700'}`}></i>
                        {feature.text}
                    </li>
                ))}
            </ul>

            <a 
                href={checkoutUrl}
                target="_blank" 
                rel="noopener noreferrer"
                onClick={handleCheckout}
                className={`block w-full text-center py-4 rounded-xl font-bold text-sm transition-all ${
                isPro 
                ? 'bg-white text-black hover:bg-gray-200 hover:scale-[1.02]' 
                : 'border border-white/20 text-white hover:bg-white/5'
            }`}>
                {isPro ? 'Start Pro Trial' : 'Get Started'}
            </a>
        </motion.div>
    );
};

const Pricing = () => {
    return (
        <section id="pricing" className="py-24 border-t border-white/5 relative z-10 scroll-mt-24">
            <div className="max-w-5xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold font-heading mb-6">Pay for performance.</h2>
                    <p className="text-gray-400">Simple pricing that scales with your ad spend.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
                    <PricingCard 
                        plan="Starter"
                        price="£29"
                        description="For solo media buyers testing waters."
                        delay={0.1}
                        isPro={false}
                        checkoutUrl="https://example.com/checkout-starter"
                        features={[
                            { text: "50 Video Audits / Month", included: true },
                            { text: "Deep Think Analysis", included: true },
                            { text: "Detailed Fix Reports", included: true },
                            { text: "Viral Script Rewrites", included: false },
                            { text: "Policy Violation Check", included: false },
                            { text: "Competitor Benchmarking", included: false },
                        ]}
                    />
                    <PricingCard 
                        plan="Professional"
                        price="£49"
                        description="For agencies and scaling brands."
                        delay={0.2}
                        isPro={true}
                        checkoutUrl="https://example.com/checkout-pro"
                        features={[
                            { text: "500 Video Audits / Month", included: true },
                            { text: "Deep Think Analysis", included: true },
                            { text: "Detailed Fix Reports", included: true },
                            { text: "Viral Script Rewrites", included: true },
                            { text: "Policy Violation Check", included: true },
                            { text: "Competitor Benchmarking", included: true },
                        ]}
                    />
                </div>
                
                <div className="mt-12 text-center">
                    <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
                        <i className="fa-solid fa-lock text-xs"></i> 
                        Secure payment processing via Lemon Squeezy. Cancel anytime.
                    </p>
                </div>
            </div>
        </section>
    );
};

const Footer = () => (
    <footer className="py-12 border-t border-white/5 bg-[#050505] text-xs text-gray-600 relative z-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
                 <div className="w-6 h-6 bg-white/10 rounded flex items-center justify-center">
                     <i className="fa-solid fa-bolt text-gray-400 text-[10px]"></i>
                 </div>
                 <span className="font-bold text-gray-400">ViralAudit</span>
            </div>
            <div className="flex gap-8">
                <a href="#features" onClick={(e) => scrollToSection(e, "features")} className="hover:text-white transition-colors">Features</a>
                <a href="#how-it-works" onClick={(e) => scrollToSection(e, "how-it-works")} className="hover:text-white transition-colors">How it Works</a>
                <a href="#pricing" onClick={(e) => scrollToSection(e, "pricing")} className="hover:text-white transition-colors">Pricing</a>
                <a href="#" className="hover:text-white transition-colors">Login</a>
            </div>
            <div>&copy; 2025 ViralAudit Inc.</div>
        </div>
    </footer>
);

const App = () => {
  return (
    <AuthProvider>
        <div className="min-h-screen bg-black text-white selection:bg-pink-500/30 selection:text-white overflow-hidden">
        <Background />
        <Navbar />
        <Hero />
        <Features />
        <Pricing />
        <Footer />
        <AuthModal />
        </div>
    </AuthProvider>
  );
};

const container = document.getElementById("root");
if (container) {
    const root = createRoot(container);
    root.render(<App />);
}

export default App;
