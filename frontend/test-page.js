import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    console.log('🔍 Navigating to http://localhost:3000...');
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
    
    // Wait for page to load
    await page.waitForTimeout(2000);
    
    // Get page title
    const title = await page.title();
    console.log('📄 Page title:', title);
    
    // Get page content
    const bodyContent = await page.locator('body').innerHTML();
    console.log('📝 Page content length:', bodyContent.length);
    
    // Check for React root
    const rootElement = await page.locator('#root').innerHTML();
    console.log('⚛️ React root content:', rootElement.substring(0, 200) + '...');
    
    // Check for any visible text
    const visibleText = await page.locator('body').textContent();
    console.log('👀 Visible text:', visibleText.substring(0, 300) + '...');
    
    // Check for errors in console
    const logs = [];
    const errors = [];
    
    page.on('console', msg => {
      console.log(`🗣️ Console ${msg.type()}: ${msg.text()}`);
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    page.on('pageerror', error => {
      console.log(`💥 Page Error: ${error.message}`);
      errors.push(error.message);
    });
    
    // Reload page to catch console messages
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Check network failures
    const responses = [];
    page.on('response', response => {
      if (!response.ok()) {
        responses.push(`❌ Failed request: ${response.url()} - ${response.status()}`);
      }
    });
    
    // Take a screenshot
    await page.screenshot({ path: 'page-screenshot.png', fullPage: true });
    console.log('📸 Screenshot saved as page-screenshot.png');
    
    // Print any errors
    if (errors.length > 0) {
      console.log('\n🚨 ERRORS FOUND:');
      errors.forEach(error => console.log(`❌ ${error}`));
    }
    
    if (responses.length > 0) {
      console.log('\n🌐 NETWORK ISSUES:');
      responses.forEach(resp => console.log(resp));
    }
    
  } catch (error) {
    console.error('❌ Error accessing page:', error.message);
  } finally {
    await browser.close();
  }
})();