import { useEffect, useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { LayoutDashboard, Package, Link2, Settings2, LogOut, Plus, Trash2, Pencil, Upload, Image as ImageIcon, ImageOff, ExternalLink, Leaf, Menu, X, Search, Loader2, Check } from 'lucide-react'
import { AppstoreOutlined, ShoppingOutlined, ApiOutlined, CloudOutlined } from '@ant-design/icons'
import { api, cloudinaryUpload } from '../api'
import LangSwitch from '../components/LangSwitch.jsx'
import IconPicker, { RenderIcon } from '../components/IconPicker.jsx'

function useAuth(){
  const token = localStorage.getItem('token')
  if(!token) location.href='/login'
  return token
}
const TABS = [
  {k:'products', label:'Sản phẩm', icon: Package, ant: ShoppingOutlined},
  {k:'categories', label:'Danh mục', icon: AppstoreOutlined, isAnt:true},
  {k:'platforms', label:'Nền tảng', icon: Link2},
  {k:'config', label:'Cấu hình', icon: Settings2},
]

export default function Admin(){
  const { t } = useTranslation()
  const token = useAuth()
  const [tab,setTab]=useState('products')
  const [drawer,setDrawer]=useState(false)
  const [cats,setCats]=useState([])
  const [products,setProducts]=useState([])
  const [platforms,setPlatforms]=useState([])
  const [form,setForm]=useState({})
  const [editing,setEditing]=useState(null)
  const [cloud,setCloud]=useState({cloud:'', preset:''})
  const [uploading,setUploading]=useState(false)
  const [saving,setSaving]=useState(null)
  const [toast,setToast]=useState('')
  const [q,setQ]=useState('')
  function showToast(m){ setToast(m); setTimeout(()=>setToast(''),1800)}

  async function load(){
    const [c,p,pl,cf]=await Promise.all([ api.getCategories(), api.getProducts({}), api.getPlatforms(), api.getConfig()])
    setCats(c.data||[]); setProducts(p.data||[]); setPlatforms(pl.data||[]);
    setCloud({cloud: cf.data?.cloudinaryCloudName||'', preset: cf.data?.cloudinaryUploadPreset||''})
  }
  useEffect(()=>{ load() },[])

  const filteredProducts = useMemo(()=>{
    if(!q) return products
    const s=q.toLowerCase()
    return products.filter(x=> String(x.title).toLowerCase().includes(s) || String(x.platform).toLowerCase().includes(s))
  },[products,q])

  async function saveCategory(){
    if(!form.name) return alert('Nhập tên danh mục')
    setSaving('cat'); try{
      if(editing) await api.updateCategory({id:editing, name:form.name, slug:form.slug, icon:form.icon, order:form.order}, token)
      else await api.createCategory(form, token)
      setForm({}); setEditing(null); await load(); showToast(t('saved'))
    } finally{ setSaving(null)}
  }
  async function saveProduct(){
    if(!form.title) return alert('Nhập tên sản phẩm')
    setSaving('prod'); try{
      const payload={...form, categorySlug: cats.find(x=>x.id===form.categoryId)?.slug || '' }
      if(editing) await api.updateProduct({id:editing, ...payload}, token)
      else await api.createProduct(payload, token)
      setForm({}); setEditing(null); await load(); showToast(t('saved'))
    } finally{ setSaving(null)}
  }
  async function onUpload(e){
    const file=e.target.files[0]; if(!file) return
    if(!cloud.cloud || !cloud.preset) return alert(t('upload_preset_note'))
    setUploading(true)
    try{ const url = await cloudinaryUpload(file, cloud.cloud, cloud.preset); setForm(s=>({...s, imageUrl:url})) } finally{ setUploading(false) }
  }

  return (
    <div className="min-h-screen bg-[#f3f5f3] text-[#111]">
      {drawer && <div onClick={()=>setDrawer(false)} className="fixed inset-0 bg-black/40 z-20 lg:hidden"/>}
      <aside className={`fixed inset-y-0 left-0 w-[264px] bg-[#143026] text-white z-30 flex flex-col transition ${drawer?'translate-x-0':'-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white text-[#1a6b4a] grid place-items-center"><Leaf size={18}/></div>
              <div><div className="font-extrabold leading-none">Nguyen L. Khang</div></div>
            </div>
            <button onClick={()=>setDrawer(false)} className="lg:hidden p-1.5 bg-white/10 rounded-lg"><X size={16}/></button>
          </div>
          <div className="mt-6 grid grid-cols-3 gap-2">
            {[
              {v:products.length,l:'SP'},
              {v:cats.length,l:'DM'},
              {v:platforms.length,l:'SÀN'},
            ].map(x=>(
              <div key={x.l} className="bg-white/[0.08] border border-white/10 rounded-xl py-2.5 text-center"><div className="font-bold">{x.v}</div><div className="text-[10px] tracking-widest text-white/60">{x.l}</div></div>
            ))}
          </div>
        </div>
        <nav className="px-3 space-y-1 flex-1 overflow-auto">
          {TABS.map(x=>{
            const Active = tab===x.k
            const Icon = x.icon
            return (
              <button key={x.k} onClick={()=>{setTab(x.k); setDrawer(false); setEditing(null); setForm({})}} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-medium transition ${Active?'bg-white text-[#1a6b4a] shadow':'text-white/75 hover:bg-white/10 hover:text-white'}`}>
                <span className={`w-7 h-7 rounded-lg grid place-items-center shrink-0 ${Active?'bg-[#1a6b4a] text-white':'bg-white/10'}`}>{x.isAnt ? <Icon style={{fontSize:14}}/> : <Icon size={14}/>}</span>{t(x.k)}
                {Active && <span className="ml-auto w-1.5 h-1.5 bg-[#1a6b4a] rounded-full"/>}
              </button>
            )
          })}
        </nav>
        <div className="p-4 border-t border-white/10 space-y-3">
          <div className="flex items-center justify-between"><span className="text-xs text-white/60">Language</span><LangSwitch/></div>
          <button onClick={()=>{localStorage.clear(); location.href='/login'}} className="w-full inline-flex items-center justify-center gap-2 bg-white text-[#1a6b4a] py-2.5 rounded-xl font-bold text-sm"><LogOut size={14}/> {t('logout')}</button>
        </div>
      </aside>

      <div className="lg:pl-[264px] min-h-screen flex flex-col">
        <header className="sticky top-0 z-10 bg-white border-b border-black/5">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-[64px] flex items-center gap-3">
            <button onClick={()=>setDrawer(true)} className="lg:hidden w-9 h-9 rounded-xl bg-[#1a6b4a] text-white grid place-items-center shrink-0"><Menu size={18}/></button>
            <span className="hidden sm:grid w-9 h-9 rounded-xl bg-[#f3f5f3] place-items-center border shrink-0"><LayoutDashboard size={16} className="text-[#1a6b4a]"/></span>
            <div className="min-w-0 hidden sm:block">
              <h1 className="font-extrabold text-[16px] leading-none capitalize flex items-center gap-2 truncate">{t(tab)} {editing && <span className="text-[11px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border">editing</span>}</h1>
              <p className="text-xs text-zinc-500 truncate">Shopee • Tiktok Shop • Lazada</p>
            </div>
            {tab==='products' && (
              <div className="flex-1 max-w-[520px] mx-2 relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"/>
                <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Tìm sản phẩm..." className="w-full pl-9 pr-3 py-2.5 bg-[#f3f5f3] rounded-full text-sm outline-none focus:bg-white focus:ring-2 focus:ring-[#1a6b4a]/10 border border-transparent focus:border-[#1a6b4a]/15" />
              </div>
            )}
            <div className="flex items-center gap-2 shrink-0 ml-auto">
              <a href="/" className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1a6b4a] text-white text-sm font-semibold hover:bg-[#1a4d3a]"><ExternalLink size={14}/>{t('view_client')}</a>
            </div>
          </div>
        </header>

        {toast && <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#1a6b4a] text-white px-4 py-2.5 rounded-full text-sm font-medium shadow-xl flex items-center gap-2 z-50"><Check size={16}/> {toast}</div>}
        <main className="max-w-[1200px] mx-auto w-full p-4 sm:p-6 flex-1">

          {tab==='products' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs bg-white border px-3 py-1.5 rounded-full text-zinc-600">{filteredProducts.length}/{products.length} sản phẩm</span>
              </div>

              <div className="grid lg:grid-cols-[380px_1fr] gap-6 items-start">
                <div className="bg-white rounded-2xl border border-black/5 p-4 lg:sticky lg:top-[72px]">
                  <h3 className="font-bold flex items-center gap-2 mb-3 text-sm"><span className="w-7 h-7 rounded-lg bg-[#1a6b4a] text-white grid place-items-center"><ShoppingOutlined style={{fontSize:14}}/></span>{editing?t('product_edit'):t('product_add')}</h3>
                  <div className="space-y-2">
                    <input value={form.title||''} onChange={e=>setForm({...form,title:e.target.value})} placeholder={t('product_name')} className="w-full bg-[#f3f5f3] rounded-xl px-3 py-2.5 text-[13px] outline-none focus:bg-white focus:ring-2 focus:ring-[#1a6b4a]/10 border border-transparent focus:border-[#1a6b4a]/15" />
                    <div className="grid grid-cols-2 gap-2">
                      <select value={form.categoryId||''} onChange={e=>setForm({...form,categoryId:e.target.value})} className="bg-[#f3f5f3] rounded-xl px-3 py-2.5 text-[13px] outline-none">
                        <option value="">{t('choose_category')}</option>
                        {cats.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                      <select value={form.platform||'shopee'} onChange={e=>setForm({...form,platform:e.target.value})} className="bg-[#f3f5f3] rounded-xl px-3 py-2.5 text-[13px] outline-none">
                        <option value="shopee">Shopee</option><option value="tiktok">Tiktok Shop</option><option value="lazada">Lazada</option>
                      </select>
                    </div>
                    <div className="bg-[#f9faf9] rounded-xl p-2.5 border border-dashed flex gap-2 items-center">
                      <div className="w-16 h-16 rounded-lg bg-white border overflow-hidden grid place-items-center relative shrink-0">
                        <div className="absolute inset-0 grid place-items-center text-[#1a6b4a]/30 bg-[#eef2ef]"><ImageOff size={18}/></div>
                        {form.imageUrl && <img key={form.imageUrl} src={form.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" onError={e=>e.currentTarget.style.display='none'} onLoad={e=>e.currentTarget.style.display='block'}/>}
                      </div>
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <label className={`flex items-center justify-center gap-1.5 w-full bg-white border rounded-lg py-2 text-xs font-semibold cursor-pointer hover:border-[#1a6b4a] ${uploading?'opacity-60 pointer-events-none':''}`}>{uploading?<><Loader2 size={12} className="animate-spin"/> Đang tải...</>:<><Upload size={12}/> Chọn ảnh</>}<input type="file" accept="image/*" onChange={onUpload} className="hidden" /></label>
                        <input value={form.imageUrl||''} onChange={e=>setForm({...form,imageUrl:e.target.value})} placeholder={t('image_url_hint')} className="w-full bg-white border rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-[#1a6b4a] truncate" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input value={form.price||''} onChange={e=>setForm({...form,price:e.target.value})} placeholder={t('price')} type="number" className="bg-[#f3f5f3] rounded-xl px-3 py-2.5 text-[13px] outline-none" />
                      <input value={form.originalPrice||''} onChange={e=>setForm({...form,originalPrice:e.target.value})} placeholder={t('original_price')} type="number" className="bg-[#f3f5f3] rounded-xl px-3 py-2.5 text-[13px] outline-none" />
                    </div>
                    <input value={form.affiliateUrl||''} onChange={e=>setForm({...form,affiliateUrl:e.target.value})} placeholder={t('affiliate_link')} className="w-full bg-[#f3f5f3] rounded-xl px-3 py-2.5 text-[13px] outline-none" />
                    <textarea value={form.description||''} onChange={e=>setForm({...form,description:e.target.value})} placeholder={t('description')} rows={2} className="w-full bg-[#f3f5f3] rounded-xl px-3 py-2.5 text-[13px] outline-none resize-none" />
                    <button onClick={saveProduct} disabled={saving==='prod'} className="w-full bg-[#1a6b4a] text-white py-2.5 rounded-xl font-bold text-sm hover:bg-[#1a4d3a] disabled:opacity-60 inline-flex items-center justify-center gap-2">{saving==='prod'?<><Loader2 size={16} className="animate-spin"/> Đang lưu...</>:t('save')}</button>
                    {editing && <button onClick={()=>{setEditing(null); setForm({})}} className="w-full border rounded-xl py-2 hover:bg-zinc-50 text-xs">{t('cancel')}</button>}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="hidden lg:block bg-white rounded-2xl border border-black/5 overflow-hidden">
                    <div className="overflow-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-[#f9faf9] text-xs text-zinc-500"><tr><th className="text-left p-3">Sản phẩm</th><th className="text-left p-3">Giá</th><th className="text-right p-3">Thao tác</th></tr></thead>
                        <tbody className="divide-y">
                          {filteredProducts.map(p=>(
                            <tr key={p.id} className="hover:bg-[#f9faf9]">
                              <td className="p-3 flex gap-3">
                                <div className="relative w-12 h-12 rounded-lg bg-[#eef2ef] grid place-items-center text-[#1a6b4a]/30 shrink-0 overflow-hidden"><ImageOff size={16}/>{p.imageUrl && <img src={p.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" onError={e=>e.currentTarget.style.display='none'}/>}</div>
                                <div className="min-w-0"><div className="font-medium line-clamp-1">{p.title}</div><div className="text-xs text-zinc-500 flex items-center gap-1"><span className="bg-[#1a6b4a] text-white px-1.5 py-0.5 rounded text-[10px] font-bold uppercase">{p.platform}</span>{p.categorySlug}</div></div>
                              </td>
                              <td className="p-3 font-bold text-[#1a6b4a] whitespace-nowrap">{Number(p.price).toLocaleString('vi-VN')}₫</td>
                              <td className="p-3 text-right space-x-1">
                                <button onClick={()=>{setEditing(p.id); setForm(p); window.scrollTo({top:0,behavior:'smooth'})}} className="w-8 h-8 rounded-full border bg-white inline-grid place-items-center hover:bg-[#1a6b4a] hover:text-white"><Pencil size={14}/></button>
                                <button onClick={async()=>{if(confirm('Xóa?')){await api.deleteProduct(p.id, token); load()}}} className="w-8 h-8 rounded-full bg-red-50 text-red-600 inline-grid place-items-center hover:bg-red-600 hover:text-white"><Trash2 size={14}/></button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {filteredProducts.length===0 && <div className="p-10 text-center text-zinc-400">Không có sản phẩm phù hợp</div>}
                  </div>
                  <div className="grid sm:grid-cols-2 lg:hidden gap-3">
                    {filteredProducts.map(p=>(
                      <div key={p.id} className="bg-white rounded-2xl p-3 flex gap-3 border border-black/5">
                        <div className="relative w-20 h-20 rounded-xl bg-[#eef2ef] grid place-items-center text-[#1a6b4a]/30 shrink-0 overflow-hidden"><ImageOff size={22}/>{p.imageUrl && <img src={p.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" onError={e=>e.currentTarget.style.display='none'}/>}</div>
                        <div className="flex-1 min-w-0 flex flex-col">
                          <div className="font-semibold text-sm line-clamp-2 flex-1">{p.title}</div>
                          <div className="text-xs text-zinc-400">{p.categorySlug} • <span className="bg-[#1a6b4a] text-white px-1 rounded text-[10px]">{p.platform}</span></div>
                          <div className="font-bold text-[#1a6b4a] text-sm">{Number(p.price).toLocaleString('vi-VN')}₫</div>
                          <div className="flex gap-1.5 mt-1">
                            <button onClick={()=>{setEditing(p.id); setForm(p)}} className="flex-1 py-1.5 rounded-full bg-black text-white text-xs">Sửa</button>
                            <button onClick={async()=>{if(confirm('Xóa?')){await api.deleteProduct(p.id, token); load()}}} className="px-3 py-1 rounded-full bg-red-50 text-red-600 text-xs">Xóa</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab==='categories' && (
            <div className="grid lg:grid-cols-[360px_1fr] gap-6 items-start">
              <div className="bg-white rounded-2xl p-5 border border-black/5 lg:sticky lg:top-[80px]">
                <h3 className="font-bold flex items-center gap-2 mb-4"><span className="w-8 h-8 rounded-xl bg-[#1a6b4a] text-white grid place-items-center"><Plus size={16}/></span>{editing?t('category_edit'):t('category_add')}</h3>
                <div className="space-y-3">
                  <input value={form.name||''} onChange={e=>setForm({...form,name:e.target.value})} placeholder={t('category_name')} className="w-full bg-[#f3f5f3] rounded-xl px-3.5 py-3 text-sm outline-none" />
                  <input value={form.slug||''} onChange={e=>setForm({...form,slug:e.target.value})} placeholder={t('category_slug')} className="w-full bg-[#f3f5f3] rounded-xl px-3.5 py-3 text-sm outline-none" />
                  <IconPicker value={form.icon||''} onChange={v=>setForm({...form,icon:v})} />
                  <input value={form.order||''} onChange={e=>setForm({...form,order:e.target.value})} placeholder={t('order')} type="number" className="w-full bg-[#f3f5f3] rounded-xl px-3.5 py-3 text-sm outline-none" />
                  <button onClick={saveCategory} disabled={saving==='cat'} className="w-full bg-[#1a6b4a] text-white py-3 rounded-xl font-bold hover:bg-[#1a4d3a] disabled:opacity-60 inline-flex items-center justify-center gap-2">{saving==='cat'?<><Loader2 size={16} className="animate-spin"/> Đang lưu...</>:t('save')}</button>
                  {editing && <button onClick={()=>{setEditing(null); setForm({})}} className="w-full border rounded-xl py-2.5 hover:bg-zinc-50 text-sm">{t('cancel')}</button>}
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-black/5 overflow-hidden">
                <div className="px-5 py-4 font-bold border-b flex items-center justify-between"><span className="flex items-center gap-2"><AppstoreOutlined/> Danh sách ({cats.length})</span><span className="text-xs font-normal bg-[#f3f5f3] px-2.5 py-1 rounded-full">{cats.length} items</span></div>
                <div className="divide-y divide-black/5 max-h-[60vh] overflow-auto">
                  {cats.map(c=>(
                    <div key={c.id} className="flex items-center gap-3 px-5 py-4 hover:bg-[#f9faf9]">
                      <div className="w-10 h-10 rounded-xl bg-[#f3f5f3] border grid place-items-center text-[#1a6b4a]"><RenderIcon name={c.icon||'Package'} size={18}/></div>
                      <div className="flex-1 min-w-0"><div className="font-semibold text-sm">{c.name}</div><div className="text-xs text-zinc-500">/{c.slug} • #{c.order}</div></div>
                      <button onClick={()=>{setEditing(c.id); setForm(c)}} className="w-8 h-8 rounded-full border bg-white grid place-items-center hover:bg-[#1a6b4a] hover:text-white"><Pencil size={14}/></button>
                      <button onClick={async()=>{if(confirm('Xóa?')){await api.deleteCategory(c.id, token); load()}}} className="w-8 h-8 rounded-full bg-red-50 text-red-600 grid place-items-center hover:bg-red-600 hover:text-white"><Trash2 size={14}/></button>
                    </div>
                  ))}
                  {cats.length===0 && <div className="p-12 text-center text-sm text-zinc-400">Chưa có danh mục</div>}
                </div>
              </div>
            </div>
          )}

          {tab==='platforms' && (
            <div className="bg-white rounded-2xl p-6 border border-black/5">
              <h3 className="font-extrabold flex items-center gap-2"><ApiOutlined style={{color:'#1a6b4a'}}/>{t('platform_config')}</h3><p className="text-sm text-zinc-500 mb-6">{t('platform_note')}</p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {platforms.map(pl=>(
                  <div key={pl.id} className="border rounded-2xl p-5 bg-[#f9faf9] hover:bg-white hover:shadow-sm transition">
                    <div className="flex items-center gap-2 font-bold"><span className="w-9 h-9 rounded-xl bg-[#1a6b4a] text-white grid place-items-center text-xs font-black">{pl.key[0].toUpperCase()}</span>{pl.name} <span className="text-xs font-normal text-zinc-500">• {pl.key}</span></div>
                    <input defaultValue={pl.baseUrl} id={`base-${pl.key}`} className="w-full mt-3 bg-white border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#1a6b4a]" placeholder="https://" />
                     <button onClick={async(e)=>{ const btn=e.currentTarget; const v=document.getElementById(`base-${pl.key}`).value; btn.innerHTML='...'; await api.upsertPlatform({key:pl.key, baseUrl:v}, token); showToast(t('saved')); btn.innerHTML='Save'}} className="mt-3 w-full bg-black text-white py-2.5 rounded-xl text-sm font-semibold inline-flex items-center justify-center gap-1.5">Save</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab==='config' && (
            <div className="max-w-[640px] bg-white rounded-2xl p-6 sm:p-8 border border-black/5">
              <div className="w-11 h-11 rounded-xl bg-[#1a6b4a] text-white grid place-items-center"><CloudOutlined style={{fontSize:20}}/></div>
              <h3 className="font-extrabold text-lg mt-3">{t('config')} & Cloudinary</h3><p className="text-sm text-zinc-500 mb-6">{t('cloud_help')}</p>
              <label className="text-xs font-bold">{t('cloud_name')}</label>
              <input value={cloud.cloud} onChange={e=>setCloud({...cloud, cloud:e.target.value})} placeholder="djvnqc0q5" className="w-full bg-[#f3f5f3] rounded-xl px-3.5 py-3 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-[#1a6b4a]/10 mb-4 mt-1 border border-transparent focus:border-[#1a6b4a]/15" />
              <label className="text-xs font-bold">{t('upload_preset')}</label>
              <input value={cloud.preset} onChange={e=>setCloud({...cloud, preset:e.target.value})} placeholder="affiliate" className="w-full bg-[#f3f5f3] rounded-xl px-3.5 py-3 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-[#1a6b4a]/10 mb-6 mt-1 border border-transparent focus:border-[#1a6b4a]/15" />
              <button onClick={async()=>{ setSaving('cfg'); await api.updateConfig('cloudinaryCloudName', cloud.cloud, token); await api.updateConfig('cloudinaryUploadPreset', cloud.preset, token); setSaving(null); showToast(t('saved'))}} disabled={saving==='cfg'} className="w-full bg-[#1a6b4a] text-white py-3 rounded-xl font-bold hover:bg-[#1a4d3a] disabled:opacity-60 inline-flex items-center justify-center gap-2">{saving==='cfg'?<><Loader2 size={16} className="animate-spin"/> Đang lưu...</>:<>Save Cloudinary</>}</button>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
