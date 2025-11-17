import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trophy, Flame, Check } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { useToast } from "@/hooks/use-toast";

interface Mission {
  id: string;
  title: string;
  description: string | null;
  category: string;
  assigned_to: string | null;
  is_shared: boolean;
  exp_reward: number;
  completed: boolean;
  streak_count: number;
}

const Missions = () => {
  const [loading, setLoading] = useState(true);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [coupleSpaceId, setCoupleSpaceId] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [partnerId, setPartnerId] = useState<string>('');
  const [partnerName, setPartnerName] = useState<string>('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newMission, setNewMission] = useState({
    title: '',
    description: '',
    category: 'inne' as const,
    assignedTo: 'shared' as 'me' | 'partner' | 'shared',
    expReward: 10,
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      setUserId(user.id);

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

      // Get partner info
      const { data: members } = await supabase
        .from('couple_members')
        .select('user_id')
        .eq('couple_space_id', membership.couple_space_id);

      const partner = members?.find(m => m.user_id !== user.id);
      if (partner) {
        setPartnerId(partner.user_id);
        
        const { data: profile } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', partner.user_id)
          .single();

        setPartnerName(profile?.name || 'Partner');
      }

      await loadMissions(membership.couple_space_id);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMissions = async (spaceId: string) => {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());

    const { data } = await supabase
      .from('missions')
      .select('*')
      .eq('couple_space_id', spaceId)
      .gte('week_start', weekStart.toISOString().split('T')[0])
      .order('created_at', { ascending: false });

    setMissions(data || []);
  };

  const handleCreateMission = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const today = new Date();
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      let assignedToId = null;
      let isShared = newMission.assignedTo === 'shared';
      
      if (newMission.assignedTo === 'me') {
        assignedToId = userId;
      } else if (newMission.assignedTo === 'partner') {
        assignedToId = partnerId;
      }

      const { error } = await supabase
        .from('missions')
        .insert({
          couple_space_id: coupleSpaceId,
          title: newMission.title,
          description: newMission.description || null,
          category: newMission.category,
          assigned_to: assignedToId,
          is_shared: isShared,
          exp_reward: newMission.expReward,
          week_start: weekStart.toISOString().split('T')[0],
          week_end: weekEnd.toISOString().split('T')[0],
          created_by: userId,
        });

      if (error) throw error;

      toast({
        title: "Misja dodana! 🎯",
      });

      setDialogOpen(false);
      setNewMission({
        title: '',
        description: '',
        category: 'inne',
        assignedTo: 'shared',
        expReward: 10,
      });

      loadMissions(coupleSpaceId);
    } catch (error: any) {
      toast({
        title: "Błąd",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCompleteMission = async (missionId: string, currentlyCompleted: boolean, expReward: number, assignedTo: string | null, isShared: boolean) => {
    try {
      const { error: missionError } = await supabase
        .from('missions')
        .update({
          completed: !currentlyCompleted,
          completed_at: !currentlyCompleted ? new Date().toISOString() : null,
        })
        .eq('id', missionId);

      if (missionError) throw missionError;

      // Award exp if completing (not uncompleting)
      if (!currentlyCompleted) {
        if (isShared || !assignedTo) {
          // Award to both
          const { data: allMembers } = await supabase
            .from('couple_members')
            .select('user_id')
            .eq('couple_space_id', coupleSpaceId);

          for (const member of allMembers || []) {
            const { data: currentExp } = await supabase
              .from('user_exp')
              .select('exp_points')
              .eq('couple_space_id', coupleSpaceId)
              .eq('user_id', member.user_id)
              .single();

            await supabase
              .from('user_exp')
              .update({ exp_points: (currentExp?.exp_points || 0) + expReward })
              .eq('couple_space_id', coupleSpaceId)
              .eq('user_id', member.user_id);
          }
        } else {
          // Award to assigned person
          const { data: currentExp } = await supabase
            .from('user_exp')
            .select('exp_points')
            .eq('couple_space_id', coupleSpaceId)
            .eq('user_id', assignedTo)
            .single();

          await supabase
            .from('user_exp')
            .update({ exp_points: (currentExp?.exp_points || 0) + expReward })
            .eq('couple_space_id', coupleSpaceId)
            .eq('user_id', assignedTo);
        }

        toast({
          title: "Misja ukończona! 🎉",
          description: `+${expReward} exp!`,
        });
      }

      loadMissions(coupleSpaceId);
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
    return <div className="min-h-screen bg-background flex items-center justify-center pb-20">Ładowanie...</div>;
  }

  const completedCount = missions.filter(m => m.completed).length;
  const totalExp = missions.filter(m => m.completed).reduce((sum, m) => sum + m.exp_reward, 0);

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-6 max-w-lg">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Misje tygodniowe</h1>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-gradient-warm">
                <Plus className="w-4 h-4 mr-1" />
                Nowa
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Dodaj misję</DialogTitle>
                <DialogDescription>
                  Stwórz nowy quest na ten tydzień
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateMission} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Nazwa misji</Label>
                  <Input
                    id="title"
                    value={newMission.title}
                    onChange={(e) => setNewMission({ ...newMission, title: e.target.value })}
                    required
                    placeholder="np. 3x siłownia w tym tygodniu"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Opis (opcjonalnie)</Label>
                  <Textarea
                    id="description"
                    value={newMission.description}
                    onChange={(e) => setNewMission({ ...newMission, description: e.target.value })}
                    placeholder="Dodatkowe szczegóły..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Kategoria</Label>
                  <Select
                    value={newMission.category}
                    onValueChange={(value: any) => setNewMission({ ...newMission, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dom">🏠 Dom</SelectItem>
                      <SelectItem value="finanse">💰 Finanse</SelectItem>
                      <SelectItem value="zdrowie">💪 Zdrowie</SelectItem>
                      <SelectItem value="relacja">❤️ Relacja</SelectItem>
                      <SelectItem value="inne">📌 Inne</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="assignedTo">Typ misji</Label>
                  <Select
                    value={newMission.assignedTo}
                    onValueChange={(value: any) => setNewMission({ ...newMission, assignedTo: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="shared">Wspólna misja</SelectItem>
                      <SelectItem value="me">Moja misja</SelectItem>
                      <SelectItem value="partner">Misja {partnerName}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expReward">Nagroda EXP</Label>
                  <Input
                    id="expReward"
                    type="number"
                    min="1"
                    value={newMission.expReward}
                    onChange={(e) => setNewMission({ ...newMission, expReward: parseInt(e.target.value) || 10 })}
                  />
                </div>

                <Button type="submit" className="w-full bg-gradient-warm">
                  Dodaj misję
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Week Stats */}
        <Card className="mb-6 shadow-card bg-gradient-warm">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-4 text-center text-white">
              <div>
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Trophy className="w-5 h-5" />
                  <span className="text-3xl font-bold">{completedCount}</span>
                </div>
                <p className="text-sm opacity-90">Ukończone</p>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Flame className="w-5 h-5" />
                  <span className="text-3xl font-bold">{totalExp}</span>
                </div>
                <p className="text-sm opacity-90">EXP zdobyte</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Missions List */}
        <div className="space-y-3">
          {missions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Brak misji na ten tydzień. Dodaj swoją pierwszą!
            </p>
          ) : (
            missions.map((mission) => (
              <Card key={mission.id} className={mission.completed ? "opacity-60" : "shadow-card"}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => handleCompleteMission(mission.id, mission.completed, mission.exp_reward, mission.assigned_to, mission.is_shared)}
                      className={`mt-0.5 w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                        mission.completed
                          ? "bg-success border-success"
                          : "border-success hover:bg-success/10"
                      }`}
                    >
                      {mission.completed && <Check className="w-4 h-4 text-white" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className={`font-semibold ${mission.completed ? "line-through" : ""}`}>
                          {mission.title}
                        </p>
                        <div className="flex items-center gap-1 text-accent text-sm font-semibold flex-shrink-0">
                          <Trophy className="w-4 h-4" />
                          {mission.exp_reward}
                        </div>
                      </div>
                      {mission.description && (
                        <p className="text-sm text-muted-foreground mb-2">{mission.description}</p>
                      )}
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="secondary" className="text-xs">
                          {getCategoryLabel(mission.category)}
                        </Badge>
                        {mission.is_shared && (
                          <Badge variant="outline" className="text-xs">
                            Wspólna
                          </Badge>
                        )}
                        {mission.streak_count > 0 && (
                          <Badge className="text-xs bg-primary/10 text-primary border-primary">
                            <Flame className="w-3 h-3 mr-1" />
                            {mission.streak_count} tygodni
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Missions;