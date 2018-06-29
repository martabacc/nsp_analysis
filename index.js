import axios from 'axios';
import cheerio from 'cheerio';
import fs from 'fs';
import jsonexport from 'jsonexport';
import { detailUrl, lastCounter, outFile, url } from './const';
import { errorHandling, gatheredIndex, log, toResultObject } from './util';

const processedData = [];
let detailPromises = [];
let wqwq = [];
let anotherArray = [];
let publicReport = 0;
let privateReport = 0;

log('info', 'Initiating program...');

const exportToCsv = () => {
  log('info', `Start exporting CSV`);

  const arr = Object.keys(anotherArray).map( (key) => anotherArray[key] );

  jsonexport(arr, (err, csv) => {
    if (err) errorHandling(err);
    fs.writeFile(outFile, csv, (err) => {
      if (err) return errorHandling(err);
    });
  });

  log('info', `Finish. CSV is generated in ${outFile}.`);
};

const scrapeHackerone = (results) => {

  log('info', 'Promise hackerOne resolved, curating object for CSV ');
  // console.log(results);
  results.forEach((result) => {
    if (!result.success) {
      const idx = result.error.config.url;

      log('warn', `[Private] ${anotherArray[idx]['title']} issue is Private`);
      privateReport++;
      anotherArray[idx].isPrivate = true;
      gatheredIndex.forEach(gIdx => anotherArray[idx][gIdx] = null);
      return;
    }

    const idx = result.result.config.url;
    log('info', `[Public ] ${anotherArray[idx]['title']}  issue is public.`);
    publicReport++;
    anotherArray[idx].isPrivate = false;
    const data = result.result.data;
    gatheredIndex.forEach(gIdx => anotherArray[idx][gIdx] = data[gIdx]);
  });

  log('info',
      `Finish curating hackerOne jsons. Result: ${privateReport} private, ${publicReport} public`);

  exportToCsv();
};

const acquireDetail = (results) => {
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
  Promise.all(wqwq.map(toResultObject)).then(scrapeHackerone);
};

const processData = (results) => {
  log('info', 'Promises NSP resolved, scraping through HTML...');

  results.forEach(result => {
    const htmlResult = result.data;
    let $ = cheerio.load(htmlResult);

    $('.advisories-table tbody tr').each(async (idx, child) => {
      let scrapedData = {};

      const tableRow = $(child);
      scrapedData.title = tableRow.find('.advisory-title a').text();
      scrapedData.link = tableRow.find('.advisory-title a').attr('href');
      scrapedData.reportedAt = tableRow.find('.advisory-date span').html();

      scrapedData.moduleName = tableRow.find('.module-name a').text();
      scrapedData.moduleLink = tableRow.find('.module-name a').attr('href');
      scrapedData.vulnerableVersion = tableRow.find('.module-version span').first().html().replace(
          /\&gt\;/g, '>').replace(/\&lt\;/g, '<');
      scrapedData.patchedVersion = tableRow.find('.module-version span').last().html().replace(
          /\&gt\;/g, '>').replace(/\&lt\;/g, '<');

      scrapedData.severity = tableRow.find('span.cvss-score').html();
      scrapedData.rate = tableRow.find('span.cvss-rating').html();

      detailPromises.push(axios.get(`${detailUrl}${scrapedData.link}`));
      processedData[`${detailUrl}${scrapedData.link}`] = scrapedData;
    });
  });
  log('info', 'Finish curating object, gathering info from NSP detail pages...');
  Promise.all(detailPromises).then(acquireDetail).catch(errorHandling);
};

let promises = [];
[...Array(lastCounter).keys()].forEach(
    counter => promises.push(axios.get(`${url}${counter + 1}`))
);

log('info', `Pushing promises of NSP (${lastCounter} pages) table rows...`);

Promise.all(promises).then(processData).catch(errorHandling);
