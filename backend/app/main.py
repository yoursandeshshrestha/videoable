from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
import os

from app.config import settings
from app.controllers import video_router, chat_router, export_router

# Create FastAPI application
app = FastAPI(
    title=settings.api_title,
    version=settings.api_version,
    description="AI-powered chat-based video editing API"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create necessary directories
os.makedirs(settings.uploads_dir, exist_ok=True)
os.makedirs(settings.outputs_dir, exist_ok=True)
os.makedirs(settings.data_dir, exist_ok=True)

# Mount static file directories
app.mount(
    f"/{settings.uploads_dir}", 
    StaticFiles(directory=settings.uploads_dir), 
    name="uploads"
)
app.mount(
    f"/{settings.outputs_dir}", 
    StaticFiles(directory=settings.outputs_dir), 
    name="outputs"
)

# Include routers
app.include_router(video_router, prefix="/api/video", tags=["Video Management"])
app.include_router(chat_router, prefix="/api/chat", tags=["Chat & Editing"])
app.include_router(export_router, prefix="/api/export", tags=["Export"])

# Root endpoint
@app.get("/", tags=["Root"])
async def root():
    """Root endpoint - API information"""
    return {
        "message": "Videoable API - Chat-based Video Editor",
        "version": settings.api_version,
        "docs": "/docs",
        "status": "operational"
    }

# Health check endpoint
@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "api": "operational",
        "version": settings.api_version
    }

# Exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler"""
    return JSONResponse(
        status_code=500,
        content={"message": "An unexpected error occurred", "detail": str(exc)}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=True
    )