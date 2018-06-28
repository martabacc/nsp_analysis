
require('dotenv').load();
const request = require('request');
const cheerio = require('cheerio');
const axios = require('axios');
const Base64 = require('base-64')
const lastCounter = 1;
const url = `https://nodesecurity.io/advisories?page=`;
const detailUrl = 'https://nodesecurity.io';
 	
let data = [];
const processedData = [];	
let detailPromises = [];
let wqwq = [];
let anotherArray = [];

const tok = `${process.env.HO_USERNAME}:${process.env.HO_PASSWORD}`;
const hash = Base64.encode(tok);
const Basic = 'Basic ' + hash;

const errorHandling = (error) => { console.log(error)}

const scrapeHackerone = (results) => {
	console.log(results);
	results.forEach( (result) => {
		const htmlResult = cheerio.load(result.data);
		let $ = cheerio.load(htmlResult);
		console.log(result.data);
		anotherArray[result.config.url].impact = $('body').html();
		anotherArray[result.config.url].stepsToReproduce = $('#steps-to-reproduce').closest('blockquote p').text()
		anotherArray[result.config.url].description = $('#vulnerability-description').closest('blockquote p').text();

	});
	// console.log(anotherArray);
}

const acquireDetail = (results) => {
	results.forEach( (result) => {
		const htmlResult = result.data;
		let $ = cheerio.load(htmlResult);
		let hackerOneLink = $('div.advisory-description ul').children().first().find('a').attr('href');
		anotherArray[hackerOneLink] = processedData[result.config.url];
		anotherArray[hackerOneLink].hackerOneLink = hackerOneLink;


		hackerOneLink = hackerOneLink.replace('hackerone.com/reports','api.hackerone.com/v1/reports');
		console.log(hackerOneLink)
       
		wqwq.push(axios.get(hackerOneLink, {headers : { 'Authorization' : Basic }}));
	});
	Promise.all(wqwq).then(scrapeHackerone);
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