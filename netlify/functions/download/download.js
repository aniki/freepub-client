const axios = require('axios').default;
const { DOMAIN } = process.env;

const handler = async (event) => {

  try {
    const q = {
      filename: event.queryStringParameters.filename,
      directory: event.queryStringParameters.directory,
      code: event.queryStringParameters.code
    };
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
      'responseType':'blob'
    };
    const url = `https://${DOMAIN}/upload.php?action=download&directory=${q.directory}&filename=${q.filename}&valcodeup=${q.code}`;

    return axios({ url, method: 'GET', responseType: 'blob' })
      .then(response => {
        const res = response;
        return res;
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
          headers: { 
            ...response.headers,
            ...headers },
          body: response.data,
        }
      })

  } catch (error) {
    return { statusCode: 500, headers, body: error.toString() }
  }
}

module.exports = { handler }

// https://fourtoutici.ac/upload.php?action=download&directory=%2F2021%2F2021-06%2F2021-06-04&filename=EBOOK+Rob+Chilson+-+La+cite+des+robots+dIsaac+Asimov++Refuge.epub&valcodeup=d414

// Your function response must have a string body. You gave: [object Object]