import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type WellInput, type WellsListResponse, type WellResponse } from "@shared/routes";

// Utility to parse responses with logging for safety
function parseResponse<T>(schema: any, data: unknown, label: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`[Zod Validation Error] ${label}:`, result.error.format());
    throw new Error(`Data validation failed for ${label}`);
  }
  return result.data as T;
}

export function useWells() {
  return useQuery({
    queryKey: [api.wells.list.path],
    queryFn: async () => {
      const res = await fetch(api.wells.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch wells");
      const data = await res.json();
      return parseResponse<WellsListResponse>(api.wells.list.responses[200], data, "wells.list");
    },
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
    staleTime: 15000,
  });
}

export function useWell(id: number) {
  return useQuery({
    queryKey: [api.wells.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.wells.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch well details");
      const data = await res.json();
      return parseResponse<WellResponse>(api.wells.get.responses[200], data, "wells.get");
    },
    enabled: !!id && !isNaN(id),
  });
}

export function useCreateWell() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: WellInput) => {
      // Ensure currentSalinity is treated correctly based on schema
      const validated = api.wells.create.input.parse({
        ...input,
        currentSalinity: String(input.currentSalinity) // Coerce to string for numeric DB type
      });
      
      const res = await fetch(api.wells.create.path, {
        method: api.wells.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Validation failed");
        }
        throw new Error("Failed to create well");
      }
      
      const data = await res.json();
      return parseResponse<WellResponse>(api.wells.create.responses[201], data, "wells.create");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.wells.list.path] });
    },
  });
}
