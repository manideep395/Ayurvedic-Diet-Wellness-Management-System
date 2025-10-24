import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { MealPlanDisplay } from "@/components/diet/MealPlanDisplay";

interface Patient {
  id: string;
  name: string;
  prakriti: string;
  health_conditions: string[];
  dietary_habits: string;
  meal_preferences: string[];
  allergies: string[];
}

const DietCharts = () => {
  const navigate = useNavigate();
  const { patientId } = useParams();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<string>("");
  const [patientData, setPatientData] = useState<Patient | null>(null);
  const [recommendationType, setRecommendationType] = useState<string>("meal_plan");
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<string>("");

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    if (patientId) {
      setSelectedPatient(patientId);
      loadPatientData(patientId);
    }
  }, [patientId]);

  useEffect(() => {
    if (selectedPatient && !patientId) {
      loadPatientData(selectedPatient);
    }
  }, [selectedPatient]);

  const fetchPatients = async () => {
    const { data, error } = await (supabase as any)
      .from("patients")
      .select("*")
      .order("name");

    if (error) {
      toast.error("Failed to load patients");
      console.error(error);
    } else {
      setPatients(data || []);
    }
  };

  const loadPatientData = async (id: string) => {
    const { data, error} = await (supabase as any)
      .from("patients")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      toast.error("Failed to load patient data");
      console.error(error);
    } else {
      setPatientData(data);
    }
  };

  const generateRecommendations = async () => {
    if (!patientData) {
      toast.error("Please select a patient first");
      return;
    }

    setLoading(true);
    try {
      console.log('Calling AI recommendations for patient:', patientData);
      const { data, error } = await supabase.functions.invoke('ai-recommendations', {
        body: { 
          patient: patientData,
          recommendationType 
        }
      });

      console.log('AI Response:', data);
      console.log('AI Error:', error);

      if (error) throw error;

      if (!data || !data.recommendation) {
        throw new Error('No recommendation data received from AI');
      }

      console.log('Setting recommendation:', data.recommendation);
      setRecommendation(data.recommendation);
      toast.success("AI recommendations generated successfully!");

      // Save recommendation to database
      const { error: dbError } = await (supabase as any).from("recommendations").insert({
        patient_id: patientData.id,
        recommendation_type: recommendationType,
        content: { recommendation: data.recommendation },
        priority: "medium"
      });

      if (dbError) {
        console.error('Error saving to database:', dbError);
      }
    } catch (error) {
      console.error('Error generating recommendations:', error);
      toast.error("Failed to generate recommendations. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <header className="border-b bg-card/80 backdrop-blur-md sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold">Create Diet Chart</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="border-border/50 shadow-lg mb-6">
          <CardHeader>
            <CardTitle>Patient Selection</CardTitle>
            <CardDescription>
              Select a patient to generate AI-powered diet recommendations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="patient">Patient</Label>
              <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.name} - {patient.prakriti}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {patientData && (
              <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                <div className="text-sm">
                  <strong>Prakriti:</strong> {patientData.prakriti.replace('_', '-').toUpperCase()}
                </div>
                {patientData.health_conditions.length > 0 && (
                  <div className="text-sm">
                    <strong>Conditions:</strong> {patientData.health_conditions.join(", ")}
                  </div>
                )}
                {patientData.meal_preferences.length > 0 && (
                  <div className="text-sm">
                    <strong>Preferences:</strong> {patientData.meal_preferences.join(", ")}
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="recommendation-type">Recommendation Type</Label>
              <Select value={recommendationType} onValueChange={setRecommendationType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="meal_plan">Full Day Meal Plan</SelectItem>
                  <SelectItem value="dietary_advice">Dietary Recommendations</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={generateRecommendations} 
              disabled={!patientData || loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating with AI...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate AI Recommendations
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {recommendation && (
          <div className="animate-fade-in space-y-4">
            <Card className="border-border/50 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>AI-Generated Recommendations</CardTitle>
                    <CardDescription>
                      Personalized diet plan based on Ayurvedic principles
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => window.print()} variant="outline" size="sm">
                      Print Report
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setRecommendation("")}>
                      Clear
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
            
            <MealPlanDisplay data={recommendation} />
          </div>
        )}
      </main>
    </div>
  );
};

export default DietCharts;