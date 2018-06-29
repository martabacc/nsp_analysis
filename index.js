import axios from 'axios';
import { lastCounter, url } from './const';
import { nspScrape } from './scrape/nspScraper';
import { errorHandling, log } from './util';

log('info', 'Initiating program...');

let promises = [];
[...Array(lastCounter).keys()].forEach(
    counter => promises.push(axios.get(`${url}${counter + 1}`))
);

log('info', `Pushing promises of NSP (${lastCounter} pages) table rows...`);

const main = async () => {
  const results = await Promise.all(promises);
  const jsonResult = await nspScrape(results);
};

main();

