var renderer = new window.marked.Renderer();


// Override function
renderer.heading = function (text, level) {
    const escapedText = text.toLowerCase().replace(/[^\w]+/g, '-');
    return `<header-anchor :level='${escape(level)}' anchor='${escapedText}'>${escape(text)}</header-anchor>`;
};

renderer.code = function (code, language) {
    return `</div><code-highlighter language='${escape(language)}'>${escape(code)}</code-highlighter><div class="container content">`;
};

window.marked.setOptions({
    gfm: true,
    tables: true,
    breaks: true,
    sanitize: true,
    renderer: renderer
});