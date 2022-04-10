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
      .then(async response => {
        const res = response;
        const cookies = event.headers.cookie;
        // axios.defaults.headers.cookie = res.headers['set-cookie'];
        const {captcha, captcha_response} = await getBase64Image(parser(res.data), cookies);
        return { cookies, captcha, captcha_response };
      })
      .catch(err => {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: err }),
        }
      })
      .then(response => {
        const { cookies, captcha, captcha_response } = response;
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ q: { filename: q.filename, directory: q.directory }, cookies, captcha, captcha_response: response }),
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
const getBase64Image = (url, cookies) => {
  return axios
    .get(url, {
      responseType: 'arraybuffer',
      headers: {
        // cookie: cookies,
      },
    })
    .then((response) => {
      const res = response;
      return {captcha : Buffer.from(res.data, 'binary').toString('base64'), captcha_response: res.headers['set-cookie']};
    })
}

module.exports = { handler }
