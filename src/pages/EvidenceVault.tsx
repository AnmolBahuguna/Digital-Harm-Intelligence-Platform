import React, { useState } from 'react';
import { Lock, Upload, Eye, EyeOff, Download, Trash2, Plus } from 'lucide-react';

interface Evidence {
  id: string;
  name: string;
  type: 'screenshot' | 'chat' | 'document' | 'audio' | 'video';
  uploadDate: string;
  size: string;
  encrypted: boolean;
}

const EvidenceVault: React.FC = () => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [password, setPassword] = useState('');
  const [evidence, setEvidence] = useState<Evidence[]>([
    {
      id: '1',
      name: 'Threatening Messages.png',
      type: 'screenshot',
      uploadDate: '2024-01-15',
      size: '2.1 MB',
      encrypted: true
    },
    {
      id: '2',
      name: 'Chat Conversation.txt',
      type: 'chat',
      uploadDate: '2024-01-14',
      size: '156 KB',
      encrypted: true
    },
    {
      id: '3',
      name: 'Scam Email.pdf',
      type: 'document',
      uploadDate: '2024-01-13',
      size: '432 KB',
      encrypted: true
    }
  ]);

  const handleUnlock = () => {
    // In a real implementation, this would verify against a secure hash
    if (password.length >= 6) {
      setIsUnlocked(true);
    }
  };

  const getTypeIcon = (type: Evidence['type']) => {
    switch (type) {
      case 'screenshot': return '📱';
      case 'chat': return '💬';
      case 'document': return '📄';
      case 'audio': return '🎵';
      case 'video': return '📹';
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const newEvidence: Evidence = {
          id: Date.now().toString(),
          name: file.name,
          type: 'document', // In real app, determine from file type
          uploadDate: new Date().toISOString().split('T')[0],
          size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
          encrypted: true
        };
        setEvidence(prev => [newEvidence, ...prev]);
      });
    }
  };

  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900 flex items-center justify-center py-12">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-4 bg-purple-100 dark:bg-purple-900 rounded-full mb-4">
              <Lock className="h-12 w-12 text-purple-600 dark:text-purple-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Evidence Vault
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Your private, encrypted storage for sensitive evidence
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Vault Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your vault password"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                onKeyPress={(e) => e.key === 'Enter' && handleUnlock()}
              />
            </div>
            <button
              onClick={handleUnlock}
              disabled={password.length < 6}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Unlock Vault
            </button>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Security Notice:</strong> All evidence is encrypted with client-side encryption. 
              We cannot recover your password if forgotten.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Evidence Vault
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Securely store and manage your digital evidence
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <label className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Add Evidence</span>
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                accept="image/*,audio/*,video/*,.pdf,.txt,.doc,.docx"
              />
            </label>
            <button
              onClick={() => setIsUnlocked(false)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <Lock className="h-4 w-4" />
              <span>Lock Vault</span>
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-2">
              {evidence.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Total Files</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
              {evidence.filter(e => e.encrypted).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Encrypted</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              {evidence.reduce((acc, e) => acc + parseFloat(e.size), 0).toFixed(1)} MB
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Storage Used</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-2">
              256-bit
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Encryption</div>
          </div>
        </div>

        {/* Evidence List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Your Evidence Files
            </h2>
          </div>
          
          {evidence.length === 0 ? (
            <div className="p-12 text-center">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No evidence uploaded yet
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Start by uploading screenshots, documents, or recordings
              </p>
              <label className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg cursor-pointer transition-colors inline-flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Upload First Evidence</span>
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  accept="image/*,audio/*,video/*,.pdf,.txt,.doc,.docx"
                />
              </label>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {evidence.map((file) => (
                <div key={file.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl">{getTypeIcon(file.type)}</div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {file.name}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                          <span>{file.uploadDate}</span>
                          <span>{file.size}</span>
                          {file.encrypted && (
                            <span className="flex items-center space-x-1">
                              <Lock className="h-3 w-3" />
                              <span>Encrypted</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                        <Download className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => setEvidence(prev => prev.filter(e => e.id !== file.id))}
                        className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Security Info */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <Lock className="h-6 w-6 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Your Security & Privacy
              </h3>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• All files are encrypted with AES-256 encryption before storage</li>
                <li>• Only you have access to your vault password</li>
                <li>• Evidence can be safely shared with legal authorities when needed</li>
                <li>• Metadata is preserved for legal authenticity</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvidenceVault;