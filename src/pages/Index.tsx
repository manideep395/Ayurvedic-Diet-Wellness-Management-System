import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf, Users, Brain, FileText, CheckCircle } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-earth">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-10"></div>
        <div className="container mx-auto px-4 py-20 relative">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-gradient-hero mb-8">
              <Leaf className="h-10 w-10 text-primary-foreground" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-hero bg-clip-text text-transparent">
              Ayurvedic Diet Planning Platform
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Merge ancient Ayurvedic wisdom with modern nutrition science. Create personalized diet charts based on Prakriti, health conditions, and AI-powered recommendations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8" onClick={() => navigate("/auth")}>
                Get Started
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8" onClick={() => navigate("/foods")}>
                Browse Foods
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Core Features</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Everything you need to create comprehensive Ayurvedic diet plans
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 animate-fade-in">
          <Card className="shadow-card hover:shadow-soft transition-all">
            <CardHeader>
              <div className="h-12 w-12 rounded-full bg-gradient-hero flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary-foreground" />
              </div>
              <CardTitle>Patient Management</CardTitle>
              <CardDescription>
                Comprehensive patient profiles with Prakriti assessment, health conditions, dietary habits, and lifestyle tracking
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="shadow-card hover:shadow-soft transition-all">
            <CardHeader>
              <div className="h-12 w-12 rounded-full bg-gradient-warm flex items-center justify-center mb-4">
                <Leaf className="h-6 w-6 text-accent-foreground" />
              </div>
              <CardTitle>Food Database</CardTitle>
              <CardDescription>
                Thousands of foods with both scientific nutrition data (calories, macros) and Ayurvedic attributes (Rasa, Guna, Virya, Vipaka, Dosha impact)
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="shadow-card hover:shadow-soft transition-all">
            <CardHeader>
              <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center mb-4">
                <Brain className="h-6 w-6 text-secondary-foreground" />
              </div>
              <CardTitle>AI Recommendations</CardTitle>
              <CardDescription>
                Intelligent meal suggestions powered by Gemini AI, considering patient's Prakriti, health conditions, and dietary preferences
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="shadow-card hover:shadow-soft transition-all">
            <CardHeader>
              <div className="h-12 w-12 rounded-full bg-gradient-hero flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-primary-foreground" />
              </div>
              <CardTitle>Diet Chart Generator</CardTitle>
              <CardDescription>
                Automatically create balanced meal plans with daily/weekly summaries, ensuring Dosha balance and nutritional adequacy
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="shadow-card hover:shadow-soft transition-all">
            <CardHeader>
              <div className="h-12 w-12 rounded-full bg-gradient-warm flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-accent-foreground" />
              </div>
              <CardTitle>Report Generation</CardTitle>
              <CardDescription>
                Generate clear, printable, and shareable reports with graphical visualization of nutrition balance and Dosha alignment
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="shadow-card hover:shadow-soft transition-all">
            <CardHeader>
              <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center mb-4">
                <Leaf className="h-6 w-6 text-secondary-foreground" />
              </div>
              <CardTitle>Ayurvedic Principles</CardTitle>
              <CardDescription>
                Every recommendation follows authentic Ayurvedic principles while incorporating modern nutritional science
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <Card className="bg-gradient-hero text-primary-foreground shadow-soft">
          <CardContent className="py-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Practice?</h2>
            <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
              Join practitioners who are revolutionizing diet planning with Ayurvedic wisdom and AI technology
            </p>
            <Button size="lg" variant="secondary" className="text-lg px-8" onClick={() => navigate("/auth")}>
              Create Free Account
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card/50 backdrop-blur-sm mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>© 2025 Ayurvedic Diet Planning Platform. Empowering practitioners with ancient wisdom.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;