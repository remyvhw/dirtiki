var renderer = new window.marked.Renderer();


// Override function
renderer.heading = function (text, level) {
    const escapedText = text.toLowerCase().replace(/[^\w]+/g, '-');
    return `<header-anchor :level='${escape(level)}' anchor='${escapedText}'>${escape(text)}</header-anchor>`;
};

renderer.code = function (code, language) {
    return `<code-highlighter language='${escape(language)}'>${escape(code)}</code-highlighter>`;
};

renderer.paragraph = function (text) {
    return '<p>' + text + '</p>\n';
};

window.marked.setOptions({
    gfm: true,
    tables: true,
    breaks: true,
    sanitize: true,
    renderer: renderer
});