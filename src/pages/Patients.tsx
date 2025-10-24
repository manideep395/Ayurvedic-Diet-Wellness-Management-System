import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, ArrowLeft, User, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  prakriti: string;
  health_conditions: string[];
  created_at: string;
}

const Patients = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    prakriti: "",
    health_conditions: "",
    dietary_habits: "",
    digestion_quality: "",
    bowel_pattern: "",
    water_intake_liters: "",
    meal_preferences: "",
    allergies: "",
    lifestyle_notes: ""
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    const { data, error } = await (supabase as any)
      .from("patients")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load patients");
      console.error(error);
    } else {
      setPatients(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("You must be logged in");
      return;
    }

    const { error } = await (supabase as any).from("patients").insert({
      user_id: user.id,
      name: formData.name,
      age: parseInt(formData.age),
      gender: formData.gender,
      prakriti: formData.prakriti,
      health_conditions: formData.health_conditions.split(",").map(c => c.trim()),
      dietary_habits: formData.dietary_habits,
      digestion_quality: formData.digestion_quality,
      bowel_pattern: formData.bowel_pattern,
      water_intake_liters: formData.water_intake_liters ? parseFloat(formData.water_intake_liters) : null,
      meal_preferences: formData.meal_preferences.split(",").map(p => p.trim()),
      allergies: formData.allergies.split(",").map(a => a.trim()),
      lifestyle_notes: formData.lifestyle_notes
    } as any);

    if (error) {
      toast.error("Failed to create patient");
      console.error(error);
    } else {
      toast.success("Patient created successfully!");
      setIsDialogOpen(false);
      setFormData({
        name: "",
        age: "",
        gender: "",
        prakriti: "",
        health_conditions: "",
        dietary_habits: "",
        digestion_quality: "",
        bowel_pattern: "",
        water_intake_liters: "",
        meal_preferences: "",
        allergies: "",
        lifestyle_notes: ""
      });
      fetchPatients();
    }
  };

  const handleDelete = async (patientId: string, patientName: string) => {
    const { error } = await (supabase as any)
      .from("patients")
      .delete()
      .eq("id", patientId);

    if (error) {
      toast.error("Failed to delete patient");
      console.error(error);
    } else {
      toast.success(`${patientName} deleted successfully`);
      fetchPatients();
    }
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
            <h1 className="text-2xl font-bold">Patient Management</h1>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Patient
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Patient Profile</DialogTitle>
                <DialogDescription>
                  Enter patient details including Prakriti assessment and health information
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="age">Age *</Label>
                    <Input
                      id="age"
                      type="number"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender *</Label>
                    <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prakriti">Prakriti (Body Type) *</Label>
                    <Select value={formData.prakriti} onValueChange={(value) => setFormData({ ...formData, prakriti: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select prakriti" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vata">Vata</SelectItem>
                        <SelectItem value="pitta">Pitta</SelectItem>
                        <SelectItem value="kapha">Kapha</SelectItem>
                        <SelectItem value="vata_pitta">Vata-Pitta</SelectItem>
                        <SelectItem value="pitta_kapha">Pitta-Kapha</SelectItem>
                        <SelectItem value="vata_kapha">Vata-Kapha</SelectItem>
                        <SelectItem value="tridoshic">Tridoshic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="health_conditions">Health Conditions (comma-separated)</Label>
                  <Input
                    id="health_conditions"
                    value={formData.health_conditions}
                    onChange={(e) => setFormData({ ...formData, health_conditions: e.target.value })}
                    placeholder="e.g., Diabetes, Hypertension"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dietary_habits">Dietary Habits</Label>
                  <Textarea
                    id="dietary_habits"
                    value={formData.dietary_habits}
                    onChange={(e) => setFormData({ ...formData, dietary_habits: e.target.value })}
                    placeholder="Describe current eating patterns..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="digestion_quality">Digestion Quality</Label>
                    <Input
                      id="digestion_quality"
                      value={formData.digestion_quality}
                      onChange={(e) => setFormData({ ...formData, digestion_quality: e.target.value })}
                      placeholder="Good, Moderate, Poor"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="water_intake">Water Intake (liters/day)</Label>
                    <Input
                      id="water_intake"
                      type="number"
                      step="0.1"
                      value={formData.water_intake_liters}
                      onChange={(e) => setFormData({ ...formData, water_intake_liters: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lifestyle_notes">Lifestyle Notes</Label>
                  <Textarea
                    id="lifestyle_notes"
                    value={formData.lifestyle_notes}
                    onChange={(e) => setFormData({ ...formData, lifestyle_notes: e.target.value })}
                    placeholder="Exercise routine, sleep patterns, stress levels..."
                  />
                </div>
                <Button type="submit" className="w-full">Create Patient Profile</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading patients...</p>
          </div>
        ) : patients.length === 0 ? (
          <Card className="text-center py-12">
            <CardHeader>
              <User className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <CardTitle>No Patients Yet</CardTitle>
              <CardDescription>
                Get started by adding your first patient profile
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {patients.map((patient) => (
              <Card key={patient.id} className="hover:shadow-soft transition-all border-border/50 bg-gradient-card">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{patient.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {patient.age} years • {patient.gender}
                      </CardDescription>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      patient.prakriti === 'vata' || patient.prakriti.includes('vata')
                        ? 'bg-vata/20 text-vata dark:bg-vata/30 dark:text-vata' 
                        : patient.prakriti === 'pitta' || patient.prakriti.includes('pitta')
                        ? 'bg-pitta/20 text-pitta dark:bg-pitta/30 dark:text-pitta'
                        : 'bg-kapha/20 text-kapha dark:bg-kapha/30 dark:text-kapha'
                    }`}>
                      {patient.prakriti.replace('_', '-').toUpperCase()}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {patient.health_conditions.length > 0 && (
                    <div className="text-sm text-muted-foreground p-3 rounded-lg bg-muted/50">
                      <strong className="text-foreground">Conditions:</strong> {patient.health_conditions.join(", ")}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1" 
                      onClick={() => navigate(`/diet-charts/new/${patient.id}`)}
                    >
                      Create Diet Chart
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="icon" className="text-destructive hover:bg-destructive/10">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Patient</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete <strong>{patient.name}</strong>? This action cannot be undone and will remove all associated diet charts and recommendations.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(patient.id, patient.name)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Patients;