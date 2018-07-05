import cheerio from 'cheerio';
import axios from 'axios';
import { synkDetailUrl } from '../const';
import { log, toResultObject } from '../util';
import { synkDetailScrape } from './synkDetailScrape';

export const synkScraper = (results) => {
  log('info', 'Promises NSP resolved, scraping through HTML...');

  let processedData = [];
  let detailPromises = [];

  results.forEach(({ result }) => {
    const htmlResult = result.data;
    let $ = cheerio.load(htmlResult);

    $('.table--comfortable tbody tr').each((idx, child) => {
      let scrapedData = {};

      const tableRow = $(child);
      scrapedData.link = tableRow.find('span.l-push-left--sm a').attr('href');
      scrapedData.vulnerabilities = tableRow.find('span.l-push-left--sm a strong').text();
      scrapedData.severity = tableRow.find('span.severity-list__item-text').html();
      scrapedData.vulnerableVersion = tableRow.find('td span.semver').html().replace(
          /\&gt\;/g, '>').replace(/\&lt\;/g, '<');

      scrapedData.moduleName = tableRow.find('td strong.list-vulns__item__package__name a').text();
      scrapedData.moduleLink = tableRow.find('td strong.list-vulns__item__package__name a').attr(
          'href');

      scrapedData.reportedAt = tableRow.find('td.l-align-right').html();

      detailPromises.push(axios.get(`${synkDetailUrl}${scrapedData.link}`));
      processedData[`${synkDetailUrl}${scrapedData.link}`] = scrapedData;
    });
  });
  log('info', 'Finish curating object, gathering info from NSP detail pages...');
  return processedData;
//  return Promise.all(detailPromises.map(toResultObject)).then(synkDetailScrape(processedData));
};

export default synkScraper;
