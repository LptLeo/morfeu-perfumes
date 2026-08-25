# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: test-focus-editor.spec.ts >> FocusEditor - Drag & Zoom >> AdminTexts imagem 4/5: drag funciona
- Location: test-focus-editor.spec.ts:127:3

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:5175/admin/login
Call log:
  - navigating to "http://localhost:5175/admin/login", waiting until "load"

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e6]:
    - heading "This site can’t be reached" [level=1] [ref=e7]
    - paragraph [ref=e8]:
      - strong [ref=e9]: localhost
      - text: refused to connect.
    - generic [ref=e10]:
      - paragraph [ref=e11]: "Try:"
      - list [ref=e12]:
        - listitem [ref=e13]: Checking the connection
        - listitem [ref=e14]:
          - link "Checking the proxy and the firewall" [ref=e15] [cursor=pointer]:
            - /url: "#buttons"
    - generic [ref=e16]: ERR_CONNECTION_REFUSED
  - generic [ref=e17]:
    - button "Reload" [ref=e19] [cursor=pointer]
    - button "Details" [ref=e20] [cursor=pointer]
```

# Test source

```ts
  1   | import { test, expect, Page } from '@playwright/test';
  2   | 
  3   | const BASE_URL = process.env.TEST_URL || 'http://localhost:5174';
  4   | 
  5   | // Helper: login admin
  6   | async function loginAdmin(page: Page) {
> 7   |   await page.goto(`${BASE_URL}/admin/login`);
      |              ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:5175/admin/login
  8   |   await page.fill('input[type="email"]', 'lptleo11@gmail.com');
  9   |   await page.fill('input[type="password"]', 'teste123');
  10  |   await page.click('button:has-text("Entrar")');
  11  |   await page.waitForURL(`${BASE_URL}/admin/**`);
  12  | }
  13  | 
  14  | // Helper: aguarda FocusEditor carregar
  15  | async function waitForFocusEditor(page: Page) {
  16  |   await page.waitForSelector('[aria-label="Editor de enquadramento da foto"]', { timeout: 10000 });
  17  | }
  18  | 
  19  | // Helper: obtém frame e imagem
  20  | async function getFrameInfo(page: Page) {
  21  |   return await page.evaluate(() => {
  22  |     const frame = document.querySelector('[aria-label="Editor de enquadramento da foto"]') as HTMLElement;
  23  |     const img = frame?.querySelector('img') as HTMLImageElement;
  24  |     if (!frame || !img) return null;
  25  |     return {
  26  |       frameRect: frame.getBoundingClientRect(),
  27  |       imgRect: img.getBoundingClientRect(),
  28  |       objectPosition: img.style.objectPosition,
  29  |       transform: img.style.transform,
  30  |     };
  31  |   });
  32  | }
  33  | 
  34  | // Helper: drag relativo ao centro do frame
  35  | async function dragFromCenter(page: Page, deltaX: number, deltaY: number) {
  36  |   const frame = await page.$('[aria-label="Editor de enquadramento da foto"]');
  37  |   if (!frame) throw new Error('Frame não encontrado');
  38  |   const box = await frame.boundingBox();
  39  |   if (!box) throw new Error('Frame box não encontrado');
  40  |   const centerX = box.x + box.width / 2;
  41  |   const centerY = box.y + box.height / 2;
  42  |   await page.mouse.move(centerX, centerY);
  43  |   await page.mouse.down();
  44  |   await page.mouse.move(centerX + deltaX, centerY + deltaY, { steps: 10 });
  45  |   await page.mouse.up();
  46  |   await page.waitForTimeout(100); // aguarda re-render
  47  | }
  48  | 
  49  | test.describe('FocusEditor - Drag & Zoom', () => {
  50  |   test.beforeEach(async ({ page }) => {
  51  |     await loginAdmin(page);
  52  |   });
  53  | 
  54  |   test('ProductForm (4/5): drag horizontal muda apenas X', async ({ page }) => {
  55  |     await page.goto(`${BASE_URL}/admin/produtos/club-de-nuit-intense`);
  56  |     await waitForFocusEditor(page);
  57  | 
  58  |     const before = await getFrameInfo(page);
  59  |     expect(before).not.toBeNull();
  60  | 
  61  |     // Drag horizontal: 30% da largura para direita
  62  |     await dragFromCenter(page, before!.frameRect.width * 0.3, 0);
  63  | 
  64  |     const after = await getFrameInfo(page);
  65  |     expect(after).not.toBeNull();
  66  | 
  67  |     // X deve ter mudado (arrastar direita -> object-position X diminui)
  68  |     expect(after!.objectPosition).not.toBe(before!.objectPosition);
  69  |     const [beforeX] = before!.objectPosition.split(' ').map(s => parseFloat(s));
  70  |     const [afterX] = after!.objectPosition.split(' ').map(s => parseFloat(s));
  71  |     expect(afterX).toBeLessThan(beforeX);
  72  |   });
  73  | 
  74  |   test('ProductForm (4/5): drag vertical muda apenas Y', async ({ page }) => {
  75  |     await page.goto(`${BASE_URL}/admin/produtos/club-de-nuit-intense`);
  76  |     await waitForFocusEditor(page);
  77  | 
  78  |     const before = await getFrameInfo(page);
  79  |     expect(before).not.toBeNull();
  80  | 
  81  |     // Drag vertical: 30% da altura para baixo
  82  |     await dragFromCenter(page, 0, before!.frameRect.height * 0.3);
  83  | 
  84  |     const after = await getFrameInfo(page);
  85  |     expect(after).not.toBeNull();
  86  | 
  87  |     // Y deve ter mudado (arrastar baixo -> object-position Y aumenta)
  88  |     const [, beforeY] = before!.objectPosition.split(' ').map(s => parseFloat(s));
  89  |     const [, afterY] = after!.objectPosition.split(' ').map(s => parseFloat(s));
  90  |     expect(afterY).toBeGreaterThan(beforeY);
  91  |   });
  92  | 
  93  |   test('ProductForm (4/5): zoom slider funciona', async ({ page }) => {
  94  |     await page.goto(`${BASE_URL}/admin/produtos/club-de-nuit-intense`);
  95  |     await waitForFocusEditor(page);
  96  | 
  97  |     const slider = page.locator('input#focus-zoom');
  98  |     await expect(slider).toBeVisible();
  99  | 
  100 |     const before = await getFrameInfo(page);
  101 |     await slider.fill('2.5');
  102 |     await page.waitForTimeout(100);
  103 | 
  104 |     const after = await getFrameInfo(page);
  105 |     expect(after!.transform).toContain('scale(2.5)');
  106 |   });
  107 | 
```