# 🔍 Findings & Research

## 📋 Initial Discoveries
- Project started on 2026-01-30.
- Goal: Convert Selenium Java to Playwright JS/TS.

## 🚧 Constraints
- To be identified.

## 💡 Technical Research

### Existing Selenium-to-Playwright Converters (GitHub Research)

**Key Repositories Found:**
1. **ravitest0227/Ollama-AI-selenium-to-playwright-converter**
   - Uses Ollama local LLM for conversion
   - Features: Web UI, dual code panels, conversion reports
   - Exports to `/output` folder
   - Supports TypeScript/JavaScript toggle

2. **udageshiv25/SeleniumToPlaywrightConverterAgent**
   - Agent-based approach
   - Similar architecture to our planned system

**Common Patterns Identified:**

### TestNG → Playwright Mappings
- `@Test` → `test('name', async ({ page }) => {})`
- `@BeforeMethod` → `test.beforeEach()`
- `@AfterMethod` → `test.afterEach()`
- `@BeforeClass` → `test.beforeAll()`
- `@AfterClass` → `test.afterAll()`

### Locator Conversions
- `By.id("x")` → `page.locator('#x')`
- `By.className("x")` → `page.locator('.x')`
- `By.cssSelector("x")` → `page.locator('x')`
- `By.xpath("//x")` → `page.locator('//x')`
- `By.name("x")` → `page.locator('[name="x"]')`
- `By.linkText("x")` → `page.locator('a:has-text("x")')`

### Action Conversions
- `.click()` → `await .click()`
- `.sendKeys("text")` → `await .fill('text')`
- `.clear()` → `await .clear()`
- `.getText()` → `await .textContent()`
- `.getAttribute("x")` → `await .getAttribute('x')`
- `.isDisplayed()` → `await .isVisible()`

### Assertion Conversions
- `Assert.assertEquals(a, b)` → `expect(a).toBe(b)`
- `Assert.assertTrue(x)` → `expect(x).toBeTruthy()`
- `Assert.assertFalse(x)` → `expect(x).toBeFalsy()`
- `Assert.assertNull(x)` → `expect(x).toBeNull()`

### Architecture Insights
- Most projects use: `tools/converter.js` for conversion logic
- Common structure: `architecture/` for SOPs, `output/` for results
- Web UI with dual panels (input/output) is standard
- Conversion reports showing lines converted, warnings, unsupported patterns
