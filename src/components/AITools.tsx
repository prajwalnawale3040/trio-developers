import React, { useState } from 'react';
import { 
  Image as ImageIcon, 
  Type, 
  Layout, 
  MessageSquare, 
  Sparkles, 
  Download,
  RefreshCw,
  Wand2,
  Share2
} from 'lucide-react';
import { motion } from 'motion/react';
import { geminiService } from '../services/geminiService';
import { cn } from '../lib/utils';

export default function AITools({ isDarkMode }: { isDarkMode: boolean }) {
  const [activeTool, setActiveTool] = useState('image');
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const tools = [
    { id: 'image', label: 'Image Gen', icon: ImageIcon, desc: 'Create AI images from text' },
    { id: 'poster', label: 'Poster Gen', icon: Layout, desc: 'Design marketing posters' },
    { id: 'caption', label: 'Caption Gen', icon: Type, desc: 'Generate catchy captions' },
    { id: 'adcopy', label: 'Ad Copy', icon: MessageSquare, desc: 'Write high-converting ads' },
  ];

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    setResult(null);
    try {
      if (activeTool === 'image' || activeTool === 'poster') {
        const { imageUrl } = await geminiService.generateImage(prompt);
        setResult(imageUrl);
      } else {
        const { enhancedText } = await geminiService.enhanceMessage(prompt, 'creative');
        setResult(enhancedText);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => {
              setActiveTool(tool.id);
              setResult(null);
            }}
            className={cn(
              "p-6 rounded-2xl border text-left transition-all duration-300 group",
              activeTool === tool.id 
                ? (isDarkMode ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400" : "bg-emerald-50 border-emerald-200 text-emerald-600")
                : (isDarkMode ? "bg-[#0a0a0a] border-white/10 text-slate-400 hover:border-white/20" : "bg-white border-slate-200 text-slate-500 hover:border-slate-300 shadow-sm")
            )}
          >
            <tool.icon className={cn(
              "mb-4 transition-transform group-hover:scale-110",
              activeTool === tool.id ? "text-emerald-500" : "text-slate-500"
            )} size={24} />
            <p className="font-bold">{tool.label}</p>
            <p className="text-xs opacity-60 mt-1">{tool.desc}</p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className={cn(
          "p-8 rounded-3xl border",
          isDarkMode ? "bg-[#0a0a0a] border-white/10" : "bg-white border-slate-200 shadow-sm"
        )}>
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Sparkles className="text-emerald-500" size={20} />
            Generator
          </h3>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">Enter Prompt</label>
              <textarea 
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder={
                  activeTool === 'image' ? "Describe the image you want to create..." :
                  activeTool === 'poster' ? "What is the poster about? (e.g. Summer Sale)" :
                  "What should the AI write about?"
                }
                className={cn(
                  "w-full px-4 py-4 rounded-2xl border focus:outline-none focus:ring-2 focus:ring-emerald-500/20 h-40 resize-none transition-all",
                  isDarkMode ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"
                )}
              />
            </div>
            <button 
              onClick={handleGenerate}
              disabled={isGenerating || !prompt}
              className="w-full py-4 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isGenerating ? (
                <RefreshCw className="animate-spin" size={20} />
              ) : (
                <Wand2 size={20} />
              )}
              {isGenerating ? 'Generating...' : 'Generate Magic'}
            </button>
          </div>
        </div>

        <div className={cn(
          "p-8 rounded-3xl border flex flex-col items-center justify-center min-h-[400px]",
          isDarkMode ? "bg-[#0a0a0a] border-white/10" : "bg-white border-slate-200 shadow-sm"
        )}>
          {result ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full h-full flex flex-col items-center"
            >
              {activeTool === 'image' || activeTool === 'poster' ? (
                <div className="relative group w-full aspect-square max-w-sm rounded-2xl overflow-hidden border border-white/10">
                  <img src={result} alt="AI Generated" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                    <button className="p-3 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-colors">
                      <Download size={20} />
                    </button>
                    <button className="p-3 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-colors">
                      <Share2 size={20} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className={cn(
                  "w-full p-6 rounded-2xl border font-medium leading-relaxed",
                  isDarkMode ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"
                )}>
                  {result}
                </div>
              )}
              <div className="mt-6 flex gap-4">
                <button 
                  onClick={() => setResult(null)}
                  className="px-6 py-2 rounded-xl border border-white/10 text-sm font-medium hover:bg-white/5 transition-colors"
                >
                  Discard
                </button>
                <button className="px-6 py-2 rounded-xl bg-emerald-500 text-white text-sm font-bold hover:bg-emerald-600 transition-all">
                  Use in Campaign
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 mx-auto">
                <Sparkles size={40} />
              </div>
              <div>
                <p className="font-bold text-lg">Your creation will appear here</p>
                <p className="text-sm text-slate-500">Enter a prompt and click generate to start</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
