/**
 * AFFILIATE SYSTEM - Google Apps Script Backend
 * Sheets: Users | Categories | Products | Platforms | Config
 * Setup: Tạo 5 sheet đúng tên, đặt JWT_SECRET trong Project Properties > Script Properties
 * Deploy: Deploy as Web App -> Anyone, Execute as Me
 */
const SHEETS = { USERS: 'Users', CATEGORIES: 'Categories', PRODUCTS: 'Products', PLATFORMS: 'Platforms', CONFIG: 'Config', REQUESTS: 'PromotionRequests' };
const JWT_EXP = 7 * 24 * 60 * 60 * 1000;

function getSecret_() { return PropertiesService.getScriptProperties().getProperty('JWT_SECRET') || 'change_this_secret_123'; }
function getSs_() {
  let ss = SpreadsheetApp.getActiveSpreadsheet();
  if (ss) return ss;
  const id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (id) return SpreadsheetApp.openById(id);
  throw new Error('SPREADSHEET_NOT_BOUND: Script chưa gắn với Google Sheet. Hãy mở chính Google Sheet > Extensions > Apps Script rồi dán code, hoặc thêm SPREADSHEET_ID vào Script Properties');
}
function sheet_(name) {
  const ss = getSs_();
  let sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  return sh;
}
function jsonResponse_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
function withCors_(output) {
  return output;
}
function cacheGet_(k){ try{ return CacheService.getScriptCache().get(k); } catch(_){ return null; } }
function cachePut_(k,v,sec){ try{ CacheService.getScriptCache().put(k,v,sec||30); } catch(_){} }
function cacheClear_(){ try{ CacheService.getScriptCache().removeAll(['init','cats','prods','plats','cfg']); } catch(_){} }
function getInit_(){
  const cached = cacheGet_('init');
  if(cached) return JSON.parse(cached);
  const data = { categories: getCategories_(), products: getProducts_({}), platforms: getPlatforms_(), config: getConfig_() };
  cachePut_('init', JSON.stringify(data), 30);
  return data;
}
function doGet(e) {
  e = e || {}; e.parameter = e.parameter || {};
  const action = String(e.parameter.action || '').trim();
  try {
    if (!action) return withCors_(jsonResponse_({ ok: true, msg: 'Affiliate API running. Use ?action=getInit|getProducts|getCategories|ping', time: new Date().toISOString() }));
    if (action === 'getInit') return withCors_(jsonResponse_({ ok: true, data: getInit_() }));
    if (action === 'getCategories') {
      const c = cacheGet_('cats'); if(c) return withCors_(jsonResponse_({ ok:true, data: JSON.parse(c)}));
      const d=getCategories_(); cachePut_('cats', JSON.stringify(d),30); return withCors_(jsonResponse_({ ok: true, data: d }));
    }
    if (action === 'getProducts') {
      const hasFilter = e.parameter.category || e.parameter.platform || e.parameter.search;
      if(!hasFilter){ const c=cacheGet_('prods'); if(c) return withCors_(jsonResponse_({ ok:true, data: JSON.parse(c)})); }
      const d=getProducts_(e.parameter); if(!hasFilter) cachePut_('prods', JSON.stringify(d),30); return withCors_(jsonResponse_({ ok: true, data: d }));
    }
    if (action === 'getPlatforms') return withCors_(jsonResponse_({ ok: true, data: getPlatforms_() }));
    if (action === 'getConfig') return withCors_(jsonResponse_({ ok: true, data: getConfig_() }));
    if (action === 'getPromotionRequests') {
      const auth = verifyAuth_(e.parameter.token);
      if (!auth.ok) return withCors_(jsonResponse_(auth));
      return withCors_(jsonResponse_({ ok: true, data: getPromotionRequests_() }));
    }
    if (action === 'verifyToken') {
      const token = e.parameter.token || '';
      const payload = verifyJwt_(token);
      return withCors_(jsonResponse_({ ok: !!payload, payload: payload }));
    }
    if (action === 'ping') return withCors_(jsonResponse_({ ok: true, msg: 'pong', time: new Date().toISOString() }));
    return withCors_(jsonResponse_({ ok: false, error: 'Unknown action: ' + action }));
  } catch (err) { return withCors_(jsonResponse_({ ok: false, error: err.toString(), stack: err.stack || '' })); }
}
function doPost(e) {
  e = e || {}; e.parameter = e.parameter || {}; e.postData = e.postData || {};
  let body = {};
  try { body = JSON.parse(e.postData.contents || '{}'); } catch (_) { body = e.parameter || {}; }
  if (!body || typeof body !== 'object') body = {};
  const action = String(body.action || e.parameter.action || '').trim();
  try {
    if (!action) return withCors_(jsonResponse_({ ok: false, error: 'Missing action' }));
    if (action === 'login') {
      const res = login_(body.email, body.password);
      return withCors_(jsonResponse_(res));
    }
    if (action === 'register') {
      const res = register_(body.email, body.password, body.role);
      return withCors_(jsonResponse_(res));
    }
    if (action === 'createPromotionRequest') return withCors_(jsonResponse_({ ok: true, data: createPromotionRequest_(body) }));
    const auth = verifyAuth_(body.token || e.parameter.token);
    if (!auth.ok) return withCors_(jsonResponse_(auth));
    if (action === 'createCategory') return withCors_(jsonResponse_({ ok: true, data: createCategory_(body) }));
    if (action === 'updateCategory') return withCors_(jsonResponse_({ ok: true, data: updateCategory_(body) }));
    if (action === 'deleteCategory') return withCors_(jsonResponse_({ ok: true, data: deleteCategory_(body.id) }));
    if (action === 'createProduct') return withCors_(jsonResponse_({ ok: true, data: createProduct_(body) }));
    if (action === 'updateProduct') return withCors_(jsonResponse_({ ok: true, data: updateProduct_(body) }));
    if (action === 'deleteProduct') return withCors_(jsonResponse_({ ok: true, data: deleteProduct_(body.id) }));
    if (action === 'upsertPlatform') return withCors_(jsonResponse_({ ok: true, data: upsertPlatform_(body) }));
    if (action === 'updateConfig') return withCors_(jsonResponse_({ ok: true, data: updateConfig_(body.key, body.value) }));
    if (action === 'updatePromotionRequestStatus') return withCors_(jsonResponse_({ ok: true, data: updatePromotionRequestStatus_(body.id, body.status) }));
    return withCors_(jsonResponse_({ ok: false, error: 'Unknown POST action: ' + action }));
  } catch (err) { return withCors_(jsonResponse_({ ok: false, error: err.toString(), stack: err.stack || '' })); }
}
function doOptions(e) {
  return ContentService.createTextOutput('').setMimeType(ContentService.MimeType.TEXT);
}

