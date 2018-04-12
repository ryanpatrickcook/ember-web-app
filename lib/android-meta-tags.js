'use strict';

module.exports = androidMetaTags;

function androidMetaTags(manifest) {
  let tags = [];

  if (manifest.name) {
    tags.push('<meta name="application-name" content="' + manifest.name + '">');
  }

  if (manifest.theme_color) {
    tags.push('<meta name="theme-color" content="' + manifest.theme_color + '">');
  }

  return tags;
}
