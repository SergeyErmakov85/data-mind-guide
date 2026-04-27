import { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Mail } from 'lucide-react';
import { toast } from 'sonner';

import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

/* --------------------------------------------------------------------------
 * Schemas
 * -------------------------------------------------------------------------- */

const emailSchema = z.string().trim().email({ message: 'Введите корректный email' }).max(255);
const passwordSchema = z
  .string()
  .min(8, { message: 'Минимум 8 символов' })
  .max(72, { message: 'Максимум 72 символа' });

const signInSchema = z.object({ email: emailSchema, password: passwordSchema });

const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  display_name: z.string().trim().min(2, { message: 'Минимум 2 символа' }).max(80),
  specialization: z.string().trim().max(120).optional().or(z.literal('')),
});

const magicSchema = z.object({ email: emailSchema });

type SignInValues = z.infer<typeof signInSchema>;
type SignUpValues = z.infer<typeof signUpSchema>;
type MagicValues = z.infer<typeof magicSchema>;

/* --------------------------------------------------------------------------
 * Page
 * -------------------------------------------------------------------------- */

const AuthPage = () => {
  const { user, loading, signIn, signUp, signInWithMagicLink } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo =
    (location.state as { from?: string } | null)?.from ?? '/dashboard';

  const [submitting, setSubmitting] = useState(false);

  const signInForm = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  });
  const signUpForm = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: '', password: '', display_name: '', specialization: '' },
  });
  const magicForm = useForm<MagicValues>({
    resolver: zodResolver(magicSchema),
    defaultValues: { email: '' },
  });

  if (!loading && user) return <Navigate to={redirectTo} replace />;

  const onSignIn = async (v: SignInValues) => {
    setSubmitting(true);
    const { error } = await signIn(v.email, v.password);
    setSubmitting(false);
    if (error) {
      toast.error(error.message === 'Invalid login credentials' ? 'Неверный email или пароль' : error.message);
      return;
    }
    navigate(redirectTo, { replace: true });
  };

  const onSignUp = async (v: SignUpValues) => {
    setSubmitting(true);
    const { error } = await signUp(v.email, v.password, {
      display_name: v.display_name,
      specialization: v.specialization || undefined,
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message === 'User already registered' ? 'Пользователь уже зарегистрирован' : error.message);
      return;
    }
    toast.success('Добро пожаловать!');
    navigate(redirectTo, { replace: true });
  };

  const onMagic = async (v: MagicValues) => {
    setSubmitting(true);
    const { error } = await signInWithMagicLink(v.email);
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success('Письмо со ссылкой отправлено. Проверьте почту.');
    magicForm.reset();
  };

  return (
    <main id="main-content" className="container max-w-md py-16">
      <header className="mb-8 text-center">
        <p className="kicker">ACCOUNT</p>
        <h1 className="font-heading text-3xl font-bold mt-2">Вход в личный кабинет</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Сохраняйте прогресс, расчёты и закладки между устройствами.
        </p>
      </header>

      <Tabs defaultValue="signin" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="signin">Вход</TabsTrigger>
          <TabsTrigger value="signup">Регистрация</TabsTrigger>
          <TabsTrigger value="magic">Magic link</TabsTrigger>
        </TabsList>

        {/* -------- Sign in -------- */}
        <TabsContent value="signin" className="mt-6">
          <Form {...signInForm}>
            <form onSubmit={signInForm.handleSubmit(onSignIn)} className="space-y-4" noValidate>
              <FormField
                control={signInForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" autoComplete="email" placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={signInForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Пароль</FormLabel>
                    <FormControl>
                      <Input type="password" autoComplete="current-password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Войти
              </Button>
            </form>
          </Form>
        </TabsContent>

        {/* -------- Sign up -------- */}
        <TabsContent value="signup" className="mt-6">
          <Form {...signUpForm}>
            <form onSubmit={signUpForm.handleSubmit(onSignUp)} className="space-y-4" noValidate>
              <FormField
                control={signUpForm.control}
                name="display_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Имя</FormLabel>
                    <FormControl>
                      <Input autoComplete="name" placeholder="Анна Иванова" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={signUpForm.control}
                name="specialization"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Специализация (опционально)</FormLabel>
                    <FormControl>
                      <Input placeholder="Клинический психолог, студент…" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={signUpForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" autoComplete="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={signUpForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Пароль</FormLabel>
                    <FormControl>
                      <Input type="password" autoComplete="new-password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Создать аккаунт
              </Button>
            </form>
          </Form>
        </TabsContent>

        {/* -------- Magic link -------- */}
        <TabsContent value="magic" className="mt-6">
          <Form {...magicForm}>
            <form onSubmit={magicForm.handleSubmit(onMagic)} className="space-y-4" noValidate>
              <FormField
                control={magicForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" autoComplete="email" placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="mr-2 h-4 w-4" />
                )}
                Прислать ссылку для входа
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Без пароля — кликните по ссылке в письме, и мы автоматически войдём.
              </p>
            </form>
          </Form>
        </TabsContent>
      </Tabs>
    </main>
  );
};

export default AuthPage;
