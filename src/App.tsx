import React, { useState } from 'react';
import { FirebaseProvider } from './components/FirebaseProvider';
import { Navbar } from './components/Navbar';
import { LiveFeed } from './components/LiveFeed';
import { SupernovaLab } from './components/SupernovaLab';
import { BlackHoleLab } from './components/BlackHoleLab';
import { HighEnergyLab } from './components/HighEnergyLab';
import { RejectionLab } from './components/RejectionLab';
import LandingPage from './components/LandingPage';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Disc, Zap, Activity, ChevronLeft, AlertTriangle } from 'lucide-react';
import { useFirebase } from './components/FirebaseProvider';

type Section = 'hub' | 'feed' | 'supernova' | 'blackhole' | 'highenergy' | 'rejection';

function Dashboard() {
  const { user } = useFirebase();
  const [activeSection, setActiveSection] = useState<Section>('hub');

  const modules = [
    { 
      id: 'feed' as Section, 
      title: 'Automated Live Feed', 
      icon: Activity, 
      color: 'text-sky-500', 
      bg: 'bg-sky-50',
      border: 'hover:border-sky-300',
      shadow: 'hover:shadow-sky-500/20',
      desc: 'Stream live targets into the Python Ensemble Engine.' 
    },
    { 
      id: 'supernova' as Section, 
      title: 'Supernova Lab', 
      icon: Sparkles, 
      color: 'text-indigo-500', 
      bg: 'bg-indigo-50',
      border: 'hover:border-indigo-300',
      shadow: 'hover:shadow-indigo-500/20',
      desc: 'Review vetted Type Ia and core-collapse supernovae candidates.' 
    },
    { 
      id: 'blackhole' as Section, 
      title: 'Black Hole Lab', 
      icon: Disc, 
      color: 'text-fuchsia-500', 
      bg: 'bg-fuchsia-50',
      border: 'hover:border-fuchsia-300',
      shadow: 'hover:shadow-fuchsia-500/20',
      desc: 'Analyze black hole binaries and mass ratio parameters.' 
    },
    { 
      id: 'highenergy' as Section, 
      title: 'High-Energy Lab', 
      icon: Zap, 
      color: 'text-amber-500', 
      bg: 'bg-amber-50',
      border: 'hover:border-amber-300',
      shadow: 'hover:shadow-amber-500/20',
      desc: 'Investigate active galactic nuclei and X-ray binaries.' 
    },
    { 
      id: 'rejection' as Section, 
      title: 'False Positive Archive', 
      icon: AlertTriangle, 
      color: 'text-rose-500', 
      bg: 'bg-rose-50',
      border: 'hover:border-rose-300',
      shadow: 'hover:shadow-rose-500/20',
      desc: 'Review rejected candidates, instrument artifacts, and eclipsing binaries.' 
    }
  ];

  const renderSection = () => {
    switch (activeSection) {
      case 'feed':
        return <LiveFeed />;
      case 'supernova':
        return <SupernovaLab />;
      case 'blackhole':
        return <BlackHoleLab />;
      case 'highenergy':
        return <HighEnergyLab />;
      case 'rejection':
        return <RejectionLab />;
      default:
        return null;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="min-h-screen flex flex-col pt-32 pb-16"
    >
      <Navbar />
      
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 relative z-20"
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] max-w-4xl h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        </motion.div>

        <AnimatePresence mode="wait">
          {activeSection === 'hub' ? (
            <motion.div 
              key="hub"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 max-w-5xl mx-auto"
            >
              {modules.map((m) => (
                <motion.div
                  key={m.id}
                  whileHover={{ y: -8 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveSection(m.id)}
                  className={`cursor-pointer bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 flex flex-col items-center text-center transition-all shadow-[0_10px_40px_-10px_rgba(0,0,0,0.4)] hover:shadow-2xl ${m.border} ${m.shadow}`}
                >
                  <div className={`${m.bg.replace('50', '900/30')} ${m.color} p-6 rounded-3xl mb-8 border border-white/5`}>
                    <m.icon className="w-12 h-12" />
                  </div>
                  <h2 className="text-2xl font-display font-extrabold text-slate-100 mb-4">{m.title}</h2>
                  <p className="text-slate-400 font-medium leading-relaxed">
                    {m.desc}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="section"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              <button 
                onClick={() => setActiveSection('hub')}
                className="flex items-center gap-2 text-slate-400 hover:text-indigo-400 transition-colors font-bold text-sm bg-slate-800 border border-slate-700 px-5 py-2.5 rounded-xl shadow-inner hover:shadow-md"
              >
                <ChevronLeft className="w-5 h-5" /> Back to Hub
              </button>
              
              <div className="mt-4">
                {renderSection()}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </motion.div>
  );
}

export default function App() {
  const [showLanding, setShowLanding] = useState(true);

  return (
    <FirebaseProvider>
      <AnimatePresence mode="wait">
        {showLanding ? (
          <motion.div 
            key="landing" 
            exit={{ opacity: 0, y: -40, scale: 0.98 }} 
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            <LandingPage onEnter={() => setShowLanding(false)} />
          </motion.div>
        ) : (
          <motion.div 
            key="dashboard"
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ duration: 0.5 }}
          >
            <Dashboard />
          </motion.div>
        )}
      </AnimatePresence>
    </FirebaseProvider>
  );
}
