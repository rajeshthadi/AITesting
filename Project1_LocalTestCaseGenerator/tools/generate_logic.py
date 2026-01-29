
import requests
import json
import os

OLLAMA_URL = "http://localhost:11434/api/generate"

PROMPT_TEMPLATE = """
You are an expert QA Manual Tester. Your job is to create detailed Test Cases based on the user's requirement.

## Output Format
Please generate test cases using the following format for each test case:

**Test Case ID**: [A unique identifier (e.g., TC_LOGIN_001)]
**Title/Description**: [A concise summary of the test's objective]
**Preconditions**: [Conditions that must be true before the test can run]
**Test Steps**:
[A detailed, step-by-step list of actions to perform, written from the end-user's perspective.]
**Test Data**: [Specific input values needed]
**Expected Results**: [The specific, observable outcome the system should produce]

## User Input
{input}
"""

def generate_test_case(user_request, model="llama3.2"):
    """
    Generates test cases by sending the prompt to Ollama.
    """
    try:
        # 1. Construct Prompt
        full_prompt = PROMPT_TEMPLATE.format(input=user_request)
        
        # 2. Payload
        payload = {
            "model": model,
            "prompt": full_prompt,
            "stream": False,
            "temperature": 0.5
        }
        
        # 3. Request
        print(f"[INFO] Sending request to Ollama ({model})...")
        response = requests.post(OLLAMA_URL, json=payload)
        response.raise_for_status()
        
        # 4. Parse
        result = response.json()
        response_text = result.get("response", "")
        
        return {
            "status": "success",
            "data": response_text,
            "metadata": {
                "model": model,
                "duration": result.get("total_duration")
            }
        }
        
    except requests.exceptions.ConnectionError:
        return {"status": "error", "message": "Could not connect to Ollama. Ensure it is running."}
    except Exception as e:
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    # Simple CLI Test
    test_input = "Verify successful login with valid credentials"
    print(f"Testing with input: '{test_input}'")
    res = generate_test_case(test_input)
    print(json.dumps(res, indent=2))
