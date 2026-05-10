import React from 'react';
import { FileText, Calendar, Building } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DocumentCard({ data, onClick }) {
  const extracted = data.extracted_data || {};
  
  // Format Type dynamically
  const typeStr = extracted.document_type || extracted.type || "Unknown Document";
  
  // Find name dynamically (since the AI generates keys based on doc type)
  const nameStr = extracted.customer_name || extracted.borrower_name || extracted.name || extracted.account_holder || extracted.account_holder_name || extracted.full_name || "Unknown Customer";

  // Find some amount to show on the card
  const amountStr = extracted.loan_amount || extracted.due_amount || extracted.balance || extracted.total_amount;

  return (
    <motion.div 
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="glass p-5 rounded-2xl cursor-pointer transition-colors hover:bg-surface/80 group"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="bg-primary/20 p-3 rounded-lg text-primary">
          <FileText size={24} />
        </div>
        <span className="text-xs font-semibold px-2 py-1 bg-surface border border-border rounded-md uppercase tracking-wider text-gray-300">
          {typeStr.replace('_', ' ')}
        </span>
      </div>

      <h3 className="text-lg font-bold text-white mb-1 truncate">{nameStr}</h3>
      <p className="text-sm text-gray-400 truncate mb-4">{data.filename}</p>

      <div className="flex items-center gap-4 text-xs text-gray-500 mt-auto pt-4 border-t border-border">
        {amountStr && (
          <div className="flex items-center gap-1">
            <Building size={14} />
            <span>{amountStr}</span>
          </div>
        )}
        <div className="flex items-center gap-1 ml-auto">
          <Calendar size={14} />
          <span>Extracted Successfully</span>
        </div>
      </div>
    </motion.div>
  );
}
