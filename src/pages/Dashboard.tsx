import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Apple, FileText, LogOut, Plus, Sparkles, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ patients: 0, dietCharts: 0, foods: 0, recommendations: 0 });
  const [recentRecommendations, setRecentRecommendations] = useState<any[]>([]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      const [patientsRes, chartsRes, foodsRes, recommendationsRes] = await Promise.all([
        (supabase as any).from("patients").select("id", { count: "exact", head: true }),
        (supabase as any).from("diet_charts").select("id", { count: "exact", head: true }),
        (supabase as any).from("foods").select("id", { count: "exact", head: true }),
        (supabase as any).from("recommendations").select("id", { count: "exact", head: true })
      ]);

      setStats({
        patients: patientsRes.count || 0,
        dietCharts: chartsRes.count || 0,
        foods: foodsRes.count || 0,
        recommendations: recommendationsRes.count || 0
      });

      // Fetch recent recommendations
      const { data: recentRecs } = await (supabase as any)
        .from("recommendations")
        .select(`
          id,
          recommendation_type,
          created_at,
          patients (
            name,
            prakriti
          )
        `)
        .order("created_at", { ascending: false })
        .limit(5);
      
      setRecentRecommendations(recentRecs || []);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-earth flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-earth">
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">
            Ayurvedic Diet Platform
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user?.email}</span>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 animate-fade-in">
          <h2 className="text-3xl font-bold mb-2">Welcome to Your Dashboard</h2>
          <p className="text-muted-foreground">
            Manage patients, create diet plans, and leverage AI-powered Ayurvedic recommendations
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-fade-in">
          <Card className="hover:shadow-soft transition-all cursor-pointer" onClick={() => navigate("/patients")}>
            <CardHeader>
              <div className="h-12 w-12 rounded-full bg-gradient-hero flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary-foreground" />
              </div>
              <CardTitle>Patient Management</CardTitle>
              <CardDescription>
                Create and manage patient profiles with Prakriti assessments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                View Patients
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-soft transition-all cursor-pointer" onClick={() => navigate("/foods")}>
            <CardHeader>
              <div className="h-12 w-12 rounded-full bg-gradient-warm flex items-center justify-center mb-4">
                <Apple className="h-6 w-6 text-accent-foreground" />
              </div>
              <CardTitle>Food Database</CardTitle>
              <CardDescription>
                Browse foods with nutritional and Ayurvedic attributes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="secondary" className="w-full">
                Browse Database
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-soft transition-all cursor-pointer" onClick={() => navigate("/diet-charts")}>
            <CardHeader>
              <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-secondary-foreground" />
              </div>
              <CardTitle>Diet Charts</CardTitle>
              <CardDescription>
                Create AI-powered diet plans with Dosha balance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Create Diet Chart
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 mt-8 animate-fade-in">
          <Card className="shadow-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Quick Stats
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 transition-all hover:shadow-soft">
                  <div className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">{stats.patients}</div>
                  <div className="text-sm text-muted-foreground font-medium mt-1">Active Patients</div>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20 transition-all hover:shadow-soft">
                  <div className="text-3xl font-bold bg-gradient-to-r from-accent to-accent/60 bg-clip-text text-transparent">{stats.recommendations}</div>
                  <div className="text-sm text-muted-foreground font-medium mt-1">AI Recommendations</div>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-br from-secondary/10 to-secondary/5 border border-secondary/20 transition-all hover:shadow-soft">
                  <div className="text-3xl font-bold bg-gradient-to-r from-secondary to-secondary/60 bg-clip-text text-transparent">{stats.dietCharts}</div>
                  <div className="text-sm text-muted-foreground font-medium mt-1">Diet Charts</div>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-br from-kapha/10 to-kapha/5 border border-kapha/20 transition-all hover:shadow-soft">
                  <div className="text-3xl font-bold bg-gradient-to-r from-kapha to-kapha/60 bg-clip-text text-transparent">{stats.foods}</div>
                  <div className="text-sm text-muted-foreground font-medium mt-1">Food Items</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-accent" />
                  Recent AI Recommendations
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate("/diet-charts")}>
                  View All
                </Button>
              </div>
              <CardDescription>Latest personalized diet plans</CardDescription>
            </CardHeader>
            <CardContent>
              {recentRecommendations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Sparkles className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">No recommendations yet</p>
                  <Button variant="link" size="sm" onClick={() => navigate("/diet-charts")} className="mt-2">
                    Generate Your First
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentRecommendations.map((rec) => (
                    <div 
                      key={rec.id} 
                      className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:border-primary/30 hover:bg-muted/30 transition-colors cursor-pointer"
                      onClick={() => navigate("/diet-charts")}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {rec.patients?.name || "Unknown Patient"}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {rec.patients?.prakriti || "N/A"}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {rec.recommendation_type === "meal_plan" ? "Full Meal Plan" : "Dietary Advice"}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground ml-2 whitespace-nowrap">
                        {new Date(rec.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;