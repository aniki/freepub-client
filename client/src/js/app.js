import { i18n } from './i18n';

export default () => {
    const domain = 'http://localhost:8080';
    // const domain = 'https://fti-search.netlify.app';

    return {
        i18n,
        lang: 'fr-FR', // navigator.language
        api_domain: '',
        books: [], // search results
        q: '', // search query
        currentBook: {
            captcha: '',
            code: '',
            downloadUrl: ''
        },
        cookies: [],
        isDownloadable: false,

        async init() {
            // localStorage sync
            this.books = JSON.parse(localStorage.getItem('books')) || [];

            // // get domain
            // this.api_domain = await fetch(`${domain}/.netlify/functions/init`)
            //     .then(
            //         async (response) => {
            //             const res = await response.json()
            //             return res.domain;
            //         }
            //     )
        },
        async query() {
            // search query
            const res = await fetch(`${domain}/search?q=${this.q}`)
                .then(
                    async (response) => {
                        const res = await response.json()
                        return res
                    }
                )

            // state update
            this.books = res.results;
            this.q = '';
            // localStorage update
            localStorage.setItem('books', JSON.stringify(this.books));
            // set cookies for PHPSession
            this.cookies = res.cookies;
            document.cookie = res.cookies;

        },
        async captcha(e, filename, directory) {
            if (e) {
                const res = await fetch(`${domain}/captcha?filename=${filename}&directory=${directory}`, { credentials: "same-origin" })
                    .then(
                        async (response) => {
                            const res = await response.json();
                            return res;
                        }
                    )
                this.currentBook = { ...this.currentBook, filename, directory };
                this.currentBook.captcha = `data:image/png;base64, ${res.captcha}`;
                this.isDownloadable = true;
            }
        },
        async download() {
            const { filename, directory, code } = this.currentBook;
            const options = {
                credentials: "same-origin",
                headers: {
                    // 'Access-Control-Allow-Credentials' : 'same-origin'
                }
            }
            const url = await fetch(`${domain}/download?filename=${filename}&directory=${directory}&code=${code}`, options)
                .then(
                    async (response) => {
                        const res = await response.json();
                        return res.fileUrl;
                    }
                )

            this.currentBook.code = '';
            this.currentBook.downloadUrl = url;

            console.log(url)
        }
    }
}
