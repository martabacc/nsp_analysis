import axios from 'axios';
import cheerio from 'cheerio';
import { errorHandling, log, toResultObject } from '../util';
import { hackeroneScrape } from './hackeroneScraper';

export const nspDetailScrape = (processedData) => (results) => {

  let anotherArray = [];
  let hackerOnePromises = [];
  log('info', 'Promises NSP detail resolved, getting hackerone link...');

  results.forEach(({ result }) => {
    const htmlResult = result.data;
    let $ = cheerio.load(htmlResult);
    let hackerOneLink = $('div.advisory-description ul').children().first().find('a').attr('href');

    let cveReport = $('div.advisory-details').children().last().find('span a').attr('href');

    if (hackerOneLink === undefined || !hackerOneLink.includes('hackerone')) {
      /*log('warn',
          `Following report doesn't has detail report: ${processedData[result.config.url].title}`);*/
      anotherArray[result.config.url] = processedData[result.config.url];
    } else {
      hackerOneLink = hackerOneLink + '.json';
      hackerOnePromises.push(axios.get(hackerOneLink));

      anotherArray[hackerOneLink] = processedData[result.config.url];
      anotherArray[hackerOneLink].hackerOneLink = hackerOneLink;

    }
  });

  log('info',
      `Finish gathering hackerOneLink, pushing hOne Link to promises..`);
  return Promise.all(hackerOnePromises.map(toResultObject))
  .then(hackeroneScrape(anotherArray))
  .catch(errorHandling);
};
