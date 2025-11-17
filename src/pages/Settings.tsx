import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, LogOut, Link as LinkIcon, User } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [inviteCode, setInviteCode] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [partnerName, setPartnerName] = useState<string>('');
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

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', user.id)
        .single();

      setUserName(profile?.name || 'User');

      // Get couple space and invite code
      const { data: membership } = await supabase
        .from('couple_members')
        .select('couple_space_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (membership) {
        const { data: space } = await supabase
          .from('couple_spaces')
          .select('invite_code')
          .eq('id', membership.couple_space_id)
          .single();

        setInviteCode(space?.invite_code || '');

        // Get partner info
        const { data: members } = await supabase
          .from('couple_members')
          .select('user_id')
          .eq('couple_space_id', membership.couple_space_id);

        const partner = members?.find(m => m.user_id !== user.id);
        if (partner) {
          const { data: partnerProfile } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', partner.user_id)
            .single();

          setPartnerName(partnerProfile?.name || 'Partner');
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyInviteCode = () => {
    navigator.clipboard.writeText(inviteCode);
    toast({
      title: "Skopiowano!",
      description: "Kod zaproszenia został skopiowany",
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center pb-20">Ładowanie...</div>;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-6 max-w-lg">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Heart className="w-6 h-6 text-primary fill-current" />
          Ustawienia
        </h1>

        {/* Profile Info */}
        <Card className="mb-4 shadow-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="w-5 h-5" />
              Profil
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">Twoje imię</p>
                <p className="font-medium">{userName}</p>
              </div>
              {partnerName && (
                <div>
                  <p className="text-sm text-muted-foreground">Partner</p>
                  <p className="font-medium">{partnerName}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Invite Code */}
        {inviteCode && (
          <Card className="mb-4 shadow-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <LinkIcon className="w-5 h-5" />
                Kod zaproszenia
              </CardTitle>
              <CardDescription>
                Udostępnij ten kod partnerowi, żeby mógł dołączyć
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-muted px-4 py-3 rounded-lg text-center text-xl font-mono tracking-widest">
                  {inviteCode}
                </code>
                <Button onClick={handleCopyInviteCode} variant="outline">
                  Kopiuj
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* About */}
        <Card className="mb-4 shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">O Quest dla Dwojga</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Quest dla Dwojga to aplikacja stworzona dla par, które chcą działać jak zespół. 
              Zarządzaj zadaniami, osiągaj misje, zdobywaj punkty i odblokowuj nagrody razem. 
              To nie terapia - to narzędzie do lepszej organizacji i komunikacji. ❤️
            </p>
          </CardContent>
        </Card>

        {/* Logout */}
        <Button
          onClick={handleLogout}
          variant="destructive"
          className="w-full"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Wyloguj się
        </Button>
      </div>

      <BottomNav />
    </div>
  );
};

export default Settings;