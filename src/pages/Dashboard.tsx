import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Play, 
  Edit, 
  Trash2, 
  Bell, 
  User, 
  LogOut, 
  Zap, 
  CheckCircle, 
  Activity, 
  Database, 
  Globe,
  Mic,
  MessageSquare,
  Home,
  Server
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useN8n } from '../hooks/useN8n';
import { N8nConnection, N8nWorkflow, N8nExecution } from '../types';
import { AuthModal } from '../components/AuthModal';
import { toast } from 'sonner';
import { WorkflowGrid } from '../components/WorkflowGrid';
import { WorkflowList } from '../components/WorkflowList';
import { ConnectionSetup } from '../components/ConnectionSetup';
import { ProfilePage } from '../components/ProfilePage';
import Logo from '../components/Logo';

type View = 'dashboard' | 'playground' | 'mcp-servers';

export const Dashboard = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isWorkflowGrid, setIsWorkflowGrid] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredWorkflows, setFilteredWorkflows] = useState<N8nWorkflow[]>([]);
  const [activeWorkflow, setActiveWorkflow] = useState<N8nWorkflow | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { 
    connections, 
    activeConnection, 
    workflows, 
    executions,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    executeWorkflow,
    healthCheck
  } = useN8n();

  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    getWorkflows();
    getExecutions();
  }, []);

  useEffect(() => {
    if (workflows) {
      const filtered = workflows.filter(workflow =>
        workflow.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredWorkflows(filtered);
    }
  }, [searchQuery, workflows]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleSetActiveWorkflow = (workflow: N8nWorkflow) => {
    setActiveWorkflow(workflow);
  };

  const handleExecuteWorkflow = async (id: string) => {
    setIsExecuting(true);
    try {
      await executeWorkflow(id);
      toast.success('Workflow execution started!');
    } catch (error) {
      toast.error('Failed to execute workflow.');
    } finally {
      setIsExecuting(false);
    }
  };

  const handleDeleteWorkflow = async (id: string) => {
    try {
      await deleteWorkflow(id);
      toast.success('Workflow deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete workflow.');
    }
  };

  const renderSidebar = () => (
    <div className="w-64 bg-slate-800/50 border-r border-slate-700/50 flex flex-col">
      <div className="flex items-center justify-center h-20 border-b border-slate-700/50 p-4">
        <Logo size={32} />
        <span className="ml-2 text-lg font-bold text-slate-50">WorkFlow AI</span>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-2">
        <button
          onClick={() => setCurrentView('dashboard')}
          className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 ${
            currentView === 'dashboard'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          <Home className="w-5 h-5" />
          <span>Dashboard</span>
        </button>
        
        <button
          onClick={() => setCurrentView('playground')}
          className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 ${
            currentView === 'playground'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          <span>AI Playground</span>
        </button>
        
        <button
          onClick={() => setCurrentView('mcp-servers')}
          className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 ${
            currentView === 'mcp-servers'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          <Server className="w-5 h-5" />
          <span>MCP Servers</span>
        </button>
      </nav>
      
      <div className="p-4 border-t border-slate-700/50">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
            <User className="w-4 h-4 text-slate-300" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-slate-300">{user?.email}</div>
            <div className="text-xs text-slate-500">Pro Account</div>
          </div>
          <button onClick={() => setIsProfileOpen(true)} className="p-1 text-slate-400 hover:text-white transition-all duration-200">
            <Settings className="w-4 h-4" />
          </button>
          <button onClick={handleSignOut} className="p-1 text-slate-400 hover:text-white transition-all duration-200">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  const renderDashboardView = () => (
    <div className="flex-1 p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-50">Dashboard</h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="search"
              placeholder="Search workflows..."
              className="bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-2 text-sm text-slate-300 focus:outline-none focus:border-indigo-500 transition-all duration-200"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <Search className="absolute top-1/2 right-3 -translate-y-1/2 w-4 h-4 text-slate-400" />
          </div>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200">
            <Filter className="w-4 h-4 mr-2 inline-block" /> Filter
          </button>
          <button onClick={() => setIsSettingsOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200">
            <Plus className="w-4 h-4 mr-2 inline-block" /> New
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-slate-200">My Workflows</h2>
        <button onClick={() => setIsWorkflowGrid(!isWorkflowGrid)} className="text-slate-400 hover:text-white transition-all duration-200">
          {isWorkflowGrid ? 'Show List' : 'Show Grid'}
        </button>
      </div>

      {isWorkflowGrid ? (
        <WorkflowGrid workflows={filteredWorkflows} onSetActiveWorkflow={handleSetActiveWorkflow} onDeleteWorkflow={handleDeleteWorkflow} onExecuteWorkflow={handleExecuteWorkflow} isExecuting={isExecuting} />
      ) : (
        <WorkflowList workflows={filteredWorkflows} onSetActiveWorkflow={handleSetActiveWorkflow} onDeleteWorkflow={handleDeleteWorkflow} onExecuteWorkflow={handleExecuteWorkflow} isExecuting={isExecuting} />
      )}
    </div>
  );

  const renderPlaygroundView = () => (
    <div className="flex-1 p-6">
      <h1 className="text-2xl font-bold text-slate-50">AI Playground</h1>
      <p className="text-slate-400">Unleash the power of AI to generate workflows.</p>
    </div>
  );

  const renderMcpServersView = () => (
    <div className="flex-1 p-6">
      <h1 className="text-2xl font-bold text-slate-50">MCP Servers</h1>
      <p className="text-slate-400">Manage your Magic Cloud Patcher servers.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 flex">
      {renderSidebar()}

      <div className="flex-1 flex flex-col">
        <nav className="flex items-center justify-between h-20 border-b border-slate-700/50 px-6">
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden text-slate-400 hover:text-white transition-all duration-200">
            {isMobileMenuOpen ? 'Close' : 'Menu'}
          </button>
          <div className="flex items-center space-x-4">
            <button className="text-slate-400 hover:text-white transition-all duration-200">
              <Bell className="w-5 h-5" />
            </button>
          </div>
        </nav>

        {currentView === 'dashboard' && renderDashboardView()}
        {currentView === 'playground' && renderPlaygroundView()}
        {currentView === 'mcp-servers' && renderMcpServersView()}
      </div>

      {isAuthModalOpen && <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />}
      {isProfileOpen && <ProfilePage isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />}
      {isSettingsOpen && <ConnectionSetup isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />}
    </div>
  );
};
