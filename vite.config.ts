import { defineConfig, type Plugin } from "vite";

// puts the built js and css straight into index.html, so the whole page is a single request
const inlineAssets = (): Plugin => ({
  name: "inline-assets",
  enforce: "post",
  generateBundle(_, bundle) {
    const page = bundle["index.html"];
    if (page?.type !== "asset") return;
    let html = String(page.source);
    for (const [fileName, output] of Object.entries(bundle)) {
      const tag = new RegExp(`<(script|link)[^>]*/${fileName.replace(/[.]/g, "\\.")}"[^>]*>(</script>)?`);
      // replacer functions, so "$1" inside the code is not treated as a replacement pattern
      if (output.type === "chunk") html = html.replace(tag, () => `<script type="module">${output.code.replace(/<\/script/gi, "<\\/script")}</script>`);
      else if (fileName.endsWith(".css")) html = html.replace(tag, () => `<style>${output.source}</style>`);
      else continue;
      delete bundle[fileName];
    }
    page.source = html;
  },
});

export default defineConfig({
  base: "/me/",
  plugins: [inlineAssets()],
  build: {
    // keep svg icons as separate cacheable files instead of inlining them into the js
    assetsInlineLimit: 0,
    // a single inlined script has nothing to preload
    modulePreload: { polyfill: false },
  },
});
