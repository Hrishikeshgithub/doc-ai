import React, { useState, useEffect } from 'react';
import { FileUp, Search, History } from 'lucide-react';
import axios from 'axios';
import UploadModal from './components/UploadModal';
import DocumentCard from './components/DocumentCard';
import DocumentDetail from './components/DocumentDetail';

function App() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);

  const API_BASE = import.meta.env.PROD 
    ? "https://doc-ai-8z7a.onrender.com" 
    : "http://localhost:8000";

  // Fetch document history from MongoDB on load
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await axios.get(`${API_BASE}/api/documents`);
        setDocuments(response.data);
      } catch (error) {
        console.error("Failed to fetch documents:", error);
      }
    };
    fetchDocuments();
  }, []);

  const handleUploadComplete = (newDoc) => {
    // We can fetch the list again or just prepend
    setDocuments(prev => [newDoc, ...prev]);
    setIsUploadOpen(false);
  };

  return (
    <div className="min-h-screen p-8 max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
            AI Document Intelligence
          </h1>
          <p className="text-gray-400 mt-1">Automated entity extraction & processing</p>
        </div>
        
        <button 
          onClick={() => setIsUploadOpen(true)}
          className="flex items-center gap-2 bg-primary hover:bg-blue-600 px-6 py-3 rounded-xl font-medium transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)]"
        >
          <FileUp size={20} />
          Upload Document
        </button>
      </header>

      {/* Main Content */}
      <div className="flex gap-8">
        {/* Document List */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-6 border-b border-border pb-4">
            <History className="text-gray-400" />
            <h2 className="text-xl font-semibold">Recent Documents</h2>
          </div>
          
          {documents.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center text-gray-400 border-dashed border-2">
              <p>No documents processed yet.</p>
              <p className="text-sm mt-2">Upload a PDF, DOCX, or Image to start extracting data.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {documents.map((doc, idx) => (
                <DocumentCard 
                  key={idx} 
                  data={doc} 
                  onClick={() => setSelectedDoc(doc)} 
                />
              ))}
            </div>
          )}
        </div>

        {/* Side Panel for Detail */}
        {selectedDoc && (
          <DocumentDetail 
            doc={selectedDoc} 
            onClose={() => setSelectedDoc(null)} 
          />
        )}
      </div>

      {/* Upload Modal */}
      {isUploadOpen && (
        <UploadModal 
          onClose={() => setIsUploadOpen(false)} 
          onComplete={handleUploadComplete} 
        />
      )}
    </div>
  );
}

export default App;
