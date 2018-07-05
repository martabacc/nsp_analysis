import axios from 'axios';
import { synkLimit, synkUrl } from './const';
import { clean } from './mining/clean';
import { synkOutfile } from './const';
import { exportToCsv } from './ops/exportToCsv';
import { gatherFunctionality } from './scrape/gatherFunctionality';
import { synkScraper } from './scrape/synkScraper';
import { log, toResultObject } from './util';

log('info', 'Initiating program...');

log('info', `Start pusing promises`);

function sleep(time) {
  return new Promise((resolve) => setTimeout(resolve, 1000 * time));
}

let promises = [];
//for (let counter = 1; counter <= lastCounter; counter++) {
//  promises.push(axios.get(`${url}${counter}`));
//};

for (let counter = 1; counter <= synkLimit; counter++) {
//  console.log(`${synkUrl}${counter}?type=npm`);
  promises.push(axios.get(`${synkUrl}${counter}?type=npm`));
};

log('info', `Finish pushing promises of NSP (${synkLimit} pages) table rows...`);

const main = async () => {

  log('info', `Start resolving NSP page promises...`);
  const results = await Promise.all(promises.map(toResultObject));

//  log('info', `NSP page promise all resolved with ${results.length} results`);
//  const jsonResult = await nspScrape(results);

//  log('info', `NSP page promise all resolved with ${results.length} results`);
  const jsonResult = await synkScraper(results);
//  console.log(jsonResult);
//  log('info', `Cleaning data...`);
//  const cleanedData = clean(jsonResult);

  log('info', `Now exporting to CSV`);
  const arr = Object.keys(jsonResult).map((key) => jsonResult[key])

  exportToCsv(arr, synkOutfile);
  log('info', `Finish program. Now quitting.`);
};

main();

