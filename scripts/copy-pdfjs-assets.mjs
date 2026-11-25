import { cpSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const packageRoot = dirname(require.resolve("pdfjs-dist/package.json"));
const destination = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "pdfjs");

mkdirSync(destination, { recursive: true });
cpSync(join(packageRoot, "build", "pdf.worker.min.mjs"), join(destination, "pdf.worker.min.mjs"));
cpSync(join(packageRoot, "standard_fonts"), join(destination, "standard_fonts"), { recursive: true });
cpSync(join(packageRoot, "cmaps"), join(destination, "cmaps"), { recursive: true });
