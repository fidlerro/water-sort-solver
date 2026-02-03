import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { copyFileSync, existsSync, mkdirSync } from "fs";
import { resolve } from "path";

export default defineConfig({
  plugins: [
    react(),
    {
      name: "copy-onnx-wasm-files",
      buildStart() {
        // Copy ONNX Runtime WASM files to public directory
        const wasmFiles = [
          "ort-wasm.wasm",
          "ort-wasm-simd.wasm",
          "ort-wasm-threaded.wasm",
          "ort-wasm-simd-threaded.wasm",
        ];

        const nodeModulesPath = resolve(__dirname, "node_modules/onnxruntime-web/dist");
        const publicPath = resolve(__dirname, "public");

        if (!existsSync(publicPath)) {
          mkdirSync(publicPath, { recursive: true });
        }

        wasmFiles.forEach((file) => {
          const src = resolve(nodeModulesPath, file);
          const dest = resolve(publicPath, file);
          if (existsSync(src)) {
            copyFileSync(src, dest);
            console.log(`Copied ${file} to public directory`);
          }
        });
      },
    },
  ],
  base: "/puzzle-n-survival/",
  server: {
    fs: {
      strict: false,
    },
  },
  optimizeDeps: {
    exclude: ["onnxruntime-web"],
  },
  assetsInclude: ["**/*.wasm"],
});