// ===== JWT =====
function b64Encode_(str) { return Utilities.base64EncodeWebSafe(Utilities.newBlob(str).getBytes()).replace(/=+$/,''); }
function b64Decode_(str) { return Utilities.newBlob(Utilities.base64DecodeWebSafe(str)).getDataAsString(); }
function sign_(msg, secret) {
  const sig = Utilities.computeHmacSha256Signature(msg, secret);
  return Utilities.base64EncodeWebSafe(sig).replace(/=+$/,'');
}
function createJwt_(payload) {
  const secret = getSecret_();
  const header = b64Encode_(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = b64Encode_(JSON.stringify(payload));
  const sig = sign_(header + '.' + body, secret);
  return header + '.' + body + '.' + sig;
}
function verifyJwt_(token) {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const secret = getSecret_();
  const expectSig = sign_(parts[0] + '.' + parts[1], secret);
  if (expectSig !== parts[2]) return null;
  try {
    const payload = JSON.parse(b64Decode_(parts[1]));
    if (payload.exp && Date.now() > payload.exp) return null;
    return payload;
  } catch (_) { return null; }
}
function verifyAuth_(token) {
  const p = verifyJwt_(token);
  if (!p) return { ok: false, error: 'Unauthorized: token invalid or expired' };
  if (p.role !== 'admin') return { ok: false, error: 'Forbidden' };
  return { ok: true, payload: p };
}
function hashPass_(pass) {
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, pass, Utilities.Charset.UTF_8).map(function(b){var v=(b<0?256+b:b).toString(16);return v.length==1?'0'+v:v;}).join('');
}

