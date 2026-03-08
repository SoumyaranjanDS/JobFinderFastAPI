from pydantic import BaseModel
from typing import List


class JobBase(BaseModel):
    title: str
    company: str
    location: str
    salary: str
    source: str
    date_posted: str
    apply_link: str


class JobCreate(JobBase):
    pass


class JobResponse(JobBase):
    id: int


class JobListResponse(BaseModel):
    status: str
    results: int
    jobs: List[JobResponse]