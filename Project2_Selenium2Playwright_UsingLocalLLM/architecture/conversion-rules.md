# 🔄 Conversion Rules SOP

## Purpose
Define the deterministic rules for converting Selenium Java (TestNG) code to Playwright JavaScript/TypeScript.

## Inputs
- **sourceCode**: String containing Selenium Java code
- **targetLanguage**: "javascript" or "typescript"

## Outputs
- **convertedCode**: String containing Playwright code
- **conversionLog**: Array of conversion steps performed
- **warnings**: Array of patterns that couldn't be converted

## Conversion Logic

### 1. TestNG Annotations
| Input Pattern | Output Pattern | Notes |
|--------------|----------------|-------|
| `@Test` | `test('testName', async ({ page }) => {})` | Extract method name for test name |
| `@BeforeMethod` | `test.beforeEach(async ({ page }) => {})` | Runs before each test |
| `@AfterMethod` | `test.afterEach(async ({ page }) => {})` | Runs after each test |
| `@BeforeClass` | `test.beforeAll(async () => {})` | Runs once before all tests |
| `@AfterClass` | `test.afterAll(async () => {})` | Runs once after all tests |

### 2. WebDriver Initialization
| Input | Output | Notes |
|-------|--------|-------|
| `WebDriver driver = new ChromeDriver();` | `// Playwright auto-manages browser` | Remove - Playwright handles this |
| `driver.manage().window().maximize();` | `// Auto-maximized in Playwright` | Remove - default behavior |

### 3. Navigation
| Input | Output |
|-------|--------|
| `driver.get("url")` | `await page.goto('url')` |
| `driver.navigate().to("url")` | `await page.goto('url')` |
| `driver.navigate().back()` | `await page.goBack()` |
| `driver.navigate().forward()` | `await page.goForward()` |
| `driver.navigate().refresh()` | `await page.reload()` |
| `driver.getCurrentUrl()` | `page.url()` |
| `driver.getTitle()` | `await page.title()` |

### 4. Locators
| Input | Output | CSS Equivalent |
|-------|--------|----------------|
| `By.id("elementId")` | `page.locator('#elementId')` | `#elementId` |
| `By.className("className")` | `page.locator('.className')` | `.className` |
| `By.cssSelector("selector")` | `page.locator('selector')` | Direct use |
| `By.xpath("//xpath")` | `page.locator('//xpath')` | XPath support |
| `By.name("name")` | `page.locator('[name="name"]')` | `[name="name"]` |
| `By.linkText("text")` | `page.locator('a:has-text("text")')` | Text-based |
| `By.partialLinkText("text")` | `page.locator('a:text-matches("text", "i")')` | Partial match |
| `By.tagName("tag")` | `page.locator('tag')` | Direct tag |

### 5. Element Actions
| Input | Output | Notes |
|-------|--------|-------|
| `element.click()` | `await element.click()` | Add await |
| `element.sendKeys("text")` | `await element.fill('text')` | Use fill for inputs |
| `element.clear()` | `await element.clear()` | Add await |
| `element.submit()` | `await element.press('Enter')` | Simulate Enter key |
| `element.getText()` | `await element.textContent()` | Returns text |
| `element.getAttribute("attr")` | `await element.getAttribute('attr')` | Add await |
| `element.isDisplayed()` | `await element.isVisible()` | Add await |
| `element.isEnabled()` | `await element.isEnabled()` | Add await |
| `element.isSelected()` | `await element.isChecked()` | For checkboxes/radios |

### 6. Waits
| Input | Output | Notes |
|-------|--------|-------|
| `WebDriverWait wait = new WebDriverWait(driver, 10)` | `// Built into Playwright` | Auto-wait |
| `wait.until(ExpectedConditions.visibilityOf(element))` | `await element.waitFor({ state: 'visible' })` | Explicit wait |
| `wait.until(ExpectedConditions.elementToBeClickable(element))` | `await element.waitFor({ state: 'visible' })` | Clickable check |
| `Thread.sleep(1000)` | `await page.waitForTimeout(1000)` | Hard wait (discouraged) |

### 7. Assertions
| Input | Output | Framework |
|-------|--------|-----------|
| `Assert.assertEquals(a, b)` | `expect(a).toBe(b)` | Playwright Test |
| `Assert.assertTrue(condition)` | `expect(condition).toBeTruthy()` | Playwright Test |
| `Assert.assertFalse(condition)` | `expect(condition).toBeFalsy()` | Playwright Test |
| `Assert.assertNull(value)` | `expect(value).toBeNull()` | Playwright Test |
| `Assert.assertNotNull(value)` | `expect(value).not.toBeNull()` | Playwright Test |

### 8. Browser Cleanup
| Input | Output | Notes |
|-------|--------|-------|
| `driver.close()` | `await page.close()` | Close current page |
| `driver.quit()` | `await browser.close()` | Close browser |

## Edge Cases

### Unsupported Patterns
- **Actions class**: Convert to individual Playwright actions
- **Select class**: Use `selectOption()` method
- **Frames**: Use `page.frameLocator()` or `frame.locator()`
- **Windows/Tabs**: Use `context.pages()` and `page.bringToFront()`

### Special Handling
1. **Variable declarations**: Convert `WebElement` to `const element`
2. **Import statements**: Replace with Playwright imports
3. **Class structure**: Convert to Playwright test file structure
4. **Method names**: Convert camelCase to kebab-case for test names

## Error Handling
- Log any unrecognized patterns as warnings
- Preserve original code as comments when conversion is uncertain
- Flag deprecated Selenium methods

## Quality Checks
- Ensure all async operations have `await`
- Verify proper test structure with fixtures
- Check for proper import statements
- Validate locator syntax
