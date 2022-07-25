const prettify = require('html-prettify');
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const md = require('markdown-it')({ html: true });

module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(syntaxHighlight);

  eleventyConfig.addPassthroughCopy('./src/static');

  eleventyConfig.addPairedShortcode('prettify', (content) => {
    return prettify(content);
  });

  eleventyConfig.addFilter('console', function(value) {
    return JSON.stringify(value, null, 2);
  });

  eleventyConfig.addPairedShortcode('markdown', (content) => {
    return md.render(content);
  });

  eleventyConfig.addPairedShortcode('brace', function(content, type = 'curly') {
    const [opening, closing] = {
      curly: ['{{', '}}'],
      silent: ['{%-', '-%}']
    }[type];
    return `${opening}${content}${closing}`;
  });

  return {
    dir: {
      input: 'src',
      output: 'dist'
    },
    templateFormats: [
      'html',
      'md',
      'njk'
    ],
    passthroughFileCopy: true,
  }
}
