from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

from routes import places, route, ai, template

# Load environment variables
load_dotenv()

app = FastAPI(
    title="PlaceHunter API",
    description="여행 장소 추천 및 동선 최적화 API",
    version="1.0.0",
)

# CORS middleware
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
# Allow multiple frontend origins for development and production
allowed_origins = [
    "http://localhost:3000",
    frontend_url,
]

# Add production Vercel URL if provided
vercel_url = os.getenv("VERCEL_URL")
if vercel_url:
    allowed_origins.append(f"https://{vercel_url}")

# Allow any *.vercel.app domain for preview deployments
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(places.router, prefix="/api/places", tags=["places"])
app.include_router(route.router, prefix="/api/route", tags=["route"])
app.include_router(ai.router, prefix="/api/ai", tags=["ai"])
app.include_router(template.router, prefix="/api/template", tags=["template"])


@app.get("/")
async def root():
    return {"message": "PlaceHunter API", "version": "1.0.0", "docs": "/docs"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


# For Railway deployment - run with dynamic port
if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)
