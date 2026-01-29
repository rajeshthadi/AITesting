
import requests
import json
import sys

def verify_ollama():
    url = "http://localhost:11434/api/generate"
    payload = {
        "model": "llama3.2",
        "prompt": "Say 'Connection Established' and nothing else.",
        "stream": False
    }
    
    print(f"Testing connection to {url} with model 'llama3.2'...")
    
    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()
        
        data = response.json()
        result = data.get("response", "").strip()
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {result}")
        
        if "Connection Established" in result:
            print("[SUCCESS] Ollama is running and accessible.")
            return True
        else:
            print("[WARNING] response received but content differed.")
            return False
            
    except requests.exceptions.ConnectionError:
        print("[ERROR] Could not connect to Ollama. Is it running?")
        return False
    except Exception as e:
        print(f"[ERROR] {e}")
        return False

if __name__ == "__main__":
    success = verify_ollama()
    if not success:
        sys.exit(1)
