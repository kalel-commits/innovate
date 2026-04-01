import requests
import json

url = "http://localhost:8000/api/dashboard?intensity=49&hazard_type=general"
try:
    response = requests.get(url)
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        print(json.dumps(response.json(), indent=2))
    else:
        print(response.text)
except Exception as e:
    print(f"Error: {e}")
