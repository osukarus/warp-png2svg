import { test, expect } from '@playwright/test';

// Helper to build a tiny in-memory PNG (1x1 red) as a Buffer
function redPngBase64(): string {
  // 1x1 red PNG base64 (compiled)
  return 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=';
}

function dataUrlToFilePayload(dataUrl: string, fileName: string) {
  const base64 = dataUrl.split(',')[1] || dataUrl;
  const buffer = Buffer.from(base64, 'base64');
  return { name: fileName, mimeType: 'image/png', buffer } as const;
}

test('upload, convert, and download SVG', async ({ page, context }) => {
  await page.goto('/', { waitUntil: 'networkidle' });

  // Expect core controls to be present
  await page.waitForSelector('input[type="file"]');
  await expect(page.getByRole('button', { name: 'Convert' })).toBeVisible();

  // Prepare a 1x1 red PNG and set input files
  const file = dataUrlToFilePayload(redPngBase64(), 'tiny.png');
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles({ name: file.name, mimeType: file.mimeType, buffer: file.buffer });

  // Convert
  await page.getByRole('button', { name: 'Convert' }).click();

  // Wait for the toast or SVG output area to show something
  const svgContainer = page.locator('div:has-text("SVG Output")').locator('xpath=following-sibling::*[1]');
  await expect(svgContainer).toBeVisible();

  // The SVG is injected via dangerouslySetInnerHTML; check that an <svg> appears
  await expect(page.locator('svg')).toBeVisible({ timeout: 10000 });

  // Download SVG
  const [ download ] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('link', { name: /Download SVG/ }).click(),
  ]);
  const path = await download.path();
  expect(path).toBeTruthy();

  // Basic validation: file name ends with .svg
  expect((await download.suggestedFilename()).endsWith('.svg')).toBeTruthy();
});

