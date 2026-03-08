from fastapi import APIRouter
from services.job_service import get_aggregated_jobs

router = APIRouter()


@router.get("/jobs")
def get_jobs(title: str, location: str, page: int = 1, limit: int = 10):
    result = get_aggregated_jobs(title, location, page, limit)

    return {
        "status": "success",
        "page": page,
        "limit": limit,
        "results": len(result["jobs"]),
        "total_results": result["all_jobs_count"],
        "jobs": result["jobs"]
    }