
require('dotenv').load();
const request = require('request');
const cheerio = require('cheerio');
const axios = require('axios');
const lastCounter = 1;
const url = `https://nodesecurity.io/advisories?page=`;
const detailUrl = 'https://nodesecurity.io';
 	
let data = [];
const processedData = [];	
let detailPromises = [];
let wqwq = [];
let anotherArray = [];

const errorHandling = (error) => { console.error(error) }

const toResultObject = (promise) => {
    return promise
    .then(result => ({ success: true, result }))
    .catch(error => ({ success: false, error }));
};

const gatheredIndex = [
	'vulnerability_information', //the markdown is here
	'title',
	'created_at',
	'disclosed_at'
];

const scrapeHackerone =  (results) => {
	// console.log(results);
	results.forEach( (result) => {
	    if (!result.success) {
    		anotherArray[result.error.config.url].isPrivate = true;
			return;
	    }
	    const idx = result.result.config.url;
    	anotherArray[idx].isPrivate = false;
	    const data = result.result.data;
	    gatheredIndex.forEach( gIdx =>  anotherArray[idx][gIdx] = data[gIdx]);

	});
	console.log(anotherArray);
}

const acquireDetail =  (results) => {
	results.forEach( (result) => {
		const htmlResult = result.data;
		let $ = cheerio.load(htmlResult);
		let hackerOneLink = $('div.advisory-description ul').children().first().find('a').attr('href');
		anotherArray[hackerOneLink+'.json'] = processedData[result.config.url];
		anotherArray[hackerOneLink+'.json'].hackerOneLink = hackerOneLink;

		// console.log(hackerOneLink);
		wqwq.push(axios.get(hackerOneLink+'.json'));
	});
	Promise.all(wqwq.map(toResultObject)).then(scrapeHackerone);
}


const processData = (results) => {

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
	Promise.all(detailPromises).then(acquireDetail).catch(errorHandling);
}


let promises = [];
[...Array(lastCounter).keys()].forEach( 
	counter => promises.push( axios.get(`${url}${counter+1}`))
);

Promise.all(promises).then(processData).catch(errorHandling);