import React, { useState, useEffect } from 'react';
import { FileUp, History, LogOut, User } from 'lucide-react';
import axios from 'axios';
import UploadModal from './components/UploadModal';
import DocumentCard from './components/DocumentCard';
import DocumentDetail from './components/DocumentDetail';
import AuthPage from './components/AuthPage';

const API_BASE = import.meta.env.PROD
  ? "https://doc-ai-8z7a.onrender.com"
  : "http://localhost:8000";

function App() {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!user || !token) return;
    const fetchDocuments = async () => {
      try {
        const response = await axios.get(`${API_BASE}/api/documents`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDocuments(response.data);
      } catch (error) {
        if (error.response?.status === 401) handleLogout();
        console.error("Failed to fetch documents:", error);
      }
    };
    fetchDocuments();
  }, [user]);

  const handleAuth = (data) => {
    setUser({ name: data.name, email: data.email });
    setDocuments([]);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setDocuments([]);
  };

  const handleUploadComplete = (newDoc) => {
    setDocuments(prev => [newDoc, ...prev]);
    setIsUploadOpen(false);
  };

  if (!user) {
    return <AuthPage onAuth={handleAuth} />;
  }

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

        <div className="flex items-center gap-3">
          {/* User badge */}
          <div className="flex items-center gap-2 glass px-4 py-2 rounded-xl border border-white/10">
            <div className="w-7 h-7 rounded-full bg-primary/30 flex items-center justify-center">
              <User size={14} className="text-primary" />
            </div>
            <span className="text-sm font-medium text-gray-200">{user.name}</span>
          </div>

          <button
            onClick={() => setIsUploadOpen(true)}
            className="flex items-center gap-2 bg-primary hover:bg-blue-600 px-6 py-3 rounded-xl font-medium transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)]"
          >
            <FileUp size={20} />
            Upload Document
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-400 hover:text-white glass px-4 py-3 rounded-xl border border-white/10 transition-all hover:border-red-500/40 hover:text-red-400"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex gap-8">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-6 border-b border-border pb-4">
            <History className="text-gray-400" />
            <h2 className="text-xl font-semibold">Recent Documents</h2>
            {documents.length > 0 && (
              <span className="ml-auto text-xs bg-primary/20 text-primary px-2 py-1 rounded-full font-medium">
                {documents.length} docs
              </span>
            )}
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

        {selectedDoc && (
          <DocumentDetail
            doc={selectedDoc}
            onClose={() => setSelectedDoc(null)}
          />
        )}
      </div>

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
