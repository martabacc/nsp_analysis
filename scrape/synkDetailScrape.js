import axios from 'axios';
import cheerio from 'cheerio';
import { errorHandling, log, toResultObject } from '../util';

export const synkDetailScrape = (processedData) => (results) => {

  let anotherArray = [];
  let hackerOnePromises = [];
  log('info', 'Promises NSP detail resolved, getting hackerone link...');

  results.forEach(({ success, result }) => {
    const htmlResult = result.data;
    let $ = cheerio.load(htmlResult);
    if(!success) console.log(result);
    let overview = $('div .card--markdown').find('h2#overview').nextUntil('h2');
    const text = overview.contents().text();
    anotherArray[result.config.url] = processedData[result.config.url];
    anotherArray[result.config.url].text = text
    .replace(/(<([^>]+)>)/ig, '')
    .replace(/\&gt\;/g, '>')
    .replace(/\&lt\;/g, '<')
    .replace(/\&\#39\;/g, '"')
    .replace(/\&quot;/g, '« »')
    .replace(/(<([^>]+)>)/ig, '');
  });

  return Object.keys(anotherArray).map((key) => anotherArray[key]);
};
