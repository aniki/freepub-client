const cheerio = require('cheerio');
const axios = require('axios').default;
const { domain } = require('../conf');

const handler = async (event, context) => {
  // Parser
  const parser = (html) => {
    const $ = cheerio.load(html);
    const selector = 'body > center > table[bgcolor=#000000] > tbody > tr > td[align=middle] a';
    let data = [];
    $(selector).each((index, element) => {
      const regex = /(javascript:popupup\(')|('\))/g;
      const array = $(element).attr('href').replace(regex, '').split("', '");
      data.push({ filename: array[0], directory: array[1] });
    });
    return data;
  }

  // Query
  const query = event.queryStringParameters.q;
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE'
  };
  const url = `${domain}/search.php?action=showsearchresults&q=+${query}&listyear=20xx&search=Recherche`;

  if (event.httpMethod !== "GET") {
    return res.status(401).json({
      message: "Not allowed"
    });
  }

  return axios.get(url)
    .then(response => {
      const result = parser(response.data);
      // return res.status(200).json({ query, result })
      return {
        statusCode: 200, // <-- Important!
        headers,
        body: JSON.stringify({ query, result })
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
