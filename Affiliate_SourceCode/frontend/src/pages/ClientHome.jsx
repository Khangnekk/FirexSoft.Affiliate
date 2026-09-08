import { useEffect, useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, Leaf, ShoppingBag, Heart, Home as HomeIcon, Sparkles, Store, Tag, Flame, ImageOff, ExternalLink } from 'lucide-react'
import { ShoppingOutlined, HeartOutlined, HomeOutlined, FireOutlined } from '@ant-design/icons'
import { api } from '../api'
import LangSwitch from '../components/LangSwitch.jsx'
import { RenderIcon } from '../components/IconPicker.jsx'

function PlatformBadge({p}){
  const map={ shopee:'bg-[#1a6b4a] text-white', tiktok:'bg-black text-white', lazada:'bg-[#1a1a1a] text-white'}
  return <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide ${map[p]||'bg-[#1a6b4a] text-white'}`}><Store size={10}/>{p}</span>
}
function ProductCard({p}){
  const discount = p.originalPrice && p.price ? Math.round((1 - Number(p.price)/Number(p.originalPrice))*100) : 0
  return (
    <a href={p.affiliateUrl} target="_blank" rel="noopener" className="group bg-white rounded-[18px] overflow-hidden border border-black/[0.06] shadow-[0_2px_12px_rgba(15,61,46,0.06)] hover:shadow-[0_8px_24px_rgba(15,61,46,0.12)] hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 flex flex-col">
      <div className="relative aspect-[1/1] bg-[#eef2ef] overflow-hidden grid place-items-center">
        <div className="absolute inset-0 grid place-items-center text-[#1a6b4a]/30"><ImageOff size={36} strokeWidth={1.5}/></div>
        {p.imageUrl && <img src={p.imageUrl} alt={p.title} loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition duration-300" onError={e=>e.currentTarget.style.display='none'} />}
        {discount>0 && <span className="absolute top-2 right-2 bg-[#1a6b4a] text-white text-[11px] font-bold px-2 py-1 rounded-full shadow">-{discount}%</span>}
        <span className="absolute bottom-2 left-2"><PlatformBadge p={p.platform}/></span>
      </div>
      <div className="p-3.5 flex flex-col gap-1.5 flex-1">
        <h3 className="text-[13.5px] leading-[1.4] line-clamp-2 min-h-[38px] font-[550] text-[#111] tracking-tight">{p.title}</h3>
        <div className="flex items-baseline gap-2 mt-0.5">
          <span className="text-[#1a6b4a] font-extrabold text-[16px] tracking-tight">{Number(p.price).toLocaleString('vi-VN')}₫</span>
          {p.originalPrice && <span className="text-[11px] text-zinc-400 line-through">{Number(p.originalPrice).toLocaleString('vi-VN')}₫</span>}
        </div>
        <div className="text-[11.5px] text-zinc-500 line-clamp-1">{p.description||' '}</div>
      </div>
    </a>
  )
}
export default function ClientHome(){
  const { t } = useTranslation()
  const [cats,setCats]=useState([])
  const [products,setProducts]=useState([])
  const [q,setQ]=useState('')
  const [cat,setCat]=useState('')
  const [platform,setPlatform]=useState('')
  const [loading,setLoading]=useState(true)

  async function load(){
    setLoading(true)
    if(!cat && !platform && !q){
      const r = await api.getInit().catch(()=>({data:{categories:[], products:[]}}))
      const d = r.data || {}
      setCats(d.categories||[]); setProducts(d.products||[]); setLoading(false); return
    }
    const [c,p]=await Promise.all([api.getCategories().catch(()=>({data:[]})), api.getProducts({category:cat, platform, search:q}).catch(()=>({data:[]}))])
    setCats(c.data||[]); setProducts(p.data||[]); setLoading(false)
  }
  useEffect(()=>{ load() },[cat, platform])
  useEffect(()=>{
    const id=setTimeout(()=>load(),300)
    return ()=>clearTimeout(id)
  },[q])

  const filtered = useMemo(()=> products, [products])

  return (
    <div className="min-h-screen bg-[#f3f5f3] pb-24">
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-black/[0.06]">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 py-3.5">
            <div className="w-9 h-9 rounded-xl bg-[#1a6b4a] grid place-items-center text-white shadow"><Leaf size={18} strokeWidth={2.2}/></div>
            <div className="flex-1 min-w-0">
              <h1 className="font-extrabold text-[16px] leading-none tracking-tight flex items-center gap-1.5">{t('site_title')} <a href="https://www.linkedin.com/in/khangnekk/" target="_blank" rel="noopener" className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#1a6b4a] text-white hover:bg-black transition"><ExternalLink size={10}/></a></h1>
              <p className="text-[11.5px] truncate"><a href="https://www.linkedin.com/in/khangnekk/" target="_blank" rel="noopener" className="text-[#1a6b4a] hover:underline">linkedin.com/in/khangnekk</a></p>
            </div>
            <div className="hidden sm:flex w-2"/>
            <LangSwitch compact />
          </div>

          <div className="pb-3.5">
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"/>
              <input value={q} onChange={e=>setQ(e.target.value)} placeholder={t('search_placeholder')} className="w-full bg-[#eef2ef] rounded-full pl-10 pr-4 py-3 text-[14px] placeholder:text-zinc-400 outline-none focus:bg-white focus:ring-2 focus:ring-[#1a6b4a]/15 border border-transparent focus:border-[#1a6b4a]/20 transition" />
            </div>
          </div>

          <div className="flex gap-2 pb-3 overflow-x-auto scrollbar-none -mx-1 px-1">
            <button onClick={()=>setCat('')} className={`shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-semibold border transition ${!cat?'bg-[#1a6b4a] text-white border-[#1a6b4a] shadow':'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-300'}`}><ShoppingBag size={14}/>{t('all')}</button>
            {cats.map(c=>(
              <button key={c.id} onClick={()=>setCat(c.slug||c.id)} className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[13px] font-semibold border transition ${cat===(c.slug||c.id)?'bg-[#1a6b4a] text-white border-[#1a6b4a] shadow':'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-300'}`}>
                <span className="w-5 h-5 rounded-full bg-black/5 grid place-items-center shrink-0"><RenderIcon name={c.icon} size={12} className={cat===(c.slug||c.id)?'text-white':'text-[#1a6b4a]'}/></span>{c.name}
              </button>
            ))}
          </div>

          <div className="flex gap-2 pb-4">
            {[
              {k:'',l:t('all_platforms')},
              {k:'shopee',l:'Shopee'},
              {k:'tiktok',l:'Tiktok Shop'},
              {k:'lazada',l:'Lazada'},
            ].map(x=>(
              <button key={x.k} onClick={()=>{setPlatform(x.k); setTimeout(load,0)}} className={`flex-1 py-2 rounded-full text-xs font-bold border transition ${platform===x.k?'bg-black text-white border-black':'bg-white border-zinc-200 hover:border-zinc-300'}`}>{x.l}</button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-[1240px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between pt-5 pb-3">
          <h2 className="font-bold text-sm tracking-tight flex items-center gap-1.5"><Tag size={14} className="text-[#1a6b4a]"/>{filtered.length} sản phẩm</h2>
          <span className="hidden sm:inline"/>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
            {Array.from({length:10}).map((_,i)=><div key={i} className="bg-white rounded-[18px] overflow-hidden border border-black/5"><div className="aspect-square shimmer"/><div className="p-3.5 space-y-2.5"><div className="h-3.5 shimmer rounded"/><div className="h-3 shimmer rounded w-2/3"/></div></div>)}
          </div>
        ) : filtered.length===0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed"><p className="text-sm text-zinc-500">{t('no_products')}</p></div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
            {filtered.map(p=> <ProductCard key={p.id} p={p}/>) }
          </div>
        )}

        <p className="text-center text-[11px] text-zinc-400 mt-8">© Nguyen Luong Khang — <a href="https://www.linkedin.com/in/khangnekk/" target="_blank" rel="noopener" className="underline hover:text-[#1a6b4a]">linkedin.com/in/khangnekk</a></p>
      </main>

      <nav className="fixed bottom-3 left-3 right-3 bg-black text-white rounded-full flex justify-around py-2.5 shadow-xl sm:hidden">
        <a className="flex flex-col items-center gap-0.5 text-white"><HomeOutlined style={{fontSize:18}}/><span className="text-[10px] font-semibold">{t('home')}</span></a>
        <a className="flex flex-col items-center gap-0.5 text-white/60"><HeartOutlined style={{fontSize:18}}/><span className="text-[10px]">{t('fav')}</span></a>
        <a className="flex flex-col items-center gap-0.5 text-white/60"><ShoppingOutlined style={{fontSize:18}}/><span className="text-[10px]">Giỏ</span></a>
      </nav>
    </div>
  )
}
