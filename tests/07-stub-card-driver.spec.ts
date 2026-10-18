import { test, expect, Page } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

// =====================================================
// ชื่อและนามสกุลของตัวเอง (ต้องตรงกับใน stubs/card.html)
// =====================================================
const FIRST_NAME = 'ธนันธร';
const LAST_NAME = 'ศิริ';

const CARD_PATH = path.resolve(__dirname, '../stubs/card.html');

// =====================================================
// DRIVER : ทำหน้าที่เป็น caller ด้านบน
// เรียก Stub card.html โดยตรง (ไม่ผ่าน Login UI)
// =====================================================
async function driverOpenCard(page: Page): Promise<void> {
  await page.goto(pathToFileURL(CARD_PATH).href);
  await expect(page.locator('[data-test="stub-inventory"]')).toBeVisible();
}

// -----------------------------------------------------
// Test 1 : Top-Down  (A REAL -> B STUB จาก card.html)
// -----------------------------------------------------
test('STUB card.html: Login REAL -> Inventory STUB มีชื่อ-นามสกุลตัวเอง', async ({ page }) => {

  // REAL A : Login จริง
  await page.goto('/');
  await page.locator('#user-name').fill('standard_user');
  await page.locator('#password').fill('secret_sauce');

  await Promise.all([
    page.waitForURL(/inventory\.html/),
    page.locator('#login-button').click(),
  ]);

  // STUB B : แทน DOM ของ Inventory ด้วยเนื้อหาจาก card.html
  const cardHtml = fs.readFileSync(CARD_PATH, 'utf-8');
  await page.setContent(cardHtml);

  // Assert : มีชื่อและนามสกุลตัวเอง
  await expect(page.locator('[data-test="stub-inventory"]')).toBeVisible();
  await expect(page.locator('[data-test="first-name"]')).toHaveText(FIRST_NAME);
  await expect(page.locator('[data-test="last-name"]')).toHaveText(LAST_NAME);
  await expect(page.locator('[data-test="stub-card"]'))
    .toContainText(`${FIRST_NAME} ${LAST_NAME}`);
});

// -----------------------------------------------------
// Test 2 : Driver เรียก card.html
// -----------------------------------------------------
test('DRIVER -> card.html: Driver เปิด Stub และตรวจชื่อ-นามสกุล', async ({ page }) => {

  // Driver เรียก Stub
  await driverOpenCard(page);

  // Assert : ชื่อและนามสกุลต้องอยู่ใน Stub
  await expect(page.locator('[data-test="first-name"]')).toHaveText(FIRST_NAME);
  await expect(page.locator('[data-test="last-name"]')).toHaveText(LAST_NAME);
});

// npx playwright test tests/07-stub-card-driver.spec.ts --headed
