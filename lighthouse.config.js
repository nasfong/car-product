module.exports = {
  extends: 'lighthouse:default',
  settings: {
    formFactor: 'desktop',
    screenEmulation: {
      mobile: false,
      width: 1350,
      height: 940,
      deviceScaleFactor: 1,
      disabled: false
    },
    throttling: {
      rttMs: 40,
      throughputKbps: 11024,
      cpuSlowdownMultiplier: 1
    },
    onlyCategories: [
      'performance',
      'accessibility',
      'best-practices',
      'seo'
    ]
  }
};
