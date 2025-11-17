import { Home, CheckSquare, Target, Gift, Settings, LucideIcon } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { cn } from "@/lib/utils";

interface NavItem {
  to: string;
  icon: LucideIcon;
  label: string;
}

const BottomNav = () => {
  const navItems: NavItem[] = [
    { to: "/dashboard", icon: Home, label: "Start" },
    { to: "/tasks", icon: CheckSquare, label: "Zadania" },
    { to: "/missions", icon: Target, label: "Misje" },
    { to: "/rewards", icon: Gift, label: "Nagrody" },
    { to: "/settings", icon: Settings, label: "Więcej" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 safe-area-bottom">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className="flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all"
            activeClassName="text-primary"
          >
            <item.icon className="w-5 h-5" />
            <span className="text-xs font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;