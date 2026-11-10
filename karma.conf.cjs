const fs = require('fs');
const path = require('path');

// 1. Detección automática de ejecutable de Chrome, Brave o Edge en Windows
const localAppData = process.env.LOCALAPPDATA || '';
const programFiles = process.env['ProgramFiles'] || 'C:\\Program Files';
const programFilesX86 = process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)';

const possiblePaths = [
  path.join(programFiles, 'Google\\Chrome\\Application\\chrome.exe'),
  path.join(programFilesX86, 'Google\\Chrome\\Application\\chrome.exe'),
  path.join(localAppData, 'Google\\Chrome\\Application\\chrome.exe'),
  path.join(programFiles, 'BraveSoftware\\Brave-Browser\\Application\\brave.exe'),
  path.join(programFilesX86, 'BraveSoftware\\Brave-Browser\\Application\\brave.exe'),
  path.join(localAppData, 'BraveSoftware\\Brave-Browser\\Application\\brave.exe'),
  path.join(programFiles, 'Microsoft\\Edge\\Application\\msedge.exe'),
  path.join(programFilesX86, 'Microsoft\\Edge\\Application\\msedge.exe'),
];

for (const p of possiblePaths) {
  if (p && fs.existsSync(p)) {
    process.env.CHROME_BIN = p;
    break;
  }
}

const instrumenter = require('./karma.coverage-plugin.cjs');

// 2. Plugin custom para resolver el descalce entre .js y .jsx de karma-esbuild
const fixJsxResolutionPlugin = {
  name: 'fix-jsx-resolution',
  setup(build) {
    build.onResolve({ filter: /\.js$/ }, (args) => {
      if (args.path.endsWith('.test.js')) {
        const jsxPath = args.path.replace(/\.js$/, '.jsx');
        if (fs.existsSync(jsxPath)) {
          return { path: jsxPath };
        }
      }
    });
  },
};

module.exports = function (config) {
  config.set({
    frameworks: ['jasmine'],
    plugins: [
      'karma-jasmine',
      'karma-chrome-launcher',
      'karma-esbuild',
      'karma-coverage',
      'karma-spec-reporter',
    ],
    files: [
      { pattern: 'test/**/*.spec.js', watched: false },
      { pattern: 'js/**/*.test.jsx', watched: false },
    ],
    preprocessors: {
      'test/**/*.spec.js': ['esbuild'],
      'js/**/*.test.jsx': ['esbuild'],
    },
    esbuild: {
      jsx: 'automatic',
      loader: {
        '.js': 'jsx',
        '.jsx': 'jsx',
        '.css': 'text',
        '.svg': 'text',
        '.png': 'dataurl',
        '.jpg': 'dataurl',
      },
      define: { 'process.env.NODE_ENV': '"development"' },
      plugins: [fixJsxResolutionPlugin, instrumenter],
      singleBundle: false,
    },
    reporters: ['spec', 'coverage'],
    coverageReporter: {
      dir: 'coverage',
      reporters: [
        { type: 'html', subdir: 'html' },
        { type: 'text-summary' },
        { type: 'text' },
      ],
    },
    browsers: ['ChromeHeadlessCI'],
    customLaunchers: {
      ChromeHeadlessCI: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox', '--disable-gpu'],
      },
    },
    singleRun: true,
  });
};