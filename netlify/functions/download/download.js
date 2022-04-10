const { DOMAIN , API_KEY, APP_ID, AUTH_DOMAIN, PROJECT_ID, STORAGE_BUCKET } = process.env;

const { initializeApp } = require('firebase/app');
const { getStorage, getDownloadURL, ref, uploadBytes } = require("firebase/storage");
const firebaseConfig = {
  apiKey: API_KEY,
  authDomain: AUTH_DOMAIN,
  projectId: PROJECT_ID,
  storageBucket: STORAGE_BUCKET,
  appId: APP_ID
};
const app = initializeApp(firebaseConfig);

const fetch = require('node-fetch');

const handler = async (event) => {

  try {
    const q = {
      filename: event.queryStringParameters.filename,
      directory: event.queryStringParameters.directory,
      code: event.queryStringParameters.code
    };
    const cookie = event.headers.cookie;
    const cors_headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
      'Access-Control-Expose-Headers': 'Content-Disposition',
      'responseType': 'arraybuffer',
      'credentials': 'include',
    };
    const url = `https://${DOMAIN}/upload.php?action=download&directory=${q.directory}&filename=${encodeURI(q.filename)}&valcodeup=${q.code}`;
    const response = await fetch(url).then((res) => {
      return res
    });
    const content_type = response.headers.get('content-type');
    const buffer = await response.buffer();
    const storage = getStorage();
    const fileRef = ref(storage, `uploads/${q.filename}`);
    const fileUrl = await uploadBytes(fileRef, buffer).then((snapshot) => {
      return getDownloadURL(snapshot.ref);
    });

    return {
      statusCode: 200,
      headers: {...cors_headers, ...{cookie}},
      body: JSON.stringify({ cookie, url, fileUrl }),
    }

  } catch (error) {
    return { statusCode: 500, body: error.toString() }
  }
}

module.exports = { handler }

// https://fourtoutici.ac/upload.php?action=download&directory=%2F2021%2F2021-06%2F2021-06-04&filename=EBOOK+Rob+Chilson+-+La+cite+des+robots+dIsaac+Asimov++Refuge.epub&valcodeup=d414

