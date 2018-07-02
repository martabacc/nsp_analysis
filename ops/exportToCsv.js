import fs from 'fs';
import { outFile } from '../const';
import { errorHandling, log } from '../util';

export const exportToCsv = (finalResult) => {
  log('info', `Start exporting CSV`);
  const f = finalResult[0];

  const file = fs.createWriteStream(outFile);
  file.on('error', errorHandling);
  f.forEach(({result}) => {
    const string = Object.keys(result).map(key => result[key]).join(',');
    console.log(string)
    file.write(string + '\n');
  });
  file.end();

  log('info', `CSV generated in ${outFile}.`);
};
