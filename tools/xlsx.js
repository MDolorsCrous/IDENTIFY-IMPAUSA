const {execSync} = require("child_process");
const f = process.argv[2];
const get = p => execSync(`unzip -p "${f}" ${p}`, {maxBuffer: 1<<28}).toString("utf8");
const decode = s => s.replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&amp;/g,"&").replace(/&quot;/g,'"').replace(/&apos;/g,"'");
const ss = [];
for (const si of get("xl/sharedStrings.xml").split("<si>").slice(1)) {
  ss.push(decode((si.match(/<t[^>]*>([\s\S]*?)<\/t>/g)||[]).map(t=>t.replace(/<[^>]+>/g,"")).join("")));
}
const colIdx = r => { let n=0; for (const ch of r.replace(/\d+/g,"")) n = n*26 + (ch.charCodeAt(0)-64); return n-1; };
for (const sheet of ["xl/worksheets/sheet1.xml","xl/worksheets/sheet2.xml"]) {
  let xml; try { xml = get(sheet); } catch { continue; }
  console.log("\n########## " + sheet + " ##########");
  for (const row of xml.split("<row ").slice(1)) {
    const cells = [];
    for (const m of row.matchAll(/<c r="([A-Z]+\d+)"([^>]*)>([\s\S]*?)<\/c>/g)) {
      const [, ref, attrs, inner] = m;
      let v = (inner.match(/<v>([\s\S]*?)<\/v>/)||[])[1];
      if (attrs.includes('t="s"')) v = ss[+v];
      else if (attrs.includes('t="inlineStr"')) v = decode((inner.match(/<t[^>]*>([\s\S]*?)<\/t>/)||[])[1]||"");
      cells[colIdx(ref)] = v === undefined ? "" : decode(String(v));
    }
    if (cells.length) console.log(Array.from(cells, c => c===undefined?"":c).join(" | "));
  }
}
