module.exports = function(eleventyConfig) {

    eleventyConfig.addCollection("photo", function(collection) {
        return collection.getFilteredByGlob("photo/**/*.liquid");
    });


// Images
const fs = require('fs');
const path = require('path');
const Image = require('@11ty/eleventy-img');

// ELEVENTY IMG
  // https://www.11ty.dev/docs/plugins/image/#asynchronous-shortcode
  async function imageShortcode(src, alt, sizes = "100vw", page = this.page) {
    if(alt === undefined) {
      // You bet we throw an error on missing alt (alt="" works okay)
      throw new Error(`Missing \`alt\` on responsiveimage from: ${src}`);
    }
    
    /**
     * By default the eleventy image plugin assumes a central folder of images.
     * I store images in the same directory where they're used.
     * page contains the current page context, so we can use
     * path.dirname to get the current image context
     */
    let imageSrc = `${path.dirname(page.inputPath)}/${src}`;
    // let imageSrc = src;

    let metadata = await Image(imageSrc, {
      widths: [400, 600, 800, 1200, 1500, 2400],
      formats: ['avif', null],
      outputDir: path.dirname(page.outputPath),
      urlPath: page.url,
      hashLength: 12,
      filenameFormat: function (id, src, width, format, options) {
        const extension = path.extname(src);
        const name = path.basename(src, extension);   
        return `${name}-${id}-${width}w.${format}`;
      }
    });
    
    /**
     * `originalImg` is the original, but after dir/filename processing.
     * - `metadata` contains an object of all processed images;
     * - Object.values is an arrayified version of the metadata;
     * - Original image format is always the last array;
     * - Full-sized image is always the last item in the last array;
     * - requires .at(), only available in Node.js 16.6 and up
     * @cite https://mailchi.mp/webtoolsweekly/web-tools-454?e=73a9401058
     * @cite https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/at
    */
    let originalImg = Object.values(metadata).at(-1).at(-1);

    return `
    <picture>
      ${Object.values(metadata).map(imageFormat => {
        return `
        <source type="${imageFormat[0].sourceType}" srcset="${imageFormat.map(entry => entry.srcset).join(", ")}" sizes="${sizes}">`;
      }).join("\n")}
        
        <img
          src="${originalImg.url}"
          width="${originalImg.width}"
          height="${originalImg.height}"
          alt="${alt}"
          loading="lazy"
          decoding="async">

    </picture>`;
  }
  eleventyConfig.addLiquidShortcode("image", imageShortcode);

}
