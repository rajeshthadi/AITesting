# 🤖 LLM Integration SOP

## Purpose
Define how to interact with Ollama's codellama model for intelligent code conversion.

## Configuration
- **API Endpoint**: `http://localhost:11434/api/generate`
- **Model**: `codellama:7b`
- **Temperature**: `0.2` (low for deterministic output)
- **Max Tokens**: `2000` (sufficient for most test cases)

## Inputs
- **sourceCode**: Selenium Java code to convert
- **targetLanguage**: "javascript" or "typescript"
- **conversionRules**: Reference to conversion-rules.md

## Outputs
- **convertedCode**: Playwright code
- **confidence**: Conversion confidence score (if available)
- **warnings**: Any conversion issues

## Prompt Engineering Strategy

### System Prompt Template
```
You are an expert code converter specializing in test automation frameworks.
Your task is to convert Selenium Java (TestNG) code to Playwright {targetLanguage}.

RULES:
1. Follow Playwright best practices
2. Use async/await for all asynchronous operations
3. Convert TestNG annotations to Playwright test hooks
4. Use Playwright's auto-waiting capabilities (avoid explicit waits when possible)
5. Preserve test logic and structure
6. Add comments for complex conversions
7. Output ONLY the converted code, no explanations

CONVERSION PATTERNS:
{conversionPatterns}
```

### User Prompt Template
```
Convert the following Selenium Java code to Playwright {targetLanguage}:

```java
{sourceCode}
```

Output the converted Playwright code:
```

## API Request Structure
```json
{
  "model": "codellama:7b",
  "prompt": "{systemPrompt}\n\n{userPrompt}",
  "stream": false,
  "options": {
    "temperature": 0.2,
    "num_predict": 2000,
    "top_p": 0.9,
    "top_k": 40
  }
}
```

## Response Handling

### Success Response
```json
{
  "model": "codellama:7b",
  "created_at": "timestamp",
  "response": "converted code here",
  "done": true
}
```

### Error Handling
1. **Connection Error**: Verify Ollama is running
2. **Model Not Found**: Check if codellama is installed
3. **Timeout**: Increase timeout or reduce input size
4. **Invalid Response**: Fall back to rule-based conversion

## Post-Processing Steps
1. **Extract Code**: Remove markdown code fences if present
2. **Validate Syntax**: Check for basic syntax errors
3. **Format Code**: Apply consistent formatting
4. **Add Imports**: Ensure proper Playwright imports at top
5. **Verify Structure**: Confirm test structure is valid

## Quality Assurance
- Compare LLM output with rule-based conversion
- Flag discrepancies for review
- Log all conversions for analysis
- Track conversion success rate

## Fallback Strategy
If LLM conversion fails:
1. Use deterministic rule-based converter
2. Log the failure reason
3. Mark output as "rule-based conversion"
4. Continue processing

## Performance Optimization
- Cache common conversion patterns
- Batch similar conversions when possible
- Set reasonable timeouts (30 seconds max)
- Monitor API response times

## Security Considerations
- Sanitize input code before sending to LLM
- Validate output before returning to user
- Don't send sensitive data to LLM
- Log all API interactions for audit
