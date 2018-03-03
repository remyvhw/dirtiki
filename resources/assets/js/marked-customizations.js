var renderer = new window.marked.Renderer();


// Override function
renderer.heading = function (text, level) {
    const escapedText = text.toLowerCase().replace(/[^\w]+/g, '-');
    return `<header-anchor :level='${level}' anchor='${escapedText}'>${text}</header-anchor>`;
};

renderer.code = function (code, language) {
    return `<code-highlighter language='${language}'>${code}</code-highlighter>`;
};

window.marked.setOptions({
    gfm: true,
    tables: true,
    breaks: true,
    sanitize: true,
    renderer: renderer
});