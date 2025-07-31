import { io, Socket } from "socket.io-client";
import { SyncMessage } from "@shared/schema";

const SOCKET_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3001";

class SocketService {
  private socket: Socket | null = null;
  private documentId: string | null = null;

  connect() {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        withCredentials: true,
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinDocument(documentId: string, userId: string) {
    if (!this.socket) return;
    
    this.documentId = documentId;
    this.socket.emit("join-document", { documentId, userId });
  }

  leaveDocument(userId: string) {
    if (!this.socket || !this.documentId) return;
    
    this.socket.emit("leave-document", { documentId: this.documentId, userId });
    this.documentId = null;
  }

  updateDocument(content: string, userId: string) {
    if (!this.socket || !this.documentId) return;
    
    this.socket.emit("document-update", {
      documentId: this.documentId,
      content,
      userId,
    });
  }

  updateCursor(position: any, userId: string) {
    if (!this.socket || !this.documentId) return;
    
    this.socket.emit("cursor-position", {
      documentId: this.documentId,
      position,
      userId,
    });
  }

  onDocumentUpdate(callback: (data: { content: string; updatedBy: string; timestamp: Date }) => void) {
    if (!this.socket) return;
    
    this.socket.on("document-updated", callback);
  }

  onUserJoined(callback: (data: { userId: string; username: string; timestamp: Date }) => void) {
    if (!this.socket) return;
    
    this.socket.on("user-joined", callback);
  }

  onUserLeft(callback: (data: { userId: string; timestamp: Date }) => void) {
    if (!this.socket) return;
    
    this.socket.on("user-left", callback);
  }

  onCursorUpdate(callback: (data: { userId: string; position: any; timestamp: Date }) => void) {
    if (!this.socket) return;
    
    this.socket.on("cursor-update", callback);
  }

  onRoomState(callback: (data: { documentId: string; users: string[] }) => void) {
    if (!this.socket) return;
    
    this.socket.on("room-state", callback);
  }

  onError(callback: (error: { message: string }) => void) {
    if (!this.socket) return;
    
    this.socket.on("error", callback);
  }

  off(event: string) {
    if (!this.socket) return;
    
    this.socket.off(event);
  }
}

export const socketService = new SocketService();
