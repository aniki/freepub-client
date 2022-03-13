import { i18n } from './i18n';

export default () => {
    const domain = 'https://fti-search.netlify.app';

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
        isDownloadable: false,

        async init() {
            console.log(i18n);
            // localStorage sync
            this.books = JSON.parse(localStorage.getItem('books')) || [];
            // get domain
            this.api_domain = await fetch(`${domain}/.netlify/functions/init`)
                .then(
                    async (response) => {
                        const res = await response.json()
                        return res.domain;
                    }
                )
        },
        async query() {
            // search query
            const res = await fetch(`${domain}/.netlify/functions/search?q=${this.q}`)
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
        },
        async captcha(e, filename, directory) {
            if (e) {
                const res = await fetch(`${domain}/.netlify/functions/captcha?filename=${filename}&directory=${directory}`)
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
            const url = await fetch(`${domain}/.netlify/functions/download?filename=${filename}&directory=${directory}&code=${code}`)
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
