import axios from 'axios';
import cheerio from 'cheerio';
import { errorHandling, log, toResultObject } from '../util';
import { hackeroneScrape } from './hackeroneScraper';

export const nspDetailScrape = (processedData) => (results) => {

  let anotherArray = [];
  let wqwq = [];
  log('info', 'Promises NSP detail resolved, getting hackerone link...');
  results.forEach((result) => {
    const htmlResult = result.data;
    let $ = cheerio.load(htmlResult);
    let hackerOneLink = $('div.advisory-description ul').children().first().find('a').attr('href');
    anotherArray[hackerOneLink + '.json'] = processedData[result.config.url];
    anotherArray[hackerOneLink + '.json'].hackerOneLink = hackerOneLink;

    // console.log(hackerOneLink);
    wqwq.push(axios.get(hackerOneLink + '.json'));
  });

  log('info', 'Finish gathering hackerOneLink, pushing hOne Link to promises..');
  return Promise.all(wqwq.map(toResultObject)).then(hackeroneScrape(anotherArray)).catch(errorHandling);
};
