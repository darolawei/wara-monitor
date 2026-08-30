import { createContext, useContext, type ReactNode } from "react";
import { useQuery, useMutation, UseMutationResult } from "@tanstack/react-query";
import { apiRequest, queryClient, getQueryFn } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { SafeUser, LoginInput } from "@shared/schema";

type AuthContextType = {
  user: SafeUser | null;
  isLoading: boolean;
  loginMutation: UseMutationResult<SafeUser, Error, LoginInput>;
  logoutMutation: UseMutationResult<void, Error, void>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();

  const {
    data: user,
    isLoading,
  } = useQuery<SafeUser | null>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginInput) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      return (await res.json()) as SafeUser;
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: `Welcome back, ${user.fullName}`,
        description: "You are now signed in to the Wara-Monitor system.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message.replace(/^\d+:\s*/, "") || "Invalid credentials",
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      queryClient.clear();
      toast({
        title: "Signed out",
        description: "You have been securely logged out.",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        loginMutation,
        logoutMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
