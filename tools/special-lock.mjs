// Locks / unlocks the secret page. Run from the site folder:
//   node tools/special-lock.mjs lock   <password> <path/to/special-content.js>
//   node tools/special-lock.mjs unlock <password> [out-file]
// "lock" encrypts the content (and any pictures it points to) into special-locked.js.
// The password and the readable text are never written into the site.
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { webcrypto as crypto } from "node:crypto";

const ITER = 600000; // PBKDF2-SHA256 iterations (OWASP 2023+ recommendation)
const [, , mode, password, file] = process.argv;
if (!mode || !password) { console.error("usage: lock <password> <content.js> | unlock <password> [out]"); process.exit(1); }
const pw = password.trim().toLowerCase();
const b64 = (u8) => Buffer.from(u8).toString("base64");
const unb64 = (s) => new Uint8Array(Buffer.from(s, "base64"));

async function keyFor(salt) {
  const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(pw), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey({ name: "PBKDF2", salt, iterations: ITER, hash: "SHA-256" }, base, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
}
const MIME = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".gif": "image/gif" };
function inline(src) {
  if (!src || src.startsWith("data:")) return src || "";
  const p = path.resolve(src);
  if (!fs.existsSync(p)) { console.warn("missing picture, left empty:", src); return ""; }
  return `data:${MIME[path.extname(p).toLowerCase()] || "image/jpeg"};base64,${fs.readFileSync(p).toString("base64")}`;
}

if (mode === "lock") {
  const ctx = {}; vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(file, "utf8") + "\n;this.__S = SPECIAL;", ctx);
  const S = JSON.parse(JSON.stringify(ctx.__S));
  // Embed every picture the content points to (any value ending in an image extension), so no
  // photo ever exists as a separate public file. Unlocking reveals them; without the password they don't exist.
  const IMG = /\.(jpe?g|png|webp|gif)$/i;
  const walk = (v) => Array.isArray(v) ? v.map(walk)
    : v && typeof v === "object" ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, walk(x)]))
    : typeof v === "string" && IMG.test(v) ? inline(v) : v;
  Object.assign(S, walk(S));
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, await keyFor(salt), new TextEncoder().encode(JSON.stringify(S))));
  fs.writeFileSync("special-locked.js",
    `/* Scrambled on purpose. Only the right password can read this. */\nwindow.SPECIAL_LOCKED = ${JSON.stringify({ v: 1, iter: ITER, salt: b64(salt), iv: b64(iv), data: b64(data) })};\n`);
  console.log("locked ->", "special-locked.js", `(${data.length} bytes)`);
} else if (mode === "unlock") {
  const ctx = { window: {} }; vm.createContext(ctx);
  vm.runInContext(fs.readFileSync("special-locked.js", "utf8"), ctx);
  const L = ctx.window.SPECIAL_LOCKED;
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: unb64(L.iv) }, await keyFor(unb64(L.salt)), unb64(L.data)).catch(() => null);
  if (!plain) { console.error("wrong password"); process.exit(2); }
  const out = `const SPECIAL = ${JSON.stringify(JSON.parse(new TextDecoder().decode(plain)), null, 2)};\n`;
  if (file) { fs.writeFileSync(file, out); console.log("unlocked ->", file); } else process.stdout.write(out);
}
