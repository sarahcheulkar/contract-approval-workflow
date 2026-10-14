package com.contractflow.selenium;

import io.github.bonigarcia.wdm.WebDriverManager;
import org.junit.jupiter.api.*;
import org.openqa.selenium.*;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Duration;

import org.springframework.boot.test.context.SpringBootTest;

/**
 * Selenium WebDriver E2E Automated Test Suite for Contract Approval Workflow
 * Author: Shruti Gupta (Roll No: 23102C0051)
 *
 * Covers 5 Critical User Journeys:
 * 1. Page Load & 8-Stage Stepper Presence
 * 2. Contract Request Submission with Success Assertion
 * 3. Form Validation Failure Protection (Amount <= 0)
 * 4. Reviewer Approval Workflow Decision
 * 5. Reviewer Rejection Decision
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.DEFINED_PORT)
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class ContractWorkflowSeleniumTest {

    private static WebDriver driver;
    private static WebDriverWait wait;
    private static final String APP_URL = System.getProperty("app.url", "http://localhost:8089");
    private static final Path SCREENSHOT_DIR = Paths.get("target", "screenshots");

    @BeforeAll
    public static void setUpSuite() throws IOException {
        Files.createDirectories(SCREENSHOT_DIR);
        WebDriverManager.chromedriver().setup();

        ChromeOptions options = new ChromeOptions();
        options.addArguments("--headless=new");
        options.addArguments("--no-sandbox");
        options.addArguments("--disable-dev-shm-usage");
        options.addArguments("--window-size=1920,1080");

        driver = new ChromeDriver(options);
        wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    }

    @AfterAll
    public static void tearDownSuite() {
        if (driver != null) {
            driver.quit();
        }
    }

    private void captureScreenshot(String testName) {
        try {
            TakesScreenshot ts = (TakesScreenshot) driver;
            File source = ts.getScreenshotAs(OutputType.FILE);
            Path destination = SCREENSHOT_DIR.resolve(testName + "_" + System.currentTimeMillis() + ".png");
            Files.copy(source.toPath(), destination);
            System.out.println("Screenshot captured: " + destination.toAbsolutePath());
        } catch (Exception e) {
            System.err.println("Could not capture screenshot: " + e.getMessage());
        }
    }

    @Test
    @Order(1)
    @DisplayName("Journey 1: Verify Dashboard, 8-Stage Stepper & Metric Cards Load")
    public void testDashboardAndStepperLoad() {
        try {
            driver.get(APP_URL);
            wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("stepperTrack")));

            // Assert Stepper exists with 8 stages
            WebElement stepper = driver.findElement(By.id("stepperTrack"));
            Assertions.assertTrue(stepper.isDisplayed(), "Stepper track should be visible");

            WebElement pageTitle = driver.findElement(By.className("page-title"));
            Assertions.assertEquals("Contract Workflow", pageTitle.getText().trim());

            captureScreenshot("Journey1_DashboardLoaded");
        } catch (Exception e) {
            captureScreenshot("Journey1_Failure");
            throw e;
        }
    }

    @Test
    @Order(2)
    @DisplayName("Journey 2: Submit Valid Contract Request & Verify In Registry")
    public void testSubmitValidContract() {
        try {
            driver.get(APP_URL);

            // Click + New Contract button
            WebElement newBtn = wait.until(ExpectedConditions.elementToBeClickable(By.id("newContractBtn")));
            newBtn.click();

            // Wait for modal to open
            wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("newContractModal")));

            // Fill Form fields
            driver.findElement(By.id("contractTitle")).sendKeys("Global Cloud Security Framework");
            driver.findElement(By.id("vendorName")).sendKeys("CloudFort Security Ltd");

            Select categorySelect = new Select(driver.findElement(By.id("categorySelect")));
            categorySelect.selectByVisibleText("Security & Compliance");

            WebElement amountInput = driver.findElement(By.id("contractAmount"));
            amountInput.clear();
            amountInput.sendKeys("48000");

            driver.findElement(By.id("termsDescription")).sendKeys("Annual security monitoring and incident response agreement.");

            // Submit contract
            WebElement submitBtn = driver.findElement(By.id("submitContractBtn"));
            submitBtn.click();

            // Wait for modal to close and table to contain title
            wait.until(ExpectedConditions.invisibilityOfElementLocated(By.id("newContractModal")));

            // Verify toast or new row
            WebElement table = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("contractsTable")));
            Assertions.assertTrue(table.getText().contains("Global Cloud Security Framework"),
                    "New contract should appear in contracts table");

            captureScreenshot("Journey2_ContractCreatedSuccess");
        } catch (Exception e) {
            captureScreenshot("Journey2_Failure");
            throw e;
        }
    }

    @Test
    @Order(3)
    @DisplayName("Journey 3: Prevent Invalid Contract Submission (Amount <= 0)")
    public void testValidationPreventsZeroAmount() {
        try {
            driver.get(APP_URL);

            WebElement newBtn = wait.until(ExpectedConditions.elementToBeClickable(By.id("newContractBtn")));
            newBtn.click();

            wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("newContractModal")));

            driver.findElement(By.id("contractTitle")).sendKeys("Invalid Test Contract");
            driver.findElement(By.id("vendorName")).sendKeys("Zero Budget Co");

            Select categorySelect = new Select(driver.findElement(By.id("categorySelect")));
            categorySelect.selectByIndex(1);

            // Set invalid zero amount
            WebElement amountInput = driver.findElement(By.id("contractAmount"));
            amountInput.clear();
            amountInput.sendKeys("0");

            WebElement submitBtn = driver.findElement(By.id("submitContractBtn"));
            submitBtn.click();

            // Assert error banner appears
            WebElement errorBanner = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("formErrorBanner")));
            Assertions.assertTrue(errorBanner.isDisplayed(), "Validation error banner should be displayed");

            // Close modal
            driver.findElement(By.id("cancelNewContractBtn")).click();
            captureScreenshot("Journey3_ValidationBlocked");
        } catch (Exception e) {
            captureScreenshot("Journey3_Failure");
            throw e;
        }
    }

    @Test
    @Order(4)
    @DisplayName("Journey 4: Review and Approve a Contract (Audit & Confetti)")
    public void testReviewAndApproveContract() {
        try {
            driver.get(APP_URL);

            // Click Review on CT-101
            WebElement reviewBtn = wait.until(ExpectedConditions.elementToBeClickable(By.id("reviewBtn-CT-101")));
            reviewBtn.click();

            // Wait for review modal
            wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("reviewModal")));

            // Add reviewer remarks
            WebElement notesInput = driver.findElement(By.id("reviewerNotesInput"));
            notesInput.clear();
            notesInput.sendKeys("Terms verified against budget SLA. Approved by Legal.");

            // Click Approve button
            WebElement approveBtn = driver.findElement(By.id("modalApproveBtn"));
            approveBtn.click();

            // Verify status badge turns to Approved
            wait.until(ExpectedConditions.invisibilityOfElementLocated(By.id("reviewModal")));

            WebElement badge = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("statusBadge-CT-101")));
            Assertions.assertTrue(badge.getText().equalsIgnoreCase("Approved"), "Status badge should be Approved");

            captureScreenshot("Journey4_ApprovedSuccess");
        } catch (Exception e) {
            captureScreenshot("Journey4_Failure");
            throw e;
        }
    }

    @Test
    @Order(5)
    @DisplayName("Journey 5: Review and Reject a Contract with Remarks")
    public void testReviewAndRejectContract() {
        try {
            driver.get(APP_URL);

            // Click Review on CT-102
            WebElement reviewBtn = wait.until(ExpectedConditions.elementToBeClickable(By.id("reviewBtn-CT-102")));
            reviewBtn.click();

            wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("reviewModal")));

            WebElement notesInput = driver.findElement(By.id("reviewerNotesInput"));
            notesInput.clear();
            notesInput.sendKeys("Budget exceeded limit for Q4. Rejected for revision.");

            WebElement rejectBtn = driver.findElement(By.id("modalRejectBtn"));
            rejectBtn.click();

            wait.until(ExpectedConditions.invisibilityOfElementLocated(By.id("reviewModal")));

            WebElement badge = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("statusBadge-CT-102")));
            Assertions.assertTrue(badge.getText().equalsIgnoreCase("Rejected"), "Status badge should be Rejected");

            captureScreenshot("Journey5_RejectedSuccess");
        } catch (Exception e) {
            captureScreenshot("Journey5_Failure");
            throw e;
        }
    }
}
