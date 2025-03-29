from flask import Flask, request, jsonify
from flask_cors import CORS  
from bs4 import BeautifulSoup
import requests

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  
@app.route("/jobs", methods=["POST"])
def get_jobs():
    data = request.get_json()

    if not data or "url" not in data:
        return jsonify({"error": "Missing 'url' in request body"}), 400

    url = data["url"]
    limit = data.get("limit", None)

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36"
    }

    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()

        soup = BeautifulSoup(response.text, "html.parser")
        job_list = []

        job_divs = soup.find_all("div", attrs={"data-href": True})

        for div in job_divs:
            job_title_elem = div.find("a")
            job_title = job_title_elem.get_text(strip=True) if job_title_elem else "No title"
            job_link = "https://internshala.com" + div["data-href"]
            job_list.append({"title": job_title, "link": job_link})

        try:
            limit = int(limit)
            job_list = job_list[:limit]
        except (TypeError, ValueError):
            pass  

        return jsonify(job_list)

    except requests.exceptions.RequestException as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True) 
else:
    app.run(host="0.0.0.0", port=5000)
