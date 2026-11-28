const fs = require('node:fs');
const path = require('node:path');
const base = path.resolve(__dirname, '..');
const destination = process.argv[2];
if (!destination) throw new Error('Pass an absolute preview output path.');
const read = name => fs.readFileSync(path.join(base, name), 'utf8');
const source = read('index.html');
let content = source.match(/<body>([\s\S]*)<\/body>/)[1];
// Keep the complete working prototype; its home link is unnecessary in chat.
content = content.replace(/<a class="brand"[^>]*>/, '<span class="brand">').replace('</a>', '</span>');
let css = read('styles.css').replace(/^@import[^\r\n]*/gm, '').replaceAll(':root', ':scope');
css = css.replace(/(^|[},])body\{/g, '$1:scope{');
const extraCSS = `
#alpas-chat-preview{color-scheme:light dark;--ink:light-dark(#253956,#f3e7cc);--muted:light-dark(#626b76,#c0bec5);--paper:light-dark(#fcf6e9,#202634);--green:light-dark(#293f67,#e7c879);--lime:light-dark(#f0cd72,#293f67);--line:light-dark(#e6dbc8,#575460);--white:light-dark(#fffcf5,#2a3040);background:var(--paper);color:var(--ink)}
#alpas-chat-preview .topbar{height:auto;min-height:96px;flex-wrap:wrap;padding-top:15px;padding-bottom:15px}
#alpas-chat-preview main{padding-left:20px;padding-right:20px}
#alpas-chat-preview .filters{position:static}
#alpas-chat-preview .topbar>.pill{white-space:normal}
#alpas-chat-preview .hero-weave{pointer-events:none}
#alpas-chat-preview footer{margin-left:20px;margin-right:20px}
#alpas-chat-preview select,#alpas-chat-preview input:not([type=checkbox]){background:var(--white)}
#alpas-chat-preview .hero h1{font-size:clamp(30px,4.5vw,48px)}
#alpas-chat-preview .demo-note{padding-top:20px}
#alpas-chat-preview dialog{background:var(--white);color:var(--ink)}
#alpas-chat-preview .cultural-context,#alpas-chat-preview .detail-note,#alpas-chat-preview th{background:var(--paper)}
#alpas-chat-preview .primary{background:light-dark(#293f67,#e7c879);color:light-dark(#fff,#202634)}
#alpas-chat-preview .day.selected{background:light-dark(#293f67,#e7c879);color:light-dark(#fff,#202634)}
#alpas-chat-preview .day:hover{background:light-dark(#f6ebd3,#414457)}
#alpas-chat-preview .event-title .translation{color:var(--muted)}
#alpas-chat-preview .request-add{flex-wrap:wrap}
#alpas-chat-preview .table-scroll{overflow-x:auto}
#alpas-chat-preview .brand-word>.translation{color:var(--muted)}
@media(max-width:800px){#alpas-chat-preview .discovery-layout{grid-template-columns:1fr}#alpas-chat-preview .filters{position:static}#alpas-chat-preview .hero-weave{opacity:.15}#alpas-chat-preview .cultural-hero{padding-right:0}#alpas-chat-preview .collections{grid-template-columns:repeat(3,minmax(0,1fr))}}
@media(max-width:480px){#alpas-chat-preview .collections{grid-template-columns:repeat(2,minmax(0,1fr))}#alpas-chat-preview .topbar{gap:14px}#alpas-chat-preview .request{grid-template-columns:22px 1fr 20px}#alpas-chat-preview .request select{grid-column:2}#alpas-chat-preview .remove-request{grid-column:3;grid-row:auto}#alpas-chat-preview .results-heading{flex-wrap:wrap}#alpas-chat-preview .calendar-panel>.section-heading{flex-wrap:wrap}}
`;
let app = read('app.js').replace("const $ = id => document.getElementById(id);", "const $ = id => previewRoot.querySelector('#' + id);");
app = app.replaceAll('document.querySelectorAll', 'previewRoot.querySelectorAll');
app = app.replaceAll('localStorage', 'previewStorage');
// Requests and checkmarks stay with this preview rather than accessing a disk origin.
const setup = `
const previewRoot = document.getElementById('alpas-chat-preview');
const initialPreview = window.openai?.widgetState?.privateContent || {};
const storageValues = new Map(Object.entries(initialPreview.storage || {}));
const previewStorage = {getItem:key=>storageValues.get(key)||null,setItem:(key,value)=>storageValues.set(key,value)};
`;
const persistence = `
let restoringPreview = false;
function restorePreview(saved) {
  if (!saved || typeof saved !== 'object') return;
  restoringPreview = true;
  if (saved.filters) {
    const f = saved.filters;
    if (/^\\d{4}-\\d{2}$/.test(f.month || '')) state.month = f.month;
    if (!f.date || /^\\d{4}-\\d{2}-\\d{2}$/.test(f.date)) state.date = f.date || '';
    if (!f.collection || Alpas.collections.some(c => c.id === f.collection)) state.collection = f.collection || '';
    for (const [id,key] of [['location','location'],['age','age'],['price','maxPrice'],['time','startHour'],['mood','mood'],['interest','interest']]) {
      const control = $(id), value = String(f[key] ?? '');
      if (control.tagName === 'SELECT') {if ([...control.options].some(o=>o.value===value)) control.value=value;}
      else if (value === '' || Number(value)>=0) control.value=value;
    }
    renderDiscovery();
  }
  if (saved.view === 'team' && $('team').hidden) previewRoot.querySelector('[data-view="team"]').click();
  restoringPreview = false;
}
restorePreview(initialPreview);
function persistPreview(){
  if(restoringPreview) return;
  const storage = Object.fromEntries(storageValues);
  const privateContent = {filters:filters(),view:$('team').hidden?'discover':'team'};
  if(JSON.stringify(storage).length < 12000) privateContent.storage=storage;
  window.openai?.setWidgetState({modelContent:{location:$('location').value,date:state.date,collection:state.collection},privateContent})?.catch(()=>{});
}
for(const name of ['click','change','input','submit']) previewRoot.addEventListener(name,persistPreview);
window.addEventListener('openai:set_globals',event=>{const saved=event.detail?.globals?.widgetState?.privateContent;if(saved) restorePreview(saved);});
$('storage-note').textContent='Interactive class preview · Fictional events · No shared team account';
`;
const script = ['(function(){', setup, read('engine.js'), read('bilingual.js'), app, persistence, '})();'].join('\n');
const result = ['<div id="alpas-chat-preview">', '<style>', '@scope (#alpas-chat-preview) {', css, '}', extraCSS, '</style>', content, '</div>', '<script>', script, '</script>'].join('\n');
fs.mkdirSync(path.dirname(destination), { recursive: true });
fs.writeFileSync(destination, result);
new (require('node:vm').Script)(script);
if (/<(?:!doctype|html|head|body)[\s>]/i.test(result)) throw new Error('Preview must be an HTML fragment');
console.log('Created chat preview (' + Buffer.byteLength(result) + ' bytes). Embedded JavaScript syntax passed.');
