import os from "os";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
export function getCallerFile() {
    const originalFunc = Error.prepareStackTrace;
    Error.prepareStackTrace = (err, stackTraces) => stackTraces;
    const err = new Error();
    const stack = err.stack;
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
export function __filename() {
    return fileURLToPath(getCallerFile());
}
export function __dirname() {
    return dirname(fileURLToPath(getCallerFile()));
}
export function dajPort(korime) {
    const HOST = os.hostname();
    let port = null;
    if (HOST != "spider") {
        port = 12221;
    }
    else {
        const portovi = require("/var/www/RWA/2024/portovi.js");
        port = portovi[korime];
    }
    return port;
}
export function dajPortSevis(korime) {
    const HOST = os.hostname();
    let port = null;
    if (HOST != "spider") {
        port = 12222;
    }
    else {
        const portovi = require("/var/www/RWA/2024/portovi_servis.js");
        port = portovi[korime];
    }
    return port;
}
