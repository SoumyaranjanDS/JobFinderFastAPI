import requests
from bs4 import BeautifulSoup


def scrape_wellfound_jobs(title: str):
    jobs = []

    try:
        query = title.replace(" ", "%20")
        url = f"https://wellfound.com/jobs?query={query}"

        headers = {
            "User-Agent": "Mozilla/5.0"
        }

        response = requests.get(url, headers=headers)
        soup = BeautifulSoup(response.text, "html.parser")

        print("Wellfound page title:", soup.title.text if soup.title else "No title")
        print("H2 count:", len(soup.find_all("h2")))
        print("H3 count:", len(soup.find_all("h3")))
        print("Links count:", len(soup.find_all("a")))

    except Exception as e:
        print("Wellfound scraper error:", e)

    return jobs