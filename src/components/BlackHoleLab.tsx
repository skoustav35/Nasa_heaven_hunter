import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, orderBy, getDocs, limit } from 'firebase/firestore';
import { motion } from 'motion/react';
import { Disc } from 'lucide-react';
import { ThesisModal } from './ThesisModal';

export function BlackHoleLab() {
  const [theses, setTheses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedThesis, setSelectedThesis] = useState<any | null>(null);

  useEffect(() => {
    async function loadTheses() {
      try {
        const q = query(
          collection(db, 'discovery_theses'),
          where('object_type', '==', 'BLACK_HOLE'),
          orderBy('createdAt', 'desc'),
          limit(20)
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTheses(data);
      } catch (error) {
        console.error("Failed to load black hole theses:", error);
      } finally {
        setLoading(false);
      }
    }
    loadTheses();
  }, []);

  return (
    <div className="space-y-6 relative">
      <div className="bg-fuchsia-900/40 border border-fuchsia-500/30 rounded-2xl p-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Disc className="text-fuchsia-400" /> Black Hole Discovery Lab
        </h2>
        <p className="text-slate-300 mt-2">
          Review vetted Black Hole Binaries and Ellipsoidal Variables.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="w-8 h-8 border-4 border-fuchsia-500/30 border-t-fuchsia-500 rounded-full animate-spin" />
        </div>
      ) : theses.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
          No black hole discoveries recorded yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {theses.map((thesis, i) => (
            <motion.div
              key={thesis.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => setSelectedThesis(thesis)}
              className="bg-slate-900/50 border border-slate-800 hover:border-fuchsia-500/50 rounded-2xl p-6 transition-all cursor-pointer shadow-lg hover:shadow-fuchsia-500/10 group"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-white group-hover:text-fuchsia-400 transition-colors">TIC {thesis.tic_id || thesis.ticId}</h3>
                <span className="bg-fuchsia-500/20 text-fuchsia-300 text-xs px-2 py-1 rounded font-mono">
                  {((thesis.confidence_score || 0) * 100).toFixed(1)}% CONF
                </span>
              </div>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Mass Ratio (q)</span>
                  <span className="text-white font-mono">{thesis.physical_parameters?.mass_ratio_q?.value?.toFixed(3) || "N/A"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Orbital Period (P)</span>
                  <span className="text-white font-mono">{thesis.physical_parameters?.orbital_period?.value?.toFixed(4) || "N/A"} d</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Inclination (i)</span>
                  <span className="text-white font-mono">{thesis.physical_parameters?.inclination_i?.value?.toFixed(1) || "N/A"}°</span>
                </div>
              </div>
              
              <div className="text-xs text-slate-500 line-clamp-2 italic">
                Click to read detailed thesis...
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <ThesisModal 
        thesis={selectedThesis} 
        onClose={() => setSelectedThesis(null)} 
        type="BLACK_HOLE" 
      />
    </div>
  );
}
