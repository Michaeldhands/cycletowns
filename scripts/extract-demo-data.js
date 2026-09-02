/* Pulls the data tables out of the original demo (reference/demo.html) into src/data/*.json.
   Run: node scripts/extract-demo-data.js */
const fs=require('fs');const vm=require('vm');const path=require('path');
const html=fs.readFileSync(path.join(__dirname,'../reference/demo.html'),'utf8');
const m=html.match(/<script>\n([\s\S]*)<\/script>\s*<\/body>/);
let src=m[1].replace(/^boot\(\);\s*$/m,'');
const el=()=>new Proxy({style:{},classList:{add(){},remove(){},toggle(){},contains(){return false}},dataset:{}},{get(t,k){if(k in t)return t[k];if(k==='querySelectorAll')return()=>[];if(k==='querySelector'||k==='getElementById')return()=>el();if(typeof k==='string')return t[k]=(k.startsWith('add')||k.startsWith('set')||k.startsWith('append')||k.startsWith('remove'))?()=>{}:'';return undefined;},set(){return true}});
const ctx={document:new Proxy({},{get(t,k){if(k==='body'||k==='documentElement')return el();return()=>el();}}),navigator:{},setTimeout(){},clearTimeout(){},console,Blob:function(){},URL:{createObjectURL(){return ''}},location:{href:''},localStorage:{getItem(){return null},setItem(){}},Date,Math,JSON,Object,Array,String,Number,encodeURIComponent};
ctx.window=ctx;vm.createContext(ctx);vm.runInContext(src,ctx,{filename:'demo.js'});
const names=['PERSONAS','TOWNS','BIG_LOOPS','TOWN_EXTRA','TOWN_SEEDO','TOWN_GEO','TOWN_WHEN','RACES','NEWS','ORIGINALS','SOCIALS','PARTNER_TYPES','CAT_DEFS','CAT_HERO','RANK_LOCKED','SCOPES','GEO_SCOPES','OFFERS','SHOP_LINES','BOUNTIES','AI_RECS','AI_CHIPS','AI_ANSWERS','RIDEPICS','TOWN_PIX','VPIX','ONB','HERO_HEADLINES','RIDER_TYPES','AGE_BANDS','ABILITY','BIKE_BRANDS','COUNTRIES','DIMLAB','GUIDE_SPEC','EXP','LITE_VIBE','LITE_TAGS','MCOL'];
const out=path.join(__dirname,'../src/data');fs.mkdirSync(out,{recursive:true});
for(const n of names){if(ctx[n]===undefined){console.error('missing',n);continue;}fs.writeFileSync(path.join(out,n.toLowerCase().replace(/_/g,'-')+'.json'),JSON.stringify(ctx[n],null,1)+'\n');}
console.log('towns',ctx.TOWNS.length,'news',ctx.NEWS.length+ctx.ORIGINALS.length,'races',Object.keys(ctx.RACES).length);
