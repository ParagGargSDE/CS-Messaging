import React, { useState, useMemo } from 'react';
import { useMessagingSystem } from './services/messageService';
import { Message, Agent, CannedResponse } from './types';
import { AGENTS, CANNED_RESPONSES } from './constants';
import { 
  Search, 
  Send, 
  User as UserIcon, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  MessageSquare, 
  Plus,
  RefreshCw,
  Zap,
  ArrowUpDown,
  Check,
  Filter,
  Mail,
  Shield,
  X,
  Edit2,
  PlusCircle,
  Save,
  Camera
} from 'lucide-react';

const App = () => {
  const { messages, users, isLoading, addMessage, markAsRead, resolveMessage, resolveConversation } = useMessagingSystem();
  
  // UI State
  const [agents, setAgents] = useState<Agent[]>(AGENTS);
  const [currentAgent, setCurrentAgent] = useState<Agent>(AGENTS[0]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [inputText, setInputText] = useState('');
  
  // Modal States
  const [simModalOpen, setSimModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  
  // Profile Editing State
  const [profileMode, setProfileMode] = useState<'view' | 'edit' | 'create'>('view');
  const [formData, setFormData] = useState<Agent>(currentAgent);

  const [sortOption, setSortOption] = useState<'urgency' | 'newest' | 'oldest'>('urgency');
  const [filterStatus, setFilterStatus] = useState<'open' | 'resolved'>('open');

  // Simulation State
  const [simUserId, setSimUserId] = useState('');
  const [simBody, setSimBody] = useState('');

  // Filtering and Sorting Logic
  const filteredMessages = useMemo(() => {
    // 1. Filter
    const filtered = messages.filter(msg => {
      const user = users[msg.userId];
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        msg.body.toLowerCase().includes(searchLower) ||
        msg.userId.includes(searchLower) ||
        (user && user.name.toLowerCase().includes(searchLower));
        
      const matchesStatus = msg.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    });

    // 2. Sort
    return filtered.sort((a, b) => {
      const timeA = new Date(a.timestamp.replace(' ', 'T')).getTime();
      const timeB = new Date(b.timestamp.replace(' ', 'T')).getTime();

      if (sortOption === 'urgency') {
         // Primary: Urgency (Descending)
         if (b.urgencyScore !== a.urgencyScore) {
           return b.urgencyScore - a.urgencyScore;
         }
         // Secondary: Time (Descending - Newest first)
         return timeB - timeA;
      } else if (sortOption === 'newest') {
         return timeB - timeA;
      } else { // oldest
         return timeA - timeB;
      }
    });
  }, [messages, users, searchTerm, sortOption, filterStatus]);

  // Derived State
  const activeUser = selectedUserId ? users[selectedUserId] : null;
  const activeConversation = useMemo(() => {
    if (!selectedUserId) return [];
    // Chat messages always sorted by time ascending (oldest to newest)
    return messages.filter(m => m.userId === selectedUserId).sort((a, b) => {
      const timeA = new Date(a.timestamp.replace(' ', 'T')).getTime();
      const timeB = new Date(b.timestamp.replace(' ', 'T')).getTime();
      return timeA - timeB;
    });
  }, [messages, selectedUserId]);

  const hasOpenMessages = useMemo(() => {
    if (!selectedUserId) return false;
    return messages.some(m => m.userId === selectedUserId && m.status === 'open');
  }, [messages, selectedUserId]);

  // Handlers
  const handleSendMessage = () => {
    if (!inputText.trim() || !selectedUserId) return;
    // Pass currentAgent.id to track who sent it
    addMessage(selectedUserId, inputText, 'outbound', currentAgent.id);
    setInputText('');
  };

  const handleSimulateIncoming = (e: React.FormEvent) => {
    e.preventDefault();
    if(simUserId && simBody) {
      addMessage(simUserId, simBody, 'inbound');
      setSimModalOpen(false);
      setSimUserId('');
      setSimBody('');
    }
  };

  const handleCannedResponse = (response: CannedResponse) => {
    setInputText(response.text);
  };

  const handleResolveTicket = () => {
    if (selectedUserId) {
      resolveConversation(selectedUserId);
    }
  };

  // Profile Management Handlers
  const openProfileModal = (mode: 'view' | 'create' = 'view') => {
    setProfileMode(mode);
    if (mode === 'create') {
      setFormData({
        id: `agent_${Date.now()}`,
        name: '',
        email: '',
        role: 'Support Agent',
        status: 'Online',
        avatar: `https://picsum.photos/seed/${Date.now()}/200/200`
      });
    } else {
      setFormData({ ...currentAgent });
    }
    setProfileModalOpen(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (profileMode === 'create') {
      const newAgent = { ...formData };
      setAgents(prev => [...prev, newAgent]);
      setCurrentAgent(newAgent);
    } else {
      // Edit mode
      setAgents(prev => prev.map(a => a.id === formData.id ? formData : a));
      setCurrentAgent(formData);
    }
    setProfileModalOpen(false);
  };

  const refreshAvatar = () => {
    setFormData(prev => ({
      ...prev,
      avatar: `https://picsum.photos/seed/${Math.random()}/200/200`
    }));
  };

  // Helper for Urgency Badge
  const UrgencyBadge = ({ score }: { score: number }) => {
    if (score >= 70) {
      return (
        <span className="flex items-center text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
          <AlertTriangle size={12} className="mr-1" /> Critical
        </span>
      );
    }
    if (score >= 40) {
      return (
        <span className="flex items-center text-xs font-semibold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">
          <Clock size={12} className="mr-1" /> High
        </span>
      );
    }
    return (
      <span className="flex items-center text-xs font-medium text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
        <MessageSquare size={12} className="mr-1" /> Normal
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center animate-pulse">
          <RefreshCw className="h-8 w-8 text-blue-600 animate-spin mb-4" />
          <h2 className="text-xl font-semibold text-slate-700">Loading Branch Portal...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
      
      {/* Header */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0 z-10 shadow-sm">
        <div className="flex items-center space-x-2">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Zap className="text-white h-5 w-5" fill="currentColor" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">Branch <span className="text-slate-400 font-normal">Connect</span></h1>
        </div>

        <div className="flex items-center space-x-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search customers or messages..." 
              className="pl-9 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm w-64 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-3 border-l pl-6 border-slate-200">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold">{currentAgent.name}</p>
              <p className={`text-xs font-medium ${currentAgent.status === 'Online' ? 'text-green-600' : 'text-orange-500'}`}>
                {currentAgent.status}
              </p>
            </div>
            <div className="group relative">
               <img 
                src={currentAgent.avatar} 
                alt="Agent" 
                className="h-10 w-10 rounded-full border-2 border-white shadow-sm cursor-pointer hover:border-blue-200 transition-colors object-cover"
              />
              <div className="absolute right-0 top-12 bg-white rounded-lg shadow-xl border border-slate-100 w-64 p-2 hidden group-hover:block z-50">
                <div className="px-3 py-2 border-b border-slate-100 mb-1">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Switch Account</p>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {agents.map(agent => (
                    <button 
                      key={agent.id}
                      onClick={() => setCurrentAgent(agent)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-center ${currentAgent.id === agent.id ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50 text-slate-700'}`}
                    >
                      <div className="relative mr-3 flex-shrink-0">
                        <img src={agent.avatar} className="w-8 h-8 rounded-full object-cover" />
                        <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-white ${agent.status === 'Online' ? 'bg-green-500' : 'bg-orange-400'}`}></div>
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-medium truncate">{agent.name}</p>
                        <p className="text-[10px] text-slate-500 truncate">{agent.role}</p>
                      </div>
                    </button>
                  ))}
                </div>
                
                <div className="border-t border-slate-100 mt-1 pt-1 space-y-1">
                   <button 
                     onClick={() => openProfileModal('create')}
                     className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md flex items-center font-medium"
                   >
                     <PlusCircle size={14} className="mr-2" /> Add New Agent
                   </button>
                   <button 
                     onClick={() => openProfileModal('view')}
                     className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-md flex items-center"
                   >
                     <UserIcon size={14} className="mr-2" /> View Profile
                   </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        
        {/* Left Panel: Message List */}
        <div className="w-1/3 min-w-[320px] max-w-[450px] bg-white border-r border-slate-200 flex flex-col">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-semibold text-slate-700 flex items-center">
                Inbox <span className="ml-2 bg-slate-200 text-slate-600 text-xs px-2 py-0.5 rounded-full">{filteredMessages.length}</span>
              </h2>
              <button 
                  onClick={() => setSimModalOpen(true)}
                  className="text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-md hover:bg-blue-200 font-medium transition-colors"
                >
                  + Sim
              </button>
            </div>

            <div className="flex gap-2">
               {/* Status Filter */}
               <div className="flex p-0.5 bg-slate-200 rounded-lg flex-1">
                 <button
                   onClick={() => setFilterStatus('open')}
                   className={`flex-1 text-xs font-medium py-1 rounded-md transition-all ${filterStatus === 'open' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                 >
                   Open
                 </button>
                 <button
                   onClick={() => setFilterStatus('resolved')}
                   className={`flex-1 text-xs font-medium py-1 rounded-md transition-all ${filterStatus === 'resolved' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                 >
                   Resolved
                 </button>
               </div>
               
               {/* Sort Dropdown */}
               <div className="relative w-28">
                 <select
                   value={sortOption}
                   onChange={(e) => setSortOption(e.target.value as 'urgency' | 'newest' | 'oldest')}
                   className="w-full appearance-none bg-white border border-slate-200 text-slate-600 text-xs rounded-lg pl-2 pr-6 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                 >
                   <option value="urgency">Urgency</option>
                   <option value="newest">Newest</option>
                   <option value="oldest">Oldest</option>
                 </select>
                 <ArrowUpDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
               </div>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {filteredMessages.length === 0 ? (
               <div className="p-10 text-center text-slate-400">
                 <Filter className="h-10 w-10 mx-auto mb-2 opacity-20" />
                 <p className="text-sm">No {filterStatus} messages found</p>
                 {searchTerm && <p className="text-xs mt-1">Try clearing your search</p>}
               </div>
            ) : (
              filteredMessages.map((msg) => {
                const isSelected = selectedUserId === msg.userId;
                // Find agent if outbound
                const msgAgent = msg.direction === 'outbound' && msg.agentId 
                  ? agents.find(a => a.id === msg.agentId) 
                  : null;

                return (
                  <div 
                    key={msg.id}
                    onClick={() => {
                      setSelectedUserId(msg.userId);
                      markAsRead(msg.id);
                    }}
                    className={`p-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors ${isSelected ? 'bg-blue-50 border-l-4 border-l-blue-600' : 'border-l-4 border-l-transparent'}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center">
                         <h3 className={`font-semibold text-sm ${isSelected ? 'text-blue-900' : 'text-slate-800'}`}>
                           {users[msg.userId]?.name || `User ${msg.userId}`}
                         </h3>
                         {msg.direction === 'inbound' && !msg.isRead && (
                           <span className="ml-2 h-2 w-2 rounded-full bg-blue-500"></span>
                         )}
                      </div>
                      <span className="text-xs text-slate-400 whitespace-nowrap">{msg.timestamp.split(' ')[1]}</span>
                    </div>
                    
                    <p className="text-sm text-slate-600 line-clamp-2 mb-2">
                      {msg.direction === 'outbound' && <span className="text-slate-400 mr-1">You:</span>}
                      {msg.body}
                    </p>
                    
                    <div className="flex items-center justify-between">
                       {msg.direction === 'inbound' ? (
                          <UrgencyBadge score={msg.urgencyScore} />
                       ) : (
                         <div className="flex items-center">
                           {msgAgent ? (
                             <div className="flex items-center bg-blue-50/50 pl-1 pr-2 py-0.5 rounded-full border border-blue-100">
                               <img src={msgAgent.avatar} className="w-3.5 h-3.5 rounded-full object-cover mr-1.5" alt={msgAgent.name} />
                               <span className="text-[10px] font-medium text-blue-700">{msgAgent.name.split(' ')[0]}</span>
                             </div>
                           ) : (
                             <span className="text-xs text-slate-400 flex items-center"><CheckCircle size={12} className="mr-1"/> Replied</span>
                           )}
                         </div>
                       )}
                       {msg.status === 'resolved' && (
                         <span className="flex items-center text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full ml-2">
                           Resolved
                         </span>
                       )}
                       <span className="text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded ml-auto">ID: {msg.userId}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Center Panel: Chat Interface */}
        <div className="flex-1 flex flex-col bg-slate-50/50 relative">
          {!selectedUserId ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
              <MessageSquare className="h-16 w-16 mb-4 text-slate-300" />
              <p className="text-lg font-medium text-slate-500">Select a conversation to start messaging</p>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm">
                 <div>
                   <h2 className="font-bold text-slate-800">{activeUser?.name}</h2>
                   <p className="text-xs text-slate-500">User ID: {selectedUserId} • +254 {activeUser?.phoneNumber}</p>
                 </div>
                 <div className="flex items-center space-x-2">
                    {hasOpenMessages && (
                      <button 
                        onClick={handleResolveTicket}
                        className="flex items-center bg-green-50 text-green-700 hover:bg-green-100 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors mr-2 border border-green-200"
                      >
                        <Check className="h-4 w-4 mr-1.5" />
                        Resolve Ticket
                      </button>
                    )}
                    <button className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
                       <UserIcon size={20} />
                    </button>
                 </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                 {activeConversation.map((msg) => {
                   // Find the agent if this message has an agentId
                   const msgAgent = msg.agentId ? agents.find(a => a.id === msg.agentId) : null;
                   
                   return (
                   <div key={msg.id} className={`flex ${msg.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] rounded-2xl px-5 py-3.5 shadow-sm text-sm border relative ${
                        msg.direction === 'outbound' 
                        ? 'bg-blue-600 text-white border-blue-600 rounded-br-none' 
                        : msg.status === 'resolved'
                          ? 'bg-slate-100 text-slate-500 border-slate-100 rounded-bl-none'
                          : 'bg-white text-slate-700 border-slate-200 rounded-bl-none'
                      }`}>
                        <p>{msg.body}</p>
                        <div className={`text-[10px] mt-1.5 flex justify-between items-center ${msg.direction === 'outbound' ? 'text-blue-200' : 'text-slate-400'}`}>
                          <span className="flex items-center gap-2">
                            {msg.timestamp}
                            {/* Added agent name here too */}
                            {msg.direction === 'outbound' && msgAgent && (
                              <span className="font-medium opacity-90 border-l border-blue-400 pl-2">
                                {msgAgent.name}
                              </span>
                            )}
                          </span>
                          {msg.status === 'resolved' && msg.direction === 'inbound' && (
                             <span className="flex items-center ml-2 text-green-600 font-semibold"><Check size={10} className="mr-0.5"/> Resolved</span>
                          )}
                        </div>
                        
                        {/* Agent Avatar for Outbound messages */}
                        {msg.direction === 'outbound' && msgAgent && (
                          <div className="absolute -right-10 bottom-0 flex flex-col items-center group" title={`Sent by ${msgAgent.name}`}>
                             <img src={msgAgent.avatar} className="w-8 h-8 rounded-full border-2 border-white shadow-sm object-cover" alt="Agent" />
                          </div>
                        )}
                      </div>
                   </div>
                 )})}
              </div>

              {/* Input Area */}
              <div className="p-4 bg-white border-t border-slate-200">
                {/* Canned Responses Chips */}
                <div className="flex gap-2 mb-3 overflow-x-auto pb-1 scrollbar-hide">
                  {CANNED_RESPONSES.map(canned => (
                    <button
                      key={canned.id}
                      onClick={() => handleCannedResponse(canned)}
                      className="whitespace-nowrap px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs rounded-full border border-slate-200 transition-colors"
                    >
                      {canned.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder={`Reply as ${currentAgent.name}...`}
                    className="flex-1 bg-slate-100 border-0 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                  />
                  <button 
                    onClick={handleSendMessage}
                    disabled={!inputText.trim()}
                    className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right Panel: Customer Context */}
        {selectedUserId && activeUser && (
          <div className="w-80 bg-white border-l border-slate-200 p-6 hidden xl:block overflow-y-auto">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">Customer Context</h3>
            
            <div className="flex flex-col items-center mb-8">
              <div className="h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-3 border border-slate-200">
                 <UserIcon size={40} />
              </div>
              <h2 className="text-lg font-bold text-slate-800">{activeUser.name}</h2>
              <p className="text-slate-500 text-sm">{activeUser.phoneNumber}</p>
            </div>

            <div className="space-y-6">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-500 mb-1">Loan Balance</p>
                <p className="text-2xl font-bold text-slate-800">KES {activeUser.loanBalance.toLocaleString()}</p>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2">
                  <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '65%' }}></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p className="text-xs text-slate-500 mb-1">Credit Score</p>
                    <p className="text-lg font-bold text-slate-800">{activeUser.creditScore}</p>
                 </div>
                 <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p className="text-xs text-slate-500 mb-1">Risk Tier</p>
                    <p className={`text-lg font-bold ${activeUser.riskTier === 'High' ? 'text-red-600' : activeUser.riskTier === 'Medium' ? 'text-orange-600' : 'text-green-600'}`}>
                      {activeUser.riskTier}
                    </p>
                 </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-700 mb-3">Recent Activity</h4>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="h-2 w-2 rounded-full bg-green-500 mt-1.5 mr-2"></div>
                    <div>
                      <p className="text-xs text-slate-800 font-medium">Loan Repayment</p>
                      <p className="text-[10px] text-slate-500">2 days ago</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="h-2 w-2 rounded-full bg-blue-500 mt-1.5 mr-2"></div>
                    <div>
                      <p className="text-xs text-slate-800 font-medium">App Login</p>
                      <p className="text-[10px] text-slate-500">5 hours ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Simulator Modal */}
      {simModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-96 transform transition-all scale-100">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
              <Plus className="mr-2 h-5 w-5 text-blue-600" /> Simulate Message
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Simulate an incoming message from the API.
            </p>
            <form onSubmit={handleSimulateIncoming}>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">User ID</label>
                  <input
                    type="number"
                    required
                    value={simUserId}
                    onChange={e => setSimUserId(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g. 208"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Message Body</label>
                  <textarea
                    required
                    value={simBody}
                    onChange={e => setSimBody(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    rows={4}
                    placeholder="Type the customer's message..."
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setSimModalOpen(false)}
                    className="flex-1 px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    Send to Portal
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {profileModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden relative">
            <button 
              onClick={() => setProfileModalOpen(false)}
              className="absolute top-4 right-4 text-white/80 hover:text-white z-10 transition-colors"
            >
              <X size={24} />
            </button>
            
            <div className="bg-blue-600 h-28 relative overflow-hidden">
               <div className="absolute inset-0 bg-blue-600 opacity-50 pattern-grid-lg"></div>
               {profileMode !== 'view' && (
                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-white/20 text-4xl font-bold uppercase tracking-widest">
                       {profileMode}
                    </span>
                 </div>
               )}
            </div>
            
            <div className="px-8 pb-8 -mt-12 relative">
              {profileMode === 'view' ? (
                // View Mode
                <>
                  <div className="flex justify-between items-end mb-4">
                     <div className="relative">
                        <img 
                          src={formData.avatar} 
                          alt={formData.name} 
                          className="w-24 h-24 rounded-full border-4 border-white shadow-md object-cover bg-white"
                        />
                        <div className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-4 border-white ${
                           formData.status === 'Online' ? 'bg-green-500' : 
                           formData.status === 'Away' ? 'bg-orange-500' : 'bg-red-500'
                        }`}></div>
                     </div>
                     <button
                       onClick={() => setProfileMode('edit')}
                       className="mb-2 text-xs flex items-center text-blue-600 hover:text-blue-800 font-medium px-3 py-1.5 bg-blue-50 hover:bg-blue-100 rounded-full transition-colors"
                     >
                        <Edit2 size={12} className="mr-1.5" /> Edit Profile
                     </button>
                  </div>
                  
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-slate-800 mb-1">{formData.name}</h2>
                    <p className="text-slate-500 font-medium">{formData.role}</p>
                  </div>
                  
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center text-sm p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="bg-white p-2 rounded-full shadow-sm mr-3">
                        <Mail size={16} className="text-blue-500" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Email Address</p>
                        <p className="text-slate-700 font-medium">{formData.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center text-sm p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="bg-white p-2 rounded-full shadow-sm mr-3">
                        <Shield size={16} className="text-blue-500" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Agent ID</p>
                        <p className="text-slate-700 font-medium">{formData.id}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-6">
                     <div className="text-center">
                        <p className="text-3xl font-bold text-blue-600">98%</p>
                        <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mt-1">CSAT Score</p>
                     </div>
                     <div className="text-center border-l border-slate-100">
                        <p className="text-3xl font-bold text-slate-700">12m</p>
                        <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mt-1">Avg Response</p>
                     </div>
                  </div>
                </>
              ) : (
                // Edit / Create Mode
                <form onSubmit={handleSaveProfile} className="mt-2">
                   <div className="flex justify-center mb-6 relative">
                       <div className="relative group cursor-pointer" onClick={refreshAvatar}>
                          <img 
                            src={formData.avatar} 
                            alt="Avatar Preview" 
                            className="w-24 h-24 rounded-full border-4 border-white shadow-md object-cover bg-slate-100"
                          />
                          <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                             <RefreshCw className="text-white" size={24} />
                          </div>
                          <div className="absolute bottom-0 right-0 bg-blue-600 text-white p-1.5 rounded-full border-2 border-white shadow-sm">
                             <Camera size={14} />
                          </div>
                       </div>
                       <p className="absolute -bottom-6 text-xs text-slate-400">Click to randomize avatar</p>
                   </div>

                   <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Full Name</label>
                        <input 
                           type="text" 
                           required
                           value={formData.name}
                           onChange={e => setFormData({...formData, name: e.target.value})}
                           className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-sm"
                           placeholder="e.g. Jane Doe"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Role</label>
                          <input 
                             type="text" 
                             required
                             value={formData.role}
                             onChange={e => setFormData({...formData, role: e.target.value})}
                             className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-sm"
                             placeholder="e.g. Senior Agent"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Status</label>
                          <select 
                             value={formData.status}
                             onChange={e => setFormData({...formData, status: e.target.value as any})}
                             className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-sm appearance-none"
                          >
                            <option value="Online">Online</option>
                            <option value="Away">Away</option>
                            <option value="Busy">Busy</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Email Address</label>
                        <input 
                           type="email" 
                           required
                           value={formData.email}
                           onChange={e => setFormData({...formData, email: e.target.value})}
                           className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-sm"
                           placeholder="e.g. jane@branch.co"
                        />
                      </div>
                   </div>

                   <div className="flex gap-3 mt-8 pt-4 border-t border-slate-100">
                      <button 
                        type="button"
                        onClick={() => {
                          if (profileMode === 'create') {
                            setProfileModalOpen(false);
                          } else {
                            setProfileMode('view');
                            setFormData(currentAgent); // Reset
                          }
                        }}
                        className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center justify-center shadow-sm"
                      >
                        <Save size={16} className="mr-2" /> Save Profile
                      </button>
                   </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;