import { defineConfig } from 'vite'
import { resolve } from 'path'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'MicroIframeSdk',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'mjs' : 'js'}`,
    },
    rollupOptions: {
      external: (id) => {
        // 外部化所有依赖包
        return (
          id === '@micro-iframe/types' ||
          id === '@micro-iframe/utils' ||
          id === 'vue' ||
          id === 'vue-router' ||
          id === 'react' ||
          id === 'react-dom' ||
          id === 'react-router-dom' ||
          id === 'react/jsx-runtime' ||
          id.startsWith('vue/') ||
          id.startsWith('vue-router/') ||
          id.startsWith('react/') ||
          id.startsWith('react-dom/') ||
          id.startsWith('react-router-dom/')
        )
      },
    },
  },
})

