import React, { useState } from 'react';
import { TrendingUp, BarChart2, Star, Plus, RefreshCw, Layers } from 'lucide-react';

export default function TrendsTab() {
  const [activeKeyword, setActiveKeyword] = useState('Autonomous Agents');
  const [keywords, setKeywords] = useState([
    { word: 'Autonomous Agents', weight: 94, category: 'AI Architecture' },
    { word: 'n8n pipelines', weight: 88, category: 'Workflows' },
    { word: 'Runway Gen-4.5', weight: 81, category: 'Video Synthesis' },
    { word: 'ElevenLabs clone', weight: 74, category: 'Voice synthesis' },
    { word: 'Stripe MRR elasticity', weight: 65, category: 'Finance' },
    { word: 'Cognitive Swarms', weight: 90, category: 'AI Architecture' }
  ]);

  const [competitors, setCompetitors] = useState([
    { name: 'FlowStack Agency', followers: '45,200', growth: '+12.4%', status: 'Active Tracking' },
    { name: 'WeaveMotion Labs', followers: '31,800', growth: '+8.1%', status: 'Active Tracking' },
    { name: 'AABOS Competitor X', followers: '89,100', growth: '-2.3%', status: 'Declining' }
  ]);

  const [trendingSounds, setTrendingSounds] = useState([
    { rank: 1, title: 'Synthwave Eclipse (Sped Up)', postsCount: '1.2M', growth: '94%' },
    { rank: 2, title: 'Corporate Minimalist Beats', postsCount: '840K', growth: '62%' },
    { rank: 3, title: 'Lofi Coffee Brainwaves', postsCount: '620K', growth: '45%' }
  ]);

  const handleKeywordClick = (word: string) => {
    setActiveKeyword(word);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-6" id="trends-tab">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600 animate-pulse" />
            Market Intelligence & Trends Dashboard
          </h2>
          <p className="text-3xs text-slate-500 uppercase tracking-widest font-mono">Competitor Tracking, Keyword weight metrics, and TikTok sound-trending graphs</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Keyword Cloud Column */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-2xs font-mono font-extrabold text-slate-400 uppercase tracking-widest">Visual Keyword Cloud</h3>
          
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-wrap gap-2 min-h-[180px] items-center justify-center">
            {keywords.map(kw => {
              // Dynamic sizes based on weight
              const sizeClass = kw.weight >= 90 ? 'text-sm font-black text-indigo-700' : kw.weight >= 80 ? 'text-xs font-bold text-cyan-600' : 'text-[10px] font-semibold text-slate-600';
              return (
                <button 
                  key={kw.word}
                  onClick={() => handleKeywordClick(kw.word)}
                  className={`px-3 py-1.5 rounded-full border bg-white shadow-3xs cursor-pointer transition-all ${
                    activeKeyword === kw.word ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-slate-150 hover:border-slate-300'
                  } ${sizeClass}`}
                >
                  {kw.word}
                </button>
              );
            })}
          </div>

          {activeKeyword && (
            <div className="p-3 bg-indigo-50/50 border border-indigo-150 rounded-xl space-y-1 text-xs">
              <span className="text-[10px] font-mono font-bold text-indigo-600 uppercase">Selected Keyword Insights:</span>
              <p className="font-bold text-slate-800">{activeKeyword}</p>
              <p className="text-[10px] text-slate-500 leading-normal font-medium">
                Weight: {keywords.find(k => k.word === activeKeyword)?.weight || 80}/100 | Category: {keywords.find(k => k.word === activeKeyword)?.category || 'General'}
              </p>
            </div>
          )}
        </div>

        {/* Competitor Tracking list */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-2xs font-mono font-extrabold text-slate-400 uppercase tracking-widest">Competitor Follower Tracking</h3>
          
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-3xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[10px] font-mono uppercase text-slate-400 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Competitor</th>
                  <th className="p-3">Followers</th>
                  <th className="p-3">Growth</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 font-semibold bg-white">
                {competitors.map(c => (
                  <tr key={c.name} className="hover:bg-slate-50/50">
                    <td className="p-3 font-bold text-slate-800">{c.name}</td>
                    <td className="p-3 font-mono text-slate-650">{c.followers}</td>
                    <td className={`p-3 font-mono ${c.growth.startsWith('+') ? 'text-emerald-600' : 'text-red-500'}`}>{c.growth}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* TikTok sound-trending graph list */}
        <div className="lg:col-span-1 space-y-4 font-sans">
          <h3 className="text-2xs font-mono font-extrabold text-slate-400 uppercase tracking-widest">TikTok sound-trending graph</h3>
          
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3.5">
            {trendingSounds.map(sound => (
              <div key={sound.rank} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                  <span>#{sound.rank} {sound.title}</span>
                  <span className="font-mono text-indigo-600 text-[10px]">{sound.postsCount} posts</span>
                </div>
                
                {/* Simulated Graph Bar */}
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                    style={{ width: sound.growth }}
                  />
                </div>
                
                <p className="text-[9px] font-mono text-slate-400 font-bold uppercase">Trending momentum growth: +{sound.growth}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
