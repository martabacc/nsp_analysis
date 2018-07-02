import axios from 'axios';
import { lastCounter, url } from './const';
import { clean } from './mining/clean';
import { exportToCsv } from './ops/exportToCsv';
import { gatherFunctionality } from './scrape/gatherFunctionality';
import { nspScrape } from './scrape/nspScraper';
import { log, toResultObject } from './util';

log('info', 'Initiating program...');

log('info', `Start pusing promises`);

let promises = [];
for (let counter = 1; counter <= lastCounter; counter++) {
  promises.push(axios.get(`${url}${counter}`));
};

log('info', `Finish pushing promises of NSP (${lastCounter} pages) table rows...`);

const main = async () => {

  log('info', `Start resolving NSP page promises...`);
  const results = await Promise.all(promises.map(toResultObject));
  log('info', `NSP page promise all resolved with ${results.length} results`);
  const jsonResult = await nspScrape(results);
  log('info', `Cleaning data...`);
  const cleanedData = clean(jsonResult);
  const lala = [];
  for (let x = 0; x < cleanedData.length; x=x+30) {
    const currentModule = cleanedData.slice(x, x+30);
    log('info', `Gathering info [${x} to ${x+30} from ${cleanedData.length}]`);
    const completeData = await gatherFunctionality(currentModule);
    lala.push(completeData);
  }
  log('info', `Now exporting to CSV`);
  exportToCsv(lala);
  log('info', `Finish program. Now quitting.`);
};

main();

