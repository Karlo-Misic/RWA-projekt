import crypto from 'crypto';
export function kreirajSHA256(tekst, sol) {
    if (sol)
        return kreirajSHA256saSoli(tekst, sol);
    return kreirajSHA256bezSoli(tekst);
}
function kreirajSHA256bezSoli(tekst) {
    const hash = crypto.createHash('sha256');
    hash.write(tekst);
    var izlaz = hash.digest('hex');
    hash.end();
    return izlaz;
}
function kreirajSHA256saSoli(tekst, sol) {
    const hash = crypto.createHash('sha256');
    hash.write(tekst + sol);
    var izlaz = hash.digest('hex');
    hash.end();
    return izlaz;
}
export function hexToUint8Array(hex) {
    const byteLength = hex.length / 2;
    const uint8Array = new Uint8Array(byteLength);
    for (let i = 0; i < byteLength; i++) {
        uint8Array[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
    }
    return uint8Array;
}
export function dajNasumceBroj(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}
