/**
 * Converter Engine - Layer 3: Tools
 * Deterministic conversion logic for Selenium to Playwright
 * Reference: architecture/conversion-rules.md
 */

const OLLAMA_API_URL = 'http://localhost:11434';
const MODEL_NAME = 'codellama:7b';

/**
 * Main conversion function using Ollama LLM
 */
async function convertWithLLM(sourceCode, targetLanguage = 'javascript') {
    const conversionPatterns = getConversionPatterns();
    const systemPrompt = buildSystemPrompt(targetLanguage, conversionPatterns);
    const userPrompt = buildUserPrompt(sourceCode, targetLanguage);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
        const response = await fetch(`${OLLAMA_API_URL}/api/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            signal: controller.signal,
            body: JSON.stringify({
                model: MODEL_NAME,
                prompt: `${systemPrompt}\n\n${userPrompt}`,
                stream: false,
                options: {
                    temperature: 0.1,
                    num_predict: 2000,
                    top_p: 0.9,
                    top_k: 40
                }
            })
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`Ollama API error: ${response.status}`);
        }

        const result = await response.json();
        const convertedCode = postProcessLLMOutput(result.response, targetLanguage);

        return {
            success: true,
            convertedCode,
            method: 'llm',
            model: MODEL_NAME,
            warnings: []
        };

    } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            console.warn('⚠️ LLM conversion timed out (30s). Falling back to rule-based conversion...');
            const result = convertWithRules(sourceCode, targetLanguage);
            result.warnings.push('LLM conversion timed out. Result generated using rule-based engine.');
            return result;
        }
        console.error('LLM conversion failed:', error.message);
        // Fallback to rule-based conversion
        return convertWithRules(sourceCode, targetLanguage);
    }
}

/**
 * Fallback rule-based conversion
 */
function convertWithRules(sourceCode, targetLanguage = 'javascript') {
    let convertedCode = sourceCode;
    const warnings = [];
    const conversionLog = [];

    // 1. Convert imports
    convertedCode = convertImports(convertedCode, targetLanguage);
    conversionLog.push('Converted imports');

    // 2. Convert TestNG annotations
    const annotationResult = convertAnnotations(convertedCode, targetLanguage);
    convertedCode = annotationResult.code;
    warnings.push(...annotationResult.warnings);
    conversionLog.push('Converted TestNG annotations');

    // 3. Convert WebDriver initialization
    convertedCode = convertWebDriverInit(convertedCode);
    conversionLog.push('Removed WebDriver initialization');

    // 4. Convert locators
    convertedCode = convertLocators(convertedCode);
    conversionLog.push('Converted locators');

    // 5. Convert actions
    convertedCode = convertActions(convertedCode);
    conversionLog.push('Converted element actions');

    // 6. Convert assertions
    convertedCode = convertAssertions(convertedCode);
    conversionLog.push('Converted assertions');

    // 7. Convert navigation
    convertedCode = convertNavigation(convertedCode);
    conversionLog.push('Converted navigation commands');

    // 8. Convert waits
    convertedCode = convertWaits(convertedCode);
    conversionLog.push('Converted waits');

    // 9. Clean up and format
    convertedCode = cleanupCode(convertedCode, targetLanguage);
    conversionLog.push('Cleaned up code');

    return {
        success: true,
        convertedCode,
        method: 'rule-based',
        conversionLog,
        warnings
    };
}

/**
 * Build system prompt for LLM
 */
function buildSystemPrompt(targetLanguage, conversionPatterns) {
    return `You are an expert code converter specializing in test automation frameworks.
Your task is to convert Selenium Java (TestNG) code to Playwright ${targetLanguage}.

RULES:
1. Follow Playwright best practices
2. Use async/await for all asynchronous operations
3. Convert TestNG annotations to Playwright test hooks
4. Use Playwright's auto-waiting capabilities (avoid explicit waits when possible)
5. Preserve test logic and structure
6. Add comments for complex conversions
7. Output ONLY the converted code, no explanations
8. Use proper imports: import { test, expect } from '@playwright/test';

CONVERSION PATTERNS:
${conversionPatterns}`;
}

/**
 * Build user prompt for LLM
 */
function buildUserPrompt(sourceCode, targetLanguage) {
    return `Convert the following Selenium Java code to Playwright ${targetLanguage}:

\`\`\`java
${sourceCode}
\`\`\`

Output the converted Playwright code:`;
}

/**
 * Get conversion patterns as text
 */
function getConversionPatterns() {
    return `
TestNG → Playwright:
- @Test → test('name', async ({ page }) => {})
- @BeforeMethod → test.beforeEach(async ({ page }) => {})
- @AfterMethod → test.afterEach(async ({ page }) => {})

Locators:
- By.id("x") → page.locator('#x')
- By.className("x") → page.locator('.x')
- By.cssSelector("x") → page.locator('x')
- By.xpath("//x") → page.locator('//x')

Actions:
- .click() → await .click()
- .sendKeys("text") → await .fill('text')
- .getText() → await .textContent()

Navigation:
- driver.get("url") → await page.goto('url')
- driver.getTitle() → await page.title()

Assertions:
- Assert.assertEquals(a, b) → expect(a).toBe(b)
- Assert.assertTrue(x) → expect(x).toBeTruthy()
`;
}

/**
 * Post-process LLM output
 */
function postProcessLLMOutput(rawOutput, targetLanguage) {
    let code = rawOutput;

    // Remove markdown code fences if present
    code = code.replace(/```(?:javascript|typescript|js|ts)?\n?/g, '');
    code = code.replace(/```\n?$/g, '');

    // Ensure proper imports
    if (!code.includes("import { test, expect }")) {
        code = "import { test, expect } from '@playwright/test';\n\n" + code;
    }

    // Clean up extra whitespace
    code = code.trim();

    return code;
}

/**
 * Convert imports
 */
function convertImports(code, targetLanguage) {
    // Remove Java imports
    code = code.replace(/import\s+org\.openqa\.selenium\..+;/g, '');
    code = code.replace(/import\s+org\.testng\..+;/g, '');
    code = code.replace(/import\s+java\..+;/g, '');

    // Add Playwright imports
    const playwrightImport = "import { test, expect } from '@playwright/test';\n\n";
    return playwrightImport + code.trim();
}

/**
 * Convert TestNG annotations
 */
function convertAnnotations(code, targetLanguage) {
    const warnings = [];

    // @Test annotation
    code = code.replace(/@Test\s+public\s+void\s+(\w+)\s*\(\s*\)\s*{/g,
        "test('$1', async ({ page }) => {");

    // @BeforeMethod
    code = code.replace(/@BeforeMethod\s+public\s+void\s+\w+\s*\(\s*\)\s*{/g,
        "test.beforeEach(async ({ page }) => {");

    // @AfterMethod
    code = code.replace(/@AfterMethod\s+public\s+void\s+\w+\s*\(\s*\)\s*{/g,
        "test.afterEach(async ({ page }) => {");

    // @BeforeClass
    code = code.replace(/@BeforeClass\s+public\s+void\s+\w+\s*\(\s*\)\s*{/g,
        "test.beforeAll(async () => {");

    // @AfterClass
    code = code.replace(/@AfterClass\s+public\s+void\s+\w+\s*\(\s*\)\s*{/g,
        "test.afterAll(async () => {");

    // Remove class declaration
    code = code.replace(/public\s+class\s+\w+\s*{/g, '');

    return { code, warnings };
}

/**
 * Convert WebDriver initialization
 */
function convertWebDriverInit(code) {
    // Remove WebDriver declarations
    code = code.replace(/WebDriver\s+driver\s*;/g, '// Playwright auto-manages browser');
    code = code.replace(/driver\s*=\s*new\s+ChromeDriver\(\);/g, '');
    code = code.replace(/driver\s*=\s*new\s+FirefoxDriver\(\);/g, '');
    code = code.replace(/driver\.manage\(\)\.window\(\)\.maximize\(\);/g, '');
    code = code.replace(/driver\.manage\(\)\.timeouts\(\)\.implicitlyWait\([^)]+\);/g, '');

    return code;
}

/**
 * Convert locators
 */
function convertLocators(code) {
    // By.id
    code = code.replace(/driver\.findElement\(By\.id\("([^"]+)"\)\)/g, 'page.locator(\'#$1\')');

    // By.className
    code = code.replace(/driver\.findElement\(By\.className\("([^"]+)"\)\)/g, 'page.locator(\'.$1\')');

    // By.cssSelector
    code = code.replace(/driver\.findElement\(By\.cssSelector\("([^"]+)"\)\)/g, 'page.locator(\'$1\')');

    // By.xpath
    code = code.replace(/driver\.findElement\(By\.xpath\("([^"]+)"\)\)/g, 'page.locator(\'$1\')');

    // By.name
    code = code.replace(/driver\.findElement\(By\.name\("([^"]+)"\)\)/g, 'page.locator(\'[name="$1"]\')');

    // By.linkText
    code = code.replace(/driver\.findElement\(By\.linkText\("([^"]+)"\)\)/g, 'page.locator(\'a:has-text("$1")\')');

    // By.tagName
    code = code.replace(/driver\.findElement\(By\.tagName\("([^"]+)"\)\)/g, 'page.locator(\'$1\')');

    return code;
}

/**
 * Convert actions
 */
function convertActions(code) {
    // 1. Basic conversions
    code = code.replace(/\.click\(\)/g, '.click()');
    code = code.replace(/\.sendKeys\("([^"]+)"\)/g, '.fill(\'$1\')');
    code = code.replace(/\.sendKeys\('([^']+)'\)/g, '.fill(\'$1\')');
    code = code.replace(/\.getText\(\)/g, '.textContent()');
    code = code.replace(/\.getAttribute\("([^"]+)"\)/g, '.getAttribute(\'$1\')');
    code = code.replace(/\.isDisplayed\(\)/g, '.isVisible()');
    code = code.replace(/\.isEnabled\(\)/g, '.isEnabled()');
    code = code.replace(/\.isSelected\(\)/g, '.isChecked()');
    code = code.replace(/\.clear\(\)/g, '.clear()');

    // 2. Add await before Playwright methods that need it
    // We target page.locator(...).method()
    code = code.replace(/page\.locator\(([^)]+)\)\.(click|fill|textContent|getAttribute|isVisible|isEnabled|isChecked|clear)\(/g,
        'await page.locator($1).$2(');

    return code;
}

/**
 * Convert assertions
 */
function convertAssertions(code) {
    // assertEquals
    code = code.replace(/Assert\.assertEquals\(([^,]+),\s*([^)]+)\)/g, 'expect($1).toBe($2)');

    // assertTrue
    code = code.replace(/Assert\.assertTrue\(([^)]+)\)/g, 'expect($1).toBeTruthy()');

    // assertFalse
    code = code.replace(/Assert\.assertFalse\(([^)]+)\)/g, 'expect($1).toBeFalsy()');

    // assertNull
    code = code.replace(/Assert\.assertNull\(([^)]+)\)/g, 'expect($1).toBeNull()');

    // assertNotNull
    code = code.replace(/Assert\.assertNotNull\(([^)]+)\)/g, 'expect($1).not.toBeNull()');

    return code;
}

/**
 * Convert navigation
 */
function convertNavigation(code) {
    // get/navigate.to
    code = code.replace(/driver\.get\("([^"]+)"\)/g, 'await page.goto(\'$1\')');
    code = code.replace(/driver\.navigate\(\)\.to\("([^"]+)"\)/g, 'await page.goto(\'$1\')');

    // navigate.back
    code = code.replace(/driver\.navigate\(\)\.back\(\)/g, 'await page.goBack()');

    // navigate.forward
    code = code.replace(/driver\.navigate\(\)\.forward\(\)/g, 'await page.goForward()');

    // navigate.refresh
    code = code.replace(/driver\.navigate\(\)\.refresh\(\)/g, 'await page.reload()');

    // getCurrentUrl
    code = code.replace(/driver\.getCurrentUrl\(\)/g, 'page.url()');

    // getTitle
    code = code.replace(/driver\.getTitle\(\)/g, 'await page.title()');

    // close/quit
    code = code.replace(/driver\.close\(\)/g, 'await page.close()');
    code = code.replace(/driver\.quit\(\)/g, 'await browser.close()');

    return code;
}

/**
 * Convert waits
 */
function convertWaits(code) {
    // Remove WebDriverWait declarations
    code = code.replace(/WebDriverWait\s+wait\s*=\s*new\s+WebDriverWait\([^)]+\);/g,
        '// Playwright has built-in auto-waiting');

    // Thread.sleep -> waitForTimeout
    code = code.replace(/Thread\.sleep\((\d+)\)/g, 'await page.waitForTimeout($1)');

    return code;
}

/**
 * Clean up code
 */
function cleanupCode(code, targetLanguage) {
    // Remove empty lines (more than 2 consecutive)
    code = code.replace(/\n{3,}/g, '\n\n');

    // Remove trailing semicolons for TypeScript if needed
    if (targetLanguage === 'typescript') {
        // TypeScript cleanup
    }

    // Trim
    code = code.trim();

    return code;
}

/**
 * Main export function
 */
async function convert(sourceCode, targetLanguage = 'javascript', useLLM = true) {
    if (!sourceCode || sourceCode.trim() === '') {
        return {
            success: false,
            error: 'Source code is empty',
            convertedCode: '',
            warnings: []
        };
    }

    try {
        if (useLLM) {
            return await convertWithLLM(sourceCode, targetLanguage);
        } else {
            return convertWithRules(sourceCode, targetLanguage);
        }
    } catch (error) {
        return {
            success: false,
            error: error.message,
            convertedCode: '',
            warnings: []
        };
    }
}

module.exports = {
    convert,
    convertWithLLM,
    convertWithRules
};
