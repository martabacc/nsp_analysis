import dotenv from 'dotenv';

dotenv.load();
const outFile = process.env.OUTFILE;
const lastCounter = process.env.REPORT_LIMIT;
const url = process.env.URL;
const detailUrl = process.env.DETAIL_URL;
const githubToken = process.env.GITHUB_TOKEN;
const synkLimit = process.env.SYNK_LIMIT;
const synkUrl = process.env.SYNK_URL;
const synkDetailUrl = process.env.SYNK_DETAIL_URL;
const synkOutfile = process.env.SYNK_OUTFILE;

module.exports = {
  outFile,
  lastCounter,
  url,
  detailUrl,
  githubToken,
  synkUrl,
  synkDetailUrl,
  synkLimit,
  synkOutfile
};

