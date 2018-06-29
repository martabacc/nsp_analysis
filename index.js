import axios from 'axios';
import { lastCounter, url } from './const';
import { clean } from './mining/clean';
import { exportToCsv } from './ops/exportToCsv';
import { gatherFunctionality } from './scrape/gatherFunctionality';
import { nspScrape } from './scrape/nspScraper';
import { log } from './util';

log('info', 'Initiating program...');

let promises = [...Array(lastCounter).keys()].map(
    counter => axios.get(`${url}${counter + 1}`)
);

log('info', `Pushing promises of NSP (${lastCounter} pages) table rows...`);

const main = async () => {
  const results = await Promise.all(promises);
  const jsonResult = await nspScrape(results);
  log('info', `Finish getting JSON Result (With length of ${jsonResult.length})`);
  log('info', `Cleaning data...`);
  const cleanedData = clean(jsonResult);
  const completeData = await gatherFunctionality(cleanedData);
  exportToCsv(completeData);
  log('info', `Finish program. Now quitting.`);
};

main();

