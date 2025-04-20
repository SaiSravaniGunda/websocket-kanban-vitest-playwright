import { test, expect } from '@playwright/test';

test.describe('Kanban Board', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    // Wait for the board to load
    await page.waitForSelector('.kanban-board');
  });

  test('should create, move, and delete tasks', async ({ page }) => {
    // Test data
    const taskTitle = 'Playwright Test Task ' + Date.now();
    
    // 1. Create task
    await page.click('button:has-text("Add Task")');
    await page.fill('input[name="title"]', taskTitle);
    await page.click('button:has-text("Create")');
    
    // Verify task exists in To Do column
    await expect(page.locator(`.column:has-text("To Do") >> text="${taskTitle}"`))
      .toBeVisible();
    
    // 2. Move task to In Progress
    const taskLocator = page.locator(`.task:has-text("${taskTitle}")`);
    const inProgressColumn = page.locator('.column:has-text("In Progress")');
    
    await taskLocator.dragTo(inProgressColumn);
    
    // Verify task moved
    await expect(page.locator(`.column:has-text("In Progress") >> text="${taskTitle}"`))
      .toBeVisible();
    
    // 3. Delete task
    await taskLocator.click();
    await page.click('button:has-text("×")');
    
    // Verify task deleted
    await expect(page.locator(`text="${taskTitle}"`))
      .not.toBeVisible({ timeout: 5000 });
  });

  test('should update task details', async ({ page }) => {
    // Test data with unique title
    const originalTitle = 'Task to Update ' + Date.now();
    const updatedTitle = 'Updated Task Title ' + Date.now();
    
    // 1. Create task
    await page.click('button:has-text("Add Task")');
    await page.fill('input[name="title"]', originalTitle);
    await page.click('button:has-text("Create")');
    
    // 2. Edit task
    await page.click(`.task:has-text("${originalTitle}")`);
    await page.fill('input[name="title"]', updatedTitle);
    await page.click('button:has-text("Update")');
    
    // Verify update
    await expect(page.locator(`text="${updatedTitle}"`))
      .toBeVisible({ timeout: 5000 });
  });

  test('should handle file uploads', async ({ page }) => {
    // Create a task first
    const taskTitle = 'File Upload Test ' + Date.now();
    await page.click('button:has-text("Add Task")');
    await page.fill('input[name="title"]', taskTitle);
    await page.click('button:has-text("Create")');
    
    // Open the task for editing
    await page.click(`.task:has-text("${taskTitle}")`);
    
    // Upload a test file
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.click('text="Upload File"');
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles('./tests/fixtures/test-image.png');
    
    // Verify upload
    await expect(page.locator('img[alt="Preview"]'))
      .toBeVisible({ timeout: 5000 });
    
    // Save the task
    await page.click('button:has-text("Update")');
    
    // Verify the attachment appears in the task card
    await expect(page.locator(`.task:has-text("${taskTitle}") >> img`))
      .toBeVisible();
  });
});