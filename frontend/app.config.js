module.exports = ({ config }) => ({
  ...config,
  ...(process.env.SHUTTLEGO_XCTEST === '1' && {
    ios: { ...config.ios, bundleIdentifier: config.ios?.bundleIdentifier ?? 'vn.shuttlego.app' },
    plugins: [...(config.plugins ?? []), './uitests/withUITests'],
  }),
});
