import fs from 'fs';
import { outFile } from '../const';
import { log } from '../util';

export const exportToCsv = (finalResult) => {
  log('info', `Start exporting CSV`);
  const e = finalResult;

  const file = fs.createWriteStream(outFile);
  const Json2csvParser = require('json2csv').Parser;
  const parser = new Json2csvParser();
  const csv = parser.parse(e);
  file.write(csv);

  log('info', `CSV generated in ${outFile}.`);
};
