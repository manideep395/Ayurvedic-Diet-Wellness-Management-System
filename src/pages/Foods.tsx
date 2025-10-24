import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search } from "lucide-react";
import { toast } from "sonner";

interface Food {
  id: string;
  name: string;
  category: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  rasa: string[];
  guna: string[];
  virya: string;
  vipaka: string;
  dosha_effects: string[];
  serving_size: string;
  ayurvedic_notes: string;
}

const Foods = () => {
  const navigate = useNavigate();
  const [foods, setFoods] = useState<Food[]>([]);
  const [filteredFoods, setFilteredFoods] = useState<Food[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFoods();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = foods.filter(food =>
        food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        food.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredFoods(filtered);
    } else {
      setFilteredFoods(foods);
    }
  }, [searchQuery, foods]);

  const fetchFoods = async () => {
    const { data, error } = await (supabase as any)
      .from("foods")
      .select("*")
      .order("name");

    if (error) {
      toast.error("Failed to load foods");
      console.error(error);
    } else {
      setFoods(data || []);
      setFilteredFoods(data || []);
    }
    setLoading(false);
  };

  const getDoshaColor = (effect: string) => {
    if (effect.includes("vata")) return "vata";
    if (effect.includes("pitta")) return "pitta";
    if (effect.includes("kapha")) return "kapha";
    return "muted";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <header className="border-b bg-card/80 backdrop-blur-md shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")} className="hover:bg-primary/10">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">Food Database</h1>
          </div>
          <Badge variant="secondary" className="text-sm">{filteredFoods.length} Foods</Badge>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card className="mb-8 shadow-glow border-primary/20 bg-gradient-to-br from-card to-muted/20 animate-fade-in">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Search className="h-6 w-6 text-primary" />
              Explore Ayurvedic Foods
            </CardTitle>
            <CardDescription className="text-base">
              Discover foods with complete nutritional data and traditional Ayurvedic properties
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-4 top-4 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search by name or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 text-base border-primary/30 focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="text-center py-20 animate-fade-in">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4"></div>
            <p className="text-muted-foreground text-lg">Loading foods...</p>
          </div>
        ) : filteredFoods.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground text-lg mb-2">No foods found</p>
            <p className="text-sm text-muted-foreground">Try adjusting your search criteria</p>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredFoods.map((food, index) => (
              <Card 
                key={food.id} 
                className="hover:shadow-glow hover:scale-[1.02] hover:border-primary/40 transition-all duration-300 animate-fade-in group"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="group-hover:text-primary transition-colors">{food.name}</CardTitle>
                      <CardDescription className="capitalize">{food.category}</CardDescription>
                    </div>
                    <Badge variant="outline" className="bg-gradient-nutrition text-foreground border-0 font-semibold">
                      {food.serving_size}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="p-3 rounded-lg bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 group-hover:from-primary/10 group-hover:to-primary/15 transition-colors">
                      <div className="text-xs text-muted-foreground font-medium">Calories</div>
                      <div className="font-bold text-primary mt-1">{food.calories}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-gradient-to-br from-accent/5 to-accent/10 border border-accent/20 group-hover:from-accent/10 group-hover:to-accent/15 transition-colors">
                      <div className="text-xs text-muted-foreground font-medium">Protein</div>
                      <div className="font-bold text-accent-foreground mt-1">{food.protein_g}g</div>
                    </div>
                    <div className="p-3 rounded-lg bg-gradient-to-br from-secondary/5 to-secondary/10 border border-secondary/20 group-hover:from-secondary/10 group-hover:to-secondary/15 transition-colors">
                      <div className="text-xs text-muted-foreground font-medium">Carbs</div>
                      <div className="font-bold text-secondary-foreground mt-1">{food.carbs_g}g</div>
                    </div>
                    <div className="p-3 rounded-lg bg-gradient-to-br from-kapha/5 to-kapha/10 border border-kapha/20 group-hover:from-kapha/10 group-hover:to-kapha/15 transition-colors">
                      <div className="text-xs text-muted-foreground font-medium">Fat</div>
                      <div className="font-bold mt-1" style={{ color: 'hsl(var(--kapha))' }}>{food.fat_g}g</div>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2 border-t border-border/50">
                    <div className="text-sm font-semibold text-primary">Ayurvedic Properties</div>
                    <div className="flex flex-wrap gap-1.5">
                      {food.rasa?.map((r, i) => (
                        <Badge key={i} className="bg-gradient-warm text-foreground border-0 font-medium text-xs">{r}</Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Badge variant="outline" className="border-primary/30 bg-primary/5">{food.virya}</Badge>
                      <Badge variant="outline" className="border-accent/30 bg-accent/5">{food.vipaka}</Badge>
                    </div>
                    {food.dosha_effects && food.dosha_effects.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {food.dosha_effects.map((effect, i) => (
                          <Badge 
                            key={i} 
                            className="text-xs font-medium"
                            style={{
                              backgroundColor: `hsl(var(--${getDoshaColor(effect)}) / 0.15)`,
                              color: `hsl(var(--${getDoshaColor(effect)}))`,
                              border: `1px solid hsl(var(--${getDoshaColor(effect)}) / 0.3)`
                            }}
                          >
                            {effect.replace(/_/g, " ")}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {food.ayurvedic_notes && (
                    <p className="text-xs text-muted-foreground italic border-l-4 border-primary/30 pl-3 py-1 bg-muted/30 rounded-r">
                      {food.ayurvedic_notes}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Foods;