# 📔 Gemini: Project Constitution

## 🎯 Project Overview
**Name:** Selenium Java to Playwright JS/TS Converter
**Description:** A web application that takes Selenium Java (TestNG) code as input and converts it into readable Playwright JavaScript/TypeScript code.

**North Star:** A functional web-based converter that handles TestNG annotations and Selenium commands, providing both a downloadable file and an on-screen preview.


## 🏗️ Architectural Invariants
1. **3-Layer Architecture:**
   - Layer 1: SOPs in `architecture/`
   - Layer 2: Reasoning/Navigation
   - Layer 3: Deterministic tools in `tools/`
2. **Data-First:** All tools must have defined schemas here before implementation.
3. **Environment:** Local development with potential cloud deployment.
4. **Self-Healing:** Errors must be documented in `findings.md` and fixed in `architecture/`.

## 📜 Behavioral Rules
1. **Prioritize Readability:** Focus on clean Playwright idioms rather than strict 1:1 line matching.
2. **Comprehensive Conversion:** Attempt to convert all Selenium/TestNG elements (annotations, locators, assertions).
3. **No Guessing:** If logic is unclear, ask the user.
4. **Traceability:** Every major action must be logged in `progress.md`.

## 📊 Data Schemas

### Input Schema (Conversion Request)
```json
{
  "sourceCode": "string",
  "targetLanguage": "typescript | javascript",
  "framework": "playwright"
}
```

### Output Schema (Conversion Response)
```json
{
  "convertedCode": "string",
  "filePath": "string",
  "status": "success | error",
  "logs": ["string"]
}
```


## 🔄 Conversion Rules (Authoritative Mappings)

### TestNG Annotations → Playwright Test Hooks
| Selenium/TestNG | Playwright |
|----------------|------------|
| `@Test` | `test('name', async ({ page }) => {})` |
| `@BeforeMethod` | `test.beforeEach(async ({ page }) => {})` |
| `@AfterMethod` | `test.afterEach(async ({ page }) => {})` |
| `@BeforeClass` | `test.beforeAll(async () => {})` |
| `@AfterClass` | `test.afterAll(async () => {})` |

### Locator Strategies
| Selenium | Playwright |
|----------|-----------|
| `By.id("x")` | `page.locator('#x')` |
| `By.className("x")` | `page.locator('.x')` |
| `By.cssSelector("x")` | `page.locator('x')` |
| `By.xpath("//x")` | `page.locator('//x')` |
| `By.name("x")` | `page.locator('[name="x"]')` |
| `By.linkText("x")` | `page.locator('a:has-text("x")')` |
| `By.tagName("x")` | `page.locator('x')` |

### Element Actions
| Selenium | Playwright |
|----------|-----------|
| `.click()` | `await locator.click()` |
| `.sendKeys("text")` | `await locator.fill('text')` |
| `.clear()` | `await locator.clear()` |
| `.getText()` | `await locator.textContent()` |
| `.getAttribute("x")` | `await locator.getAttribute('x')` |
| `.isDisplayed()` | `await locator.isVisible()` |
| `.isEnabled()` | `await locator.isEnabled()` |
| `.submit()` | `await locator.press('Enter')` |

### Assertions (TestNG/JUnit → Playwright)
| Selenium/TestNG | Playwright |
|----------------|-----------|
| `Assert.assertEquals(a, b)` | `expect(a).toBe(b)` |
| `Assert.assertTrue(x)` | `expect(x).toBeTruthy()` |
| `Assert.assertFalse(x)` | `expect(x).toBeFalsy()` |
| `Assert.assertNull(x)` | `expect(x).toBeNull()` |
| `Assert.assertNotNull(x)` | `expect(x).not.toBeNull()` |

### WebDriver Operations
| Selenium | Playwright |
|----------|-----------|
| `driver.get("url")` | `await page.goto('url')` |
| `driver.getCurrentUrl()` | `page.url()` |
| `driver.getTitle()` | `await page.title()` |
| `driver.close()` | `await page.close()` |
| `driver.quit()` | `await browser.close()` |
| `driver.navigate().back()` | `await page.goBack()` |
| `driver.navigate().forward()` | `await page.goForward()` |
| `driver.navigate().refresh()` | `await page.reload()` |





## 🛠️ Maintenance Log
- **2026-01-30:** 
  - Project initialized via B.L.A.S.T. Protocol 0.
  - Discovery questions answered and documented.
  - Data schemas defined (Input/Output).
  - Research completed on existing converters.
  - Conversion rules established as authoritative mappings.
  - **Phase 0 (Initialization) & Phase 1 (Blueprint): COMPLETE ✅**
  - **Phase 2 (Link - Connectivity): COMPLETE ✅**
    - Environment verified: Node.js v20.16.0, npm v10.8.1, Ollama v0.15.2
    - codellama:7b model confirmed available
    - Connection handshake script created and tested
    - All connectivity tests passed
  - **Phase 3 (Architect - 3-Layer Build): COMPLETE ✅**
    - Layer 1 SOPs created (conversion-rules.md, llm-integration.md, ui-design.md)
    - Layer 3 Tools implemented (converter.js with LLM + rule-based conversion)
    - Express backend with REST API endpoints
    - Beautiful dark-themed UI with dual-panel layout
    - Frontend logic with keyboard shortcuts and state management
    - Comprehensive documentation (README.md)
  - **Server Status:** Running on http://localhost:3000 ✓


