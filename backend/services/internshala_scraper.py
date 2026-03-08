import requests
from bs4 import BeautifulSoup


def scrape_internshala_jobs(title: str):

    jobs = []

    try:
        query = title.lower().replace(" ", "-")

        url = f"https://internshala.com/jobs/{query}-jobs"

        headers = {
            "User-Agent": "Mozilla/5.0"
        }

        response = requests.get(url, headers=headers)
        soup = BeautifulSoup(response.text, "html.parser")

        cards = soup.select(".individual_internship")

        print("Internshala jobs:", len(cards))

        for i, job in enumerate(cards[:20]):

            title_el = job.select_one(".job-title-href")
            company_el = job.select_one(".company-name")
            location_el = job.select_one(".location_link")
            date_el = job.select_one(".status-success")

            title_text = title_el.text.strip() if title_el else "Unknown"
            company_text = company_el.text.strip() if company_el else "Unknown"
            location_text = location_el.text.strip() if location_el else "Remote"
            date_text = date_el.text.strip() if date_el else "Unknown"

            apply_link = (
                "https://internshala.com" + title_el["href"]
                if title_el else "Not available"
            )

            jobs.append({
                "id": i + 1,
                "title": title_text,
                "company": company_text,
                "location": location_text,
                "salary": "Not specified",
                "source": "Internshala",
                "date_posted": date_text,
                "apply_link": apply_link
            })

    except Exception as e:
        print("Internshala scraper error:", e)

    return jobs