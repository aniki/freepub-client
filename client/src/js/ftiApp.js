export default () => {
    const domain = 'localhost:8888';

    return {
        domain: '',
        books: [], // search results
        q: '', // search query
        currentBook: {
            captcha: '',
            code: '',
            downloadUrl: ''
        },

        async init() {
            // localStorage sync
            this.books = JSON.parse(localStorage.getItem('books')) || [];
            // get domain
            this.domain = await fetch(`http://${domain}/.netlify/functions/init`)
                .then(
                    async (response) => {
                        const res = await response.json()
                        return res.domain;
                    }
                )
        },
        async query() {
            // search query
            const res = await fetch(`http://${domain}/.netlify/functions/search?q=${this.q}`)
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
                const data = { filename, directory };
                const res = await fetch(`http://${domain}/.netlify/functions/captcha?filename=${filename}&directory=${directory}`)
                    .then(
                        async (response) => {
                            const res = await response.json()
                            return res
                        }
                    )
                this.currentBook = {...this.currentBook, filename, directory};
                this.currentBook.captcha = `data:image/png;base64, ${res.captcha}`;
            }
        },
        download(e) {
            const {filename, directory, code} = this.currentBook;

            const url = `http://${domain}/.netlify/functions/download?filename=${filename}&directory=${directory}&code=${code}`

            this.currentBook.code = '';
            this.currentBook.downloadUrl = url;

            console.log(url)
        }
    }
}
 