import { Router } from "express";
import { storage } from "./storage.js";
import { 
  validateLogin, 
  validateRegister, 
  validateCreateDocument, 
  validateUpdateDocument,
  authResponseSchema,
  apiResponseSchema,
  errorResponseSchema
} from "@shared/schema";
import { randomUUID } from "crypto";

const router = Router();

// Authentication middleware
const authenticate = async (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ success: false, message: "No token provided" });
  }

  // For in-memory storage, we'll use a simple token validation
  // In production, use JWT or similar
  const userId = token;
  const user = await storage.getUser(userId);
  if (!user) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }

  req.user = user;
  next();
};

// Auth routes
router.post("/auth/register", async (req, res) => {
  try {
    const data = validateRegister(req.body);
    
    // Check if user already exists
    const existingUser = await storage.getUserByEmail(data.email);
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: "User already exists" 
      });
    }

    const passwordHash = await storage.hashPassword(data.password);
    const user = await storage.createUser({
      email: data.email,
      username: data.username,
      passwordHash,
    });

    const token = user.id; // Simple token for in-memory storage
    
    res.json({
      success: true,
      message: "User created successfully",
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        token,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Invalid input",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

router.post("/auth/login", async (req, res) => {
  try {
    const data = validateLogin(req.body);
    
    const user = await storage.getUserByEmail(data.email);
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid credentials" 
      });
    }

    const isValid = await storage.validatePassword(data.password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid credentials" 
      });
    }

    const token = user.id; // Simple token for in-memory storage
    
    res.json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        token,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Invalid input",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Document routes
router.get("/documents", authenticate, async (req: any, res) => {
  try {
    const documents = await storage.getDocumentsByUser(req.user.id);
    res.json({
      success: true,
      message: "Documents retrieved successfully",
      data: {
        documents: documents.map(doc => ({
          id: doc.id,
          title: doc.title,
          userId: doc.userId,
          isPublic: doc.isPublic,
          createdAt: doc.createdAt,
          updatedAt: doc.updatedAt,
          lastSyncedAt: doc.lastSyncedAt,
        })),
        total: documents.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve documents",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

router.post("/documents", authenticate, async (req: any, res) => {
  try {
    const data = validateCreateDocument(req.body);
    
    const document = await storage.createDocument({
      title: data.title,
      content: data.content,
      userId: req.user.id,
      isPublic: data.isPublic,
    });

    res.json({
      success: true,
      message: "Document created successfully",
      data: {
        document: {
          id: document.id,
          title: document.title,
          content: document.content,
          userId: document.userId,
          isPublic: document.isPublic,
          createdAt: document.createdAt,
          updatedAt: document.updatedAt,
          lastSyncedAt: document.lastSyncedAt,
        },
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Invalid input",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

router.get("/documents/:id", authenticate, async (req: any, res) => {
  try {
    const document = await storage.getDocument(req.params.id);
    
    if (!document) {
      return res.status(404).json({ 
        success: false, 
        message: "Document not found" 
      });
    }

    if (document.userId !== req.user.id && !document.isPublic) {
      return res.status(403).json({ 
        success: false, 
        message: "Access denied" 
      });
    }

    res.json({
      success: true,
      message: "Document retrieved successfully",
      data: { document },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve document",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

router.put("/documents/:id", authenticate, async (req: any, res) => {
  try {
    const data = validateUpdateDocument(req.body);
    
    const existingDocument = await storage.getDocument(req.params.id);
    if (!existingDocument) {
      return res.status(404).json({ 
        success: false, 
        message: "Document not found" 
      });
    }

    if (existingDocument.userId !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: "Access denied" 
      });
    }

    const document = await storage.updateDocument(req.params.id, data);

    res.json({
      success: true,
      message: "Document updated successfully",
      data: { document },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Invalid input",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

router.delete("/documents/:id", authenticate, async (req: any, res) => {
  try {
    const document = await storage.getDocument(req.params.id);
    
    if (!document) {
      return res.status(404).json({ 
        success: false, 
        message: "Document not found" 
      });
    }

    if (document.userId !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: "Access denied" 
      });
    }

    const deleted = await storage.deleteDocument(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({ 
        success: false, 
        message: "Document not found" 
      });
    }

    res.json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete document",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Document versions
router.get("/documents/:id/versions", authenticate, async (req: any, res) => {
  try {
    const document = await storage.getDocument(req.params.id);
    
    if (!document) {
      return res.status(404).json({ 
        success: false, 
        message: "Document not found" 
      });
    }

    if (document.userId !== req.user.id && !document.isPublic) {
      return res.status(403).json({ 
        success: false, 
        message: "Access denied" 
      });
    }

    const versions = await storage.getDocumentVersions(req.params.id);
    
    res.json({
      success: true,
      message: "Document versions retrieved successfully",
      data: { versions },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve document versions",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Health check
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is healthy",
    data: {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
  });
});

export default router;
