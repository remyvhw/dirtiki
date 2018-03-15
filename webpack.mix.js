let mix = require('laravel-mix');

/*
 |--------------------------------------------------------------------------
 | Mix Asset Management
 |--------------------------------------------------------------------------
 |
 | Mix provides a clean, fluent API for defining some Webpack build steps
 | for your Laravel application. By default, we are compiling the Sass
 | file for the application as well as bundling up all the JS files.
 |
 */

const prismLanguages = [
    "prismjs/components/prism-sql",
    "prismjs/components/prism-json",
    "prismjs/components/prism-java",
    "prismjs/components/prism-csharp",
    "prismjs/components/prism-python",
    "prismjs/components/prism-php",
    "prismjs/components/prism-typescript",
    "prismjs/components/prism-ruby",
    "prismjs/components/prism-swift",
];


mix.js('resources/assets/js/app.js', 'public/js').extract(prismLanguages.concat(['vue', 'axios', 'collect.js', 'prismjs', "diff"]))
    .sass('resources/assets/sass/app.scss', 'public/css');

if (mix.inProduction()) {
    mix.version();
}
