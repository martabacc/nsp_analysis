import cheerio from 'cheerio';
import { removeStopwords } from 'stopword';
import { gatheredIndex, isUrlOrEmpty, log } from '../util';

export const clean = (data) => {
  log('info', `Started cleaning data`);
  const arr = Object.keys(data).map((key) => data[key]).map((value) => {

    const indexToClean = gatheredIndex[0];
    const htmlDescription = value[indexToClean];

    if (value.isPrivate || !htmlDescription) return {
      ...value,
      description: null,
      impact: null,
      slicedDescription: null,
      slicedImpact: null
    };
    const $ = cheerio.load(htmlDescription);
    const description = $('h2#vulnerability-description')
    .next()
    .text()
    .replace(/(<([^>]+)>)/ig, '')
    .replace(/\&gt\;/g, '>')
    .replace(/\&lt\;/g, '<')
    .replace(/\&\#39\;/g, '"')
    .replace(/\&quot;/g, '« »')
    .replace(/(<([^>]+)>)/ig, '');
    const impact = $('h2#impact')
    .next()
    .text()
    .replace(/(<([^>]+)>)/ig, '')
    .replace(/\&gt\;/g, '>')
    .replace(/\&lt\;/g, '<')
    .replace(/\&\#39\;/g, '"')
    .replace(/\&quot;/g, '"')
    .replace(/(<([^>]+)>)/ig, '');
    const cobaString = htmlDescription.replace(/(<([^>]+)>)/ig, '').replace(/\&gt\;/g, '>').replace(
        /\&lt\;/g, '<').replace(/\&\#39\;/g, '"').replace(/\&quot;/g, '« »').replace(
        /(<([^>]+)>)/ig, '').replace(/([:\-\>!\\\n])/g, ' ');
    const slicedDescription = removeStopwords(cobaString.split(' ').filter(isUrlOrEmpty)).join(' ');
    const slicedImpact = removeStopwords(impact.split(' ').filter(isUrlOrEmpty)).join(' ');
    return {
      ...value,
      description,
      impact,
      slicedDescription,
      slicedImpact
    };
  });
  log('info', `Finished cleaning data`);
  return arr;
};
