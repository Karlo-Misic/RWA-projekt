import os from "os";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

export function getCallerFile(): string {
	const originalFunc = Error.prepareStackTrace;
	Error.prepareStackTrace = (err: Error, stackTraces: NodeJS.CallSite[]) =>
		stackTraces;
	const err = new Error();
	const stack = err.stack as unknown as NodeJS.CallSite[];
	Error.prepareStackTrace = originalFunc;

	let callerFile = null;
	if (stack[2] != undefined) {
		callerFile = stack[2].getFileName();
	}
	if (!callerFile) {
		throw new Error("Nije moguće utvrditi naziv datoteke koja poziva funkciju");
	}
	return callerFile;
}

export function __filename(): string {
	return fileURLToPath(getCallerFile());
}

export function __dirname(): string {
	return dirname(fileURLToPath(getCallerFile()));
}

export function dajPort(korime: string) {
	const HOST = os.hostname();
	let port = null;
	if (HOST != "spider") {
		port = 12221;
	} else {
		const portovi = require("/var/www/RWA/2024/portovi.js");
		port = portovi[korime];
	}
	return port;
}

export function dajPortSevis(korime: string) {
	const HOST = os.hostname();
	let port = null;
	if (HOST != "spider") {
		port = 12222;
	} else {
		const portovi = require("/var/www/RWA/2024/portovi_servis.js");
		port = portovi[korime];
	}
	return port;
}
