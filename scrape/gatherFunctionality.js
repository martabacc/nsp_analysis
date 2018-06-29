import axios from 'axios';
import cheerio from 'cheerio';
import { removeStopwords } from 'stopword';
import { githubToken } from '../const';

export const gatherFunctionality = async (dataArray) => {
  return await Promise.all(
      dataArray.map(async (value) => {
        const { moduleLink } = value;
        const { data } = await axios.get(moduleLink);
        let $ = cheerio.load(data);

        const keywords = $('a.dependency__sectionWordCloud___1Ja0f')
        .map((i, el) => $(el).text()).get().join(' ');
        const githubUrl = $('span.package__githubIcon___3R9ox').closest('a').attr('href') || '';
        const githubApiUrl = githubUrl.replace('github.com', 'api.github.com/repos');

        const githubResult = await axios.get(githubApiUrl + `?access_token=${githubToken}`).catch(e => e);

        const githubDescription = githubResult.status === 200 ? githubResult.data.description.split(' ') : [];
        return {
          ...value,
          functionality: removeStopwords(githubDescription).join(' '),
          keywords
        };
      })
  );
};
