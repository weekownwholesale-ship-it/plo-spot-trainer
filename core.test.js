const C=require('./core.js');
let pass=0, fail=0;
function eq(name, got, want){
  const ok = JSON.stringify(got)===JSON.stringify(want);
  if(ok) pass++; else { fail++; console.log('FAIL',name,'got',JSON.stringify(got),'want',JSON.stringify(want)); }
}
function cards(s){ return C.parseHand(s); }
function outsSorted(o){ return o.map(C.cardStr).sort(); }

// --- straight-outs (correct by construction; spot-checks) ---
let o=C.straightOuts(cards('JsTs9d8d'), cards('QhJd7c'));
eq('wrap outs count', o.length, 13);
o=C.straightOuts(cards('ThJhQd7d'), cards('8c9d2s'));
eq('big wrap count', o.length, 16);
o=C.straightOuts(cards('AsAhKsKh'), cards('QhJd7c'));
eq('broadway gutshot', outsSorted(o), ['Tc','Td','Th','Ts']);
o=C.straightOuts(cards('Ad2s3h4d'), cards('5cKhQd'));
eq('dead wheel draw', o.length, 0);

// --- evaluator validation: reproduce all 15 benchmark equities ---
console.log('\n--- evaluator validation (4000 iters each, tol 1.5pp) ---');
let maxErr=0;
for(const [hs, want] of C.EQUITY_BANK){
  const got=C.equityVsRandom(cards(hs), 4000)*100;
  const err=Math.abs(got-want);
  if(err>maxErr) maxErr=err;
  const ok=err<=1.5;
  if(ok) pass++; else fail++;
  console.log((ok?'ok  ':'FAIL')+' '+hs+' got '+got.toFixed(2)+' want '+want+' err '+err.toFixed(2));
}
console.log('maxErr =', maxErr.toFixed(2));

// --- equity distribution sanity (for position thresholds) ---
const deck=C.fullDeck(), eqs=[];
for(let i=0;i<400;i++){
  const d=C.shuffle(deck.slice());
  eqs.push(C.equityVsRandom([d[0],d[1],d[2],d[3]], 600));
}
eqs.sort((a,b)=>b-a);
function pct(p){ return (eqs[Math.floor(p*eqs.length)]*100).toFixed(1); }
console.log('\nequity percentiles: top14%='+pct(0.14)+' top16%='+pct(0.16)+' top19%='+pct(0.19)+
  ' top23%='+pct(0.23)+' top30%='+pct(0.30)+' top35%='+pct(0.35)+' top48%='+pct(0.48));
// spot: where does AA72r land?
const aa=C.equityVsRandom(cards('AsAh7d2c'),2000);
const rank=eqs.filter(e=>e>aa).length/eqs.length;
console.log('AA72r equity '+(aa*100).toFixed(1)+' → top '+(rank*100).toFixed(0)+'%');

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail?1:0);
