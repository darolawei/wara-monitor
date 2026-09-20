import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";

type LiveEvent =
  | { type: "connected" }
  | { type: "reading-created"; wellId: number };

function getLiveUrl() {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${window.location.host}/api/live`;
}

export function useLiveReadings() {
  const queryClient = useQueryClient();

  useEffect(() => {
    let socket: WebSocket | undefined;
    let reconnectTimer: number | undefined;
    let closedByEffect = false;

    const connect = () => {
      socket = new WebSocket(getLiveUrl());

      socket.onmessage = (message) => {
        try {
          const event = JSON.parse(message.data) as LiveEvent;
          if (event.type !== "reading-created") return;

          queryClient.invalidateQueries({ queryKey: [api.wells.list.path] });
          queryClient.invalidateQueries({ queryKey: [api.wells.get.path, event.wellId] });
          queryClient.invalidateQueries({ queryKey: [api.readings.list.path, event.wellId] });
        } catch (error) {
          console.error("Failed to process live reading event", error);
        }
      };

      socket.onclose = () => {
        if (!closedByEffect) {
          reconnectTimer = window.setTimeout(connect, 3000);
        }
      };
    };

    connect();

    return () => {
      closedByEffect = true;
      if (reconnectTimer) window.clearTimeout(reconnectTimer);
      socket?.close();
    };
  }, [queryClient]);
}
