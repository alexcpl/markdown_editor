import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import routes from "./routes.js";
import { storage } from "./storage.js";
import { SyncMessage } from "@shared/schema";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api", routes);

// Socket.IO for real-time collaboration
const documentRooms = new Map<string, Set<string>>();

io.on("connection", (socket: Socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-document", async (data: { documentId: string; userId: string }) => {
    const { documentId, userId } = data;
    
    // Verify user has access to the document
    const document = await storage.getDocument(documentId);
    if (!document) {
      socket.emit("error", { message: "Document not found" });
      return;
    }

    const user = await storage.getUser(userId);
    if (!user) {
      socket.emit("error", { message: "User not found" });
      return;
    }

    if (document.userId !== userId && !document.isPublic) {
      socket.emit("error", { message: "Access denied" });
      return;
    }

    socket.join(documentId);
    
    // Track user in room
    if (!documentRooms.has(documentId)) {
      documentRooms.set(documentId, new Set());
    }
    documentRooms.get(documentId)!.add(userId);

    // Notify others in the room
    socket.to(documentId).emit("user-joined", {
      userId,
      username: user.username,
      timestamp: new Date(),
    });

    // Send current room state
    socket.emit("room-state", {
      documentId,
      users: Array.from(documentRooms.get(documentId)!),
    });
  });

  socket.on("document-update", async (data: { documentId: string; content: string; userId: string }) => {
    const { documentId, content, userId } = data;
    
    // Verify user has access
    const document = await storage.getDocument(documentId);
    if (!document || (document.userId !== userId && !document.isPublic)) {
      socket.emit("error", { message: "Access denied" });
      return;
    }

    // Update document
    await storage.updateDocument(documentId, { content });

    // Broadcast to other users in the room
    socket.to(documentId).emit("document-updated", {
      content,
      updatedBy: userId,
      timestamp: new Date(),
    });
  });

  socket.on("cursor-position", (data: { documentId: string; position: any; userId: string }) => {
    socket.to(data.documentId).emit("cursor-update", {
      userId: data.userId,
      position: data.position,
      timestamp: new Date(),
    });
  });

  socket.on("leave-document", (data: { documentId: string; userId: string }) => {
    const { documentId, userId } = data;
    
    socket.leave(documentId);
    
    // Remove user from room tracking
    if (documentRooms.has(documentId)) {
      documentRooms.get(documentId)!.delete(userId);
      
      // Clean up empty rooms
      if (documentRooms.get(documentId)!.size === 0) {
        documentRooms.delete(documentId);
      }
    }

    // Notify others
    socket.to(documentId).emit("user-left", {
      userId,
      timestamp: new Date(),
    });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    
    // Remove user from all rooms
    documentRooms.forEach((users, documentId) => {
      users.forEach(userId => {
        socket.to(documentId).emit("user-left", {
          userId,
          timestamp: new Date(),
        });
      });
    });
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : "Internal server error",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});
