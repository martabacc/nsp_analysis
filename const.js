import dotenv from 'dotenv';

dotenv.load();
const outFile = process.env.OUTFILE;
const lastCounter = process.env.REPORT_LIMIT;
const url = process.env.URL;
const detailUrl = process.env.DETAIL_URL;
const githubToken = process.env.GITHUB_TOKEN;

module.exports = {
  outFile,
  lastCounter,
  url,
  detailUrl,
  githubToken
};

