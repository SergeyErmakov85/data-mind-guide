import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Calculator, FlaskConical, BarChart3, GraduationCap, FileText, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';

const navItems = [
  { path: '/', label: 'Главная', icon: BookOpen },
  { path: '/theory', label: 'Теория', icon: GraduationCap },
  { path: '/descriptive', label: 'Описательная статистика', icon: BarChart3 },
  { path: '/hypothesis', label: 'Проверка гипотез', icon: FlaskConical },
  { path: '/practice', label: 'Практика', icon: Calculator },
  { path: '/trainer', label: 'Тренажёр', icon: FileText },
];

export const Header = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="font-heading font-bold text-xl hidden sm:inline">СтатПси</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link flex items-center gap-2 text-sm ${
                  isActive ? 'active' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <nav className="lg:hidden border-t border-border/50 bg-background p-4 animate-fade-in">
          <div className="flex flex-col gap-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`nav-link flex items-center gap-3 ${
                    isActive ? 'active' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
};
