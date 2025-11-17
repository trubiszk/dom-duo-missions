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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Check, User, Users as UsersIcon } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { useToast } from "@/hooks/use-toast";

interface Task {
  id: string;
  title: string;
  description: string | null;
  category: string;
  assigned_to: string | null;
  completed: boolean;
  created_by: string;
}

interface Profile {
  id: string;
  name: string;
}

const Tasks = () => {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [coupleSpaceId, setCoupleSpaceId] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [partnerId, setPartnerId] = useState<string>('');
  const [partnerName, setPartnerName] = useState<string>('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    category: 'inne' as const,
    assignedTo: 'me' as 'me' | 'partner' | 'shared',
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

      await loadTasks(membership.couple_space_id);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTasks = async (spaceId: string) => {
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .eq('couple_space_id', spaceId)
      .order('created_at', { ascending: false });

    setTasks(data || []);
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let assignedToId = null;
      if (newTask.assignedTo === 'me') {
        assignedToId = userId;
      } else if (newTask.assignedTo === 'partner') {
        assignedToId = partnerId;
      }

      const { error } = await supabase
        .from('tasks')
        .insert({
          couple_space_id: coupleSpaceId,
          title: newTask.title,
          description: newTask.description || null,
          category: newTask.category,
          assigned_to: assignedToId,
          created_by: userId,
        });

      if (error) throw error;

      toast({
        title: "Zadanie dodane! ✅",
      });

      setDialogOpen(false);
      setNewTask({
        title: '',
        description: '',
        category: 'inne',
        assignedTo: 'me',
      });

      loadTasks(coupleSpaceId);
    } catch (error: any) {
      toast({
        title: "Błąd",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleToggleComplete = async (taskId: string, currentlyCompleted: boolean) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          completed: !currentlyCompleted,
          completed_at: !currentlyCompleted ? new Date().toISOString() : null,
        })
        .eq('id', taskId);

      if (error) throw error;

      loadTasks(coupleSpaceId);
      
      if (!currentlyCompleted) {
        toast({
          title: "Zadanie ukończone! 🎉",
        });
      }
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

  const myTasks = tasks.filter(t => t.assigned_to === userId);
  const partnerTasks = tasks.filter(t => t.assigned_to === partnerId);
  const sharedTasks = tasks.filter(t => t.assigned_to === null);

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center pb-20">Ładowanie...</div>;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-6 max-w-lg">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Zadania</h1>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-gradient-warm">
                <Plus className="w-4 h-4 mr-1" />
                Nowe
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Dodaj zadanie</DialogTitle>
                <DialogDescription>
                  Stwórz nowe zadanie dla siebie lub partnera
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateTask} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Nazwa zadania</Label>
                  <Input
                    id="title"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    required
                    placeholder="np. Zrobić zakupy"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Opis (opcjonalnie)</Label>
                  <Textarea
                    id="description"
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    placeholder="Dodatkowe szczegóły..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Kategoria</Label>
                  <Select
                    value={newTask.category}
                    onValueChange={(value: any) => setNewTask({ ...newTask, category: value })}
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
                  <Label htmlFor="assignedTo">Przypisz do</Label>
                  <Select
                    value={newTask.assignedTo}
                    onValueChange={(value: any) => setNewTask({ ...newTask, assignedTo: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="me">Ja</SelectItem>
                      <SelectItem value="partner">{partnerName}</SelectItem>
                      <SelectItem value="shared">Wspólne</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" className="w-full bg-gradient-warm">
                  Dodaj zadanie
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="my" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="my">Moje ({myTasks.length})</TabsTrigger>
            <TabsTrigger value="partner">{partnerName} ({partnerTasks.length})</TabsTrigger>
            <TabsTrigger value="shared">Wspólne ({sharedTasks.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="my" className="space-y-3 mt-4">
            {myTasks.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Brak zadań</p>
            ) : (
              myTasks.map((task) => (
                <Card key={task.id} className={task.completed ? "opacity-60" : ""}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => handleToggleComplete(task.id, task.completed)}
                        className={`mt-0.5 w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                          task.completed
                            ? "bg-primary border-primary"
                            : "border-primary hover:bg-primary/10"
                        }`}
                      >
                        {task.completed && <Check className="w-3 h-3 text-white" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium ${task.completed ? "line-through" : ""}`}>
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                        )}
                        <Badge variant="secondary" className="mt-2">
                          {getCategoryLabel(task.category)}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="partner" className="space-y-3 mt-4">
            {partnerTasks.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Brak zadań</p>
            ) : (
              partnerTasks.map((task) => (
                <Card key={task.id} className={task.completed ? "opacity-60" : ""}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => handleToggleComplete(task.id, task.completed)}
                        className={`mt-0.5 w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                          task.completed
                            ? "bg-secondary border-secondary"
                            : "border-secondary hover:bg-secondary/10"
                        }`}
                      >
                        {task.completed && <Check className="w-3 h-3 text-white" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium ${task.completed ? "line-through" : ""}`}>
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                        )}
                        <Badge variant="secondary" className="mt-2">
                          {getCategoryLabel(task.category)}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="shared" className="space-y-3 mt-4">
            {sharedTasks.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Brak wspólnych zadań</p>
            ) : (
              sharedTasks.map((task) => (
                <Card key={task.id} className={task.completed ? "opacity-60" : ""}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => handleToggleComplete(task.id, task.completed)}
                        className={`mt-0.5 w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                          task.completed
                            ? "bg-accent border-accent"
                            : "border-accent hover:bg-accent/10"
                        }`}
                      >
                        {task.completed && <Check className="w-3 h-3 text-white" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium ${task.completed ? "line-through" : ""}`}>
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                        )}
                        <Badge variant="secondary" className="mt-2">
                          {getCategoryLabel(task.category)}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      <BottomNav />
    </div>
  );
};

export default Tasks;