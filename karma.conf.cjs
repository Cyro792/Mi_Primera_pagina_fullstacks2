const instrumentar = require('./karma.coverage-plugin.cjs')

module.exports = function (config) {
  config.set({
    frameworks: ['jasmine'],
    plugins: ['karma-jasmine', 'karma-chrome-launcher', 'karma-esbuild', 'karma-coverage', 'karma-spec-reporter'],
    files: [{ pattern: 'test/**/*.spec.js', watched: false }],
    preprocessors: { 'test/**/*.spec.js': ['esbuild'] },
    esbuild: {
      jsx: 'automatic',
      loader: { '.js': 'jsx' },
      define: { 'process.env.NODE_ENV': '"development"' },
      plugins: [instrumentar],
      singleBundle: false,
    },
    reporters: ['spec', 'coverage'],
    coverageReporter: {
      dir: 'coverage',
      reporters: [{ type: 'html', subdir: 'html' }, { type: 'text-summary' }, { type: 'text' }, { type: 'lcovonly', subdir: '.' }],
    },
    browsers: ['ChromeHeadlessCI'],
    customLaunchers: { ChromeHeadlessCI: { base: 'ChromeHeadless', flags: ['--no-sandbox', '--disable-gpu'] } },
    singleRun: true,
  })
}
