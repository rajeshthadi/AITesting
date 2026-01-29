# SOP: Test Case Generation

## Goal
Generate python test cases based on user input using a local Ollama model (Llama 3.2).

## Inputs
- `user_request`: String (The functionality to test).
- `model`: String (Default: "llama3.2").

## Logic
1. **Validation**: Ensure `user_request` is not empty.
2. **Prompt Construction**:
   - Load `architecture/prompt_template.md`.
   - Inject `user_request` into the `{input}` placeholder.
3. **Execution**:
   - Call Ollama API (`/api/generate`).
   - Temperature: 0.2 (Low for deterministic code).
4. **Formatting**:
   - Extract code blocks from the response.
   - Return raw markdown.

## Output
- JSON object with:
    - `status`: "success" or "error"
    - `data`: The generated test code/markdown.
    - `raw_response`: Full LLM output.
