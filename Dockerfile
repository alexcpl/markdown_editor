# Multi-stage build for reproducible builds
# --- Stage 1: Builder ---
FROM node:18-alpine AS builder
WORKDIR /app

# Copy ALL source code and configuration files
# This is the most reliable way to ensure the build environment has everything.
COPY . .

# Install ALL dependencies (including devDependencies needed for building)
RUN npm install

# Run the Full Build Process
# This should run both 'build:client' (Vite build -> dist/public)
# and 'build:server' (tsc -p tsconfig.server.json -> dist/server/server, dist/server/shared).
RUN npm run build

# --- Production Stage ---
FROM node:18-alpine
WORKDIR /app

# Copy only production dependencies and built files
# Copy package files for production dependency installation
COPY package*.json ./
# Install only the dependencies needed to RUN the application (not build tools)
RUN npm install --production

# --- Copy the Built Application from the Builder Stage ---
# Copy the compiled server code
COPY --from=builder /app/dist/server/server ./dist/server
# --- CRITICAL FIX: Copy the compiled shared code to the location expected at runtime ---
# The error shows routes.js looks for '/app/dist/shared/schema.js'
# So, we copy the shared code from the builder to that specific location in the production image.
COPY --from=builder /app/dist/server/shared ./dist/shared
# --- CRITICALLY, copy the built client static files ---
# Copy the output of the Vite client build
COPY --from=builder /app/dist/public ./dist/public

# --- Expose the Port ---
# Inform Docker that the container listens on port 3000 at runtime.
EXPOSE 3000

# --- Define the Startup Command ---
# Run the main server entry point using Node.js.
CMD ["node", "dist/server/index.js"]
# --- End Dockerfile ---