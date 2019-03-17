const { Semaphore } = require("await-semaphore");

module.exports = function getPageOpener({
    browser,
    maxPages
} = {}) {
    const semaphore = new Semaphore(maxPages);
    return {
        open: async () => {
            const release = await semaphore.acquire();
            const page = await browser.newPage();
            page.release = release;
            return page;
        },
        close: async page => {
            await page.close();
            page.release();
        }
    }
};