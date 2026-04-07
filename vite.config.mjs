import { defineConfig } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.resolve(__dirname, "src");
const isMinify = process.env.BUILD_MIN === "true";

/**
 * Vite plugin that resolves bare module imports (e.g. "storage.js", "editors.js")
 * against the src/ directory, mirroring webpack's resolve.modules configuration.
 */
function resolveSrcPlugin() {
    return {
        name: "resolve-src",
        resolveId(id) {
            if (id.startsWith(".") || id.startsWith("/") || id.startsWith("@") || path.isAbsolute(id)) {
                return null;
            }
            const candidates = [
                path.join(srcDir, id),
                path.join(srcDir, id + ".js"),
            ];
            for (const candidate of candidates) {
                if (fs.existsSync(candidate)) {
                    return candidate;
                }
            }
            return null;
        },
    };
}

export default defineConfig({
    plugins: [resolveSrcPlugin()],
    build: {
        lib: {
            entry: path.resolve(srcDir, "blockpy.js"),
            name: "blockpy",
            formats: ["umd"],
        },
        outDir: "dist",
        emptyOutDir: false,
        minify: isMinify ? "esbuild" : false,
        sourcemap: "inline",
        cssCodeSplit: false,
        cssMinify: isMinify,
        rollupOptions: {
            external: ["jquery", "knockout", "filepond"],
            output: {
                entryFileNames: isMinify ? "blockpy.min.js" : "blockpy.js",
                globals: {
                    jquery: "jQuery",
                    knockout: "ko",
                    filepond: "FilePond",
                },
                assetFileNames: (assetInfo) => {
                    if (assetInfo.name && assetInfo.name.endsWith(".css")) {
                        return "blockpy.css";
                    }
                    return "[name][extname]";
                },
            },
        },
    },
});
