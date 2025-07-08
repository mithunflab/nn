
import { useState, useEffect } from 'react';
import { 
  Settings, 
  FileText, 
  PlusCircle, 
  Grid, 
  List, 
  Search, 
  Filter,
  Users,
  Calendar,
  TrendingUp,
  Bell,
  Menu,
  X,
  RefreshCw,
  Shield
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useN8n } from '../hooks/useN8n';
import { N8nWorkflow } from '../types';
import { toast } from 'sonner';
import { WorkflowGrid } from '../components/WorkflowGrid';
import { WorkflowList } from '../components/WorkflowList';
import { ConnectionSetup } from '../components/ConnectionSetup';
import ProfilePage from '../components/ProfilePage';
import AIPlayground from './AIPlayground';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'workflows' | 'playground' | 'mcp-servers' | 'profile'>('dashboard');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [isConnectionModalOpen, setIsConnectionModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { 
    workflows,
    loading,
    loadWorkflows,
    activateWorkflow,
    deactivateWorkflow,
    deleteWorkflow,
    executeWorkflow,
    testConnection,
    saveConnection,
    refreshWorkflows
  } = useN8n();

  useEffect(() => {
    loadWorkflows();
  }, []);

  const handleWorkflowAction = async (workflowId: string, action: 'activate' | 'deactivate' | 'delete' | 'edit' | 'view') => {
    try {
      switch (action) {
        case 'activate':
          await activateWorkflow(workflowId);
          toast.success('Workflow activated successfully!');
          break;
        case 'deactivate':
          await deactivateWorkflow(workflowId);
          toast.success('Workflow deactivated successfully!');
          break;
        case 'delete':
          if (window.confirm('Are you sure you want to delete this workflow?')) {
            await deleteWorkflow(workflowId);
            toast.success('Workflow deleted successfully!');
          }
          break;
        case 'edit':
          // Open workflow in external editor
          window.open(`/workflow/${workflowId}/edit`, '_blank');
          break;
        case 'view':
          // Open workflow details
          window.open(`/workflow/${workflowId}`, '_blank');
          break;
      }
      await refreshWorkflows();
    } catch (error) {
      console.error('Error handling workflow action:', error);
      toast.error('Failed to perform action. Please try again.');
    }
  };

  const filteredWorkflows = workflows.filter(workflow => {
    const matchesSearch = workflow.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'active' && workflow.active) ||
                         (filterStatus === 'inactive' && !workflow.active);
    return matchesSearch && matchesFilter;
  });

  const activeWorkflows = workflows.filter(w => w.active);
  const totalWorkflows = workflows.length;

  const renderTabContent = () => {
    if (activeTab === 'profile') {
      return <ProfilePage isOpen={true} onClose={() => setActiveTab('dashboard')} />;
    }

    if (activeTab === 'playground') {
      return <AIPlayground />;
    }

    if (activeTab === 'workflows') {
      return (
        <div className="space-y-6">
          {/* Workflows Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-50">Workflows</h2>
              <p className="text-slate-400">Manage your automation workflows</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors duration-200 ${
                    viewMode === 'grid' 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-slate-800 text-slate-400 hover:text-slate-300'
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors duration-200 ${
                    viewMode === 'list' 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-slate-800 text-slate-400 hover:text-slate-300'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
              
              <button
                onClick={() => setIsConnectionModalOpen(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors duration-200"
              >
                <PlusCircle className="w-4 h-4 inline-block mr-2" />
                New Connection
              </button>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search workflows..."
                className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 focus:ring-indigo-500 focus:border-indigo-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-slate-400" />
              <select
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 focus:ring-indigo-500 focus:border-indigo-500"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
              >
                <option value="all">All Workflows</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Workflow Display */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
          ) : (
            <>
              {viewMode === 'grid' ? (
                <WorkflowGrid 
                  workflows={filteredWorkflows} 
                  onAction={handleWorkflowAction}
                />
              ) : (
                <WorkflowList 
                  workflows={filteredWorkflows} 
                  onAction={handleWorkflowAction}
                />
              )}
            </>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-8">
        {/* Dashboard Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-50">Dashboard</h1>
          <p className="text-slate-400">Monitor and manage your automation workflows</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Workflows</p>
                <p className="text-2xl font-bold text-slate-50">{totalWorkflows}</p>
              </div>
              <div className="w-12 h-12 bg-indigo-600/20 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-indigo-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Active Workflows</p>
                <p className="text-2xl font-bold text-slate-50">{activeWorkflows.length}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-600/20 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Success Rate</p>
                <p className="text-2xl font-bold text-slate-50">95%</p>
              </div>
              <div className="w-12 h-12 bg-amber-600/20 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-amber-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Team Members</p>
                <p className="text-2xl font-bold text-slate-50">4</p>
              </div>
              <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Workflows */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-50">Recent Workflows</h2>
            <button
              onClick={() => setActiveTab('workflows')}
              className="text-indigo-400 hover:text-indigo-300 text-sm font-medium"
            >
              View All
            </button>
          </div>
          
          <div className="space-y-4">
            {workflows.slice(0, 5).map((workflow) => (
              <div key={workflow.id} className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl">
                <div className="flex items-center space-x-4">
                  <div className={`w-3 h-3 rounded-full ${workflow.active ? 'bg-emerald-400' : 'bg-slate-500'}`}></div>
                  <div>
                    <h3 className="font-medium text-slate-50">{workflow.name}</h3>
                    <p className="text-sm text-slate-400">
                      Updated {new Date(workflow.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    workflow.active 
                      ? 'bg-emerald-600/20 text-emerald-400' 
                      : 'bg-slate-600/20 text-slate-400'
                  }`}>
                    {workflow.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-slate-50">WorkFlow AI</h1>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  activeTab === 'dashboard' 
                    ? 'text-indigo-400 bg-indigo-600/20' 
                    : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('workflows')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  activeTab === 'workflows' 
                    ? 'text-indigo-400 bg-indigo-600/20' 
                    : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                Workflows
              </button>
              <button
                onClick={() => setActiveTab('playground')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  activeTab === 'playground' 
                    ? 'text-indigo-400 bg-indigo-600/20' 
                    : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                AI Playground
              </button>
              <button
                onClick={() => setActiveTab('mcp-servers')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  activeTab === 'mcp-servers' 
                    ? 'text-indigo-400 bg-indigo-600/20' 
                    : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                MCP Servers
              </button>
            </nav>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 text-slate-400 hover:text-slate-300 transition-colors duration-200">
                <Bell className="w-5 h-5" />
              </button>
              <button className="p-2 text-slate-400 hover:text-slate-300 transition-colors duration-200">
                <Settings className="w-5 h-5" />
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-medium"
              >
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </button>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-slate-400 hover:text-slate-300 transition-colors duration-200"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderTabContent()}
      </main>

      {/* Connection Setup Modal */}
      <ConnectionSetup 
        isOpen={isConnectionModalOpen} 
        onClose={() => setIsConnectionModalOpen(false)} 
      />
    </div>
  );
};

export default Dashboard;
