import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Apple, FileText, LogOut, Plus } from "lucide-react";
import { toast } from "sonner";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ patients: 0, dietCharts: 0, foods: 0 });

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
      const [patientsRes, chartsRes, foodsRes] = await Promise.all([
        (supabase as any).from("patients").select("id", { count: "exact", head: true }),
        (supabase as any).from("diet_charts").select("id", { count: "exact", head: true }),
        (supabase as any).from("foods").select("id", { count: "exact", head: true })
      ]);

      setStats({
        patients: patientsRes.count || 0,
        dietCharts: chartsRes.count || 0,
        foods: foodsRes.count || 0
      });
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

        <Card className="mt-8 shadow-card animate-fade-in">
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                <div className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">{stats.patients}</div>
                <div className="text-sm text-muted-foreground font-medium">Active Patients</div>
              </div>
              <div className="p-4 rounded-lg bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20">
                <div className="text-3xl font-bold bg-gradient-to-r from-accent to-accent/60 bg-clip-text text-transparent">{stats.dietCharts}</div>
                <div className="text-sm text-muted-foreground font-medium">Diet Charts</div>
              </div>
              <div className="p-4 rounded-lg bg-gradient-to-br from-secondary/10 to-secondary/5 border border-secondary/20">
                <div className="text-3xl font-bold bg-gradient-to-r from-secondary to-secondary/60 bg-clip-text text-transparent">{stats.foods}</div>
                <div className="text-sm text-muted-foreground font-medium">Food Items</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;