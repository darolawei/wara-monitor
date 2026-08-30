import { Droplets, Activity, Menu, LogOut, Sun, Moon, User as UserIcon } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {

  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,

} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";

export function Navbar() {

  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 group cursor-pointer transition-transform hover:scale-105 active:scale-95 duration-200">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary shadow-lg shadow-primary/20">
                <Droplets className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-xl tracking-tight hidden sm:block">
                Wara-Monitor <span className="text-primary">PNG</span>
              </span>
            </Link>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-6">
            <div className="hidden md:flex items-center gap-1">
              <Link href="/" className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${location === '/' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`} data-testid="link-dashboard">
                Dashboard
              </Link>
              <Link href="/map" className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${location === '/map' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`} data-testid="link-map">
                Map View
              </Link>
            </div>
            
            <Button variant="outline" size="sm" className="hidden lg:flex items-center gap-2 rounded-full border-primary/20 hover:bg-primary/5">
              <Activity className="h-4 w-4 text-primary" />
              <span className="text-primary font-medium">System Active</span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full"
              data-testid="button-theme-toggle"
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="rounded-full gap-2 px-3" data-testid="button-user-menu">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-secondary text-primary-foreground flex items-center justify-center text-xs font-bold">
                      {user.fullName.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden sm:block text-sm font-medium" data-testid="text-username">
                      {user.fullName.split(" ")[0]}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-xl">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span className="font-semibold">{user.fullName}</span>
                      <span className="text-xs font-normal text-muted-foreground">@{user.username} · {user.role}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="md:hidden" asChild>
                    <Link href="/">
                      <UserIcon className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="md:hidden" asChild>
                    <Link href="/map">
                      <UserIcon className="mr-2 h-4 w-4" />
                      Map View
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="md:hidden" />
                  <DropdownMenuItem
                    onClick={() => logoutMutation.mutate()}
                    className="text-red-600 dark:text-red-400 focus:text-red-700"
                    data-testid="button-logout"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
