import { API_URL } from './config'
function qs(o){ return new URLSearchParams(o).toString() }
async function get(action, params={}){
  const res = await fetch(`${API_URL}?${qs({action,...params, _t: Date.now()})}`, { redirect: 'follow', cache: 'no-store' });
  return res.json();
}
async function post(action, body={}){
  const res = await fetch(API_URL, {
    method:'POST',
    redirect: 'follow',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({action, ...body})
  });
  const t = await res.text();
  try { return JSON.parse(t); } catch(e){ throw new Error(t.slice(0,300)) }
}
const mem = new Map()
function cachedGet(key, fetcher, ttl=20000){
  const hit = mem.get(key)
  if(hit && Date.now()-hit.t < ttl) return Promise.resolve(hit.v)
  return fetcher().then(v=>{ mem.set(key,{v,t:Date.now()}); try{localStorage.setItem('cache_'+key, JSON.stringify({v,t:Date.now()}))}catch(_){}; return v })
}
export const api = {
  getInit: ()=> cachedGet('init', ()=> get('getInit'), 30000),
  getCategories: ()=> cachedGet('cats', ()=> get('getCategories'), 30000),
  getProducts: (p)=> {
    const hasFilter = p && (p.category || p.platform || p.search)
    if(hasFilter) return get('getProducts', p)
    return cachedGet('prods', ()=> get('getProducts', p), 20000)
  },
  getPlatforms: ()=> cachedGet('plats', ()=> get('getPlatforms'), 30000),
  getConfig: ()=> cachedGet('cfg', ()=> get('getConfig'), 30000),
  clearCache: ()=> { mem.clear(); try{Object.keys(localStorage).forEach(k=>k.startsWith('cache_')&&localStorage.removeItem(k))}catch(_){} },
  login: (email,password)=> post('login',{email,password}),
  createCategory: (data,token)=> post('createCategory',{...data, token}).then(r=>{ mem.delete('cats'); mem.delete('init'); return r}),
  updateCategory: (data,token)=> post('updateCategory',{...data, token}).then(r=>{ mem.delete('cats'); mem.delete('init'); return r}),
  deleteCategory: (id,token)=> post('deleteCategory',{id,token}).then(r=>{ mem.delete('cats'); mem.delete('init'); return r}),
  createProduct: (data,token)=> post('createProduct',{...data, token}).then(r=>{ mem.delete('prods'); mem.delete('init'); return r}),
  updateProduct: (data,token)=> post('updateProduct',{...data, token}).then(r=>{ mem.delete('prods'); mem.delete('init'); return r}),
  deleteProduct: (id,token)=> post('deleteProduct',{id,token}).then(r=>{ mem.delete('prods'); mem.delete('init'); return r}),
  upsertPlatform: (data,token)=> post('upsertPlatform',{...data,token}),
  updateConfig: (key,value,token)=> post('updateConfig',{key,value,token}),
};
export async function cloudinaryUpload(file, cloud, preset){
  const fd=new FormData(); fd.append('file',file); fd.append('upload_preset', preset);
  const r=await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`,{method:'POST',body:fd});
  const j=await r.json(); if(!j.secure_url) throw new Error(j.error?.message||'Upload failed'); return j.secure_url;
}
