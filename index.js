
require('dotenv').load();
const request = require('request');
const cheerio = require('cheerio');
const axios = require('axios');
const jsonexport = require('jsonexport');
const fs = require('fs');
const winston = require('winston');
const format = winston.format;


const outFile = 'out.csv';
const lastCounter = 1;
const url = `https://nodesecurity.io/advisories?page=`;
const detailUrl = 'https://nodesecurity.io';

let data = [];
const processedData = [];	
let detailPromises = [];
let wqwq = [];
let anotherArray = [];
let public = 0;
let private = 0;


const errorHandling = (error) => { 
	logger.log({
	  level: 'error',
	  message: `[ERROR] ${error}`
	});
}
const myFormat = format.printf(info => `${info.timestamp} [${info.label}] ${info.level}: ${info.message}`);

const logger = winston.createLogger({
  format: format.combine(
  	format.label({label: 'NSP Scraper'}),
  	format.colorize(),
    format.timestamp(),
    myFormat
  ),
  transports: [new winston.transports.Console()]
});

logger.log({
  level: 'info',
  message: 'Initiating program...'
});

const toResultObject = (promise) => {
    return promise
    .then(result => ({ success: true, result }))
    .catch(error => ({ success: false, error }));
};

const gatheredIndex = [
	'vulnerability_information_html', //the markdown is here
	'title',
	'created_at',
	'disclosed_at'
];

const exportToCsv = () => {
	logger.log({
	  level: 'info',
	  message: `Start exporting CSV`
	});

	const arr = Object.keys(anotherArray).map(function (key) { return anotherArray[key]; });

	jsonexport(arr, (err, csv) => {
		if(err) errorHandling(err);
		fs.writeFile(outFile, csv, (err) => {
			if(err) return errorHandling(err);
		})
	});

	logger.log({
	  level: 'info',
	  message: `Finish. CSV is generated in ${outFile}.`
	});
}


const scrapeHackerone =  (results) => {

	logger.log({
	  level: 'info',
	  message: 'Promise hackerOne resolved, curating object for CSV '
	});
	// console.log(results);
	results.forEach( (result) => {
	    if (!result.success) {
	    	const idx = result.error.config.url;
	    	
			logger.log({
			  level: 'warn',
			  message: `[Private] ${anotherArray[idx]['title']} issue is Private`
			});
			private++;
    		anotherArray[idx].isPrivate = true;
    		gatheredIndex.forEach( gIdx =>  anotherArray[idx][gIdx] = null);
			return;
	    }

	    const idx = result.result.config.url;
		logger.log({
		  level: 'info',
		  message: `[Public ] ${anotherArray[idx]['title']}  issue is public.`
		});
		public++;
    	anotherArray[idx].isPrivate = false;
	    const data = result.result.data;
	    gatheredIndex.forEach( gIdx =>  anotherArray[idx][gIdx] = data[gIdx]);
	});

	logger.log({
	  level: 'info',
	  message: `Finish curating hackerOne jsons. Result: ${private} private, ${public} public`
	});

	exportToCsv();
}

const acquireDetail =  (results) => {
	logger.log({
	  level: 'info',
	  message: 'Promises NSP detail resolved, getting hackerone link...'
	});
	results.forEach( (result) => {
		const htmlResult = result.data;
		let $ = cheerio.load(htmlResult);
		let hackerOneLink = $('div.advisory-description ul').children().first().find('a').attr('href');
		anotherArray[hackerOneLink+'.json'] = processedData[result.config.url];
		anotherArray[hackerOneLink+'.json'].hackerOneLink = hackerOneLink;

		// console.log(hackerOneLink);
		wqwq.push(axios.get(hackerOneLink+'.json'));
	});

	logger.log({
	  level: 'info',
	  message: 'Finish gathering hackerOneLink, pushing hOne Link to promises..'
	});
	Promise.all(wqwq.map(toResultObject)).then(scrapeHackerone);
}


const processData = (results) => {
	logger.log({
	  level: 'info',
	  message: 'Promises NSP resolved, scraping through HTML...'
	});

	results.forEach( result => {
		const htmlResult = result.data;
		let $ = cheerio.load(htmlResult);

		$('.advisories-table tbody tr').each( async (idx, child) => {
			let scrapedData = {};

			const tableRow = $(child);
			scrapedData.title = tableRow.find('.advisory-title a').text();
			scrapedData.link = tableRow.find('.advisory-title a').attr('href');
			scrapedData.reportedAt = tableRow.find('.advisory-date span').html();

			scrapedData.moduleName = tableRow.find('.module-name a').text();
			scrapedData.moduleLink = tableRow.find('.module-name a').attr('href');
			scrapedData.vulnerableVersion = tableRow.find('.module-version span').first().html().replace(/\&gt\;/g, '>').replace(/\&lt\;/g, '<');
			scrapedData.patchedVersion= tableRow.find('.module-version span').last().html().replace(/\&gt\;/g, '>').replace(/\&lt\;/g, '<');

			scrapedData.severity = tableRow.find('span.cvss-score').html();
			scrapedData.rate = tableRow.find('span.cvss-rating').html();

			detailPromises.push(axios.get(`${detailUrl}${scrapedData.link}`));
			processedData[`${detailUrl}${scrapedData.link}`] = scrapedData;
		});
	});
	logger.log({
	  level: 'info',
	  message: 'Finish curating object, gathering info from NSP detail pages...'
	});
	Promise.all(detailPromises).then(acquireDetail).catch(errorHandling);
}


let promises = [];
[...Array(lastCounter).keys()].forEach( 
	counter => promises.push( axios.get(`${url}${counter+1}`))
);

logger.log({
  level: 'info',
  message: `Pushing promises of NSP (${lastCounter} pages) table rows...`
});

Promise.all(promises).then(processData).catch(errorHandling);