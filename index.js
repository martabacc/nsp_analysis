
const request = require('request');
const cheerio = require('cheerio');
const axios = require('axios');
const lastCounter = 61;
const url = `https://nodesecurity.io/advisories?page=`;

let data = [];

const errorHandling = (error) => { console.log(error)}

const processData = (results) => {
	const processedData = [];

	results.forEach( result => {
		const htmlResult = result.data;
		let $ = cheerio.load(htmlResult);


		$('.advisories-table tbody tr').each( (idx, child) => {
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
			processedData.push(scrapedData)
		});
	});
	console.log(processedData);
}


let promises = [];
[...Array(lastCounter).keys()].forEach( 
	counter => promises.push( axios.get(`${url}${counter+1}`))
);

Promise.all(promises).then(processData).catch(errorHandling);