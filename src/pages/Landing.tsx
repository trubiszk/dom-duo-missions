import { Button } from "@/components/ui/button";
import { Heart, CheckCircle, Trophy, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-sunset">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-12 pt-8">
          <div className="inline-flex items-center gap-2 mb-4 text-primary">
            <Heart className="w-8 h-8 fill-current" />
            <h1 className="text-4xl md:text-5xl font-bold">Quest dla Dwojga</h1>
          </div>
          <p className="text-xl md:text-2xl text-foreground/80 mb-8 max-w-2xl mx-auto">
            Działajcie jak zespół, nie przeciwko sobie. Misje, nagrody i lepsze zrozumienie – bez terapii.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate('/auth')}
              className="bg-gradient-warm hover:shadow-glow transition-all"
            >
              Zacznij za darmo
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate('/auth')}
            >
              Mam już konto
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="bg-card rounded-2xl p-6 shadow-card">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Jasny podział zadań</h3>
            <p className="text-muted-foreground">
              Koniec z "myślałem, że ty to zrobisz". Każdy wie, kto za co odpowiada.
            </p>
          </div>

          <div className="bg-card rounded-2xl p-6 shadow-card">
            <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mb-4">
              <Trophy className="w-6 h-6 text-secondary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Misje tygodniowe</h3>
            <p className="text-muted-foreground">
              Razem zdobywajcie punkty, budujcie streaki i odblokowujcie nagrody.
            </p>
          </div>

          <div className="bg-card rounded-2xl p-6 shadow-card">
            <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-4">
              <MessageCircle className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Lepsza komunikacja</h3>
            <p className="text-muted-foreground">
              Prosty tłumacz emocji pomaga wyrazić to, co czujesz – bez kłótni.
            </p>
          </div>

          <div className="bg-card rounded-2xl p-6 shadow-card">
            <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center mb-4">
              <Heart className="w-6 h-6 text-success" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Wspólne nagrody</h3>
            <p className="text-muted-foreground">
              Wykupuj nagrody za punkty – randki, masaże, Queen/King Days i więcej.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-card rounded-2xl p-8 shadow-card">
          <h2 className="text-2xl font-bold mb-4">
            Gotowi być lepszym zespołem?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Dołączcie do par, które już przestały się kłócić o drobiazgi i zaczęły działać razem.
          </p>
          <Button 
            size="lg"
            onClick={() => navigate('/auth')}
            className="bg-gradient-warm hover:shadow-glow transition-all"
          >
            Stwórz wspólną przestrzeń
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Landing;