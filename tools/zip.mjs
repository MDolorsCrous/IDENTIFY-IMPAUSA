// Un escritor de ZIP minimo, sin dependencias.
//
// Existe por un detalle que rompe la subida de una skill: Compress-Archive de
// PowerShell guarda las rutas con barra invertida, y el formato ZIP las quiere
// hacia delante. Los .skill que funcionan las llevan bien; uno hecho con
// Compress-Archive, no. Aqui se controlan los nombres de entrada.
import { deflateRawSync } from "node:zlib";

const TABLA = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = TABLA[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

/**
 * @param {{nombre: string, datos: Buffer}[]} ficheros nombres con "/" siempre
 * @param {Date} fecha fija por defecto, para que regenerar no cambie el binario
 */
export function crearZip(ficheros, fecha = new Date(Date.UTC(2026, 0, 1, 12, 0, 0))) {
  const hora =
    ((fecha.getUTCHours() << 11) | (fecha.getUTCMinutes() << 5) | (fecha.getUTCSeconds() >> 1)) &
    0xffff;
  const dia =
    (((fecha.getUTCFullYear() - 1980) << 9) | ((fecha.getUTCMonth() + 1) << 5) | fecha.getUTCDate()) &
    0xffff;

  const locales = [];
  const central = [];
  let desplazamiento = 0;

  for (const f of ficheros) {
    const nombre = Buffer.from(f.nombre, "utf8");
    const comprimido = deflateRawSync(f.datos);
    const crc = crc32(f.datos);

    const cabecera = Buffer.alloc(30);
    cabecera.writeUInt32LE(0x04034b50, 0);
    cabecera.writeUInt16LE(20, 4); // version necesaria
    cabecera.writeUInt16LE(0x0800, 6); // nombres en UTF-8
    cabecera.writeUInt16LE(8, 8); // deflate
    cabecera.writeUInt16LE(hora, 10);
    cabecera.writeUInt16LE(dia, 12);
    cabecera.writeUInt32LE(crc, 14);
    cabecera.writeUInt32LE(comprimido.length, 18);
    cabecera.writeUInt32LE(f.datos.length, 22);
    cabecera.writeUInt16LE(nombre.length, 26);
    locales.push(cabecera, nombre, comprimido);

    const entrada = Buffer.alloc(46);
    entrada.writeUInt32LE(0x02014b50, 0);
    entrada.writeUInt16LE(20, 4); // version que lo creo
    entrada.writeUInt16LE(20, 6);
    entrada.writeUInt16LE(0x0800, 8);
    entrada.writeUInt16LE(8, 10);
    entrada.writeUInt16LE(hora, 12);
    entrada.writeUInt16LE(dia, 14);
    entrada.writeUInt32LE(crc, 16);
    entrada.writeUInt32LE(comprimido.length, 20);
    entrada.writeUInt32LE(f.datos.length, 24);
    entrada.writeUInt16LE(nombre.length, 28);
    entrada.writeUInt32LE(desplazamiento, 42);
    central.push(entrada, nombre);

    desplazamiento += cabecera.length + nombre.length + comprimido.length;
  }

  const cuerpo = Buffer.concat(locales);
  const directorio = Buffer.concat(central);
  const fin = Buffer.alloc(22);
  fin.writeUInt32LE(0x06054b50, 0);
  fin.writeUInt16LE(ficheros.length, 8);
  fin.writeUInt16LE(ficheros.length, 10);
  fin.writeUInt32LE(directorio.length, 12);
  fin.writeUInt32LE(cuerpo.length, 16);

  return Buffer.concat([cuerpo, directorio, fin]);
}
