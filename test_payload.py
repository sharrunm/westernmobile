import sys
import json
import urllib.request

url = 'http://localhost:8000/api/invoices/'
hdr = {'Content-Type': 'application/json'}
data = {
    "customer_name": "sam",
    "customer_phone": "123",
    "customer_email": "",
    "customer_address": "",
    "mobile_brand": "sam",
    "mobile_model": "s22",
    "imei": "",
    "service_type": "Screen Repair",
    "problem_desc": "sss",
    "service_rate": 2999.99,
    "tax_rate": 0,
    "payment_status": "Pending"
}
req = urllib.request.Request(url, headers=hdr, data=json.dumps(data).encode('utf-8'))
try:
    with urllib.request.urlopen(req) as response:
        print("Status Code:", response.getcode())
        print("Response:", response.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print("HTTP Error:", e.code)
    print("Error content:", e.read().decode('utf-8'))
except Exception as e:
    print("Other error:", e)
