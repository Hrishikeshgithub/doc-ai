import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { X, UploadCloud, Loader2, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

export default function UploadModal({ onClose, onComplete }) {
  const [file, setFile] = useState(null);
  const [docType, setDocType] = useState("Auto-detect");
  const [uploading, setUploading] = useState(false);
  const [progressText, setProgressText] = useState("");

  const onDrop = useCallback(acceptedFiles => {
    if (acceptedFiles?.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1
  });

  const handleUpload = async () => {
    if (!file) return;
    
    setUploading(true);
    setProgressText("Uploading file...");
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("document_type", docType);

    try {
      setTimeout(() => setProgressText("Running AI Extraction..."), 1500);
      
      const API_BASE = import.meta.env.PROD 
        ? "https://doc-ai-8z7a.onrender.com" 
        : "http://localhost:8000";
      const response = await axios.post(`${API_BASE}/api/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setProgressText("Done!");
      setTimeout(() => {
        onComplete(response.data);
      }, 800);
      
    } catch (error) {
      console.error(error);
      const backendError = error.response?.data?.detail || error.message;
      alert(`Extraction failed: ${backendError}`);
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="glass w-full max-w-lg rounded-3xl p-6 relative shadow-2xl"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold mb-6 text-white">Upload Document</h2>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-400 mb-2">Document Type Hint</label>
          <select 
            value={docType}
            onChange={(e) => setDocType(e.target.value)}
            className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
          >
            <option>Auto-detect</option>
            <option>kyc</option>
            <option>loan_agreement</option>
            <option>bank_statement</option>
            <option>recovery_notice</option>
          </select>
        </div>

        {!uploading ? (
          <>
            <div 
              {...getRootProps()} 
              className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
                isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-gray-400 hover:bg-surface/50'
              }`}
            >
              <input {...getInputProps()} />
              <div className="bg-surface w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <UploadCloud size={28} className="text-primary" />
              </div>
              {file ? (
                <p className="font-medium text-white">{file.name}</p>
              ) : (
                <>
                  <p className="font-medium text-white">Drag & drop your file here</p>
                  <p className="text-sm text-gray-400 mt-2">Supports PDF, DOCX, PNG, JPEG</p>
                </>
              )}
            </div>

            <div className="mt-8 flex justify-end">
              <button 
                onClick={handleUpload}
                disabled={!file}
                className="bg-primary hover:bg-blue-600 disabled:opacity-50 disabled:hover:bg-primary px-8 py-3 rounded-xl text-white font-medium transition-colors"
              >
                Start Extraction
              </button>
            </div>
          </>
        ) : (
          <div className="py-12 text-center">
            {progressText === "Done!" ? (
              <CheckCircle2 size={64} className="text-green-500 mx-auto mb-6" />
            ) : (
              <Loader2 size={64} className="text-primary animate-spin mx-auto mb-6" />
            )}
            <h3 className="text-xl font-medium text-white">{progressText}</h3>
            <div className="w-full bg-surface h-2 rounded-full mt-6 overflow-hidden relative">
              <motion.div 
                initial={{ width: "0%" }}
                animate={{ width: progressText === "Done!" ? "100%" : "60%" }}
                transition={{ duration: 1.5 }}
                className="absolute top-0 left-0 h-full bg-primary"
              />
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
