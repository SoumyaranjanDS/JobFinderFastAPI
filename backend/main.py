from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import jobs

app = FastAPI(
    title="Job Aggregator API",
    description="Aggregates job listings from Indeed and Internshala",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # later replace with your Vercel domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root endpoint
@app.get("/")
def home():
    return {
        "status": "running",
        "service": "Job Aggregator API",
        "docs": "/docs"
    }

# Include job routes
app.include_router(jobs.router)