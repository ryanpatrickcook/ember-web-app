/* eslint-env node */
'use strict';

const path = require('path');
const getManifestConfiguration = require('./lib/get-manifest-configuration');
const BroccoliMergeTrees = require('broccoli-merge-trees');

const MANIFEST_NAME = 'manifest.webmanifest';
const BROWSERCONFIG_NAME = 'browserconfig.xml';

module.exports = {
  name: 'ember-web-app',

  shouldIncludeChildAddon(childAddon) {
    if (childAddon.name === 'broccoli-asset-rev') {
      return false;
    }

    return this._super.shouldIncludeChildAddon.apply(this, arguments);
  },

  included(app) {
    this.app = app;
    app.options = app.options || {};

    this.addonBuildConfig = this.app.options['ember-web-app'] || {};

    if (!this._disabled()) {
      this._configureFingerprint();
      this.manifestConfiguration = getManifestConfiguration(this.app.project, this.app.env);
    }

    this._super.included.apply(this, arguments);
  },

  treeFor() {
    if (this._disabled()) {
      return;
    }

    return this._super.treeFor.apply(this, arguments);
  },

  treeForPublic() {
    const configPath = path.join(this.app.project.root, 'config');

    const GenerateManifest = require('./lib/broccoli/generate-manifest-json');
    const manifest = new GenerateManifest(configPath, {
      manifestName: this.addonBuildConfig.filename || MANIFEST_NAME,
      project: this.app.project,
      env: this.app.env,
      ui: this.ui
    });

    const GenerateBrowserconfig = require('./lib/broccoli/generate-browserconfig-xml');
    const browserconfig = new GenerateBrowserconfig(configPath, {
      browserconfigName: BROWSERCONFIG_NAME,
      project: this.app.project,
      env: this.app.env,
      ui: this.ui
    });

    return new BroccoliMergeTrees([manifest, browserconfig]);
  },

  contentFor(section, config) {
    if (this._disabled()) {
      return;
    }

    let contentForSection = this.addonBuildConfig.contentForSection || 'head';

    if (section === contentForSection) {
      let tags = [];

      tags = tags.concat(require('./lib/android-link-tags')(config, this.addonBuildConfig.filename || MANIFEST_NAME));
      tags = tags.concat(require('./lib/apple-link-tags')(this.manifestConfiguration, config));
      tags = tags.concat(require('./lib/safari-pinned-tab-tags')(this.manifestConfiguration, config));
      tags = tags.concat(require('./lib/favicon-link-tags')(this.manifestConfiguration, config));

      tags = tags.concat(require('./lib/android-meta-tags')(this.manifestConfiguration, config));
      tags = tags.concat(require('./lib/apple-meta-tags')(this.manifestConfiguration, config));
      tags = tags.concat(require('./lib/ms-meta-tags')(this.manifestConfiguration, config, BROWSERCONFIG_NAME));

      return tags.join('\n');
    }
  },

  _configureFingerprint() {
    let configureFingerprint = require('./lib/configure-fingerprint');

    this.app.options.fingerprint = configureFingerprint(
      this.app.options.fingerprint, this.addonBuildConfig.filename || MANIFEST_NAME
    );

    this.app.options.fingerprint = configureFingerprint(
      this.app.options.fingerprint, BROWSERCONFIG_NAME
    );
  },

  _disabled() {
    return this.addonBuildConfig.enabled === false;
  }
};
