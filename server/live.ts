import type { Server } from "http";
import { WebSocket, WebSocketServer } from "ws";
import type { Reading, Well } from "@shared/schema";

type LiveEvent =
  | { type: "connected" }
  | { type: "reading-created"; wellId: number; reading: Reading; well: Well | undefined };

let liveServer: WebSocketServer | undefined;

export function setupLiveEvents(httpServer: Server) {
  liveServer = new WebSocketServer({ server: httpServer, path: "/api/live" });

  liveServer.on("connection", (socket) => {
    socket.send(JSON.stringify({ type: "connected" } satisfies LiveEvent));
  });
}

export function broadcastReadingCreated(reading: Reading, well: Well | undefined) {
  broadcast({
    type: "reading-created",
    wellId: reading.wellId,
    reading,
    well,
  });
}

function broadcast(event: LiveEvent) {
  if (!liveServer) return;

  const message = JSON.stringify(event);
  liveServer.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}
