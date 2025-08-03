import { User, Document, DocumentVersion } from "../shared/schema.js";
import { randomUUID } from "crypto";

// Storage interface
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>;
  updateUser(id: string, updates: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<User | undefined>;
  
  // Document operations
  getDocument(id: string): Promise<Document | undefined>;
  getDocumentsByUser(userId: string): Promise<Document[]>;
  createDocument(document: Omit<Document, 'id' | 'createdAt' | 'updatedAt' | 'lastSyncedAt'>): Promise<Document>;
  updateDocument(id: string, updates: Partial<Omit<Document, 'id' | 'createdAt'>>): Promise<Document | undefined>;
  deleteDocument(id: string): Promise<boolean>;
  getDocumentVersions(documentId: string): Promise<DocumentVersion[]>;
  createDocumentVersion(version: Omit<DocumentVersion, 'id' | 'createdAt'>): Promise<DocumentVersion>;
  
  // Authentication
  validatePassword(password: string, hash: string): Promise<boolean>;
  hashPassword(password: string): Promise<string>;
}

// In-memory storage for development
class MemStorage implements IStorage {
  private users = new Map<string, User>();
  private documents = new Map<string, Document>();
  private documentVersions = new Map<string, DocumentVersion[]>();
  private sessions = new Map<string, { userId: string; expiresAt: Date }>();

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.email === email);
  }

  async createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const id = randomUUID();
    const newUser: User = {
      ...user,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(id, newUser);
    return newUser;
  }

  async updateUser(id: string, updates: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates, updatedAt: new Date() };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getDocument(id: string): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async getDocumentsByUser(userId: string): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(d => d.userId === userId);
  }

  async createDocument(document: Omit<Document, 'id' | 'createdAt' | 'updatedAt' | 'lastSyncedAt'>): Promise<Document> {
    const id = randomUUID();
    const newDocument: Document = {
      ...document,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSyncedAt: null,
    };
    this.documents.set(id, newDocument);
    
    // Create initial version
    await this.createDocumentVersion({
      documentId: id,
      content: document.content,
      version: 1,
      createdBy: document.userId,
    });
    
    return newDocument;
  }

  async updateDocument(id: string, updates: Partial<Omit<Document, 'id' | 'createdAt'>>): Promise<Document | undefined> {
    const document = this.documents.get(id);
    if (!document) return undefined;
    
    const updateData: any = { ...updates, updatedAt: new Date() };
    const updatedDocument = { ...document, ...updateData };
    this.documents.set(id, updatedDocument);
    
    if (updates.content !== undefined) {
      const versions = this.documentVersions.get(id) || [];
      const newVersion = versions.length + 1;
      await this.createDocumentVersion({
        documentId: id,
        content: updates.content,
        version: newVersion,
        createdBy: document.userId,
      });
    }
    
    return updatedDocument;
  }

  async deleteDocument(id: string): Promise<boolean> {
    const existed = this.documents.has(id);
    this.documents.delete(id);
    this.documentVersions.delete(id);
    return existed;
  }

  async getDocumentVersions(documentId: string): Promise<DocumentVersion[]> {
    return this.documentVersions.get(documentId) || [];
  }

  async createDocumentVersion(version: Omit<DocumentVersion, 'id' | 'createdAt'>): Promise<DocumentVersion> {
    const newVersion: DocumentVersion = {
      ...version,
      id: randomUUID(),
      createdAt: new Date(),
    };
    
    const versions = this.documentVersions.get(version.documentId) || [];
    versions.push(newVersion);
    this.documentVersions.set(version.documentId, versions);
    
    return newVersion;
  }

  async validatePassword(password: string, hash: string): Promise<boolean> {
    return password === hash; // In memory storage, no hashing
  }

  async hashPassword(password: string): Promise<string> {
    return password; // In memory storage, no hashing
  }
}

// Export the appropriate storage based on environment
export const storage = new MemStorage();
