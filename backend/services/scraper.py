from urllib.parse import quote_plus
from playwright.sync_api import sync_playwright
import re


def scrape_indeed_jobs(title: str, location: str):
    jobs = []

    try:
        query = quote_plus(title)
        loc = quote_plus(location)
        url = f"https://in.indeed.com/jobs?q={query}&l={loc}"

        with sync_playwright() as p:

            browser = p.chromium.launch(
                headless=True,
                args=["--disable-blink-features=AutomationControlled"]
            )

            context = browser.new_context(
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36"
            )

            page = context.new_page()

            page.goto(url, timeout=60000)

            page.wait_for_selector("div.job_seen_beacon", timeout=15000)

            job_cards = page.query_selector_all("div.job_seen_beacon")

            print("job_seen_beacon:", len(job_cards))

            for i, job in enumerate(job_cards[:20]):

                title_el = (
                    job.query_selector("h2.jobTitle span")
                    or job.query_selector("h2 a span")
                    or job.query_selector("h2 span")
                )

                company_el = (
                    job.query_selector("[data-testid='company-name']")
                    or job.query_selector("span[data-testid='company-name']")
                )

                location_el = (
                    job.query_selector("[data-testid='text-location']")
                    or job.query_selector("div[data-testid='text-location']")
                )

                date_el = (
                    job.query_selector("span.date")
                    or job.query_selector("[data-testid='myJobsStateDate']")
                )

                salary_el = (
                    job.query_selector(".salary-snippet-container")
                    or job.query_selector(".metadata.salary-snippet-container")
                )

                link_el = job.query_selector("h2 a")

                if not title_el:
                    continue

                title_text = title_el.inner_text().strip()
                company_text = company_el.inner_text().strip() if company_el else "Not specified"
                location_text = location_el.inner_text().strip() if location_el else "Not specified"

                date_posted = date_el.inner_text().strip() if date_el else "Unknown"

                salary_text = "Not specified"
                if salary_el:
                    raw_salary = salary_el.inner_text().strip()
                    if re.search(r"(₹|\$|€|£|Rs|INR|LPA|year|month|hour)", raw_salary, re.IGNORECASE):
                        salary_text = raw_salary

                apply_link = "Not available"

                if link_el:
                    href = link_el.get_attribute("href")

                    if href:
                        if href.startswith("http"):
                            apply_link = href
                        else:
                            apply_link = f"https://in.indeed.com{href}"

                jobs.append({
                    "id": i + 1,
                    "title": title_text,
                    "company": company_text,
                    "location": location_text,
                    "salary": salary_text,
                    "source": "Indeed",
                    "date_posted": date_posted,
                    "apply_link": apply_link
                })

            browser.close()

    except Exception as e:
        print("Scraper error:", e)

    return jobs