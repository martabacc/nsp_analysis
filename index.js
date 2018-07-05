import axios from 'axios';
import { lastCounter, url } from './const';
import { clean } from './mining/clean';
import { exportToCsv } from './ops/exportToCsv';
import { gatherFunctionality } from './scrape/gatherFunctionality';
import { nspScrape } from './scrape/nspScraper';
import { log, toResultObject } from './util';

log('info', 'Initiating program...');

log('info', `Start pusing promises`);

function sleep(time) {
  return new Promise((resolve) => setTimeout(resolve, 1000 * time));
}

let promises = [];
for (let counter = 1; counter <= lastCounter; counter++) {
  promises.push(axios.get(`${url}${counter}`));
}
;

log('info', `Finish pushing promises of NSP (${lastCounter} pages) table rows...`);

const main = async () => {

  log('info', `Start resolving NSP page promises...`);
  const results = await Promise.all(promises.map(toResultObject));
  log('info', `NSP page promise all resolved with ${results.length} results`);
  const jsonResult = await nspScrape(results);
  log('info', `Cleaning data...`);
  const cleanedData = clean(jsonResult);
  const lala = [];
  const lim = 2;
  let trial429 = 0;
  for (let x = 0; x < cleanedData.length; x = x + lim) {
    await sleep(5);
    const currentModule = cleanedData.slice(Number(x), Number(x) + Number(lim));
    log('info',
        `Gathering info [${Number(x)} to ${Number(x) + Number(lim)} from ${cleanedData.length}]`);
    let flag = true;
    let is429 = false;
    const completeData = await gatherFunctionality(currentModule).catch(e => {
      log('warn', `Got error... ${ (e.response && e.response.status) || e.code || 'Unknown' }`);
      if (e.response && e.response.status === 429) {
        log('warn', 'Got TLE for max call to Github API, trying again after an hour...');
        is429 = true;
        x = x - lim;
        trial429++;
      }
      flag = false;
    });
    if (flag) lala.push(...completeData);
    if (trial429 > 10) {
      console.log('warn', 'Next time, start x from ' + x);
      break;
    }
  }
  log('info', `Now exporting to CSV`);
  exportToCsv(lala);
  log('info', `Finish program. Now quitting.`);
};

main();

