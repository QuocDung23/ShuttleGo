const { execFileSync } = require('node:child_process');
const path = require('node:path');
const { withFinalizedMod } = require('expo/config-plugins');

module.exports = (config) =>
  withFinalizedMod(config, ['ios', (config) => {
    execFileSync('ruby', [
      path.join(__dirname, 'configure-target.rb'),
      config.modRequest.platformProjectRoot,
      config.ios.bundleIdentifier,
    ], { stdio: 'inherit' });
    return config;
  }]);
