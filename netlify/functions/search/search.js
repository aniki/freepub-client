const cheerio = require('cheerio');
const axios = require('axios').default;
const { DOMAIN } = process.env;

const handler = async (event, context) => {
  // Parser
  const parser = (html) => {
    const $ = cheerio.load(html);
    const rowSelector = 'body > center > table[bgcolor=#000000] > tbody > tr';
    let data = [];
    $(rowSelector).each((index, element) => {
      if ($(element).find('a').length != 0) {
        // const typeImg = $(element).find('img').attr('src').trim().match(/i.*\/([^\.]+)\.(png|jpg|jpeg|gif)$/)[1]; // plus générique : .*\/([^\.]+)\.(png|jpg|jpeg)  - n'importe quelle extensions : .*\/([^\.]+)\.[\w]{3,4}    
        const linkElement = $(element).find('a');
        const file = $(linkElement).attr('href').replace(/(javascript:popupup\(')|('\))/g, '').split("', '");
        const filename = file[0];
        const directory = file[1];
        const typeRegex = /(EBOOK|BANDE DESSINEE|AUDIOBOOK|[A-Z]*)( .*)/;
        const type = typeFix(file[0].match(typeRegex)[1].toLowerCase());
        const title = file[0].match(typeRegex)[2];
        const size = $(element).find('div[align=right] font').text().trim();

        data.push({ filename, directory, title, type, size });
      }
    });
    return data;
  }

  // Type fix
  const typeFix = (type) => {
    let fixedType = ''
    switch (type) {
      case '':
        fixedType = 'ebook';
        break;
      case 'bande dessinee':
        fixedType = 'BD';
        break;
      case 'audiobook':
      case 'auudiobook':
        fixedType = 'audio book';
        break;
      default:
        fixedType = type;
    }
    return fixedType;
  }

  // Query
  const query = event.queryStringParameters.q;
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE'
  };
  const url = `https://${DOMAIN}/search.php?action=showsearchresults&q=+${query}&listyear=20xx&search=Recherche`;

  if (event.httpMethod !== "GET") {
    return res.status(401).json({
      message: "Not allowed"
    });
  }

  return axios.get(url)
    .then(response => {
      const results = parser(response.data);
      // return res.status(200).json({ query, result })
      return {
        statusCode: 200, // <-- Important!
        headers,
        body: JSON.stringify({ query, results })
      };
    })
    .catch(err => {
      return {
        statusCode: 500, // <-- Important!
        headers,
        body: JSON.stringify({ error: err })
      };
    })
}

module.exports = { handler }
