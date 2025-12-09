import os
import sys
import logging
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

# ========================================
# FIX: Unicode/Emoji Encoding on Windows
# ========================================
# Reconfigure stdout/stderr to use UTF-8 encoding
# This fixes UnicodeEncodeError for emojis (🚀, 🐳, etc.) in logs
if sys.platform.startswith('win'):
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')
    os.environ['PYTHONIOENCODING'] = 'utf-8'

from src.backend.api.endpoints import router as api_router

# --- Logging Configuration ---
# Create logs directory if it doesn't exist
os.makedirs("logs", exist_ok=True)

# Basic logging configuration
logging.basicConfig(
    level=logging.INFO, 
    format='%(asctime)s - %(levelname)s - %(message)s', 
    encoding="utf-8"
)

# --- FastAPI App ---
app = FastAPI(title="Mark 1 - AI Test Automation Platform")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- API Router ---
app.include_router(api_router)

# --- Workflow Metrics API Router ---
from src.backend.api.workflow_metrics_endpoints import router as workflow_metrics_router
app.include_router(workflow_metrics_router, prefix="/api")

# --- Static Files and Root Endpoint ---
# Serve the built React app from frontend-react/dist
FRONTEND_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "frontend-react", "dist")
ROBOT_TESTS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "robot_tests")

# Create robot_tests directory if it doesn't exist
os.makedirs(ROBOT_TESTS_DIR, exist_ok=True)

# Mount static files
app.mount("/reports", StaticFiles(directory=ROBOT_TESTS_DIR), name="reports")

# Serve React App
# We need to handle SPA routing by catching 404s and serving index.html,
# but for now, simple static serving of the build folder works for the root.
# FastAPI's StaticFiles with html=True serves index.html for root, but for other routes like /metrics
# we might need a catch-all.
app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="static")

# Catch-all for SPA routing (to allow direct navigation to /metrics)
from fastapi.responses import FileResponse
@app.exception_handler(404)
async def custom_404_handler(_, __):
    return FileResponse(os.path.join(FRONTEND_DIR, "index.html"))

@app.on_event("startup")
async def startup_event():
    logging.info("Application startup complete.")

@app.on_event("shutdown")
async def shutdown_event():
    logging.info("Application shutdown complete.")
