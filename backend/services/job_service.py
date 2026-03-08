from concurrent.futures import ThreadPoolExecutor
from services.scraper import scrape_indeed_jobs
from services.internshala_scraper import scrape_internshala_jobs
import time


def remove_duplicate_jobs(jobs):
    seen = set()
    unique_jobs = []

    for job in jobs:
        key = (
            job["title"].lower(),
            job["company"].lower(),
            job["location"].lower()
        )

        if key not in seen:
            seen.add(key)
            unique_jobs.append(job)

    return unique_jobs


def paginate_jobs(jobs, page: int, limit: int):
    start_index = (page - 1) * limit
    end_index = start_index + limit
    return jobs[start_index:end_index]


def get_aggregated_jobs(title: str, location: str, page: int = 1, limit: int = 10):
    start = time.time()

    with ThreadPoolExecutor() as executor:
        indeed_future = executor.submit(scrape_indeed_jobs, title, location)
        internshala_future = executor.submit(scrape_internshala_jobs, title)

        indeed_jobs = indeed_future.result()
        internshala_jobs = internshala_future.result()

    jobs = indeed_jobs + internshala_jobs
    unique_jobs = remove_duplicate_jobs(jobs)
    paginated_jobs = paginate_jobs(unique_jobs, page, limit)

    end = time.time()
    print("Scraping took:", round(end - start, 2), "seconds")

    return {
        "all_jobs_count": len(unique_jobs),
        "jobs": paginated_jobs
    }