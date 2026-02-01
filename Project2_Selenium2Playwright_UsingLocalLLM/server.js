/**
 * Express Server - Backend API
 * Handles conversion requests and file operations
 */

const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const { convert } = require('./tools/converter');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static('.')); // Serve static files from root

// API Routes

/**
 * POST /api/convert
 * Convert Selenium code to Playwright
 */
app.post('/api/convert', async (req, res) => {
    try {
        const { sourceCode, targetLanguage = 'javascript', useLLM = true } = req.body;

        if (!sourceCode) {
            return res.status(400).json({
                success: false,
                error: 'Source code is required'
            });
        }

        console.log(`\n🔄 Converting code (${targetLanguage}, ${useLLM ? 'LLM' : 'rule-based'})...`);
        const startTime = Date.now();

        const result = await convert(sourceCode, targetLanguage, useLLM);

        const conversionTime = Date.now() - startTime;
        console.log(`✅ Conversion completed in ${conversionTime}ms`);

        res.json({
            ...result,
            conversionTime,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Conversion error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/save
 * Save converted code to output directory
 */
app.post('/api/save', async (req, res) => {
    try {
        const { code, fileName, language } = req.body;

        if (!code || !fileName) {
            return res.status(400).json({
                success: false,
                error: 'Code and fileName are required'
            });
        }

        const extension = language === 'typescript' ? '.spec.ts' : '.spec.js';
        const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9-_]/g, '_');
        const fullFileName = sanitizedFileName.endsWith(extension)
            ? sanitizedFileName
            : sanitizedFileName + extension;

        const outputDir = path.join(__dirname, 'output');
        const filePath = path.join(outputDir, fullFileName);

        // Ensure output directory exists
        await fs.mkdir(outputDir, { recursive: true });

        // Write file
        await fs.writeFile(filePath, code, 'utf8');

        console.log(`💾 Saved file: ${fullFileName}`);

        res.json({
            success: true,
            filePath: path.relative(__dirname, filePath),
            fileName: fullFileName
        });

    } catch (error) {
        console.error('❌ Save error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/files
 * List all converted files in output directory
 */
app.get('/api/files', async (req, res) => {
    try {
        const outputDir = path.join(__dirname, 'output');

        // Ensure directory exists
        await fs.mkdir(outputDir, { recursive: true });

        const files = await fs.readdir(outputDir);
        const fileDetails = await Promise.all(
            files.map(async (file) => {
                const filePath = path.join(outputDir, file);
                const stats = await fs.stat(filePath);
                return {
                    name: file,
                    size: stats.size,
                    modified: stats.mtime,
                    path: path.relative(__dirname, filePath)
                };
            })
        );

        res.json({
            success: true,
            files: fileDetails
        });

    } catch (error) {
        console.error('❌ List files error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/health
 * Health check endpoint
 */
app.get('/api/health', async (req, res) => {
    try {
        // Test Ollama connection
        const ollamaResponse = await fetch('http://localhost:11434/api/tags');
        const ollamaHealthy = ollamaResponse.ok;

        res.json({
            success: true,
            server: 'running',
            ollama: ollamaHealthy ? 'connected' : 'disconnected',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.json({
            success: true,
            server: 'running',
            ollama: 'disconnected',
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * GET /api/sample
 * Get sample Selenium code
 */
app.get('/api/sample', (req, res) => {
    const sampleCode = `import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.testng.Assert;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

public class LoginTest {
    WebDriver driver;

    @BeforeMethod
    public void setUp() {
        driver = new ChromeDriver();
        driver.manage().window().maximize();
    }

    @Test
    public void testLogin() {
        driver.get("https://example.com/login");
        
        WebElement emailField = driver.findElement(By.id("email"));
        emailField.sendKeys("user@example.com");
        
        WebElement passwordField = driver.findElement(By.id("password"));
        passwordField.sendKeys("password123");
        
        WebElement loginButton = driver.findElement(By.cssSelector("button[type='submit']"));
        loginButton.click();
        
        String pageTitle = driver.getTitle();
        Assert.assertEquals(pageTitle, "Dashboard");
    }

    @AfterMethod
    public void tearDown() {
        driver.quit();
    }
}`;

    res.json({
        success: true,
        code: sampleCode
    });
});

// Start server
app.listen(PORT, () => {
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('🚀 Selenium to Playwright Converter Server');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`📡 Server running at: http://localhost:${PORT}`);
    console.log(`🤖 LLM Model: codellama:7b`);
    console.log(`📂 Output directory: ./output`);
    console.log('═══════════════════════════════════════════════════════════\n');
    console.log('Available endpoints:');
    console.log('  POST /api/convert  - Convert Selenium to Playwright');
    console.log('  POST /api/save     - Save converted code to file');
    console.log('  GET  /api/files    - List converted files');
    console.log('  GET  /api/health   - Check server and Ollama status');
    console.log('  GET  /api/sample   - Get sample Selenium code');
    console.log('\n💡 Open http://localhost:3000 in your browser\n');
});

// Error handling
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
});

process.on('unhandledRejection', (error) => {
    console.error('❌ Unhandled Rejection:', error);
});
