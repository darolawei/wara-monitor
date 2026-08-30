import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Redirect } from "wouter";
import { Droplets, ShieldCheck, Loader2, Lock, User as UserIcon, Waves } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { loginSchema, type LoginInput } from "@shared/schema";

export default function Login() {
  const { user, loginMutation } = useAuth();

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  useEffect(() => {
    document.title = "Staff Login | Wara-Monitor PNG";
  }, []);

  if (user) {
    return <Redirect to="/" />;
  }

  const onSubmit = (data: LoginInput) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen w-full grid lg:grid-cols-2 bg-background">
      {/* Left: Login form */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-3 mb-10">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary shadow-lg shadow-primary/20">
              <Droplets className="h-7 w-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display font-bold text-2xl tracking-tight">
                Wara-Monitor <span className="text-primary">PNG</span>
              </h1>
              <p className="text-xs text-muted-foreground">Coastal Salinity Monitoring System</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-display font-bold mb-2">Staff Sign In</h2>
            <p className="text-muted-foreground">
              Restricted access — only authorised technical staff may sign in to manage monitoring data.
            </p>
          </div>

          <Card className="border-none shadow-xl rounded-2xl">
            <CardContent className="pt-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              {...field}
                              placeholder="e.g. admin"
                              autoComplete="username"
                              className="pl-9 h-11 rounded-xl"
                              data-testid="input-username"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              {...field}
                              type="password"
                              placeholder="Enter your password"
                              autoComplete="current-password"
                              className="pl-9 h-11 rounded-xl"
                              data-testid="input-password"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full h-11 rounded-xl text-base font-semibold bg-gradient-to-r from-primary to-secondary hover:opacity-90 shadow-lg shadow-primary/20"
                    disabled={loginMutation.isPending}
                    data-testid="button-login"
                  >
                    {loginMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      "Sign In Securely"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/10 text-sm">
            <div className="flex items-start gap-2">
              <ShieldCheck className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-foreground">Default credentials for first-time setup</p>
                <p className="text-muted-foreground text-xs mt-1">
                  Username: <span className="font-mono font-semibold">admin</span> · Password:{" "}
                  <span className="font-mono font-semibold">wara2026</span>
                </p>
                <p className="text-muted-foreground text-xs mt-1 italic">
                  Please change this in production deployments.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Hero panel */}
      <div className="hidden lg:flex relative overflow-hidden bg-gradient-to-br from-primary via-primary to-secondary text-primary-foreground">
        <div className="absolute inset-0 opacity-20">
          <Waves className="absolute -top-10 -left-10 w-96 h-96 text-white" strokeWidth={0.5} />
          <Waves className="absolute -bottom-20 -right-10 w-[32rem] h-[32rem] text-white" strokeWidth={0.5} />
        </div>
        <div className="relative z-10 flex flex-col justify-center p-12 max-w-lg">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full mb-6 w-fit">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Secure Staff Portal</span>
          </div>
          <h2 className="text-4xl font-display font-extrabold mb-4 leading-tight">
            Protecting PNG's Coastal Drinking Water
          </h2>
          <p className="text-lg text-primary-foreground/90 leading-relaxed mb-8">
            Real-time saltwater intrusion monitoring across Manus Island, East New Britain, and Bougainville. 
            Empowering local communities with the data they need to act early.
          </p>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-2xl font-display font-bold">3</div>
              <div className="text-xs text-primary-foreground/80">Pilot regions</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-2xl font-display font-bold">24/7</div>
              <div className="text-xs text-primary-foreground/80">Monitoring</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-2xl font-display font-bold">YECAP</div>
              <div className="text-xs text-primary-foreground/80">Climate grant</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
