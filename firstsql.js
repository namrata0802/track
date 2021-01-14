const { Cluster } = require('puppeteer-cluster');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin());

const fs = require('fs');

(async () => {
  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_CONTEXT,
    maxConcurrency: 2,
    puppeteer: Cluster.PuppeteerExtra
  });
  console.time('test');
  await cluster.task(async ({ page, data: url }) => {
    async function scrap() {
        const browser = await puppeteer.launch({headless: false});
        const page = (await browser.pages())[0]
        
        await page.setDefaultNavigationTimeout(0)
        // await page.setViewport({
        //   width: 1920,
        //   height: 1080,
        // });
        await page.goto(url);
        const navigationPromise = page.waitForNavigation({ waitUntil: ['networkidle2'] });
    
        const [appn] = await page.$x('/html/body/div[1]/div[4]/c-wiz/div/div[2]/div/div/main/c-wiz[1]/c-wiz[1]/div/div[2]/div/div[1]/c-wiz[1]/h1/span');
        const appName = await page.evaluate(name => name.innerText, appn);

        const [developers] = await page.$x('/html/body/div[1]/div[4]/c-wiz/div/div[2]/div/div/main/c-wiz[1]/c-wiz[1]/div/div[2]/div/div[1]/div[2]/div[1]/div[1]/span[1]/a');
        const developer = await page.evaluate(name => name.innerText, developers);
      
        const [categorys] = await page.$x('/html/body/div[1]/div[4]/c-wiz/div/div[2]/div/div/main/c-wiz[1]/c-wiz[1]/div/div[2]/div/div[1]/div[2]/div[1]/div[1]/span[2]/a');
        const category = await page.evaluate(name => name.innerText, categorys);
      
        const [ratings] = await page.$x('/html/body/div[1]/div[4]/c-wiz/div/div[2]/div/div/main/div/div[1]/c-wiz/div[1]/div[1]');
        const rating = await page.evaluate(name => name.innerText, ratings);
      
        const [totalRatings] = await page.$x('/html/body/div[1]/div[4]/c-wiz/div/div[2]/div/div/main/div/div[1]/c-wiz/div[1]/span/span[2]');
        const totalRating = await page.evaluate(name => name.innerText, totalRatings);

        const [descriptions] = await page.$x('/html/body/div[1]/div[4]/c-wiz/div/div[2]/div/div/main/c-wiz[1]/c-wiz[3]/div/div[1]/meta');
        const description = await page.evaluate(name => name.getAttribute('content'), descriptions);
      
        const other = await page.$$eval('.BgcNfc', inputs => { return inputs.map(input => input.innerText) })
        const othervalue = await page.$$eval('span.htlgb div.IQ1z0d span:nth-child(1)', inputs => { return inputs.map(input => input.innerText) })
      
        var alldata=[];
        for (let i = 0; i < other.length; i++) {
          if (other[i] === 'Updated'){
            var updated = othervalue[i]
          } 
          if (other[i] === 'Size'){
            var size = othervalue[i]
          } 
          if (other[i] === 'Installs'){
            var installs = othervalue[i]
          }
          if (other[i] === 'Current Version'){
            var currentVersion = othervalue[i]
          }
          if (other[i] === 'Requires Android'){
            var requiresAndroid = othervalue[i]
          }
          if (other[i] === 'Content Rating'){
            oot = othervalue[i].replace('\nLearn more','')
            var contentRating = oot
          }
        }
        fs.writeFileSync(`${appName}review.json`,JSON.stringify({
          appName,
          developer,
          category,
          rating,
          totalRating,
          description,
          updated,
          size,
          installs,
          currentVersion,
          requiresAndroid,
          contentRating
        }, null, '\t'));     
          await browser.close()
        };
      scrap();
  });

  cluster.queue('https://play.google.com/store/apps/details?id=com.ng_labs.kidspaint');
//   cluster.queue('https://play.google.com/store/apps/details?id=com.ng_labs.magicslate');

  // many more pages
  console.timeEnd('test');
  await cluster.idle();
  await cluster.close();
})();
