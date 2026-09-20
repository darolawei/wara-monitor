import { z } from "zod";

export const simulatorStateSchema = z.object({
  wellId: z.coerce.number().int().positive(),
  waterMl: z.coerce.number().min(1).max(5000),
  saltGrams: z.coerce.number().min(0).max(100),
  salinity: z.coerce.number().min(0).max(100),
});

export type SimulatorStateInput = z.infer<typeof simulatorStateSchema>;

export type SimulatorState = SimulatorStateInput & {
  status: "safe" | "warning" | "danger";
  updatedAt: string;
};

let state: SimulatorState = {
  wellId: 1,
  waterMl: 500,
  saltGrams: 0.25,
  salinity: 0.5,
  status: "safe",
  updatedAt: new Date().toISOString(),
};

function getStatus(salinity: number): SimulatorState["status"] {
  if (salinity > 3) return "danger";
  if (salinity >= 1) return "warning";
  return "safe";
}

export function getSimulatorState() {
  return state;
}

export function updateSimulatorState(input: SimulatorStateInput) {
  state = {
    ...input,
    status: getStatus(input.salinity),
    updatedAt: new Date().toISOString(),
  };

  return state;
}
