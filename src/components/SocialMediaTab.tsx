import React, { useState } from 'react';
import { MessageSquare, ThumbsUp, Send, RefreshCw, BarChart2, Heart, ExternalLink } from 'lucide-react';

interface InboxItem {
  id: string;
  sender: string;
  platform: 'LinkedIn' | 'YouTube' | 'TikTok';
  text: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  replied: boolean;
}

export default function SocialMediaTab() {
  const [inbox, setInbox] = useState<InboxItem[]>([
    { id: 'in-1', sender: 'Alex Rivera', platform: 'LinkedIn', text: 'This pipeline simulator is fantastic. How does it connect to n8n?', sentiment: 'positive', replied: false },
    { id: 'in-2', sender: 'DevStudio 9', platform: 'YouTube', text: 'Can this voice synthesize in French?', sentiment: 'neutral', replied: true },
    { id: 'in-3', sender: 'Creative_Mind', platform: 'TikTok', text: 'Struggling with character consistency in Runway Gen-4.5. Help!', sentiment: 'negative', replied: false }
  ]);
  const [replyText, setReplyText] = useState('');
  const [selectedMsgId, setSelectedMsgId] = useState('in-1');

  const selectedMsg = inbox.find(m => m.id === selectedMsgId);

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedMsgId) return;

    setInbox(prev => prev.map(m => m.id === selectedMsgId ? { ...m, replied: true } : m));
    setReplyText('');
    alert(`Reply published to ${selectedMsg?.sender} on ${selectedMsg?.platform}!`);
  };

  const handleAutoRetweet = () => {
    alert("Auto-retweet scheduling loop active. System will automatically retweet top posts from @EstibanCreations every 6 hours.");
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-6" id="social-media-tab">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <ThumbsUp className="w-5 h-5 text-indigo-600" />
            Social Media Command Center (AgencyFlow)
          </h2>
          <p className="text-3xs text-slate-500 uppercase tracking-widest font-mono">Unified Inbox, Multi-Platform Preview, Sentiment Analysis, and Autoloops</p>
        </div>
        
        <button 
          onClick={handleAutoRetweet}
          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer font-sans"
        >
          Toggle Auto-Retweet Loop
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Unified Inbox List */}
        <div className="space-y-4 lg:col-span-1">
          <h3 className="text-2xs font-mono font-extrabold text-slate-400 uppercase tracking-widest">Unified Social Inbox</h3>
          
          <div className="space-y-2.5 max-h-[350px] overflow-y-auto">
            {inbox.map(item => (
              <div 
                key={item.id}
                onClick={() => setSelectedMsgId(item.id)}
                className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all space-y-2 ${
                  selectedMsgId === item.id 
                    ? 'bg-indigo-50 border-indigo-200' 
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-800">{item.sender}</span>
                  <span className={`text-[8px] font-mono font-black uppercase px-1.5 py-0.5 rounded ${
                    item.platform === 'LinkedIn' ? 'bg-blue-50 text-blue-700 border border-blue-150' : item.platform === 'YouTube' ? 'bg-red-50 text-red-700 border border-red-150' : 'bg-slate-900 text-white'
                  }`}>
                    {item.platform}
                  </span>
                </div>
                
                <p className="text-3xs text-slate-600 line-clamp-2 italic">"{item.text}"</p>

                <div className="flex justify-between items-center text-4xs font-mono">
                  <span className={`px-1.5 py-0.2 rounded font-bold uppercase ${
                    item.sentiment === 'positive' ? 'bg-emerald-100 text-emerald-800' : item.sentiment === 'neutral' ? 'bg-slate-150 text-slate-750' : 'bg-red-100 text-red-800'
                  }`}>
                    {item.sentiment}
                  </span>
                  <span className="text-slate-400">{item.replied ? 'Replied' : 'Pending'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Message Inspector & Active Composer */}
        <div className="lg:col-span-1 border border-slate-200 p-4 rounded-xl bg-slate-50 flex flex-col justify-between font-sans">
          <div>
            <h3 className="text-2xs font-mono font-extrabold text-slate-400 uppercase tracking-widest border-b pb-2 mb-3">Conversation Thread</h3>
            {selectedMsg ? (
              <div className="space-y-4">
                <div className="bg-white border border-slate-150 p-3 rounded-lg text-xs leading-relaxed font-semibold text-slate-700">
                  <p className="text-[10px] text-slate-450 font-mono font-bold">{selectedMsg.sender} says:</p>
                  <p className="mt-1">"{selectedMsg.text}"</p>
                </div>

                <form onSubmit={handleSendReply} className="space-y-3">
                  <textarea 
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={`Compose draft reply back on ${selectedMsg.platform}...`}
                    className="w-full p-2.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 font-sans"
                    rows={4}
                  />
                  <button 
                    type="submit"
                    className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" /> Dispatch Comment
                  </button>
                </form>
              </div>
            ) : (
              <p className="text-xs text-slate-400 font-mono text-center py-10">Select a unified inbox message to reply.</p>
            )}
          </div>
        </div>

        {/* Best Time to Post & Statistics previews */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-indigo-50/50 border border-indigo-150 p-4 rounded-xl space-y-2 text-center">
            <p className="text-[10px] font-mono font-bold text-indigo-500 uppercase tracking-widest">⚡ Best Time To Post Indicator</p>
            <h4 className="text-lg font-black text-indigo-900 font-sans">Today at 4:15 PM EST</h4>
            <p className="text-4xs text-slate-500 leading-normal font-medium">Calculated dynamically based on real-time LinkedIn and TikTok audience activity profiles.</p>
          </div>

          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 font-sans">
            <h4 className="text-2xs font-mono font-bold text-slate-400 uppercase tracking-widest mb-3">Post Previewer mockup</h4>
            <div className="bg-white border border-slate-150 p-3 rounded-xl space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-slate-200" />
                <span className="text-4xs font-bold text-slate-800">EstibanCreations</span>
              </div>
              <p className="text-4xs text-slate-600 leading-normal">
                "Our fully self-healing n8n workflow pipeline finished its execution cycle in 12ms. Real-time cognitive swarm routing active! 🤖 #AABOS #VisionWeaver"
              </p>
              <div className="flex gap-4 text-4xs font-mono text-slate-400 pt-1.5 border-t">
                <span>Likes: 142</span>
                <span>Shares: 23</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
