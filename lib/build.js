const config = require('../lib/config')
const util = require('../lib/util')

const build = (buildConfig = config.defaultBuildConfig, options) => {
  config.buildConfig = buildConfig
  config.update(options)

  if (!options.no_branding_update) {
    util.updateBranding()
  }

  if (!options.no_extension_update) {
    util.updateExtensionManifest()
  }

  util.buildMuon()
}

module.exports = build
