export default class {
    constructor() {
        var renderer = new window.marked.Renderer();

        // Override function
        renderer.heading = function (text, level) {
            const slug = text.toLowerCase().replace(/[^\w]+/g, '-');
            return `<header-anchor :level='${escape(level)}' anchor='${slug}'>${escape(text)}</header-anchor>`;
        };

        renderer.code = function (code, language) {
            return `</div></section><code-presenter language='${escape(language)}'>${escape(code)}</code-presenter><section class="section"><div class="container content">`;
        };

        window.marked.setOptions({
            gfm: true,
            tables: true,
            breaks: true,
            sanitize: true,
            renderer: renderer
        });
    }
}