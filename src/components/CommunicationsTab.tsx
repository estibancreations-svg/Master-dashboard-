import React, { useState } from 'react';
import { MessageSquare, Star, Send, Globe, Users, ShieldAlert, Sparkles, RefreshCw } from 'lucide-react';

interface Ticket {
  id: string;
  client: string;
  vip: boolean;
  message: string;
  originalLang: string;
  translatedText: string;
  status: 'open' | 'closed';
}

export default function CommunicationsTab() {
  const [tickets, setTickets] = useState<Ticket[]>([
    { id: 'ti-1', client: 'John Miller (Apex Ventures)', vip: true, message: 'I need the update regarding our pipeline nodes immediately.', originalLang: 'English', translatedText: 'I need the update regarding our pipeline nodes immediately.', status: 'open' },
    { id: 'ti-2', client: 'Hans Schmidt (Heidelberg Gmbh)', vip: true, message: 'Wir müssen das n8n-Webhook-Schnittstellenprojekt besprechen.', originalLang: 'German', translatedText: 'We need to discuss the n8n webhook interface project.', status: 'open' },
    { id: 'ti-3', client: 'Pedro Almodovar', vip: false, message: '¿Cómo puedo exportar la configuración JSON del pipeline?', originalLang: 'Spanish', translatedText: 'How can I export the pipeline JSON configuration?', status: 'closed' }
  ]);
  const [chatMessage, setChatMessage] = useState('');
  const [teamChat, setTeamChat] = useState([
    { sender: 'Supervisor Agent', msg: 'Lead temperature recalculations complete.' },
    { sender: 'Ben Angel', msg: 'Has the Stripe dispute evidence packet been dispatched?' },
    { sender: 'Reflexion Agent', msg: 'Evidence passed quality checks. Safe to dispatch.' }
  ]);

  const [selectedTicketId, setSelectedTicketId] = useState('ti-1');
  const [isTranslating, setIsTranslating] = useState(false);

  const selectedTicket = tickets.find(t => t.id === selectedTicketId);

  const handleSendTeamChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    setTeamChat(prev => [...prev, { sender: 'Operator', msg: chatMessage }]);
    setChatMessage('');
  };

  const handleTranslateAll = () => {
    setIsTranslating(true);
    setTimeout(() => {
      setIsTranslating(false);
      alert("Auto-translation engine complete. Translated foreign support tickets to English using server-side LLM layers.");
    }, 1200);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-6" id="communications-tab">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-600 animate-pulse" />
            Customer Communications Hub (AgencyFlow)
          </h2>
          <p className="text-3xs text-slate-500 uppercase tracking-widest font-mono">Threaded comments, VIP tagging, Internal Team-Chat, and Auto-translation</p>
        </div>
        
        <button 
          onClick={handleTranslateAll}
          disabled={isTranslating}
          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2"
        >
          {isTranslating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Globe className="w-3.5 h-3.5" />}
          Run Auto-Translation
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Threaded comments & Support tickets */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-2xs font-mono font-extrabold text-slate-400 uppercase tracking-widest">Active Client Support Tickets</h3>
          
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {tickets.map(ticket => (
              <div 
                key={ticket.id}
                onClick={() => setSelectedTicketId(ticket.id)}
                className={`p-4 rounded-xl border text-left cursor-pointer transition-all space-y-3 relative ${
                  selectedTicketId === ticket.id 
                    ? 'bg-indigo-50/50 border-indigo-400' 
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-850">{ticket.client}</span>
                    {ticket.vip && (
                      <span className="text-[9px] bg-amber-50 text-amber-700 border border-amber-150 font-mono font-bold uppercase px-1.5 py-0.2 rounded flex items-center gap-0.5">
                        <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500 shrink-0" /> VIP CRM Client
                      </span>
                    )}
                  </div>
                  
                  <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded ${
                    ticket.status === 'open' ? 'bg-indigo-50 text-indigo-700 border border-indigo-150' : 'bg-slate-100 text-slate-450 border border-slate-200'
                  }`}>
                    {ticket.status}
                  </span>
                </div>

                <div className="bg-white/60 p-2.5 rounded-lg border border-slate-150 text-3xs font-semibold text-slate-700">
                  <p className="text-[8px] text-slate-400 uppercase font-mono tracking-wider">Original ({ticket.originalLang}):</p>
                  <p className="mt-0.5">"{ticket.message}"</p>
                  
                  {ticket.originalLang !== 'English' && (
                    <div className="mt-2 pt-2 border-t border-dashed border-slate-200 text-indigo-900">
                      <p className="text-[8px] text-indigo-500 uppercase font-mono tracking-wider flex items-center gap-1">
                        <Globe className="w-2.5 h-2.5" /> Translated (English):
                      </p>
                      <p className="mt-0.5 italic font-bold">"{ticket.translatedText}"</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Internal Team-Chat Sidebar */}
        <div className="lg:col-span-1 border border-slate-200 rounded-xl p-4 bg-slate-50 flex flex-col justify-between h-[450px]">
          <div>
            <div className="flex items-center gap-1.5 border-b pb-2 mb-3">
              <Users className="w-4 h-4 text-indigo-600" />
              <h3 className="text-2xs font-mono font-extrabold text-slate-400 uppercase tracking-widest">Internal Team Chat</h3>
            </div>
            
            <div className="space-y-3 overflow-y-auto max-h-[300px] pr-1 font-sans">
              {teamChat.map((chat, idx) => (
                <div key={idx} className="space-y-0.5 text-xs text-slate-700 bg-white border border-slate-150 p-2.5 rounded-lg">
                  <p className="text-[9px] font-bold text-indigo-600 uppercase font-mono leading-none">{chat.sender}</p>
                  <p className="mt-1 leading-normal font-semibold">{chat.msg}</p>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSendTeamChat} className="mt-4 pt-3 border-t border-slate-200/85 flex gap-2">
            <input 
              type="text"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder="Type team chat message..."
              className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 font-sans"
            />
            <button 
              type="submit"
              className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}
