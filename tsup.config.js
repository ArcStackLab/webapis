import { defineConfig } from 'tsup'

const config = defineConfig((options) => {
  if (options.minify) {
    return {
      splitting: false,
      sourcemap: false,
      dts: false,
      clean: false,
      platform: 'browser',
      format: ['esm'],
      outExtension() {
        return {
          js: '.min.js'
        }
      }
    }
  } else {
    return {
      splitting: false,
      sourcemap: true,
      dts: true,
      clean: false,
      platform: 'browser',
      format: ['esm']
    }
  }
})

export default config
