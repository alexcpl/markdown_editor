import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import routes from "./routes.js";
import { storage } from "./storage.js";
// Note: SyncMessage import is not used in this file, consider removing if not needed elsewhere after compile
import { SyncMessage } from "../shared/schema.js";

// --- Add this block to get __dirname equivalent in ES modules ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// ---

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

// --- ADD THIS BLOCK: Serve static files from the Vite build output ---
// This should be placed BEFORE your API routes and 404 handler.
const staticPath = path.join(__dirname, '../../dist/public'); // Adjust path as needed based on your Dockerfile structure
console.log(`[Server] Serving static files from: ${staticPath}`); // For debugging
app.use(express.static(staticPath));
// --- END ADDITION ---

// Routes
app.use("/api", routes);

// Socket.IO for real-time collaboration
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

// --- MODIFY THIS BLOCK: Catch-all handler for client-side routing ---
// This should come AFTER static file serving and API routes, but BEFORE the final 404 handler.
// It serves index.html for any route not handled above, allowing client-side routers to work.
app.get('*', (req, res) => {
  console.log(`[Server] Catch-all serving index.html for ${req.url}`); // For debugging
  res.sendFile(path.join(staticPath, 'index.html'));
});
// --- END MODIFICATION ---

// 404 handler (Optional: You might even remove this if the catch-all above handles everything)
// If kept, it should be the very last middleware.
app.use((req, res) => {
  console.log(`[Server] 404 Route not found for ${req.method} ${req.url}`); // For debugging
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Ensure PORT is a number and listen on all interfaces
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

server.listen(PORT, "0.0.0.0", () => {
  console.log(`[Server] Server running on port ${PORT}`);
  console.log(`[Server] Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`[Server] Static files served from: ${staticPath}`);
});

// --- Add this line for documentRooms which was missing in the original ---
// Define documentRooms here or ensure it's declared before the io.on block
const documentRooms = new Map<string, Set<string>>();
// ---