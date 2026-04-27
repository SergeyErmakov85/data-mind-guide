import { Link, useNavigate } from 'react-router-dom';
import { LogIn, LogOut, User as UserIcon, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const initials = (name: string | null | undefined, email: string | null | undefined): string => {
  const src = (name && name.trim()) || (email ? email.split('@')[0] : 'U');
  return src
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
};

export const UserMenu = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return <div aria-hidden className="h-11 w-11" />;
  }

  if (!user) {
    return (
      <Button asChild variant="outline" size="sm" className="h-11 gap-2 focus-visible:ring-[3px] focus-visible:ring-ring focus-visible:ring-offset-2">
        <Link to="/auth">
          <LogIn className="h-4 w-4" />
          <span className="hidden sm:inline">Войти</span>
        </Link>
      </Button>
    );
  }

  const name = (user.user_metadata?.display_name as string | undefined) ?? null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Меню профиля"
          className="flex h-11 w-11 min-w-11 items-center justify-center rounded-full bg-primary text-primary-foreground font-heading text-sm font-bold focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {initials(name, user.email)}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="truncate">{name ?? user.email}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/dashboard" className="cursor-pointer">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Личный кабинет
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/dashboard" className="cursor-pointer">
            <UserIcon className="mr-2 h-4 w-4" />
            Профиль
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={async () => {
            await signOut();
            navigate('/', { replace: true });
          }}
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Выйти
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
