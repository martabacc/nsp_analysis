import winston, { format } from 'winston';

const myFormat = format.printf(
    info => `${info.timestamp} [${info.label}] ${info.level}: ${info.message}`);

const logger = winston.createLogger({
  format: format.combine(
      format.label({ label: 'NSP Scraper' }),
      format.colorize(),
      format.timestamp(),
      myFormat
  ),
  transports: [new winston.transports.Console()]
});

const errorHandling = (error) => {
  logger.log({
    level: 'error',
    message: `[ERROR] ${error}`
  });
};

const toResultObject = (promise) => {
  return promise
  .then(result => ({ success: true, result }))
  .catch(error => {
    if(!error.config) console.log(error);
    errorHandling(
        `Got ERROR on ${error.config.url || JSON.stringify(error)}`
    );
    return { success: false, result: error, error }
  });
};

const gatheredIndex = [
  'vulnerability_information_html', //the markdown is here
  'title',
  'created_at',
  'disclosed_at'
];

const log = (level, message) => logger.log({ level, message });

const pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name and extension
    '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
    '(\\:\\d+)?' + // port
    '(\\/[-a-z\\d%@_.~+&:]*)*' + // path
    '(\\?[;&a-z\\d%@_.,~+&:=-]*)?' + // query string
    '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator

const isUrlOrEmpty = (str) => {
  return !pattern.test(str) || str.length === 0;
};

module.exports = {
  log,
  gatheredIndex,
  errorHandling,
  toResultObject,
  isUrlOrEmpty
};


