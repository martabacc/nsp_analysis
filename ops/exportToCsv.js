import jsonexport from 'jsonexport';
import { outFile } from '../const';
import fs from 'fs';
import { errorHandling, log } from '../util';

export const exportToCsv = (finalResult) => {
  log('info', `Start exporting CSV`);

  const arr = Object.keys(finalResult).map((key) => finalResult[key]);

  jsonexport(arr, (err, csv) => {
    if (err) errorHandling(err);
    fs.writeFile(outFile, csv, (err) => {
      if (err) return errorHandling(err);
    });
  });

  log('info', `Finish. CSV is generated in ${outFile}.`);
  return finalResult;
};
