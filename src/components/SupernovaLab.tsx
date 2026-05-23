import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, orderBy, getDocs, limit } from 'firebase/firestore';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';
import { ThesisModal } from './ThesisModal';

export function SupernovaLab() {
  const [theses, setTheses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedThesis, setSelectedThesis] = useState<any | null>(null);

  useEffect(() => {
    async function loadTheses() {
      try {
        const q = query(
          collection(db, 'discovery_theses'),
          where('object_type', '==', 'SUPERNOVA'),
          orderBy('createdAt', 'desc'),
          limit(20)
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTheses(data);
      } catch (error) {
        console.error("Failed to load supernova theses:", error);
      } finally {
        setLoading(false);
      }
    }
    loadTheses();
  }, []);

  return (
    <div className="space-y-6 relative">
      <div className="bg-indigo-900/40 border border-indigo-500/30 rounded-2xl p-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Sparkles className="text-indigo-400" /> Supernova Discovery Lab
        </h2>
        <p className="text-slate-300 mt-2">
          Review vetted Type Ia and core-collapse supernova candidates.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
        </div>
      ) : theses.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
          No supernova discoveries recorded yet.
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
              className="bg-slate-900/50 border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-6 transition-all cursor-pointer shadow-lg hover:shadow-indigo-500/10 group"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">TIC {thesis.tic_id || thesis.ticId}</h3>
                <span className="bg-indigo-500/20 text-indigo-300 text-xs px-2 py-1 rounded font-mono">
                  {((thesis.confidence_score || 0) * 100).toFixed(1)}% CONF
                </span>
              </div>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Peak Time (t0)</span>
                  <span className="text-white font-mono">{thesis.physical_parameters?.peak_time_t0?.value?.toFixed(2) || "N/A"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Stretch (x1)</span>
                  <span className="text-white font-mono">{thesis.physical_parameters?.stretch_x1?.value?.toFixed(3) || "N/A"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Color (c)</span>
                  <span className="text-white font-mono">{thesis.physical_parameters?.color_c?.value?.toFixed(3) || "N/A"}</span>
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
        type="SUPERNOVA" 
      />
    </div>
  );
}
