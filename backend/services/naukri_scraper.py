from playwright.sync_api import sync_playwright
from urllib.parse import quote


def scrape_naukri_jobs(title: str, location: str):
    jobs = []

    try:
        title_slug = title.lower().strip().replace(" ", "-")
        location_slug = location.lower().strip().replace(" ", "-")

        query = quote(title.strip())
        loc = quote(location.strip())

        search_url = (
            f"https://www.naukri.com/{title_slug}-jobs-in-{location_slug}"
            f"?k={query}&l={loc}&experience=0&qproductJobSource=2"
            f"&naukriCampus=true&nignbevent_src=jobsearchDeskGNB"
        )

        with sync_playwright() as p:
            browser = p.chromium.launch(
                headless=False,
                slow_mo=150,
                args=[
                    "--disable-blink-features=AutomationControlled",
                    "--disable-dev-shm-usage",
                    "--no-sandbox",
                ],
            )

            context = browser.new_context(
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
                viewport={"width": 1366, "height": 768},
                locale="en-IN",
                extra_http_headers={
                    "Referer": "https://www.naukri.com/",
                    "Accept-Language": "en-IN,en;q=0.9",
                },
            )

            page = context.new_page()

            # Visit homepage first
            page.goto("https://www.naukri.com/", timeout=60000, wait_until="domcontentloaded")
            page.wait_for_timeout(4000)

            # Then go to the search page
            page.goto(search_url, timeout=60000, wait_until="domcontentloaded")
            page.wait_for_timeout(8000)

            print("Naukri page title:", page.title())
            print("Naukri current URL:", page.url)

            title_elements = page.query_selector_all("a.title")
            company_elements = page.query_selector_all("a.comp-name")
            location_elements = page.query_selector_all("span.locWdth")
            salary_elements = page.query_selector_all("span.sal")
            date_elements = page.query_selector_all("div.row6 span")

            print("Naukri title links:", len(title_elements))
            print("Naukri company links:", len(company_elements))
            print("Naukri locations:", len(location_elements))
            print("Naukri salary:", len(salary_elements))
            print("Naukri date posted:", len(date_elements))

            total_jobs = len(title_elements)

            for i in range(total_jobs):
                try:
                    title_el = title_elements[i] if i < len(title_elements) else None
                    company_el = company_elements[i] if i < len(company_elements) else None
                    location_el = location_elements[i] if i < len(location_elements) else None
                    salary_el = salary_elements[i] if i < len(salary_elements) else None
                    date_el = date_elements[i] if i < len(date_elements) else None

                    if not title_el:
                        continue

                    title_text = title_el.inner_text().strip()
                    company_text = company_el.inner_text().strip() if company_el else "Not specified"
                    location_text = location_el.inner_text().strip() if location_el else "Not specified"
                    salary_text = salary_el.inner_text().strip() if salary_el else "Not specified"
                    date_text = date_el.inner_text().strip() if date_el else "Unknown"

                    href = title_el.get_attribute("href")
                    apply_link = href if href else "Not available"

                    jobs.append({
                        "id": i + 1,
                        "title": title_text,
                        "company": company_text,
                        "location": location_text,
                        "salary": salary_text,
                        "source": "Naukri",
                        "date_posted": date_text,
                        "apply_link": apply_link,
                    })

                except Exception as inner_error:
                    print("Error parsing one Naukri job:", inner_error)

            browser.close()

    except Exception as e:
        print("Naukri scraper error:", e)

    return jobs