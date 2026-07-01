import { defineConfig } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import inject from "@rollup/plugin-inject";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
    const isProd = mode === "production";

    return {
        resolve: {
            tsconfigPaths: true,
        },
        build: {
            lib: {
                entry: path.resolve(__dirname, "src/blockpy.js"),
                name: "blockpy",
                formats: ["umd"],
                fileName: () => isProd ? "blockpy.min.js" : "blockpy.js",
                cssFileName: "blockpy",
            },
            minify: isProd,
            sourcemap: !isProd,
            outDir: "dist",
            // Clear dist on first (dev) build only; preserve it for the prod build
            // so both blockpy.js and blockpy.min.js coexist in dist/
            emptyOutDir: !isProd,
            rollupOptions: {
                external: ["jquery", "knockout", "filepond"],
                output: {
                    globals: {
                        jquery: "jQuery",
                        knockout: "ko",
                        filepond: "FilePond",
                    },
                    exports: "named",
                },
                plugins: [
                    inject({
                        $: "jquery",
                        jQuery: "jquery",
                        ko: "knockout",
                        FilePond: "filepond",
                    }),
                ],
            },
        },
    };
});

