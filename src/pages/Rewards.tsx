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
import { Plus, Gift, Trophy, Sparkles } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { useToast } from "@/hooks/use-toast";

interface Reward {
  id: string;
  title: string;
  description: string | null;
  cost_points: number;
  is_shared: boolean;
  for_user: string | null;
}

const Rewards = () => {
  const [loading, setLoading] = useState(true);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [myExp, setMyExp] = useState(0);
  const [coupleSpaceId, setCoupleSpaceId] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [partnerId, setPartnerId] = useState<string>('');
  const [partnerName, setPartnerName] = useState<string>('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newReward, setNewReward] = useState({
    title: '',
    description: '',
    costPoints: 50,
    forWho: 'shared' as 'shared' | 'me' | 'partner',
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

      // Load user exp
      const { data: expData } = await supabase
        .from('user_exp')
        .select('exp_points')
        .eq('couple_space_id', membership.couple_space_id)
        .eq('user_id', user.id)
        .single();

      setMyExp(expData?.exp_points || 0);

      await loadRewards(membership.couple_space_id);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRewards = async (spaceId: string) => {
    const { data } = await supabase
      .from('rewards')
      .select('*')
      .eq('couple_space_id', spaceId)
      .order('cost_points', { ascending: true });

    setRewards(data || []);
  };

  const handleCreateReward = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let forUserId = null;
      let isShared = newReward.forWho === 'shared';
      
      if (newReward.forWho === 'me') {
        forUserId = userId;
      } else if (newReward.forWho === 'partner') {
        forUserId = partnerId;
      }

      const { error } = await supabase
        .from('rewards')
        .insert({
          couple_space_id: coupleSpaceId,
          title: newReward.title,
          description: newReward.description || null,
          cost_points: newReward.costPoints,
          is_shared: isShared,
          for_user: forUserId,
          created_by: userId,
        });

      if (error) throw error;

      toast({
        title: "Nagroda dodana! 🎁",
      });

      setDialogOpen(false);
      setNewReward({
        title: '',
        description: '',
        costPoints: 50,
        forWho: 'shared',
      });

      loadRewards(coupleSpaceId);
    } catch (error: any) {
      toast({
        title: "Błąd",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleRedeemReward = async (rewardId: string, costPoints: number) => {
    if (myExp < costPoints) {
      toast({
        title: "Za mało punktów",
        description: `Potrzebujesz ${costPoints} punktów, masz ${myExp}`,
        variant: "destructive",
      });
      return;
    }

    try {
      // Deduct points
      await supabase
        .from('user_exp')
        .update({ exp_points: myExp - costPoints })
        .eq('couple_space_id', coupleSpaceId)
        .eq('user_id', userId);

      // Record redemption
      await supabase
        .from('reward_redemptions')
        .insert({
          reward_id: rewardId,
          redeemed_by: userId,
        });

      setMyExp(myExp - costPoints);

      toast({
        title: "Nagroda wykupiona! 🎉",
        description: "Ciesz się!",
      });
    } catch (error: any) {
      toast({
        title: "Błąd",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center pb-20">Ładowanie...</div>;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-6 max-w-lg">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Nagrody</h1>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-gradient-warm">
                <Plus className="w-4 h-4 mr-1" />
                Nowa
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Dodaj nagrodę</DialogTitle>
                <DialogDescription>
                  Stwórz nową nagrodę do wykupienia za punkty
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateReward} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Nazwa nagrody</Label>
                  <Input
                    id="title"
                    value={newReward.title}
                    onChange={(e) => setNewReward({ ...newReward, title: e.target.value })}
                    required
                    placeholder="np. Masaż od partnera"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Opis (opcjonalnie)</Label>
                  <Textarea
                    id="description"
                    value={newReward.description}
                    onChange={(e) => setNewReward({ ...newReward, description: e.target.value })}
                    placeholder="Dodatkowe szczegóły..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="costPoints">Koszt (punkty EXP)</Label>
                  <Input
                    id="costPoints"
                    type="number"
                    min="1"
                    value={newReward.costPoints}
                    onChange={(e) => setNewReward({ ...newReward, costPoints: parseInt(e.target.value) || 50 })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="forWho">Dla kogo</Label>
                  <Select
                    value={newReward.forWho}
                    onValueChange={(value: any) => setNewReward({ ...newReward, forWho: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="shared">Dla pary</SelectItem>
                      <SelectItem value="me">Dla mnie</SelectItem>
                      <SelectItem value="partner">Dla {partnerName}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" className="w-full bg-gradient-warm">
                  Dodaj nagrodę
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* My Points */}
        <Card className="mb-6 shadow-card bg-gradient-achievement">
          <CardContent className="pt-6">
            <div className="text-center text-white">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Trophy className="w-8 h-8" />
                <span className="text-5xl font-bold">{myExp}</span>
              </div>
              <p className="text-lg opacity-90">Twoje punkty</p>
            </div>
          </CardContent>
        </Card>

        {/* Rewards List */}
        <div className="space-y-4">
          {rewards.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Brak nagród. Dodaj swoją pierwszą!
            </p>
          ) : (
            rewards.map((reward) => {
              const canAfford = myExp >= reward.cost_points;
              
              return (
                <Card key={reward.id} className={`shadow-card ${!canAfford ? 'opacity-60' : ''}`}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Gift className="w-5 h-5 text-primary flex-shrink-0" />
                          <h3 className="font-semibold text-lg">{reward.title}</h3>
                        </div>
                        {reward.description && (
                          <p className="text-sm text-muted-foreground mb-3">{reward.description}</p>
                        )}
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className="bg-accent text-accent-foreground">
                            <Trophy className="w-3 h-3 mr-1" />
                            {reward.cost_points} pkt
                          </Badge>
                          {reward.is_shared && (
                            <Badge variant="outline" className="text-xs">
                              Dla pary
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        onClick={() => handleRedeemReward(reward.id, reward.cost_points)}
                        disabled={!canAfford}
                        className="bg-gradient-warm flex-shrink-0"
                        size="sm"
                      >
                        <Sparkles className="w-4 h-4 mr-1" />
                        Wykup
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Rewards;