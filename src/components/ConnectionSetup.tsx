import React, { useState, useEffect } from 'react';
import { 
  X, 
  Server, 
  Key, 
  Database, 
  Globe, 
  Activity,
  CheckCircle, 
  XCircle, 
  AlertTriangle
} from 'lucide-react';
import { useN8n } from '../hooks/useN8n';
import { toast } from 'sonner';

interface ConnectionSetupProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConnectionSetup = ({ isOpen, onClose }: ConnectionSetupProps) => {
  const [baseUrl, setBaseUrl] = useState<string>('');
  const [apiKey, setApiKey] = useState<string>('');
  const [instanceName, setInstanceName] = useState<string>('');
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState<string>('');
  
  const { 
    connections,
    activeConnection,
    loading,
    testConnection,
    saveConnection,
    deleteConnection
  } = useN8n();

  useEffect(() => {
    if (activeConnection) {
      setBaseUrl(activeConnection.base_url);
      setApiKey(''); // Don't show API key for security
      setInstanceName(activeConnection.instance_name);
    }
  }, [activeConnection]);

  const handleTestConnection = async () => {
    if (!baseUrl || !apiKey) {
      setTestStatus('error');
      setTestMessage('Please provide both Base URL and API Key');
      return;
    }
    
    setTestStatus('testing');
    try {
      const response = await testConnection(baseUrl, apiKey, instanceName);
      if (response.success) {
        setTestStatus('success');
        setTestMessage('Connection successful!');
      } else {
        setTestStatus('error');
        setTestMessage(response.message || 'Connection failed');
      }
    } catch (_) {
      setTestStatus('error');
      setTestMessage('Connection failed. Please check your credentials.');
    }
  };

  const handleSaveConnection = async () => {
    if (!baseUrl || !apiKey || !instanceName) {
      toast.error('Please provide all required information');
      return;
    }
    
    try {
      const response = await saveConnection(baseUrl, apiKey, instanceName);
      if (response.success) {
        toast.success('Connection saved successfully!');
        onClose();
      } else {
        toast.error(response.message || 'Failed to save connection');
      }
    } catch (_) {
      toast.error('Failed to save connection');
    }
  };

  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? 'block' : 'hidden'}`}>
      {/* Dark overlay */}
      <div className="fixed inset-0 bg-black opacity-50" onClick={onClose}></div>

      {/* Modal content */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-slate-900 p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-slate-50">N8n Connection Setup</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-300 transition-colors duration-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="base-url" className="block text-sm font-medium text-slate-300">
              Base URL
            </label>
            <input
              type="text"
              id="base-url"
              className="mt-1 p-2 w-full rounded-md bg-slate-800 border border-slate-700 text-slate-300 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="https://your-n8n-instance.com"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="api-key" className="block text-sm font-medium text-slate-300">
              API Key
            </label>
            <input
              type="password"
              id="api-key"
              className="mt-1 p-2 w-full rounded-md bg-slate-800 border border-slate-700 text-slate-300 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Your N8n API Key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="instance-name" className="block text-sm font-medium text-slate-300">
              Instance Name
            </label>
            <input
              type="text"
              id="instance-name"
              className="mt-1 p-2 w-full rounded-md bg-slate-800 border border-slate-700 text-slate-300 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="My N8n Instance"
              value={instanceName}
              onChange={(e) => setInstanceName(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-2">
          <button
            onClick={handleTestConnection}
            disabled={testStatus === 'testing'}
            className={`px-4 py-2 rounded-md text-white font-medium transition-colors duration-200 ${
              testStatus === 'testing'
                ? 'bg-indigo-700 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-500'
            }`}
          >
            {testStatus === 'testing' ? 'Testing...' : 'Test Connection'}
          </button>
          <button
            onClick={handleSaveConnection}
            className="px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors duration-200"
          >
            Save Connection
          </button>
        </div>

        {testStatus !== 'idle' && (
          <div className="mt-4 p-3 rounded-md text-sm">
            {testStatus === 'success' && (
              <div className="text-green-500 flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 inline-block" />
                <span>{testMessage}</span>
              </div>
            )}
            {testStatus === 'error' && (
              <div className="text-red-500 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 inline-block" />
                <span>{testMessage}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
