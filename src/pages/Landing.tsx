import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ArrowRight, Waves, Brain, Bluetooth, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/nox-hero.jpg";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Theme Toggle - Fixed Position */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background gradient */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            background: "var(--gradient-header)",
          }}
        />
        
        {/* Hero content */}
        <div className="container mx-auto px-4 z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left animate-fade-in">
              <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                NOX AI
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground mb-4">
                The Smartest Home Companion
              </p>
              <p className="text-lg text-foreground/80 mb-8 max-w-2xl">
                Transform your old phone into an intelligent home assistant. NOX AI listens, learns, and reacts to your environment with unmatched awareness.
              </p>
              <div className="flex gap-4 justify-center lg:justify-start">
                <Button asChild size="lg" className="text-lg px-8">
                  <Link to="/smart">
                    Get Started <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-lg px-8">
                  <Link to="/onboarding">Learn More</Link>
                </Button>
              </div>
            </div>

            <div className="relative animate-float">
              <img 
                src={heroImage} 
                alt="NOX AI Holographic Interface" 
                className="rounded-3xl shadow-2xl"
                style={{ boxShadow: "var(--shadow-glow)" }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 animate-fade-in">
            Redefining Home Intelligence
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="backdrop-blur-xl rounded-2xl p-8 border border-border/30 hover:border-primary/30 transition-all duration-300 hover:scale-105 animate-slide-up"
                style={{
                  background: "var(--gradient-card)",
                  boxShadow: "var(--shadow-soft)",
                  animationDelay: `${index * 0.1}s`,
                }}
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto text-center">
          <div 
            className="backdrop-blur-xl rounded-3xl p-12 md:p-16 border border-border/30"
            style={{
              background: "var(--gradient-card)",
              boxShadow: "var(--shadow-glow)",
            }}
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Give Your Phone a New Life
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Experience the future of home automation. NOX AI transforms any Android device into your most intelligent companion.
            </p>
            <Button asChild size="lg" className="text-lg px-12">
              <Link to="/smart">
                Start Your Journey <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

const features = [
  {
    icon: Waves,
    title: "Sound Awareness",
    description: "Detects door knocks, phone rings, and human voices with precision.",
  },
  {
    icon: Brain,
    title: "Self-Learning AI",
    description: "Adapts to your environment and routines automatically over time.",
  },
  {
    icon: Bluetooth,
    title: "Seamless Audio",
    description: "Control music playback and volume across all Bluetooth devices.",
  },
  {
    icon: Shield,
    title: "Privacy First",
    description: "All processing happens on-device. Your data stays yours.",
  },
];

export default Landing;
