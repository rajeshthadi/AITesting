# Project Map & State Tracking

## Project: Local LLM Testcase Generator with Ollama

## Status
- [ ] Phase 1: Blueprint
- [ ] Phase 2: Link
- [ ] Phase 3: Architect
- [ ] Phase 4: Stylize
- [ ] Phase 5: Trigger

## Discovery Answers
- **North Star:** Local LLM Testcase generator using Ollama (Llama 3.2) with a Chat UI.
- **Integrations:** Ollama (Local).
- **Source of Truth:** User Input via Chat UI.
- **Delivery Payload:** Chat Interface displaying generated test cases.
- **Behavioral Rules:** User Input -> Template -> Ollama -> Output.

## Data Schema
### Raw Input (User)
```json
{
  "user_request": "string",
  "model": "llama3.2"
}
```

### Internal Payload (Prompt Construction)
```json
{
  "system_prompt": "string (The Template)",
  "user_prompt": "string (From Input)"
}
```

### Delivery Output (Response)
```json
{
  "response_text": "string (Markdown/Code)",
  "status": "success/error",
  "metadata": {
    "model_used": "llama3.2",
    "generation_time": "number"
  }
}
```

## Maintenance Log
(To be updated upon completion)
