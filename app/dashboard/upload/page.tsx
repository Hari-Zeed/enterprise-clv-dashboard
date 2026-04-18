'use client';

import { motion as _motion } from 'framer-motion';
const motion = _motion as any;
import { Download } from 'lucide-react';
import { DataUploadZone } from '@/components/dashboard/data-upload-zone';

// Sample CSV data that matches the required schema exactly
const SAMPLE_CSV = `customer_id,recency,frequency,monetary_value,tenure
CUST-001,15,12,4500,24
CUST-002,45,5,1200,8
CUST-003,3,28,9800,36
CUST-004,90,2,300,3
CUST-005,7,18,6700,30
CUST-006,60,3,850,6
CUST-007,22,9,3200,18
CUST-008,5,35,15000,48
CUST-009,120,1,150,2
CUST-010,14,14,5500,26
CUST-011,33,7,2100,12
CUST-012,2,42,18500,60
CUST-013,75,4,700,5
CUST-014,10,20,7200,32
CUST-015,55,6,1600,9
CUST-016,8,25,9100,40
CUST-017,100,2,200,2
CUST-018,18,11,4000,22
CUST-019,40,8,2800,15
CUST-020,6,30,11200,42
CUST-021,28,6,1900,11
CUST-022,50,4,950,7
CUST-023,12,16,5900,28
CUST-024,80,3,600,4
CUST-025,4,22,8300,35`;

function downloadSampleCSV() {
  const blob = new Blob([SAMPLE_CSV], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', 'clv_sample_data.csv');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function UploadPage() {
  return (
    <div className="space-y-6 pb-10">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex items-start justify-between gap-4 flex-wrap"
      >
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Upload Dataset</h1>
          <p className="text-sm text-white/35 mt-1">Train or retrain the XGBoost CLV prediction model</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Download Sample CSV button */}
          <button
            onClick={downloadSampleCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 hover:border-indigo-500/50 transition-all duration-200 text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            Download Sample CSV
          </button>

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
        </div>
      </motion.div>

      {/* Info banner about sample data */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-amber-400/80"
      >
        <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 animate-pulse" />
        <p className="text-xs leading-relaxed">
          <strong className="text-amber-300">New here?</strong> Click <strong>"Download Sample CSV"</strong> above to get a ready-made test file with 25 customers — then upload it to see the full ML pipeline in action.
        </p>
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
