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
    <div className="min-h-screen bg-gradient-earth">
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold">Food Database</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Search Foods</CardTitle>
            <CardDescription>
              Browse thousands of foods with nutritional and Ayurvedic properties
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading foods...</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredFoods.map((food) => (
              <Card key={food.id} className="hover:shadow-soft transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{food.name}</CardTitle>
                      <CardDescription>{food.category}</CardDescription>
                    </div>
                    <Badge variant="outline">{food.serving_size}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="p-2 rounded bg-muted/50">
                      <div className="text-xs text-muted-foreground">Calories</div>
                      <div className="font-semibold">{food.calories}</div>
                    </div>
                    <div className="p-2 rounded bg-muted/50">
                      <div className="text-xs text-muted-foreground">Protein</div>
                      <div className="font-semibold">{food.protein_g}g</div>
                    </div>
                    <div className="p-2 rounded bg-muted/50">
                      <div className="text-xs text-muted-foreground">Carbs</div>
                      <div className="font-semibold">{food.carbs_g}g</div>
                    </div>
                    <div className="p-2 rounded bg-muted/50">
                      <div className="text-xs text-muted-foreground">Fat</div>
                      <div className="font-semibold">{food.fat_g}g</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium">Ayurvedic Properties</div>
                    <div className="flex flex-wrap gap-1">
                      {food.rasa?.map((r, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">{r}</Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Badge variant="outline">{food.virya}</Badge>
                      <Badge variant="outline">{food.vipaka}</Badge>
                    </div>
                    {food.dosha_effects && food.dosha_effects.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {food.dosha_effects.map((effect, i) => (
                          <Badge key={i} className={`bg-${getDoshaColor(effect)}/20 text-${getDoshaColor(effect)} text-xs`}>
                            {effect.replace(/_/g, " ")}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {food.ayurvedic_notes && (
                    <p className="text-xs text-muted-foreground italic border-l-2 border-accent pl-3">
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