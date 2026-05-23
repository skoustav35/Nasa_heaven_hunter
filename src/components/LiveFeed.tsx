import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, Play, Square, Satellite } from 'lucide-react';

interface Prediction {
  tic_id: number;
  object_type: string;
  consensus_classification: string;
  confidence: number;
  physical_parameters: any;
}

export function LiveFeed() {
  const [isActive, setIsActive] = useState(false);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const isHuntingRef = useRef(false);

  const startFeed = () => {
    setIsActive(true);
    isHuntingRef.current = true;
    pollTarget();
  };

  const stopFeed = () => {
    setIsActive(false);
    isHuntingRef.current = false;
  };

  const pollTarget = async () => {
    if (!isHuntingRef.current) return;
    
    // Generate a random TIC ID for streaming demonstration
    const randomTic = Math.floor(Math.random() * 900000000) + 100000000;
    
    try {
      // Fast API endpoint
      const response = await fetch('http://127.0.0.1:8000/ensemble-analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ tic_id: randomTic })
      });
      
      if (response.ok) {
        const result = await response.json();
        setPredictions(prev => [result, ...prev].slice(0, 10)); // keep last 10
      }
    } catch (e) {
      console.error("Feed error:", e);
    }
    
    if (isHuntingRef.current) {
      setTimeout(pollTarget, 3000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Activity className="text-sky-400" /> Automated Discovery Feed
          </h2>
          <p className="text-slate-400 mt-1">
            Continuously streams targets to the Python FastAPI Ensemble Engine.
          </p>
        </div>
        
        <button
          onClick={isActive ? stopFeed : startFeed}
          className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${
            isActive 
              ? 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border border-rose-500/50' 
              : 'bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 border border-sky-500/50'
          }`}
        >
          {isActive ? (
            <><Square className="w-5 h-5" fill="currentColor" /> Stop Stream</>
          ) : (
            <><Play className="w-5 h-5" fill="currentColor" /> Start Stream</>
          )}
        </button>
      </div>

      <div className="grid gap-4">
        <AnimatePresence>
          {predictions.map((pred) => {
            let color = 'border-slate-700';
            let bg = 'bg-slate-900';
            if (pred.object_type === 'SUPERNOVA') { color = 'border-indigo-500'; bg = 'bg-indigo-900/10'; }
            if (pred.object_type === 'BLACK_HOLE') { color = 'border-fuchsia-500'; bg = 'bg-fuchsia-900/10'; }
            if (pred.object_type === 'HIGH_ENERGY') { color = 'border-amber-500'; bg = 'bg-amber-900/10'; }

            return (
              <motion.div
                key={`${pred.tic_id}-${Date.now()}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`border ${color} ${bg} rounded-xl p-5 shadow-lg flex flex-col md:flex-row justify-between gap-4 items-center`}
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-slate-800 rounded-lg">
                    <Satellite className="w-6 h-6 text-slate-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">TIC {pred.tic_id}</h3>
                    <p className="text-slate-400 text-sm">{pred.consensus_classification}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  {Object.entries(pred.physical_parameters).slice(0, 2).map(([key, param]: any) => (
                    <div key={key} className="bg-slate-800/50 px-3 py-1.5 rounded text-sm border border-slate-700">
                      <span className="text-slate-400 text-xs block uppercase">{key.replace(/_/g, ' ')}</span>
                      <span className="text-white font-mono">{param.value?.toFixed(2)} {param.unit}</span>
                    </div>
                  ))}
                  <div className="bg-slate-800/50 px-3 py-1.5 rounded text-sm border border-slate-700 flex flex-col justify-center">
                    <span className="text-emerald-400 font-mono font-bold">
                      {(pred.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
          {predictions.length === 0 && isActive && (
            <div className="p-12 text-center text-slate-500 animate-pulse">
              Connecting to FastAPI and fetching data...
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
