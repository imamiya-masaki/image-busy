import resemble from 'resemblejs';
import playwright from "playwright";
import lighthouse from 'lighthouse';
import chromeLauncher from 'chrome-launcher';
import fs from 'fs';
import { exit } from 'process';

const browser = await playwright['chromium'].launch();
const context = await browser.newContext();

async function main() {
  const diffArray = ['', '1243'];
  console.log('diff check:');
  for (const diffString of diffArray) {
    const flag = await diff(diffString);
    if (!flag) {
      console.log('差分があります:route', diffString);
      await exit();
    }
  }
  console.log('差分はありませんでした');
  console.log('audit check');
  console.log('start');
  const port = 8080;
  const localhost = 'localhost:8080';
  const originApp = '0.0.0.0:8888';
  let resultScore = 0;
  for (const route of ['', '1243', '1']) {
    resultScore += await lightHouse(`http://${localhost}/${route}`)
  }
  console.log('...');
  console.log('allScore: ', resultScore);
  console.log('end');
  exit()
}

/**
 * 
 * @param {String} route
 * @returns {Promise<boolean>} diffFlag
 */

async function diff(route) {
  return Promise.all([screenShot(`screenshots/newer${route}.png`, `http://localhost:8080/${route}`, 'chromium'), screenShot(`screenshots/older${route}.png`, `http://0.0.0.0:8888/${route}`, 'chromium')]).then(res => {
    return resemble(`screenshots/newer${route}.png`)
    .compareTo(`screenshots/older${route}.png`)
    .ignoreColors()
    .onComplete((data) => { 
      let flag = true;
      if (data.misMatchPercentage > 0.01) {
        flag = false;
      }
      fs.writeFileSync(`screenshots/screenshot${route}.diff.png`, data.getBuffer());
      return flag;
    })
  })
}

/**
 * 
 * @param {String} path 
 * @param {String} url 
 * @param {String} browserType 
 */

async function screenShot(path, url) {
  const page = await context.newPage();
  await page.goto(url);
  await page.waitForSelector('#table', { state: 'visible'});
  await page.waitForTimeout(5000);
  await page.waitForLoadState('networkidle');
  await page.screenshot({path: path});
  }

/**
 * 
 * @param {string} targetURL 
 * @return {number} score
 */

async function lightHouse(targetURL) {
  console.log('audit: ', targetURL);
  const chrome = await chromeLauncher.launch({chromeFlags: ['--headless']});
  const options = {logLevel: 'error', output: 'html', onlyCategories: ['performance'], port: chrome.port};
  const runnerResult = await lighthouse(targetURL, options);
  const currentPerformance = runnerResult.lhr.categories.performance.score;
  const audits = runnerResult.lhr.audits;
  console.log('lighthouse: performance', currentPerformance * 100);
  const fcp = audits["first-contentful-paint"].score;
  const lcp = audits["largest-contentful-paint"].score;
  const speedIndex = audits["speed-index"].score;
  const tbt = audits["total-blocking-time"].score;
  const cls = audits["cumulative-layout-shift"].score;
  const tti = audits["interactive"].score;
  console.log('FCP:', fcp, 'LCP: ', lcp, 'speed-index: ', speedIndex, 'TBT: ', tbt, 'CLS: ', cls, 'TTI: ', tti);
  const lighthouse6 = fcp * 15 + speedIndex * 15 + lcp * 25 + tti * 15 + tbt * 25 + cls * 5;
  const lighthouse8 = fcp * 10 + speedIndex * 10 + lcp * 25 + tti * 10 + tbt * 30 + cls * 15;
  const resultScore = currentPerformance * 100 + lighthouse6 + lighthouse8;
  console.log('score!: ', resultScore);
  console.log('audited');
  return resultScore
}

main()