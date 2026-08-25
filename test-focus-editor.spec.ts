import { test, expect, Page } from '@playwright/test';

const BASE_URL = process.env.TEST_URL || 'http://localhost:5174';

// Helper: login admin
async function loginAdmin(page: Page) {
  await page.goto(`${BASE_URL}/admin/login`);
  await page.fill('input[type="email"]', 'lptleo11@gmail.com');
  await page.fill('input[type="password"]', 'teste123');
  await page.click('button:has-text("Entrar")');
  await page.waitForURL(`${BASE_URL}/admin/**`);
}

// Helper: aguarda FocusEditor carregar
async function waitForFocusEditor(page: Page) {
  await page.waitForSelector('[aria-label="Editor de enquadramento da foto"]', { timeout: 10000 });
}

// Helper: obtém frame e imagem
async function getFrameInfo(page: Page) {
  return await page.evaluate(() => {
    const frame = document.querySelector('[aria-label="Editor de enquadramento da foto"]') as HTMLElement;
    const img = frame?.querySelector('img') as HTMLImageElement;
    if (!frame || !img) return null;
    return {
      frameRect: frame.getBoundingClientRect(),
      imgRect: img.getBoundingClientRect(),
      objectPosition: img.style.objectPosition,
      transform: img.style.transform,
    };
  });
}

// Helper: drag relativo ao centro do frame
async function dragFromCenter(page: Page, deltaX: number, deltaY: number) {
  const frame = await page.$('[aria-label="Editor de enquadramento da foto"]');
  if (!frame) throw new Error('Frame não encontrado');
  const box = await frame.boundingBox();
  if (!box) throw new Error('Frame box não encontrado');
  const centerX = box.x + box.width / 2;
  const centerY = box.y + box.height / 2;
  await page.mouse.move(centerX, centerY);
  await page.mouse.down();
  await page.mouse.move(centerX + deltaX, centerY + deltaY, { steps: 10 });
  await page.mouse.up();
  await page.waitForTimeout(100); // aguarda re-render
}

test.describe('FocusEditor - Drag & Zoom', () => {
  test.beforeEach(async ({ page }) => {
    await loginAdmin(page);
  });

  test('ProductForm (4/5): drag horizontal muda apenas X', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/produtos/club-de-nuit-intense`);
    await waitForFocusEditor(page);

    const before = await getFrameInfo(page);
    expect(before).not.toBeNull();

    // Drag horizontal: 30% da largura para direita
    await dragFromCenter(page, before!.frameRect.width * 0.3, 0);

    const after = await getFrameInfo(page);
    expect(after).not.toBeNull();

    // X deve ter mudado (arrastar direita -> object-position X diminui)
    expect(after!.objectPosition).not.toBe(before!.objectPosition);
    const [beforeX] = before!.objectPosition.split(' ').map(s => parseFloat(s));
    const [afterX] = after!.objectPosition.split(' ').map(s => parseFloat(s));
    expect(afterX).toBeLessThan(beforeX);
  });

  test('ProductForm (4/5): drag vertical muda apenas Y', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/produtos/club-de-nuit-intense`);
    await waitForFocusEditor(page);

    const before = await getFrameInfo(page);
    expect(before).not.toBeNull();

    // Drag vertical: 30% da altura para baixo
    await dragFromCenter(page, 0, before!.frameRect.height * 0.3);

    const after = await getFrameInfo(page);
    expect(after).not.toBeNull();

    // Y deve ter mudado (arrastar baixo -> object-position Y aumenta)
    const [, beforeY] = before!.objectPosition.split(' ').map(s => parseFloat(s));
    const [, afterY] = after!.objectPosition.split(' ').map(s => parseFloat(s));
    expect(afterY).toBeGreaterThan(beforeY);
  });

  test('ProductForm (4/5): zoom slider funciona', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/produtos/club-de-nuit-intense`);
    await waitForFocusEditor(page);

    const slider = page.locator('input#focus-zoom');
    await expect(slider).toBeVisible();

    const before = await getFrameInfo(page);
    await slider.fill('2.5');
    await page.waitForTimeout(100);

    const after = await getFrameInfo(page);
    expect(after!.transform).toContain('scale(2.5)');
  });

  test('ProductForm (4/5): botão Centralizar reseta posição', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/produtos/club-de-nuit-intense`);
    await waitForFocusEditor(page);

    // Move primeiro
    const before = await getFrameInfo(page);
    await dragFromCenter(page, before!.frameRect.width * 0.2, before!.frameRect.height * 0.2);
    const moved = await getFrameInfo(page);
    expect(moved!.objectPosition).not.toBe('50% 50%');

    // Centraliza
    await page.click('button:has-text("Centralizar")');
    await page.waitForTimeout(100);

    const after = await getFrameInfo(page);
    expect(after!.objectPosition).toBe('50% 50%');
    expect(after!.transform).toBe('scale(1)');
  });

  test('AdminTexts imagem 4/5: drag funciona', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/textos`);
    await waitForFocusEditor(page);

    const before = await getFrameInfo(page);
    expect(before).not.toBeNull();

    await dragFromCenter(page, before!.frameRect.width * 0.2, 0);
    const after = await getFrameInfo(page);
    expect(after!.objectPosition).not.toBe(before!.objectPosition);
  });

  test('AdminTexts logo 1/1: drag funciona', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/textos`);
    // Scroll até header logo
    await page.locator('label:has-text("Logo do header")').scrollIntoViewIfNeeded();
    await waitForFocusEditor(page);

    const before = await getFrameInfo(page);
    expect(before).not.toBeNull();

    // Verifica aspect-ratio 1:1 no frame
    const frame = await page.$('[aria-label="Editor de enquadramento da foto"]');
    const box = await frame!.boundingBox();
    expect(box).not.toBeNull();
    expect(Math.abs(box!.width - box!.height)).toBeLessThan(5); // ~quadrado

    await dragFromCenter(page, 0, before!.frameRect.height * 0.2);
    const after = await getFrameInfo(page);
    expect(after!.objectPosition).not.toBe(before!.objectPosition);
  });

  test('CSS frame tem aspect-ratio correto via style prop', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/produtos/club-de-nuit-intense`);
    await waitForFocusEditor(page);

    const frame = await page.$('[aria-label="Editor de enquadramento da foto"]');
    const style = await frame!.getAttribute('style');
    expect(style).toContain('aspect-ratio: 4/5');
  });
});