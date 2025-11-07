import { Home, CreditCard, ArrowLeftRight, ArrowDownToLine, Sparkles } from "lucide-react";
import { useLocation } from "wouter";

export function BottomNav() {
  const [location, setLocation] = useLocation();

  const navItems = [
    {
      label: "Home",
      icon: Home,
      path: "/home",
    },
    {
      label: "Cartões",
      icon: CreditCard,
      path: "/card",
    },
    {
      label: "Converter",
      icon: ArrowLeftRight,
      path: "/stablecoin",
    },
    {
      label: "Trazer",
      icon: ArrowDownToLine,
      path: "/pix?tab=receive",
    },
    {
      label: "IWI Assistant",
      icon: Sparkles,
      path: "/support",
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-primary border-t border-primary-border z-50">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const isActive = location === item.path;
            const Icon = item.icon;
            
            return (
              <button
                key={item.path}
                onClick={() => setLocation(item.path)}
                className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[60px] ${
                  isActive 
                    ? 'text-primary-foreground' 
                    : 'text-primary-foreground/60 hover:text-primary-foreground/80'
                }`}
                data-testid={`nav-${item.path.slice(1)}`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
