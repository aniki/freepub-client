const cheerio = require('cheerio');
const axios = require('axios').default;
const { DOMAIN } = process.env;

const handler = async (event) => {

  try {
    const q = { filename: event.queryStringParameters.filename, directory: event.queryStringParameters.directory };
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE'
    };  
    const url = `https://${DOMAIN}/upload.php?action=downloadfile&filename=${q.filename}&directory=${q.directory}&`;

    if (event.httpMethod !== "GET") {
      return {
        statusCode: 401,
        headers,
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
          headers,
          body: JSON.stringify({ error: err }),
        }
      })
      .then(response => {
        return {
          statusCode: 200,
          headers,
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
  return `http://${DOMAIN}/${path}`;
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
