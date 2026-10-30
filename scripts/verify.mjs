import {readFile,readdir,stat} from 'node:fs/promises';
import assert from 'node:assert/strict';
const dataFiles=(await readdir('src/data')).filter(f=>f.endsWith('.json'));
const shape=x=>Array.isArray(x)?Array.isArray(x[0])?x.map(shape):x.map(v=>typeof v):x&&typeof x==='object'?Object.fromEntries(Object.keys(x).sort().map(k=>[k,shape(x[k])])):typeof x;
assert.deepEqual(dataFiles.map(f=>f.replace('.json','')).sort(),['en','zh-hans','zh-hant','ja','ko','fr','de','es','pt-br','ru','ar','id','th','vi'].sort(),'all fourteen locales required');
const english=JSON.parse(await readFile('src/data/en.json','utf8'));
for(const file of dataFiles){
 const code=file.replace('.json','');
 const copy=JSON.parse(await readFile(`src/data/${file}`,'utf8'));
 assert.deepEqual(shape(copy),shape(english),`${code}: translation schema`);
 for(const page of ['','privacy/','support/']){
  const route=(code==='en'?'':`${code}/`)+page;
  const html=await readFile(`dist/${route}index.html`,'utf8');
  assert(html.includes(`lang="${copy.lang}"`),route+' lang');
  assert(html.includes(`dir="${copy.dir}"`),route+' dir');
  assert(html.includes(`rel="canonical" href="https://mouseeffect.hiimobapps.cn/${route}"`),route+' canonical');
  assert.equal((html.match(/hreflang=/g)||[]).length,dataFiles.length+1,route+' alternate count');
  assert(html.includes('mailto:494763134@qq.com'),route+' support contact');
  assert(!html.includes('<form'),route+' no web form');
  for(const match of html.matchAll(/(?:src|href)="(\/[^"#?]*)"/g)){
    const target=match[1];
    await stat(`dist${target}${target.endsWith('/')?'index.html':''}`).catch(()=>assert.fail(`${route}: missing ${target}`));
  }
 }
 assert(copy.privacy.sections.length===10&&copy.support.sections.length===8,code+' complete content');
}
const sitemap=await readFile('dist/sitemap.xml','utf8');
assert.equal((sitemap.match(/<loc>/g)||[]).length,dataFiles.length*3);
assert((await readFile('dist/CNAME','utf8')).trim()==='mouseeffect.hiimobapps.cn');
await stat('dist/404.html');
console.log(`Verified ${dataFiles.length} complete locales, ${dataFiles.length*3} pages, metadata, internal links, sitemap, CNAME and 404.`);
