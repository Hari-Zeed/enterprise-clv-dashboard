'use client';

import { motion } from 'framer-motion';
import { Upload, Database } from 'lucide-react';
import { DataUploadZone } from '@/components/dashboard/data-upload-zone';

export default function UploadPage() {
  return (
    <div className="space-y-6 pb-10">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex items-start justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Upload Dataset</h1>
          <p className="text-sm text-white/35 mt-1">Train or retrain the XGBoost CLV prediction model</p>
        </div>

        {/* Pipeline steps indicator */}
        <div className="hidden md:flex items-center gap-2 text-xs text-white/30">
          {['Upload CSV', 'Validate', 'Train Model', 'Active'].map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              {i > 0 && <div className="w-6 h-px bg-white/10" />}
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-full border border-white/15 flex items-center justify-center text-[9px]">
                  {i + 1}
                </div>
                <span>{step}</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <DataUploadZone />
      </motion.div>
    </div>
  );
}
