// Plugin de esbuild que instrumenta (istanbul) solo el código de la app para medir cobertura.
const fs = require('fs')
const { createInstrumenter } = require('istanbul-lib-instrument')

const instrumenter = createInstrumenter({ esModules: true, compact: false, parserPlugins: ['jsx'] })

module.exports = {
  name: 'istanbul-instrument',
  setup(build) {
    build.onLoad({ filter: /[\\/]js[\\/](admin[\\/].*|auth)\.jsx?$/ }, (args) => {
      const fuente = fs.readFileSync(args.path, 'utf8')
      return { contents: instrumenter.instrumentSync(fuente, args.path), loader: 'jsx' }
    })
  },
}