// ===== Auth =====
function login_(email, password) {
  if (!email || !password) return { ok: false, error: 'Missing email/password' };
  const sh = sheet_(SHEETS.USERS);
  const vals = sh.getDataRange().getValues();
  const hash = hashPass_(password);
  for (let i=1;i<vals.length;i++) {
    if (String(vals[i][1]).toLowerCase() === String(email).toLowerCase() && String(vals[i][2]) === hash) {
      const payload = { id: vals[i][0], email: vals[i][1], role: vals[i][3] || 'admin', exp: Date.now()+JWT_EXP };
      const token = createJwt_(payload);
      return { ok: true, token: token, user: { id: payload.id, email: payload.email, role: payload.role } };
    }
  }
  return { ok: false, error: 'Sai email hoặc mật khẩu' };
}
function register_(email, password, role) {
  const sh = sheet_(SHEETS.USERS);
  const vals = sh.getDataRange().getValues();
  for (let i=1;i<vals.length;i++) if (String(vals[i][1]).toLowerCase()===String(email).toLowerCase()) return { ok:false, error:'Email đã tồn tại'};
  const id = 'U' + Date.now();
  sh.appendRow([id, email, hashPass_(password), role||'admin', new Date().toISOString()]);
  const payload = { id:id, email:email, role: role||'admin', exp: Date.now()+JWT_EXP };
  return { ok:true, token:createJwt_(payload), user:{id:id, email:email, role:payload.role} };
}

