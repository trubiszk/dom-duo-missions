import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Trophy, Flame, CheckCircle, Plus, Target, Gift } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { useToast } from "@/hooks/use-toast";
import { calculateCyclePhase, type CyclePhase } from "@/lib/cycleUtils";

interface Task {
  id: string;
  title: string;
  category: string;
  completed: boolean;
}

interface Mission {
  id: string;
  title: string;
  category: string;
  completed: boolean;
  exp_reward: number;
}

interface UserExp {
  exp_points: number;
}

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [todayTasks, setTodayTasks] = useState<Task[]>([]);
  const [weekMissions, setWeekMissions] = useState<Mission[]>([]);
  const [userExp, setUserExp] = useState(0);
  const [coupleSpaceId, setCoupleSpaceId] = useState<string>('');
  const [partnerCyclePhase, setPartnerCyclePhase] = useState<CyclePhase | null>(null);
  const [partnerName, setPartnerName] = useState<string>('Partner');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      const { data: membership } = await supabase
        .from('couple_members')
        .select('couple_space_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!membership) {
        navigate('/onboarding');
        return;
      }

      setCoupleSpaceId(membership.couple_space_id);
      await loadDashboardData(user.id, membership.couple_space_id);
    } catch (error) {
      console.error('Auth check error:', error);
      navigate('/auth');
    }
  };

  const loadDashboardData = async (userId: string, spaceId: string) => {
    setLoading(true);
    try {
      // Load today's tasks
      const { data: tasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('couple_space_id', spaceId)
        .eq('assigned_to', userId)
        .eq('completed', false)
        .order('created_at', { ascending: false })
        .limit(5);

      setTodayTasks(tasks || []);

      // Load this week's missions
      const today = new Date();
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      
      const { data: missions } = await supabase
        .from('missions')
        .select('*')
        .eq('couple_space_id', spaceId)
        .gte('week_start', weekStart.toISOString().split('T')[0])
        .order('created_at', { ascending: false });

      setWeekMissions(missions || []);

      // Load user exp
      const { data: expData } = await supabase
        .from('user_exp')
        .select('exp_points')
        .eq('couple_space_id', spaceId)
        .eq('user_id', userId)
        .single();

      setUserExp(expData?.exp_points || 0);

      // Load partner's cycle tracking (if enabled)
      const { data: members } = await supabase
        .from('couple_members')
        .select('user_id')
        .eq('couple_space_id', spaceId);

      const partner = members?.find(m => m.user_id !== userId);
      if (partner) {
        // Get partner's name
        const { data: partnerProfile } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', partner.user_id)
          .single();

        setPartnerName(partnerProfile?.name || 'Partner');

        // Get partner's cycle tracking
        const { data: cycleData } = await supabase
          .from('cycle_tracking')
          .select('*')
          .eq('user_id', partner.user_id)
          .eq('couple_space_id', spaceId)
          .eq('enabled', true)
          .maybeSingle();

        if (cycleData?.last_period_start) {
          const phase = calculateCyclePhase(cycleData.last_period_start, cycleData.cycle_length);
          setPartnerCyclePhase(phase);
        }
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskComplete = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ 
          completed: true,
          completed_at: new Date().toISOString(),
        })
        .eq('id', taskId);

      if (error) throw error;

      setTodayTasks(prev => prev.filter(t => t.id !== taskId));
      
      toast({
        title: "Zadanie ukończone! ✅",
        description: "Brawo!",
      });
    } catch (error: any) {
      toast({
        title: "Błąd",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      dom: "Dom",
      finanse: "Finanse",
      zdrowie: "Zdrowie",
      relacja: "Relacja",
      inne: "Inne",
    };
    return labels[category] || category;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Heart className="w-12 h-12 text-primary fill-current animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Ładowanie...</p>
        </div>
      </div>
    );
  }

  const completedMissions = weekMissions.filter(m => m.completed).length;
  const totalMissions = weekMissions.length;

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-6 max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Heart className="w-6 h-6 text-primary fill-current" />
              Witaj!
            </h1>
            <p className="text-muted-foreground text-sm">Twoje questy na dziś</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-accent font-semibold">
              <Trophy className="w-5 h-5" />
              <span className="text-2xl">{userExp}</span>
            </div>
            <p className="text-xs text-muted-foreground">exp</p>
          </div>
        </div>

        {/* Partner Cycle Context */}
        {partnerCyclePhase && (
          <Card className="mb-6 shadow-card border-pink-200/50 bg-gradient-to-br from-background to-pink-50/20 dark:to-pink-950/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="text-2xl">{partnerCyclePhase.emoji}</span>
                Kontekst: {partnerName}
              </CardTitle>
              <CardDescription className="text-sm font-medium">
                {partnerCyclePhase.phase} (Dzień {partnerCyclePhase.dayOfCycle})
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {partnerCyclePhase.tip}
              </p>
              <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border/50">
                💡 To nie diagnoza medyczna, tylko kontekst, który może pomóc w lepszym zrozumieniu.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Week Progress */}
        <Card className="mb-6 shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-primary" />
                <span className="font-semibold">Ten tydzień</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {completedMissions}/{totalMissions} misji
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-gradient-warm h-2 rounded-full transition-all"
                style={{ width: totalMissions > 0 ? `${(completedMissions / totalMissions) * 100}%` : '0%' }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Today's Tasks */}
        <Card className="mb-6 shadow-card">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-lg">Dzisiejsze zadania</CardTitle>
            <Button 
              size="sm" 
              variant="ghost"
              onClick={() => navigate('/tasks')}
            >
              <Plus className="w-4 h-4 mr-1" />
              Dodaj
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {todayTasks.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                Brak zadań na dziś 🎉
              </p>
            ) : (
              todayTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <button
                    onClick={() => handleTaskComplete(task.id)}
                    className="mt-0.5 w-5 h-5 rounded border-2 border-primary hover:bg-primary/10 transition-colors flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{task.title}</p>
                    <Badge variant="secondary" className="mt-1 text-xs">
                      {getCategoryLabel(task.category)}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            className="h-auto py-4 flex flex-col items-center gap-2"
            onClick={() => navigate('/missions')}
          >
            <Target className="w-6 h-6 text-secondary" />
            <span className="text-sm">Misje</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto py-4 flex flex-col items-center gap-2"
            onClick={() => navigate('/rewards')}
          >
            <Gift className="w-6 h-6 text-accent" />
            <span className="text-sm">Nagrody</span>
          </Button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Dashboard;