import { Link, useLocation } from 'react-router-dom';
import { 
  BookOpen, 
  FlaskConical, 
  BarChart3, 
  GraduationCap, 
  Menu, 
  X,
  Beaker,
  LineChart,
  Library,
  Info,
  ScatterChart,
  Sigma
} from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from './ui/navigation-menu';
import { cn } from '@/lib/utils';

interface NavItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}

const labItems: NavItem[] = [
  { path: '/labs/clt', label: 'Центральная предельная теорема', icon: LineChart, description: 'Визуализация сходимости к нормальному распределению' },
  { path: '/labs/sampling', label: 'Выборочные статистики', icon: BarChart3, description: 'Генератор выборок с динамическими метриками' },
  { path: '/labs/confidence', label: 'Доверительные интервалы', icon: Beaker, description: 'Интерактивная симуляция покрытия' },
  { path: '/labs/hypothesis', label: 'Проверка гипотез', icon: FlaskConical, description: 'Визуализация p-value и мощности теста' },
  { path: '/labs/regression', label: 'Линейная регрессия', icon: LineChart, description: 'Интерактивный анализ связей' },
  { path: '/labs/correlation', label: 'Корреляция и ковариация', icon: ScatterChart, description: 'Scatter plot, выбросы и коэффициент Пирсона' },
  { path: '/labs/ttest', label: 't-тесты', icon: Sigma, description: 'Одновыборочный, независимый и парный' },
  { path: '/labs/binomial', label: 'Биномиальное распределение', icon: BarChart3, description: 'Вероятности и нормальное приближение' },
  { path: '/labs/chisquare', label: 'Хи-квадрат (χ²)', icon: Library, description: 'Таблицы сопряжённости и тест независимости' },
];

const courseItems: NavItem[] = [
  { path: '/courses/descriptive', label: 'Описательная статистика', icon: BarChart3, description: 'Меры центральной тенденции и разброса' },
  { path: '/courses/probability', label: 'Теория вероятностей', icon: Library, description: 'Распределения и случайные величины' },
  { path: '/courses/inference', label: 'Статистический вывод', icon: FlaskConical, description: 'От выборки к популяции' },
];

const mainNavItems: NavItem[] = [
  { path: '/', label: 'Главная', icon: BookOpen },
  { path: '/theory', label: 'Справочник', icon: GraduationCap },
  { path: '/calculators', label: 'Калькуляторы', icon: BarChart3 },
  { path: '/about', label: 'О проекте', icon: Info },
];

export const Header = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isLabActive = location.pathname.startsWith('/labs');
  const isCourseActive = location.pathname.startsWith('/courses');

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="font-heading font-bold text-xl hidden sm:inline">МатСтат для психологов</span>
        </Link>

        {/* Desktop Navigation */}
        <NavigationMenu className="hidden lg:flex">
          <NavigationMenuList>
            {/* Labs Dropdown */}
            <NavigationMenuItem>
              <NavigationMenuTrigger className={cn(
                "gap-2",
                isLabActive && "bg-primary text-primary-foreground"
              )}>
                <Beaker className="w-4 h-4" />
                Лаборатории
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
                  {labItems.map((item) => (
                    <li key={item.path}>
                      <NavigationMenuLink asChild>
                        <Link
                          to={item.path}
                          className={cn(
                            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                            location.pathname === item.path && "bg-accent"
                          )}
                        >
                          <div className="flex items-center gap-2 text-sm font-medium leading-none">
                            <item.icon className="w-4 h-4" />
                            {item.label}
                          </div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            {item.description}
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            {/* Courses Dropdown */}
            <NavigationMenuItem>
              <NavigationMenuTrigger className={cn(
                "gap-2",
                isCourseActive && "bg-primary text-primary-foreground"
              )}>
                <GraduationCap className="w-4 h-4" />
                Курсы
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[400px] gap-3 p-4">
                  {courseItems.map((item) => (
                    <li key={item.path}>
                      <NavigationMenuLink asChild>
                        <Link
                          to={item.path}
                          className={cn(
                            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                            location.pathname === item.path && "bg-accent"
                          )}
                        >
                          <div className="flex items-center gap-2 text-sm font-medium leading-none">
                            <item.icon className="w-4 h-4" />
                            {item.label}
                          </div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            {item.description}
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            {/* Direct Links */}
            {mainNavItems.map((item) => (
              <NavigationMenuItem key={item.path}>
                <Link
                  to={item.path}
                  className={cn(
                    "nav-link flex items-center gap-2 text-sm px-4 py-2",
                    location.pathname === item.path 
                      ? 'bg-primary text-primary-foreground rounded-lg' 
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

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
        <nav className="lg:hidden border-t border-border/50 bg-background p-4 animate-fade-in max-h-[80vh] overflow-y-auto">
          <div className="flex flex-col gap-4">
            {/* Labs Section */}
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
                <Beaker className="w-4 h-4" />
                Лаборатории
              </h3>
              <div className="flex flex-col gap-1">
                {labItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "nav-link flex items-center gap-3 py-2",
                      location.pathname === item.path 
                        ? 'text-primary font-medium' 
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Courses Section */}
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                Курсы
              </h3>
              <div className="flex flex-col gap-1">
                {courseItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "nav-link flex items-center gap-3 py-2",
                      location.pathname === item.path 
                        ? 'text-primary font-medium' 
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Main Links */}
            <div className="border-t border-border pt-4">
              {mainNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "nav-link flex items-center gap-3 py-2",
                    location.pathname === item.path 
                      ? 'text-primary font-medium' 
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </nav>
      )}
    </header>
  );
};
