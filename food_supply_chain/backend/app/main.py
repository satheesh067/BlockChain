from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

# Change these imports
from app.routes.enhanced_crop_routes import router as enhanced_crop_router
from app.routes.websocket_routes import router as websocket_router
from app.utils.error_handling import error_handler

app = FastAPI(
    title="Enhanced Food Supply Chain Backend",
    description="Blockchain-based food supply chain with IPFS integration",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include enhanced routes
app.include_router(enhanced_crop_router, prefix="/api", tags=["Enhanced API"])
app.include_router(websocket_router, tags=["WebSocket"])

# Add error handlers
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    return error_handler.handle_validation_error(exc)

@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request, exc):
    return error_handler.handle_http_exception(exc)

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    return error_handler.handle_generic_exception(exc)

@app.get("/")
def root():
    return {
        "message": "Enhanced Food Supply Chain backend running",
        "version": "2.0.0",
        "features": [
            "Role-based access control",
            "IPFS file storage",
            "Enhanced crop metadata",
            "Supply chain tracking",
            "Real-time notifications"
        ]
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "timestamp": "2024-01-01T00:00:00Z"}
