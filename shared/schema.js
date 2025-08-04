import { z } from 'zod';
// User schema
export const userSchema = z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    username: z.string().min(3).max(50),
    passwordHash: z.string(),
    createdAt: z.date(),
    updatedAt: z.date(),
});
// Document schema
export const documentSchema = z.object({
    id: z.string().uuid(),
    title: z.string().min(1).max(255),
    content: z.string(),
    userId: z.string().uuid(),
    isPublic: z.boolean().default(false),
    createdAt: z.date(),
    updatedAt: z.date(),
    lastSyncedAt: z.date().nullable(),
});
// Document version schema for versioning
export const documentVersionSchema = z.object({
    id: z.string().uuid(),
    documentId: z.string().uuid(),
    content: z.string(),
    version: z.number().int().positive(),
    createdAt: z.date(),
    createdBy: z.string().uuid(),
});
// API response schemas
export const apiResponseSchema = z.object({
    success: z.boolean(),
    message: z.string(),
    data: z.any().optional(),
});
export const errorResponseSchema = z.object({
    success: z.boolean().default(false),
    message: z.string(),
    error: z.string(),
});
// Authentication schemas
export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});
export const registerSchema = z.object({
    email: z.string().email(),
    username: z.string().min(3).max(50),
    password: z.string().min(6),
});
export const authResponseSchema = z.object({
    user: userSchema.omit({ passwordHash: true }),
    token: z.string(),
});
// Document CRUD schemas
export const createDocumentSchema = z.object({
    title: z.string().min(1).max(255),
    content: z.string().default(''),
    isPublic: z.boolean().default(false),
});
export const updateDocumentSchema = z.object({
    title: z.string().min(1).max(255).optional(),
    content: z.string().optional(),
    isPublic: z.boolean().optional(),
});
export const documentListSchema = z.object({
    documents: z.array(documentSchema.omit({ content: true })),
    total: z.number(),
    page: z.number(),
    limit: z.number(),
});
// WebSocket message schemas
export const syncMessageSchema = z.object({
    type: z.enum(['document_update', 'cursor_position', 'user_joined', 'user_left']),
    documentId: z.string().uuid(),
    userId: z.string().uuid(),
    data: z.any(),
    timestamp: z.date(),
});
// Validation schemas for API endpoints
export const validateLogin = (data) => loginSchema.parse(data);
export const validateRegister = (data) => registerSchema.parse(data);
export const validateCreateDocument = (data) => createDocumentSchema.parse(data);
export const validateUpdateDocument = (data) => updateDocumentSchema.parse(data);
