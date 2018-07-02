import axios from 'axios';
import axiosRetry from 'axios-retry';
import cheerio from 'cheerio';
import { removeStopwords } from 'stopword';
import { githubToken } from '../const';
import { log, toResultObject, errorHandling } from '../util';

const randomTimeoutDelay = () => Math.floor(Math.random() * 1000);

export const gatherFunctionality = async (dataArray) => {

  log('info', 'Started gathering functionality');
  const res = await Promise.all(
      dataArray.map(async (value) => {
        const { moduleLink } = value;
        const npmGetResult = await axios.get(moduleLink);
        let $ = cheerio.load(npmGetResult.data);

        const keywords = $('a.dependency__sectionWordCloud___1Ja0f')
        .map((i, el) => $(el).text()).get().join(' ');
        const githubUrl = $('span.package__githubIcon___3R9ox').closest('a').attr('href') || '';
        const githubApiUrl = githubUrl.replace('github.com', 'api.github.com/repos');

        axiosRetry(axios, {
          retryDelay:  (r) => r*1000,
          shouldResetTimeout: true,
          retryCondition: () => true
        });
        const githubResult = await axios.get(githubApiUrl + `?access_token=${githubToken}`).catch(errorHandling) || "";

        const {status, data} = githubResult;
        const isValidGitApiResponse = status === 200 && data.description;
        const githubDescription = isValidGitApiResponse ? githubResult.data.description.split(
            ' ') : [];
        return {
          ...value,
          functionality: removeStopwords(githubDescription).join(' '),
          keywords
        };
      })
  );

  log('info', 'Finish gather functionality');
  return res;
};
