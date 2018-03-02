var renderer = new window.marked.Renderer();


// Override function
renderer.heading = function (text, level) {
    const escapedText = text.toLowerCase().replace(/[^\w]+/g, '-');
    return `<h${level}><header-anchor :level='${level}' anchor='${escapedText}'>${text}</header-anchor></h${level}>`;
};

window.marked.setOptions({
    gfm: true,
    tables: true,
    breaks: true,
    sanitize: true,
    renderer: renderer
});