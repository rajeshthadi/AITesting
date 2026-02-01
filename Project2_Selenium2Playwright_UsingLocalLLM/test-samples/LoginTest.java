import org.openqa.selenium.By;
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
        driver.manage().timeouts().implicitlyWait(10, TimeUnit.SECONDS);
    }

    @Test
    public void testSuccessfulLogin() {
        driver.get("https://example.com/login");
        
        WebElement emailField = driver.findElement(By.id("email"));
        emailField.sendKeys("user@example.com");
        
        WebElement passwordField = driver.findElement(By.id("password"));
        passwordField.sendKeys("password123");
        
        WebElement loginButton = driver.findElement(By.cssSelector("button[type='submit']"));
        loginButton.click();
        
        String pageTitle = driver.getTitle();
        Assert.assertEquals(pageTitle, "Dashboard");
        
        WebElement welcomeMessage = driver.findElement(By.className("welcome-message"));
        String messageText = welcomeMessage.getText();
        Assert.assertTrue(messageText.contains("Welcome"));
    }

    @Test
    public void testInvalidLogin() {
        driver.get("https://example.com/login");
        
        driver.findElement(By.id("email")).sendKeys("invalid@example.com");
        driver.findElement(By.id("password")).sendKeys("wrongpassword");
        driver.findElement(By.cssSelector("button[type='submit']")).click();
        
        WebElement errorMessage = driver.findElement(By.xpath("//div[@class='error']"));
        Assert.assertTrue(errorMessage.isDisplayed());
        Assert.assertEquals(errorMessage.getText(), "Invalid credentials");
    }

    @AfterMethod
    public void tearDown() {
        if (driver != null) {
            driver.quit();
        }
    }
}
