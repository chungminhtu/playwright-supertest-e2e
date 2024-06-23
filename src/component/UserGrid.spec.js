const { test, expect } = require('../../tests/fixtures');

test('should perform CRUD operations on UserGrid', async ({ page }) => {
    
    // Navigate to the UserGrid page
    await page.goto('http://localhost:3001/frontend/grid');

    // Test Create operation
    await page.fill('input[placeholder="New user name"]', 'David');
    await page.selectOption('select:near(:text("Add User"))', 'editor');
    await page.click('button:text("Add User")');

    // Verify the new user is added
    await expect(page.locator('table tbody tr')).toHaveCount(4);
    await expect(page.locator('table tbody tr:last-child td:first-child')).toHaveText('David');

    // Test Update operation
    await page.click('table tbody tr:last-child button:text("Edit")');
    await page.fill('table tbody tr:last-child input', 'David Updated');
    await page.click('table tbody tr:last-child button:text("Save")');

    // Verify the user is updated
    await expect(page.locator('table tbody tr:last-child td:first-child')).toHaveText('David Updated');

    // Test Delete operation
    await page.click('table tbody tr:last-child button:text("Delete")');

    // Verify the user is deleted
    await expect(page.locator('table tbody tr')).toHaveCount(3);
    await expect(page.locator('table tbody tr:last-child td:first-child')).not.toHaveText('David Updated');
});