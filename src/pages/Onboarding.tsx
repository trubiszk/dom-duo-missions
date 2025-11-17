import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Users, Link as LinkIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Onboarding = () => {
  const [mode, setMode] = useState<'choose' | 'create' | 'join'>('choose');
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkExistingSpace();
  }, []);

  const checkExistingSpace = async () => {
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

      if (membership) {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error checking existing space:', error);
    }
  };

  const generateInviteCode = () => {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  };

  const handleCreateSpace = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const inviteCode = generateInviteCode();

      const { data: space, error: spaceError } = await supabase
        .from('couple_spaces')
        .insert({
          created_by: user.id,
          invite_code: inviteCode,
        })
        .select()
        .single();

      if (spaceError) throw spaceError;

      const { error: memberError } = await supabase
        .from('couple_members')
        .insert({
          couple_space_id: space.id,
          user_id: user.id,
        });

      if (memberError) throw memberError;

      // Initialize user exp
      await supabase
        .from('user_exp')
        .insert({
          couple_space_id: space.id,
          user_id: user.id,
          exp_points: 0,
        });

      toast({
        title: "Przestrzeń utworzona! 🎉",
        description: `Kod zaproszenia: ${inviteCode}`,
      });

      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: "Błąd",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleJoinSpace = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: space, error: spaceError } = await supabase
        .from('couple_spaces')
        .select('id')
        .eq('invite_code', inviteCode.toUpperCase())
        .single();

      if (spaceError || !space) {
        throw new Error('Nieprawidłowy kod zaproszenia');
      }

      const { error: memberError } = await supabase
        .from('couple_members')
        .insert({
          couple_space_id: space.id,
          user_id: user.id,
        });

      if (memberError) throw memberError;

      // Initialize user exp
      await supabase
        .from('user_exp')
        .insert({
          couple_space_id: space.id,
          user_id: user.id,
          exp_points: 0,
        });

      toast({
        title: "Dołączyłeś do przestrzeni! 🎉",
        description: "Witaj w zespole!",
      });

      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: "Błąd",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (mode === 'choose') {
    return (
      <div className="min-h-screen bg-gradient-sunset flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-card">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Heart className="w-6 h-6 text-primary fill-current" />
              <CardTitle className="text-2xl">Stwórz lub dołącz</CardTitle>
            </div>
            <CardDescription>
              Wybierz, jak chcesz rozpocząć swoją przygodę
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => setMode('create')}
              className="w-full h-auto py-6 flex flex-col items-center gap-2 bg-gradient-warm hover:shadow-glow transition-all"
            >
              <Users className="w-8 h-8" />
              <div className="text-center">
                <div className="font-semibold text-lg">Stwórz nową przestrzeń</div>
                <div className="text-sm opacity-90">Dostaniesz kod, którym podzielisz się z partnerem</div>
              </div>
            </Button>

            <Button
              onClick={() => setMode('join')}
              variant="outline"
              className="w-full h-auto py-6 flex flex-col items-center gap-2"
            >
              <LinkIcon className="w-8 h-8" />
              <div className="text-center">
                <div className="font-semibold text-lg">Dołącz do przestrzeni</div>
                <div className="text-sm text-muted-foreground">Masz kod od partnera? Wpisz go tutaj</div>
              </div>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (mode === 'create') {
    return (
      <div className="min-h-screen bg-gradient-sunset flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-card">
          <CardHeader className="text-center">
            <CardTitle>Stwórz wspólną przestrzeń</CardTitle>
            <CardDescription>
              Otrzymasz kod zaproszenia dla partnera
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleCreateSpace}
              disabled={loading}
              className="w-full bg-gradient-warm hover:shadow-glow transition-all"
            >
              {loading ? "Tworzenie..." : "Stwórz przestrzeń"}
            </Button>
            <Button
              onClick={() => setMode('choose')}
              variant="ghost"
              className="w-full"
            >
              Wróć
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-sunset flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-card">
        <CardHeader className="text-center">
          <CardTitle>Dołącz do przestrzeni</CardTitle>
          <CardDescription>
            Wpisz kod zaproszenia od partnera
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleJoinSpace} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="inviteCode">Kod zaproszenia</Label>
              <Input
                id="inviteCode"
                type="text"
                placeholder="ABC12345"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                required
                className="uppercase text-center text-xl tracking-widest"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-warm hover:shadow-glow transition-all"
            >
              {loading ? "Dołączanie..." : "Dołącz"}
            </Button>

            <Button
              type="button"
              onClick={() => setMode('choose')}
              variant="ghost"
              className="w-full"
            >
              Wróć
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;