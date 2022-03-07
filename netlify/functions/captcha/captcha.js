const cheerio = require('cheerio');
const axios = require('axios').default;
const { domain } = require('../conf');

const handler = async (event) => {

  try {
    const q = { filename: event.queryStringParameters.filename, directory: event.queryStringParameters.directory };
    const url = `${domain}/upload.php?action=downloadfile&filename=${q.filename}&directory=${q.directory}&`;

    if (event.httpMethod !== "GET") {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: "Not allowed" }),
      }
    }

    return axios.get(url)
      .then(response => {
        return getBase64Image(parser(response.data));
      })
      .catch(err => {
        return {
          statusCode: 500,
          body: JSON.stringify({ error: err }),
        }
      })
      .then(response => {
        return {
          statusCode: 200,
          body: JSON.stringify({ q: { filename: q.filename, directory: q.directory }, captcha : response }),
        }
      })

  } catch (error) {
    return { statusCode: 500, body: error.toString() }
  }
}

// Captcha image url Parser
const parser = (html) => {
  const $ = cheerio.load(html);
  const selector = 'body > center > table[bgcolor=#000000] img';
  const path = $(selector).attr('src');
  console.log(path);
  return `${domain}/${path}`;
}

// Get Image
const getBase64Image = (url) => {
  console.log('getBase64Image', url);
  return axios
    .get(url, {
      responseType: 'arraybuffer'
    })
    .then(response => Buffer.from(response.data, 'binary').toString('base64'))
}

module.exports = { handler }
