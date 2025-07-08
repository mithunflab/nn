
import { useState } from 'react';
import { 
  Send, 
  RotateCw, 
  Copy, 
  Play, 
  Mic, 
  StopCircle,
  DownloadCloud,
  CopyCheck
} from 'lucide-react';
import { useN8n } from '../hooks/useN8n';
import { toast } from 'sonner';

// Since the ChatMessage type is missing, let's define it
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const AIPlayground = () => {
  const [activeTab, setActiveTab] = useState<'chat' | 'workflow'>('chat');
  const [workflowJson, setWorkflowJson] = useState<string | null>(null);
  const [workflowId, setWorkflowId] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  
  const { 
    activeConnection, 
    createWorkflow,
    executeWorkflow,
  } = useN8n();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock speech-to-text functionality since we don't have useSpeechToText
  const startRecording = () => {
    toast.info("Speech recording started");
  };
  
  const stopRecording = () => {
    toast.info("Speech recording stopped");
  };
  
  const isRecording = false;

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isGenerating) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsGenerating(true);
    setError(null);

    try {
      let tools: ("web_search" | "workflow_generation" | "analysis")[] = [];
      if (inputValue.toLowerCase().includes('search') || inputValue.toLowerCase().includes('find')) {
        tools.push('web_search');
      }
      if (inputValue.toLowerCase().includes('workflow') || inputValue.toLowerCase().includes('automat')) {
        tools.push('workflow_generation');
      }
      if (!tools.length) {
        tools.push('analysis');
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: inputValue, tools }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.workflow) {
        setWorkflowJson(JSON.stringify(data.workflow, null, 2));
        setActiveTab('workflow');
      }

      const aiMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveWorkflow = async () => {
    if (!workflowJson || !activeConnection) {
      toast.error('No workflow to save or no active connection.');
      return;
    }

    try {
      const workflowData = JSON.parse(workflowJson);
      const newWorkflow = await createWorkflow(workflowData);
      setWorkflowId(newWorkflow.id);
      toast.success('Workflow saved successfully!');
    } catch (error) {
      console.error('Error saving workflow:', error);
      toast.error('Failed to save workflow.');
    }
  };

  const handleExecuteWorkflow = async () => {
    if (!workflowId || !activeConnection) {
      toast.error('No workflow selected or no active connection.');
      return;
    }

    setIsExecuting(true);
    try {
      await executeWorkflow(workflowId);
      toast.success('Workflow execution started!');
    } catch (error) {
      console.error('Error executing workflow:', error);
      toast.error('Failed to execute workflow.');
    } finally {
      setIsExecuting(false);
    }
  };

  const handleCopyWorkflow = () => {
    if (workflowJson) {
      navigator.clipboard.writeText(workflowJson)
        .then(() => {
          setIsCopied(true);
          toast.success('Workflow JSON copied to clipboard!');
          setTimeout(() => setIsCopied(false), 3000);
        })
        .catch(err => {
          console.error("Failed to copy workflow JSON: ", err);
          toast.error('Failed to copy workflow JSON.');
        });
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Interface */}
      <div className="flex-1 p-6 space-y-4">
        {/* Messages Display */}
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`p-3 rounded-lg ${message.role === 'user' ? 'bg-slate-700 text-slate-200' : 'bg-slate-800 text-slate-300'}`}>
              <div className="text-sm text-slate-400">{message.role === 'user' ? 'You' : 'WorkFlow AI'}</div>
              <p>{message.content}</p>
              <div className="text-xs text-slate-500">{message.timestamp.toLocaleTimeString()}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Input and Controls */}
      <div className="p-6 border-t border-slate-700">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <input
              type="text"
              className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 focus:ring-indigo-500"
              placeholder="Type your message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSendMessage();
                }
              }}
            />
          </div>
          <button
            className={`p-3 rounded-lg ${isGenerating ? 'bg-indigo-700 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500'
              } text-white transition-colors duration-200`}
            onClick={handleSendMessage}
            disabled={isGenerating}
          >
            {isGenerating ? <RotateCw className="animate-spin" /> : <Send />}
          </button>
          <button
            className={`p-3 rounded-lg ${isRecording ? 'bg-red-700' : 'bg-red-600 hover:bg-red-500'
              } text-white transition-colors duration-200`}
            onClick={isRecording ? stopRecording : startRecording}
          >
            {isRecording ? <StopCircle /> : <Mic />}
          </button>
        </div>
      </div>

      {/* Workflow Display */}
      {workflowJson && (
        <div className="p-6 border-t border-slate-700">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-slate-200">Generated Workflow</h2>
            <div className="space-x-2">
              <button
                className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors duration-200"
                onClick={handleCopyWorkflow}
                disabled={isCopied}
              >
                {isCopied ? <CopyCheck className="inline-block w-4 h-4 mr-2" /> : <Copy className="inline-block w-4 h-4 mr-2" />}
                {isCopied ? 'Copied!' : 'Copy JSON'}
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors duration-200"
                onClick={handleSaveWorkflow}
              >
                <DownloadCloud className="inline-block w-4 h-4 mr-2" />
                Save Workflow
              </button>
              {workflowId && (
                <button
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors duration-200"
                  onClick={handleExecuteWorkflow}
                  disabled={isExecuting}
                >
                  {isExecuting ? <RotateCw className="animate-spin inline-block w-4 h-4 mr-2" /> : <Play className="inline-block w-4 h-4 mr-2" />}
                  {isExecuting ? 'Executing...' : 'Execute Workflow'}
                </button>
              )}
            </div>
          </div>
          <pre className="bg-slate-800 rounded-lg p-4 overflow-x-auto">
            <code className="text-sm text-slate-300 whitespace-pre">
              {workflowJson}
            </code>
          </pre>
        </div>
      )}
    </div>
  );
};

export default AIPlayground;
