export default class {
    constructor() {

        var renderer = new window.marked.Renderer();

        // Override function
        renderer.heading = function (text, level) {
            return `<header-presenter :level='${level}'>${text}</header-presenter>`;
        };

        renderer.code = function (code, language) {
            return `</div></section><code-presenter language='${escape(language)}'>${escape(code)}</code-presenter><section class="section"><div class="container">`;
        };

        renderer.image = function (href, title, text) {
            return `<image-presenter href='${href}' title='${title}'>${text}</image-presenter>`;
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