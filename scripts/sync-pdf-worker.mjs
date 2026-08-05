// Copies the pdf.js worker out of the installed pdfjs-dist into public/pdf/ so
// the file served at the `workerSrc` path in writing-pdf-viewer.tsx always
// matches the pdfjs-dist that react-pdf actually loads. A mismatched pair fails
// at runtime ("API version does not match Worker version") with no build error,
// so this runs from `prebuild` rather than being hand-copied.
//
// pdfjs-dist is a transitive dependency of react-pdf and pnpm does not host it,
// so it is resolved through react-pdf rather than from the project root.

import { copyFileSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const destination = join(projectRoot, "public", "pdf", "pdf.worker.min.mjs");

const require = createRequire(join(projectRoot, "package.json"));

function resolveWorker() {
	const reactPdfRequire = createRequire(
		require.resolve("react-pdf/package.json"),
	);
	return reactPdfRequire.resolve("pdfjs-dist/build/pdf.worker.min.mjs");
}

let source;
try {
	source = resolveWorker();
} catch (error) {
	console.error(
		"[sync-pdf-worker] Could not resolve pdfjs-dist/build/pdf.worker.min.mjs.\n" +
			"The PDF viewer will not work without it. Are dependencies installed?",
	);
	console.error(error);
	process.exit(1);
}

function isUpToDate() {
	try {
		return (
			statSync(destination).size === statSync(source).size &&
			readFileSync(destination).equals(readFileSync(source))
		);
	} catch {
		return false;
	}
}

if (isUpToDate()) {
	console.log("[sync-pdf-worker] public/pdf/pdf.worker.min.mjs is up to date.");
} else {
	mkdirSync(dirname(destination), { recursive: true });
	copyFileSync(source, destination);
	const { version } = JSON.parse(
		readFileSync(
			createRequire(require.resolve("react-pdf/package.json")).resolve(
				"pdfjs-dist/package.json",
			),
			"utf8",
		),
	);
	console.log(
		`[sync-pdf-worker] Copied pdf.worker.min.mjs from pdfjs-dist@${version}.`,
	);
}
