import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

export default function DocumentDetail({ doc, onClose }) {
  const data = doc.extracted_data || {};

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="w-96 glass rounded-2xl p-6 h-[calc(100vh-12rem)] overflow-y-auto sticky top-24"
    >
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
        <h3 className="text-xl font-bold text-white truncate pr-4">{doc.filename}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-white flex-shrink-0">
          <X size={20} />
        </button>
      </div>

      <div className="space-y-5">
        {Object.entries(data).map(([key, value]) => {
          if (value === null || value === undefined || key === "document_type") return null;
          return (
            <div key={key}>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                {key.replace(/_/g, ' ')}
              </label>
              <div className="bg-surface border border-border rounded-lg px-4 py-3 text-white break-words">
                {String(value)}
              </div>
            </div>
          );
        })}
      </div>
      
      {Object.values(data).every(val => !val) && (
        <p className="text-gray-500 text-center py-8">No specific data fields were extracted.</p>
      )}

      <button className="w-full mt-8 bg-surface border border-border text-white hover:bg-border px-4 py-3 rounded-xl font-medium transition-colors">
        Export as JSON
      </button>
    </motion.div>
  );
}
