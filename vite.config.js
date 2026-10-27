import { fileURLToPath, URL } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

/**
 * В сборке Vite ставит стили общих кусков кода (шапка, подвал — чанк PageLayout) ПЕРЕД стилями точки входа,
 * где лежит база (.btn и т. п.). Из-за этого база перебивала уточнения компонентов: на телефоне в шапке
 * вылезала кнопка «Зарегистрировать чек» (24.10). Плагин ставит стили точки входа первыми — как в разработке.
 */
function globalCssFirst() {
  return {
    name: 'anix:global-css-first',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        const entryCss = Object.values(ctx.bundle ?? {}).find((c) => c.type === 'chunk' && c.isEntry)?.viteMetadata?.importedCss;
        const links = html.match(/\s*<link rel="stylesheet"[^>]*>/g) ?? [];
        const first = links.filter((l) => [...(entryCss ?? [])].some((f) => l.includes(`/${f}`)));
        if (!first.length || links[0] === first[0]) return html;
        let out = html;
        for (const l of first) out = out.replace(l, '');
        return out.replace(links.find((l) => !first.includes(l)), first.join('') + links.find((l) => !first.includes(l)));
      },
    },
  };
}

/**
 * Картинки и шрифты лежат в public/ и в коде записаны от корня сайта: '/img/…', '/fonts/…'.
 * На GitHub Pages сайт открывается из подпапки (npm run build:pages), поэтому при сборке к таким адресам
 * в JS добавляется base. В стилях и index.html Vite делает это сам.
 */
function publicPathsWithBase() {
  let base = '/';
  return {
    name: 'anix:public-paths-with-base',
    apply: 'build',
    configResolved(config) {
      base = config.base;
    },
    renderChunk(code) {
      if (base === '/') return null;
      const out = code.replace(/(["'`])\/(img|fonts)\//g, `$1${base}$2/`);
      return out === code ? null : { code: out, map: null };
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), globalCssFirst(), publicPathsWithBase()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: { port: 5194, strictPort: true, host: '127.0.0.1' },
  preview: { port: 5194, strictPort: true, host: '127.0.0.1' },
  css: {
    preprocessorOptions: {
      scss: { additionalData: '@use "@/shared/styles/tokens" as *;\n' },
    },
  },
  build: { target: 'es2020', sourcemap: false },
});
