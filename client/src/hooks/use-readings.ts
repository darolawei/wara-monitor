import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type ReadingInput, type ReadingsListResponse, type ReadingResponse } from "@shared/routes";

function parseResponse<T>(schema: any, data: unknown, label: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`[Zod Validation Error] ${label}:`, result.error.format());
    throw new Error(`Data validation failed for ${label}`);
  }
  return result.data as T;
}

export function useWellReadings(wellId: number) {
  return useQuery({
    queryKey: [api.readings.list.path, wellId],
    queryFn: async () => {
      const url = buildUrl(api.readings.list.path, { wellId });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch readings");
      const data = await res.json();
      return parseResponse<ReadingsListResponse>(api.readings.list.responses[200], data, "readings.list");
    },
    enabled: !!wellId && !isNaN(wellId),
  });
}

export function useCreateReading() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: ReadingInput) => {
      const validated = api.readings.create.input.parse({
        ...input,
        salinity: String(input.salinity) // Coerce to string for numeric pg type
      });
      
      const res = await fetch(api.readings.create.path, {
        method: api.readings.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to record reading");
      }
      
      const data = await res.json();
      return parseResponse<ReadingResponse>(api.readings.create.responses[201], data, "readings.create");
    },
    onSuccess: (_, variables) => {
      // Invalidate the specific well's readings
      queryClient.invalidateQueries({ 
        queryKey: [api.readings.list.path, variables.wellId] 
      });
      // Invalidate the well details and list since status/currentSalinity might have updated
      queryClient.invalidateQueries({ queryKey: [api.wells.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.wells.get.path, variables.wellId] });
    },
  });
}
