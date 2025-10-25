import os
import logging
from fastapi import FastAPI
from app.core.config import settings
from app.core.database import init_db

from app.api.products import router as product_router
from app.api.inventory import router as inventory_router
from app.api.orders import router as order_router
from app.api.auth import router as auth_router
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.api.upload import router as upload_router
from app.api.reviews import router as reviews_router

app = FastAPI(title=settings.PROJECT_NAME, openapi_url=f"{settings.API_V1_STR}/openapi.json")

# Configure CORS
origins = [
    "http://localhost:3000",
    "http://localhost:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth_router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(product_router, prefix=f"{settings.API_V1_STR}/products", tags=["products"])
app.include_router(inventory_router, prefix=f"{settings.API_V1_STR}/inventory", tags=["inventory"])
app.include_router(order_router, prefix=f"{settings.API_V1_STR}/store", tags=["store"])
app.include_router(upload_router, prefix=f"{settings.API_V1_STR}/upload", tags=["upload"])
app.include_router(reviews_router, prefix=f"{settings.API_V1_STR}/reviews", tags=["reviews"])

# Mount static files
if not os.path.exists(settings.UPLOAD_DIR):
    os.makedirs(settings.UPLOAD_DIR)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

@app.on_event("startup")
async def startup_event():
    logging.info("Initializing Database...")
    init_db()

@app.get("/")
def root():
    return {"message": "Welcome to GitShop API (MySQL Edition)"}

@app.get("/health")
def health():
    return {"status": "ok"}
