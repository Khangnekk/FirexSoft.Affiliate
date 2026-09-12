import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, ArrowRight, BadgeCheck, CheckCircle2, Clock3, Infinity, Leaf, Mail, MessageCircle, Phone, Send } from 'lucide-react'
import { api } from '../api'
import LangSwitch from '../components/LangSwitch.jsx'

const initialForm = { name:'', email:'', phone:'', note:'' }
function formatPhone(value){
  let phone=String(value??'').replace(/[^\d+]/g,'')
  if(phone.startsWith('+84')) phone=phone.slice(3)
  else if(phone.startsWith('84')) phone=phone.slice(2)
  else if(phone.startsWith('0')) phone=phone.slice(1)
  if(/^\d{9}$/.test(phone)) return { display:`+84 ${phone.slice(0,3)} ${phone.slice(3)}`, href:`+84${phone}` }
  return { display:String(value??'').trim(), href:String(value??'').trim() }
}

export default function PromotionRequest(){
  const { t } = useTranslation()
  const [form,setForm]=useState(initialForm)
  const [status,setStatus]=useState('')
  const [saving,setSaving]=useState(false)
  const [contact,setContact]=useState({email:'',phone:{display:'',href:''},zalo:''})
  const zaloHref = contact.zalo ? (String(contact.zalo).startsWith('http') ? String(contact.zalo) : `https://zalo.me/${contact.zalo}`) : ''

  useEffect(()=>{
    api.getConfig().then(result=>setContact({email:String(result.data?.contactEmail||''),phone:formatPhone(result.data?.contactPhone),zalo:String(result.data?.contactZalo||'')})).catch(()=>{})
  },[])

  function update(key,value){ setForm(current=>({...current,[key]:value})) }
  async function submit(e){
    e.preventDefault()
    setStatus('')
    if(!form.name || !form.email) return setStatus('missing')
    setSaving(true)
    try {
      const result = await api.createPromotionRequest(form)
      if(!result.ok) throw new Error(result.error || 'Request failed')
      setForm(initialForm)
      setStatus('success')
    } catch (_) {
      setStatus('error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f8f5] text-[#14241d] px-4 py-5 sm:p-8">
      <header className="max-w-6xl mx-auto flex items-center justify-between">
        <a href="/" className="inline-flex items-center gap-2.5 font-extrabold tracking-tight hover:text-[#1a6b4a] transition-colors">
          <span className="w-10 h-10 rounded-2xl bg-[#1a6b4a] text-white grid place-items-center shadow-lg shadow-[#1a6b4a]/20"><Leaf size={21}/></span>
          <span>{t('site_title')}</span>
        </a>
        <LangSwitch />
      </header>

      <main className="max-w-6xl mx-auto py-8 sm:py-12">
        <a href="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1a6b4a] hover:underline"><ArrowLeft size={15}/>{t('back_to_client')}</a>
        <div className="mt-6 grid lg:grid-cols-[0.92fr_1.08fr] gap-8 lg:gap-12 items-start">
          <section className="pt-2">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#1a6b4a]">{t('promotion_request_badge')}</p>
            <h1 className="mt-4 text-4xl sm:text-5xl font-black leading-[1.04] tracking-tight max-w-xl">{t('promotion_request_title')}</h1>
            <div className="mt-7 grid sm:grid-cols-2 gap-3 max-w-lg">
              <div className="rounded-2xl bg-white border border-[#e3ece5] p-4"><BadgeCheck size={19} className="text-[#1a6b4a]"/><p className="mt-3 text-sm font-bold">{t('promotion_benefit_one')}</p></div>
              <div className="rounded-2xl bg-white border border-[#e3ece5] p-4"><Clock3 size={19} className="text-[#1a6b4a]"/><p className="mt-3 text-sm font-bold">{t('promotion_benefit_two')}</p></div>
            </div>
            <div className="mt-5 overflow-hidden rounded-2xl border border-[#b9d9c3] bg-white max-w-lg shadow-sm">
              <div className="flex items-center justify-between gap-3 border-b border-[#e5f0e8] bg-[#f3faf5] px-4 py-3"><div className="flex items-center gap-2 text-sm font-bold text-[#1a6b4a]"><BadgeCheck size={17}/>{t('promotion_price_label')}</div><span className="inline-flex items-center gap-1 rounded-full bg-[#dff1e4] px-2.5 py-1 text-[11px] font-bold text-[#1a6b4a]"><Infinity size={13}/>{t('promotion_lifetime')}</span></div>
              <div className="px-4 py-4"><p className="text-2xl font-black tracking-tight text-[#14241d]">{t('promotion_price')}</p><div className="mt-2 flex items-center gap-2 text-xs font-semibold text-[#496157]"><span className="h-5 w-5 rounded-full bg-[#e8f5eb] text-[#1a6b4a] grid place-items-center">✓</span>{t('promotion_price_note')}</div></div>
            </div>
          </section>

          <form onSubmit={submit} className="bg-white rounded-[26px] p-5 sm:p-8 shadow-[0_20px_70px_rgba(20,65,45,0.10)] border border-[#e8eee9]">
            <div className="flex items-start justify-between gap-4 border-b border-[#edf1ee] pb-5"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#1a6b4a]">01 / {t('promotion_request_badge')}</p><h2 className="mt-2 font-black text-2xl tracking-tight">{t('promotion_request_form_title')}</h2></div><span className="w-10 h-10 rounded-xl bg-[#edf7f0] text-[#1a6b4a] grid place-items-center shrink-0"><Send size={17}/></span></div>
            <p className="mt-5 text-sm text-[#68786f]">{t('promotion_request_required')}</p>
            <div className="mt-5 space-y-4">
              <label className="block text-sm font-semibold">{t('requester_name')} <span className="text-red-600">*</span><input value={form.name} onChange={e=>update('name',e.target.value)} className="mt-1.5 w-full bg-[#f5f8f6] border border-transparent rounded-xl px-3.5 py-3 font-normal outline-none focus:bg-white focus:border-[#1a6b4a]/30 focus:ring-4 focus:ring-[#1a6b4a]/10" /></label>
              <label className="block text-sm font-semibold">{t('requester_email')} <span className="text-red-600">*</span><input type="email" value={form.email} onChange={e=>update('email',e.target.value)} className="mt-1.5 w-full bg-[#f5f8f6] border border-transparent rounded-xl px-3.5 py-3 font-normal outline-none focus:bg-white focus:border-[#1a6b4a]/30 focus:ring-4 focus:ring-[#1a6b4a]/10" /></label>
              <label className="block text-sm font-semibold">{t('requester_phone')} <span className="font-normal text-[#68786f]">{t('optional')}</span><input type="tel" value={form.phone} onChange={e=>update('phone',e.target.value)} className="mt-1.5 w-full bg-[#f5f8f6] border border-transparent rounded-xl px-3.5 py-3 font-normal outline-none focus:bg-white focus:border-[#1a6b4a]/30 focus:ring-4 focus:ring-[#1a6b4a]/10" /></label>
              <label className="block text-sm font-semibold">{t('request_note')} <span className="font-normal text-[#68786f]">{t('optional')}</span><textarea value={form.note} onChange={e=>update('note',e.target.value)} rows={5} className="mt-1.5 w-full bg-[#f5f8f6] border border-transparent rounded-xl px-3.5 py-3 font-normal outline-none resize-none focus:bg-white focus:border-[#1a6b4a]/30 focus:ring-4 focus:ring-[#1a6b4a]/10" /></label>
            </div>
            {status==='missing' && <p className="mt-4 text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2.5">{t('request_missing')}</p>}
            {status==='error' && <p className="mt-4 text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2.5">{t('request_error')}</p>}
            {status==='success' && <div className="mt-4 flex items-start gap-2 text-sm text-[#1a6b4a] bg-[#edf7f0] rounded-xl px-3 py-2.5"><CheckCircle2 size={17} className="mt-0.5 shrink-0"/><span>{t('request_success')}</span></div>}
            <button disabled={saving} className="mt-5 w-full rounded-xl bg-[#14241d] text-white py-3.5 font-bold inline-flex items-center justify-center gap-2 hover:bg-[#1a6b4a] transition disabled:opacity-60">{saving?<>{t('sending')}...</>:<>{t('send_request')}<Send size={16}/></>}</button>
          </form>
        </div>
        {(contact.email || contact.phone.display || contact.zalo) && <section className="mt-8 rounded-[26px] border border-[#dce8df] bg-[#eaf4ed] p-5 sm:p-7">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
            <div><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#1a6b4a]">{t('contact_admin')}</p></div>
          </div>
          <div className="mt-5">
            <div className="flex flex-wrap content-start gap-2">
              {contact.email && <a href={`mailto:${contact.email}`} className="inline-flex h-fit items-center gap-2 rounded-xl bg-white px-3.5 py-3 text-sm font-semibold text-[#496157] hover:text-[#1a6b4a] shadow-sm"><Mail size={16}/>{contact.email}</a>}
              {contact.phone.display && <a href={`tel:${contact.phone.href}`} className="inline-flex h-fit items-center gap-2 rounded-xl bg-white px-3.5 py-3 text-sm font-semibold text-[#496157] hover:text-[#1a6b4a] shadow-sm"><Phone size={16}/>{contact.phone.display}</a>}
            </div>
            {contact.zalo && <a href={zaloHref} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#1a6b4a] px-4 py-3 text-sm font-bold text-white hover:bg-[#14583d] transition"><MessageCircle size={16}/>{t('contact_zalo_action')}</a>}
          </div>
        </section>}
      </main>
      <footer className="max-w-6xl mx-auto pt-5 border-t border-[#dfe9e1] text-xs text-[#6a7b72] flex items-center justify-between gap-3"><span>© {new Date().getFullYear()} {t('site_title')}</span><a href="/" className="inline-flex items-center gap-1 hover:text-[#1a6b4a]">{t('back_to_client')}<ArrowRight size={13}/></a></footer>
    </div>
  )
}
