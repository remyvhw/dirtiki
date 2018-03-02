var renderer = new window.marked.Renderer();


// Override function
renderer.heading = function (text, level) {
    const escapedText = text.toLowerCase().replace(/[^\w]+/g, '-');
    return `<h${level}>
            <a name="'${escapedText}'" class="anchor" href="#${escapedText}"></a>
            ${text}
          </h${level}><header-anchor></header-anchor>`;
};

window.marked.setOptions({
    gfm: true,
    tables: true,
    breaks: true,
    sanitize: true,
    renderer: renderer
});