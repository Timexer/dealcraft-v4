'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Users, Briefcase, Trophy, Lock, TrendingUp, Search } from 'lucide-react';

interface CaseResult {
  id: string;
  scenarioId: string;
  outcome: string;
  finalScore: number;
  choicesMade: string;
  advisorLogs: string;
  createdAt: Date;
}

interface Player {
  id: string;
  name: string;
  careerTier: number;
  casesCompleted: number;
  totalScore: number;
  createdAt: Date;
  updatedAt: Date;
  caseResults: CaseResult[];
}

export function AdminDashboard({ initialPlayers }: { initialPlayers: Player[] }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [selectedCase, setSelectedCase] = useState<CaseResult | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === 'EB_ADMIN_2026') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Invalid passcode');
    }
  };

  const filteredPlayers = useMemo(() => {
    return initialPlayers.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [initialPlayers, searchQuery]);

  const totalPlayers = initialPlayers.length;
  const totalCases = initialPlayers.reduce((acc, p) => acc + p.casesCompleted, 0);
  const avgScore = totalCases > 0 
    ? Math.round(initialPlayers.reduce((acc, p) => acc + p.totalScore, 0) / totalCases) 
    : 0;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-zinc-950/50 border-white/10 backdrop-blur-xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-6 h-6 text-emerald-400" />
            </div>
            <CardTitle className="text-2xl text-white">Trainer Dashboard</CardTitle>
            <p className="text-sm text-zinc-400">Enter admin passcode to continue</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                type="password"
                placeholder="Passcode"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="bg-black/50 border-white/10 text-white placeholder:text-zinc-600"
              />
              {error && <p className="text-red-400 text-sm text-center">{error}</p>}
              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white">
                Unlock Dashboard
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  const renderCaseDetails = (c: CaseResult) => {
    let advisorLogs: string[] = [];
    let choicesMade: string[] = [];
    
    try {
      advisorLogs = JSON.parse(c.advisorLogs || '[]');
      choicesMade = JSON.parse(c.choicesMade || '[]');
    } catch (e) {
      console.error("Failed to parse logs", e);
    }

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-black/40 border-white/5">
            <CardContent className="p-4">
              <p className="text-sm text-zinc-400 mb-1">Final Score</p>
              <p className="text-2xl font-bold text-emerald-400">{c.finalScore}</p>
            </CardContent>
          </Card>
          <Card className="bg-black/40 border-white/5">
            <CardContent className="p-4">
              <p className="text-sm text-zinc-400 mb-1">Outcome</p>
              <Badge variant="outline" className="border-white/10 text-zinc-200">
                {c.outcome.replace(/_/g, ' ')}
              </Badge>
            </CardContent>
          </Card>
        </div>

        <div>
          <h3 className="text-lg font-medium text-white mb-3 flex items-center">
            <Trophy className="w-5 h-5 mr-2 text-amber-400" />
            Advisor Insights (AI Logs)
          </h3>
          <ScrollArea className="h-64 rounded-md border border-white/10 bg-black/50 p-4">
            {advisorLogs.length > 0 ? (
              <div className="space-y-4">
                {advisorLogs.map((log, i) => (
                  <div key={i} className="p-3 bg-zinc-900/50 rounded-lg border border-white/5 text-sm text-zinc-300">
                    <p className="font-semibold text-emerald-400 mb-1">Turn {i + 1}</p>
                    {log}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-zinc-500 text-center mt-8">No AI advice logged for this case.</p>
            )}
          </ScrollArea>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Trainer Dashboard
            </h1>
            <p className="text-zinc-400 mt-1">Review student negotiations and provide feedback</p>
          </div>
          <Button variant="outline" onClick={() => setIsAuthenticated(false)} className="border-white/10 text-zinc-300 hover:text-white hover:bg-white/5">
            Lock Session
          </Button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-zinc-950/50 border-white/10 backdrop-blur-sm">
            <CardContent className="p-6 flex items-center space-x-4">
              <div className="p-3 bg-blue-500/10 rounded-xl">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-400">Total Students</p>
                <h3 className="text-2xl font-bold text-white">{totalPlayers}</h3>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-zinc-950/50 border-white/10 backdrop-blur-sm">
            <CardContent className="p-6 flex items-center space-x-4">
              <div className="p-3 bg-purple-500/10 rounded-xl">
                <Briefcase className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-400">Cases Completed</p>
                <h3 className="text-2xl font-bold text-white">{totalCases}</h3>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-950/50 border-white/10 backdrop-blur-sm">
            <CardContent className="p-6 flex items-center space-x-4">
              <div className="p-3 bg-emerald-500/10 rounded-xl">
                <TrendingUp className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-400">Average Score</p>
                <h3 className="text-2xl font-bold text-white">{avgScore}</h3>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Player List */}
        <Card className="bg-zinc-950/80 border-white/10 backdrop-blur-sm overflow-hidden">
          <CardHeader className="border-b border-white/5 flex flex-row items-center justify-between p-6 bg-black/20">
            <CardTitle className="text-xl font-medium flex items-center">
              <Users className="w-5 h-5 mr-2 text-zinc-400" />
              Student Roster
            </CardTitle>
            <div className="relative w-64">
              <Search className="w-4 h-4 absolute left-3 top-3 text-zinc-500" />
              <Input 
                placeholder="Search students..." 
                className="pl-9 bg-black/50 border-white/10 text-white h-10"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </CardHeader>
          <div className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-zinc-400 bg-black/40 uppercase border-b border-white/5">
                  <tr>
                    <th className="px-6 py-4 font-medium">Player Name</th>
                    <th className="px-6 py-4 font-medium">Tier</th>
                    <th className="px-6 py-4 font-medium">Cases</th>
                    <th className="px-6 py-4 font-medium">Total Score</th>
                    <th className="px-6 py-4 font-medium">Last Active</th>
                    <th className="px-6 py-4 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredPlayers.map((player) => (
                    <tr key={player.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4 font-medium text-zinc-200">{player.name}</td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/20">
                          Tier {player.careerTier}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-zinc-300">{player.casesCompleted}</td>
                      <td className="px-6 py-4 text-emerald-400 font-medium">{player.totalScore}</td>
                      <td className="px-6 py-4 text-zinc-400">{new Date(player.updatedAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-zinc-400 hover:text-white hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => setSelectedPlayer(player)}
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {filteredPlayers.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-zinc-500">
                        No students found matching "{searchQuery}"
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      </div>

      {/* Player Detail Dialog */}
      <Dialog open={!!selectedPlayer} onOpenChange={(open) => !open && setSelectedPlayer(null)}>
        <DialogContent className="bg-zinc-950 border-white/10 text-white max-w-4xl h-[85vh] p-0 flex flex-col">
          <DialogHeader className="p-6 border-b border-white/10 bg-black/20 shrink-0">
            <DialogTitle className="text-2xl flex items-center justify-between">
              <span>{selectedPlayer?.name}'s Profile</span>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-3 py-1 text-sm">
                Total Score: {selectedPlayer?.totalScore}
              </Badge>
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-hidden flex">
            {/* Case List Sidebar */}
            <div className="w-1/3 border-r border-white/10 bg-black/40 flex flex-col">
              <div className="p-4 border-b border-white/10 font-medium text-zinc-300 shrink-0">
                Completed Cases ({selectedPlayer?.caseResults.length})
              </div>
              <ScrollArea className="flex-1">
                <div className="p-2 space-y-2">
                  {selectedPlayer?.caseResults.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => setSelectedCase(result)}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        selectedCase?.id === result.id 
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-white' 
                          : 'bg-zinc-900/50 border-white/5 text-zinc-400 hover:bg-white/5 hover:text-zinc-200'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium capitalize">{result.scenarioId.replace(/-/g, ' ')}</span>
                        <span className="text-emerald-400 text-xs font-bold">{result.finalScore}</span>
                      </div>
                      <div className="text-xs opacity-70 flex justify-between">
                        <span>{new Date(result.createdAt).toLocaleDateString()}</span>
                        <span className="capitalize">{result.outcome.replace(/_/g, ' ')}</span>
                      </div>
                    </button>
                  ))}
                  {selectedPlayer?.caseResults.length === 0 && (
                    <p className="text-center text-zinc-500 text-sm mt-4">No completed cases yet.</p>
                  )}
                </div>
              </ScrollArea>
            </div>
            
            {/* Case Detail View */}
            <div className="w-2/3 bg-zinc-950 p-6 flex flex-col">
              {selectedCase ? (
                renderCaseDetails(selectedCase)
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-zinc-500">
                  <Briefcase className="w-12 h-12 mb-4 opacity-20" />
                  <p>Select a case to view details and AI logs</p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
