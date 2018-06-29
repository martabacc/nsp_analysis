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
  .catch(error => ({ success: false, error }));
};

const gatheredIndex = [
  'vulnerability_information_html', //the markdown is here
  'title',
  'created_at',
  'disclosed_at'
];

const log = (level, message) => logger.log({level, message});

module.exports = {
  log,
  gatheredIndex,
  errorHandling,
  toResultObject
};