// ===== Categories =====
function getCategories_() {
  const sh = sheet_(SHEETS.CATEGORIES);
  const v = sh.getDataRange().getValues();
  if (v.length<2) return [];
  const h = v[0];
  return v.slice(1).filter(function(r){return r[0];}).map(function(r){
    const o={}; h.forEach(function(k,i){o[k]=r[i];}); return o;
  }).sort(function(a,b){return Number(a.order||0)-Number(b.order||0);});
}
function createCategory_(b) {
  const sh = sheet_(SHEETS.CATEGORIES);
  const id = 'C'+Date.now();
  const slug = (b.slug||b.name||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  sh.appendRow([id, b.name, slug, b.icon||'📦', b.order||0, new Date().toISOString()]);
  cacheClear_(); return { id:id, name:b.name, slug:slug };
}
function updateCategory_(b) {
  const sh = sheet_(SHEETS.CATEGORIES); const v=sh.getDataRange().getValues();
  for(let i=1;i<v.length;i++) if(String(v[i][0])===String(b.id)){
    sh.getRange(i+1,2).setValue(b.name||v[i][1]);
    sh.getRange(i+1,3).setValue(b.slug||v[i][2]);
    sh.getRange(i+1,4).setValue(b.icon||v[i][3]);
    sh.getRange(i+1,5).setValue(b.order!=null?b.order:v[i][4]);
    cacheClear_(); return { id:b.id };
  }
  throw new Error('Category not found');
}
function deleteCategory_(id){ const sh=sheet_(SHEETS.CATEGORIES); const v=sh.getDataRange().getValues(); for(let i=1;i<v.length;i++) if(String(v[i][0])===String(id)){ sh.deleteRow(i+1); cacheClear_(); return {deleted:id}; } throw new Error('Not found'); }

// ===== Products =====
function getProducts_(params) {
  const sh = sheet_(SHEETS.PRODUCTS);
  const v = sh.getDataRange().getValues();
  if(v.length<2) return [];
  const h=v[0];
  let rows=v.slice(1).filter(function(r){return r[0];}).map(function(r){const o={}; h.forEach(function(k,i){o[k]=r[i];}); return o;});
  rows = rows.filter(function(r){return String(r.isActive).toLowerCase()!=='false' && String(r.isActive)!=='0';});
  if(params.category) rows=rows.filter(function(r){return String(r.categoryId)===String(params.category) || String(r.categorySlug)===String(params.category);});
  if(params.platform) rows=rows.filter(function(r){return String(r.platform).toLowerCase()===String(params.platform).toLowerCase();});
  if(params.search){ const s=params.search.toLowerCase(); rows=rows.filter(function(r){return String(r.title).toLowerCase().indexOf(s)>-1;});}
  rows.sort(function(a,b){return Number(a.order||0)-Number(b.order||0) || new Date(b.createdAt)-new Date(a.createdAt);});
  return rows;
}
function createProduct_(b){
  const sh=sheet_(SHEETS.PRODUCTS);
  const id='P'+Date.now();
  sh.appendRow([id, b.title, b.categoryId||'', b.categorySlug||'', b.imageUrl||'', b.price||0, b.originalPrice||0, b.platform||'shopee', b.affiliateUrl||'', b.description||'', b.isActive!==false?'TRUE':'FALSE', b.order||0, new Date().toISOString()]);
  cacheClear_(); return {id:id};
}
function updateProduct_(b){
  const sh=sheet_(SHEETS.PRODUCTS); const v=sh.getDataRange().getValues(); const h=v[0];
  const col=function(name){return h.indexOf(name)+1;};
  for(let i=1;i<v.length;i++) if(String(v[i][0])===String(b.id)){
    if(b.title!=null) sh.getRange(i+1,col('title')).setValue(b.title);
    if(b.categoryId!=null) sh.getRange(i+1,col('categoryId')).setValue(b.categoryId);
    if(b.categorySlug!=null) sh.getRange(i+1,col('categorySlug')).setValue(b.categorySlug);
    if(b.imageUrl!=null) sh.getRange(i+1,col('imageUrl')).setValue(b.imageUrl);
    if(b.price!=null) sh.getRange(i+1,col('price')).setValue(b.price);
    if(b.originalPrice!=null) sh.getRange(i+1,col('originalPrice')).setValue(b.originalPrice);
    if(b.platform!=null) sh.getRange(i+1,col('platform')).setValue(b.platform);
    if(b.affiliateUrl!=null) sh.getRange(i+1,col('affiliateUrl')).setValue(b.affiliateUrl);
    if(b.description!=null) sh.getRange(i+1,col('description')).setValue(b.description);
    if(b.isActive!=null) sh.getRange(i+1,col('isActive')).setValue(b.isActive?'TRUE':'FALSE');
    if(b.order!=null) sh.getRange(i+1,col('order')).setValue(b.order);
    cacheClear_(); return {id:b.id};
  }
  throw new Error('Product not found');
}
function deleteProduct_(id){ const sh=sheet_(SHEETS.PRODUCTS); const v=sh.getDataRange().getValues(); for(let i=1;i<v.length;i++) if(String(v[i][0])===String(id)){ sh.deleteRow(i+1); cacheClear_(); return {deleted:id}; } throw new Error('Not found'); }

// ===== Promotion requests =====
function getPromotionRequests_(){
  const sh=sheet_(SHEETS.REQUESTS); const v=sh.getDataRange().getValues();
  if(v.length<2) return [];
  const h=v[0];
  return v.slice(1).filter(function(r){return r[0];}).map(function(r){const o={};h.forEach(function(k,i){o[k]=r[i];});return o;}).sort(function(a,b){return new Date(b.createdAt)-new Date(a.createdAt);});
}
function createPromotionRequest_(b){
  if(!b.name || !b.email) throw new Error('Missing required request fields');
  const sh=sheet_(SHEETS.REQUESTS);
  if(sh.getLastRow()===0) sh.appendRow(['id','name','email','phone','zalo','productName','productUrl','note','status','createdAt','processedAt']);
  const id='R'+Date.now();
  sh.appendRow([id,String(b.name).trim(),String(b.email).trim(),String(b.phone||'').trim(),String(b.zalo||'').trim(),String(b.productName).trim(),String(b.productUrl||'').trim(),String(b.note||'').trim(),'pending',new Date().toISOString(),'']);
  return {id:id,status:'pending'};
}
function updatePromotionRequestStatus_(id,status){
  if(status!=='pending' && status!=='processed') throw new Error('Invalid request status');
  const sh=sheet_(SHEETS.REQUESTS); const v=sh.getDataRange().getValues(); const h=v[0];
  const statusCol=h.indexOf('status')+1; const processedCol=h.indexOf('processedAt')+1;
  for(let i=1;i<v.length;i++) if(String(v[i][0])===String(id)){
    sh.getRange(i+1,statusCol).setValue(status);
    sh.getRange(i+1,processedCol).setValue(status==='processed'?new Date().toISOString():'');
    return {id:id,status:status};
  }
  throw new Error('Promotion request not found');
}

// ===== Platforms & Config =====
function getPlatforms_(){
  const sh=sheet_(SHEETS.PLATFORMS); const v=sh.getDataRange().getValues();
  if(v.length<2) return [{id:'1',name:'Shopee',key:'shopee',baseUrl:'https://shopee.vn',isActive:'TRUE'},{id:'2',name:'TikTok Shop',key:'tiktok',baseUrl:'https://shop.tiktok.com',isActive:'TRUE'},{id:'3',name:'Lazada',key:'lazada',baseUrl:'https://lazada.vn',isActive:'TRUE'}];
  const h=v[0]; return v.slice(1).filter(function(r){return r[0];}).map(function(r){const o={};h.forEach(function(k,i){o[k]=r[i];});return o;});
}
function upsertPlatform_(b){
  const sh=sheet_(SHEETS.PLATFORMS); const v=sh.getDataRange().getValues();
  for(let i=1;i<v.length;i++) if(String(v[i][2])===String(b.key) || String(v[i][0])===String(b.id)){
    if(b.name) sh.getRange(i+1,2).setValue(b.name);
    if(b.baseUrl) sh.getRange(i+1,4).setValue(b.baseUrl);
    if(b.isActive!=null) sh.getRange(i+1,5).setValue(b.isActive?'TRUE':'FALSE');
    return {id:v[i][0]};
  }
  const id='PL'+Date.now(); sh.appendRow([id,b.name,b.key,b.baseUrl||'',b.isActive!==false?'TRUE':'FALSE']); return {id:id};
}
function getConfig_(){
  const sh=sheet_(SHEETS.CONFIG); const v=sh.getDataRange().getValues();
  const o={}; for(let i=1;i<v.length;i++){ o[v[i][0]]=v[i][0]==='contactPhone'?normalizeContactPhone_(v[i][1]):v[i][1]; }
  return o;
}
function normalizeContactPhone_(value){
  const s=String(value==null?'':value).trim();
  return /^\d{9}$/.test(s)?'0'+s:s;
}
function updateConfig_(key,value){
  const sh=sheet_(SHEETS.CONFIG); const v=sh.getDataRange().getValues();
  const normalized = key==='contactPhone'?normalizeContactPhone_(value):String(value==null?'':value).trim();
  for(let i=1;i<v.length;i++) if(String(v[i][0])===String(key)){ const cell=sh.getRange(i+1,2); if(key==='contactPhone'||key==='contactZalo') cell.setNumberFormat('@'); cell.setValue(normalized); return {key:key};}
  if(key==='contactPhone'||key==='contactZalo') sh.getRange(sh.getLastRow()+1,2).setNumberFormat('@');
  sh.appendRow([key,normalized]); return {key:key};
}
function seed(){ return seed_(); }
function initSeed(){ return seed_(); }
function testPing(){ return 'pong '+new Date().toISOString(); }
function seed_(){
  const ss=getSs_();
  const adminEmail = PropertiesService.getScriptProperties().getProperty('ADMIN_EMAIL');
  const adminPassword = PropertiesService.getScriptProperties().getProperty('ADMIN_PASSWORD');
  if (!adminEmail || !adminPassword) throw new Error('Missing ADMIN_EMAIL and ADMIN_PASSWORD in Script Properties');
  function ensure(name, headers, rows){
    let sh=ss.getSheetByName(name); if(!sh) sh=ss.insertSheet(name); else sh.clear();
    sh.getRange(1,1,1,headers.length).setValues([headers]);
    if(rows.length) sh.getRange(2,1,rows.length,headers.length).setValues(rows);
    sh.setFrozenRows(1);
  }
  ensure(SHEETS.USERS, ['id','email','passwordHash','role','createdAt'], [['U1',adminEmail, hashPass_(adminPassword), 'admin', new Date().toISOString()]]);
  ensure(SHEETS.CATEGORIES, ['id','name','slug','icon','order','createdAt'], [['C1','Điện Gia Dụng','dien-gia-dung','🏠',1,new Date().toISOString()],['C2','Làm Đẹp','lam-dep','💄',2,new Date().toISOString()],['C3','Thời Trang','thoi-trang','👗',3,new Date().toISOString()]]);
  ensure(SHEETS.PRODUCTS, ['id','title','categoryId','categorySlug','imageUrl','price','originalPrice','platform','affiliateUrl','description','isActive','order','createdAt'], [['P1','Son Lì Siêu Mịn','C2','lam-dep','https://via.placeholder.com/400','99000','149000','shopee','https://shopee.vn/product','Mô tả', 'TRUE',1,new Date().toISOString()]]);
  ensure(SHEETS.PLATFORMS, ['id','name','key','baseUrl','isActive'], [['PL1','Shopee','shopee','https://shopee.vn','TRUE'],['PL2','TikTok Shop','tiktok','https://shop.tiktok.com','TRUE'],['PL3','Lazada','lazada','https://lazada.vn','TRUE']]);
  ensure(SHEETS.CONFIG, ['key','value'], [['siteTitle','2Trees'],['siteSub','link đồ giới thiệu đến mọi người'],['cloudinaryCloudName',''],['cloudinaryUploadPreset',''],['contactEmail',''],['contactPhone',''],['contactZalo','']]);
  ensure(SHEETS.REQUESTS, ['id','name','email','phone','zalo','productName','productUrl','note','status','createdAt','processedAt'], []);
  PropertiesService.getScriptProperties().setProperty('JWT_SECRET','aff_'+Date.now());
  return {seeded:true};
}
