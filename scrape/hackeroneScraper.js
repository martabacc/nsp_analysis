import { exportToCsv } from '../ops/exportToCsv';
import { gatheredIndex, log } from '../util';

export const hackeroneScrape = (anotherArray) => (results) => {

  log('info', 'Promise hackerOne resolved, curating object for CSV ');

  let publicReport = 0;
  let privateReport = 0;
  let finalResult = anotherArray;

  results.forEach((result) => {
    if (!result.success) {
      const idx = result.error.config.url;

      log('warn', `[Private] ${finalResult[idx]['title']} issue is Private`);
      privateReport++;
      finalResult[idx].isPrivate = true;
      gatheredIndex.forEach(gIdx => finalResult[idx][gIdx] = null);
      return;
    }

    const idx = result.result.config.url;
    log('info', `[Public ] ${finalResult[idx]['title']}  issue is public.`);
    publicReport++;
    finalResult[idx].isPrivate = false;
    const data = result.result.data;
    gatheredIndex.forEach(gIdx => finalResult[idx][gIdx] = data[gIdx]);
  });

  log('info', `Finish curating hackerOne jsons. Result: ${privateReport} private, ${publicReport} public`);

  return finalResult;
};
