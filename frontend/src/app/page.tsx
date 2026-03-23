"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Rocket, LayoutGrid, Search, Wallet, Coins, AlertCircle, 
  PieChart as PieIcon, ListChecks, Download, History, FileText, Server
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import YAML from "yaml";

const COLORS = ['#3b82f6', '#10b981', '#6366f1', '#f59e0b', '#ec4899', '#8b5cf6'];

const TEMPLATES = [
  { name: "SaaS Starter", prompt: "I want to build a B2B SaaS that allows users to upload PDF documents and chat with them using RAG. It needs a login system and Stripe billing." },
  { name: "Code Review Bot", prompt: "An automated GitHub PR reviewer that comments on code quality, security vulnerabilities, and suggests improvements." },
  { name: "Customer Support AI", prompt: "A customer support chatbot integrated with our internal knowledge base to answer user queries 24/7 and hand off to humans if needed." }
];

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("gpt-4o-mini");
  const [baseUrl, setBaseUrl] = useState(""); // v0.3.0 Local LLM support
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]); // v0.4.0 Local History

  // Load history on mount
  useEffect(() => {
    const saved = localStorage.getItem("scopeAI_history");
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const handleAnalyze = async () => {
    if (!prompt) return;
    setIsAnalyzing(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch("http://localhost:8000/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": apiKey ? `Bearer ${apiKey}` : "",
        },
        body: JSON.stringify({ prompt, model, base_url: baseUrl || undefined }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to analyze project");
      }

      const data = await response.json();
      const totalTokens = data.tasks.reduce((acc: number, task: any) => acc + task.inputTokens + task.outputTokens, 0);
      
      const finalResult = {
        ...data,
        displayTotalTokens: totalTokens.toLocaleString(),
        displayTotalCost: `$${data.totalEstimatedCost.toFixed(4)}`,
        chartData: data.tasks.map((task: any) => ({ name: task.name, value: task.cost > 0 ? task.cost : 1 })) // 1 for local free models visualization
      };

      setResult(finalResult);

      // Save to History (v0.4.0)
      const newHistory = [finalResult, ...history].slice(0, 5); // Keep last 5
      setHistory(newHistory);
      localStorage.setItem("scopeAI_history", JSON.stringify(newHistory));

    } catch (err: any) {
      setError(err.message || "Is the backend running? Run ./run.sh");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // v0.2.0: Export Features
  const exportYAML = () => {
    if (!result) return;
    const yamlStr = YAML.stringify(result);
    const blob = new Blob([yamlStr], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${result.projectName.replace(/\s+/g, '_')}_blueprint.yaml`;
    a.click();
  };

  const exportPDF = () => {
    window.print(); // The most robust way to export a web dashboard to PDF without breaking CSS
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans p-6 md:p-12 print:bg-white print:text-black print:p-0">
      <header className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2 bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            Scope-AI
          </h1>
          <p className="text-slate-400 text-lg">Architect your AI projects with data-backed confidence.</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-emerald-400 border-emerald-400/30 bg-emerald-400/10 px-3 py-1 font-bold">
            v1.0.0
          </Badge>
          {result && (
            <>
              <Button variant="outline" size="sm" onClick={exportYAML} className="border-slate-800 text-slate-300 hover:text-white">
                <FileText className="w-4 h-4 mr-2" /> YAML
              </Button>
              <Button variant="outline" size="sm" onClick={exportPDF} className="border-slate-800 text-slate-300 hover:text-white">
                <Download className="w-4 h-4 mr-2" /> PDF
              </Button>
            </>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Sidebar: Input Panel */}
        <section className="lg:col-span-4 space-y-6 print:hidden">
          <Card className="bg-slate-900 border-slate-800 shadow-2xl">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Search className="w-5 h-5 text-blue-400" />
                  Project Discovery
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* v1.0.0: Templates */}
              <div className="space-y-2">
                <Label className="text-xs text-slate-500">Quick Templates</Label>
                <div className="flex flex-wrap gap-2">
                  {TEMPLATES.map((t, i) => (
                    <Badge 
                      key={i} 
                      className="cursor-pointer bg-slate-800 hover:bg-blue-600/50 text-slate-300 transition-colors"
                      onClick={() => setPrompt(t.prompt)}
                    >
                      {t.name}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <Label htmlFor="prompt">Project Description</Label>
                <Textarea
                  id="prompt"
                  placeholder="Describe your AI idea in detail..."
                  className="bg-slate-950 border-slate-800 min-h-[140px] focus:ring-blue-500 text-sm"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="model" className="text-xs">Model</Label>
                  <Input 
                    id="model" 
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="gpt-4o, ollama/llama3..."
                    className="bg-slate-950 border-slate-800 h-9 text-xs" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="api_key" className="text-xs flex items-center gap-1">
                    API Key <Wallet className="w-3 h-3 text-emerald-500" />
                  </Label>
                  <Input 
                    id="api_key" type="password" placeholder="sk-..." 
                    className="bg-slate-950 border-slate-800 h-9 text-xs" 
                    value={apiKey} onChange={(e) => setApiKey(e.target.value)}
                  />
                </div>
              </div>

              {/* v0.3.0 Local LLM Support */}
              <div className="space-y-2">
                <Label htmlFor="base_url" className="text-xs flex items-center gap-1">
                  Custom Base URL <Server className="w-3 h-3 text-blue-500" />
                </Label>
                <Input 
                  id="base_url" 
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder="e.g. http://localhost:11434 (for Ollama)"
                  className="bg-slate-950 border-slate-800 h-9 text-xs" 
                />
              </div>

              <Button 
                onClick={handleAnalyze} 
                disabled={isAnalyzing || !prompt}
                className="w-full bg-blue-600 hover:bg-blue-500 transition-all py-6 text-base font-bold mt-2"
              >
                {isAnalyzing ? "Architecting..." : "Generate Blueprint"}
                {!isAnalyzing && <Rocket className="ml-2 w-4 h-4" />}
              </Button>

              {error && (
                <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg flex items-start gap-2 text-red-400 text-xs">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* v0.4.0 Local History */}
          {history.length > 0 && (
            <Card className="bg-slate-900/50 border-slate-800/50">
              <CardHeader className="py-4 border-b border-slate-800/50">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <History className="w-4 h-4 text-slate-400" />
                  Recent Blueprints
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-800/50">
                  {history.map((h, idx) => (
                    <div 
                      key={idx} 
                      className="p-3 hover:bg-slate-800/30 cursor-pointer transition-colors"
                      onClick={() => setResult(h)}
                    >
                      <div className="text-sm font-bold text-slate-300">{h.projectName}</div>
                      <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                        <span>{h.modelUsed}</span>
                        <span className="text-emerald-400">{h.displayTotalCost}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Right: Analysis Dashboard */}
        <section className="lg:col-span-8 space-y-6">
          {!result && !isAnalyzing && (
            <div className="h-[500px] flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-slate-800 rounded-2xl bg-slate-900/20 print:hidden">
              <div className="bg-slate-800/50 p-6 rounded-full mb-6">
                <LayoutGrid className="w-12 h-12 text-slate-700" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-slate-400 font-mono tracking-tighter uppercase">Waiting for input_</h3>
              <p className="text-slate-600 max-w-sm text-sm">Select a template or describe your idea to generate a structured architecture and budget projection.</p>
            </div>
          )}

          {isAnalyzing && (
            <div className="space-y-6 animate-in fade-in duration-500 print:hidden">
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-32 w-full bg-slate-900 rounded-xl" />
                <Skeleton className="h-32 w-full bg-slate-900 rounded-xl" />
              </div>
              <Skeleton className="h-[400px] w-full bg-slate-900 rounded-xl" />
            </div>
          )}

          {result && !isAnalyzing && (
            <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-6 print:text-black">
              <div className="flex justify-between items-end px-1">
                <div>
                  <h2 className="text-3xl font-black text-slate-100 tracking-tight print:text-black">{result.projectName}</h2>
                  <p className="text-sm text-slate-500 mt-1 print:text-gray-600">Generated by Scope-AI Architect</p>
                </div>
                <Badge className="bg-blue-600/20 text-blue-400 border-blue-600/30 mb-1 print:border-blue-200 print:text-blue-800">{result.modelUsed}</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-slate-900 border-slate-800 border-l-4 border-l-emerald-500 shadow-xl print:border-gray-300 print:bg-white">
                  <CardHeader className="pb-2">
                    <CardDescription className="flex items-center gap-1 uppercase tracking-wider text-[10px] font-bold text-slate-500 print:text-gray-500">
                      <Wallet className="w-3 h-3" /> Total Est. Cost
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-black text-emerald-400 print:text-emerald-700">{result.displayTotalCost}</div>
                    <p className="text-[10px] text-slate-600 mt-1 italic print:text-gray-500">Calculated per 1,000 user sessions</p>
                  </CardContent>
                </Card>
                <Card className="bg-slate-900 border-slate-800 border-l-4 border-l-blue-500 shadow-xl print:border-gray-300 print:bg-white">
                  <CardHeader className="pb-2">
                    <CardDescription className="flex items-center gap-1 uppercase tracking-wider text-[10px] font-bold text-slate-500 print:text-gray-500">
                      <Coins className="w-3 h-3" /> Total Tokens
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-black text-blue-400 print:text-blue-700">{result.displayTotalTokens}</div>
                    <p className="text-[10px] text-slate-600 mt-1 italic print:text-gray-500">Cumulative I/O across all tasks</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Visual Chart */}
                <Card className="md:col-span-5 bg-slate-900 border-slate-800 flex flex-col items-center justify-center p-6 print:border-gray-300 print:bg-white">
                   <h4 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2 print:text-gray-500">
                     <PieIcon className="w-3 h-3" /> Cost Distribution
                   </h4>
                   <div className="w-full h-[250px] print:h-[200px]">
                     <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                         <Pie data={result.chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                           {result.chartData.map((entry: any, index: number) => (
                             <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0.1)" />
                           ))}
                         </Pie>
                         <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px' }} itemStyle={{ color: '#f1f5f9', fontSize: '12px' }} />
                       </PieChart>
                     </ResponsiveContainer>
                   </div>
                   <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2">
                     {result.chartData.map((entry: any, index: number) => (
                       <div key={index} className="flex items-center gap-1.5">
                         <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                         <span className="text-[10px] text-slate-400 font-medium print:text-gray-600">{entry.name}</span>
                       </div>
                     ))}
                   </div>
                </Card>

                {/* Detail Tabs */}
                <Card className="md:col-span-7 bg-slate-900 border-slate-800 overflow-hidden print:border-gray-300 print:bg-white">
                  <Tabs defaultValue="tasks" className="w-full">
                    <TabsList className="bg-slate-950/50 border-b border-slate-800 rounded-none w-full p-0 flex justify-start print:hidden">
                      <TabsTrigger value="tasks" className="rounded-none px-6 py-4 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-500">
                        <ListChecks className="w-4 h-4 mr-2" /> Breakdown
                      </TabsTrigger>
                      <TabsTrigger value="models" className="rounded-none px-6 py-4 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-emerald-500">
                        <Rocket className="w-4 h-4 mr-2" /> Models
                      </TabsTrigger>
                    </TabsList>
                    
                    {/* Tasks List */}
                    <TabsContent value="tasks" className="m-0 max-h-[300px] overflow-y-auto custom-scrollbar print:max-h-full print:block">
                        <div className="divide-y divide-slate-800/50 print:divide-gray-200">
                          {result.tasks.map((task: any) => (
                            <div key={task.id} className="p-4 flex justify-between items-start hover:bg-slate-800/20 transition-colors">
                              <div className="max-w-[70%]">
                                <div className="font-semibold text-slate-200 text-sm print:text-black">{task.name}</div>
                                <div className="text-[11px] text-slate-500 mt-1 print:text-gray-600">{task.description}</div>
                              </div>
                              <div className="text-right">
                                  <div className="font-mono text-emerald-400 text-sm font-bold print:text-emerald-700">${task.cost.toFixed(4)}</div>
                                  <div className="text-[9px] text-slate-600 print:text-gray-500">{(task.inputTokens + task.outputTokens).toLocaleString()} tk</div>
                              </div>
                            </div>
                          ))}
                        </div>
                    </TabsContent>
                    
                    {/* Models List */}
                    <TabsContent value="models" className="m-0 p-4 space-y-4 max-h-[300px] overflow-y-auto print:hidden">
                      {result.recommendations.map((rec: any, i: number) => (
                        <div key={i} className="p-4 bg-slate-950/50 border border-slate-800 rounded-xl">
                          <div className="text-sm font-bold text-blue-400 mb-1">{rec.model}</div>
                          <p className="text-xs text-slate-400 leading-relaxed">{rec.reason}</p>
                        </div>
                      ))}
                    </TabsContent>
                  </Tabs>
                </Card>
              </div>
            </div>
          )}
        </section>
      </main>

      <footer className="max-w-7xl mx-auto mt-24 py-8 border-t border-slate-900/50 text-center print:hidden">
        <p className="text-slate-700 text-[10px] font-mono tracking-widest uppercase italic">
          Empowering Builders. Scope-AI v1.0.0
        </p>
      </footer>
    </div>
  );
}
