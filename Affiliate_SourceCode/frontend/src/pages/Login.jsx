import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowRight, Leaf, ShieldCheck } from 'lucide-react'
import { api } from '../api'
import LangSwitch from '../components/LangSwitch.jsx'
export default function Login(){
  const { t } = useTranslation()
  const [email,setEmail]=useState('')
  const [pass,setPass]=useState('')
  const [err,setErr]=useState('')
  const [loading,setLoading]=useState(false)
  async function submit(e){
    e.preventDefault(); setErr(''); setLoading(true)
    try {
      const r=await api.login(email,pass)
      if(r.ok){ localStorage.setItem('token', r.token); localStorage.setItem('user', JSON.stringify(r.user)); location.href='/admin'; }
      else setErr(r.error||t('login_fail'))
    } catch (_) {
      setErr(t('login_fail'))
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="min-h-screen bg-[#edf3ef] text-[#14241d] px-4 py-5 sm:p-8 flex flex-col">
      <header className="w-full max-w-6xl mx-auto flex items-center justify-between">
        <a href="https://www.linkedin.com/in/khangnekk/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2.5 font-extrabold tracking-tight hover:text-[#1a6b4a] transition-colors">
          <span className="w-10 h-10 rounded-2xl bg-[#1a6b4a] text-white grid place-items-center shadow-lg shadow-[#1a6b4a]/20"><Leaf size={21}/></span>
          <span>{t('site_title')}</span>
        </a>
        <LangSwitch />
      </header>
      <main className="w-full max-w-6xl mx-auto flex-1 grid lg:grid-cols-[1.05fr_0.95fr] items-center gap-10 py-10 sm:py-16">
        <section className="hidden lg:block max-w-xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/80 border border-[#1a6b4a]/10 px-3 py-1.5 text-xs font-bold text-[#1a6b4a]"><ShieldCheck size={14}/> {t('login_badge')}</div>
          <h1 className="mt-5 text-5xl font-black leading-[1.05] tracking-tight">{t('login_heading')}</h1>
          <p className="mt-5 text-lg leading-8 text-[#496157]">{t('login_description')}</p>
          <div className="mt-8 flex items-center gap-2 text-sm font-semibold text-[#1a6b4a]"><span className="w-8 h-px bg-[#1a6b4a]"/>{t('creator_credit')}</div>
        </section>
        <form onSubmit={submit} className="w-full max-w-md lg:justify-self-end bg-white rounded-[28px] p-6 sm:p-8 shadow-[0_20px_70px_rgba(20,65,45,0.12)] border border-white">
          <div className="lg:hidden w-12 h-12 rounded-2xl bg-[#1a6b4a] text-white grid place-items-center mb-5"><Leaf size={23}/></div>
          <h2 className="mt-2 font-black text-2xl tracking-tight">{t('login_title')}</h2>
          <label className="block text-xs font-bold mb-1.5" htmlFor="email">{t('email')}</label>
          <input id="email" type="text" autoComplete="username" value={email} onChange={e=>setEmail(e.target.value)} placeholder={t('email')} className="w-full bg-[#f4f7f5] border border-transparent rounded-xl px-3.5 py-3 mb-4 outline-none focus:bg-white focus:border-[#1a6b4a]/30 focus:ring-4 focus:ring-[#1a6b4a]/10" />
          <label className="block text-xs font-bold mb-1.5" htmlFor="password">{t('password')}</label>
          <input id="password" type="password" autoComplete="current-password" value={pass} onChange={e=>setPass(e.target.value)} placeholder={t('password')} className="w-full bg-[#f4f7f5] border border-transparent rounded-xl px-3.5 py-3 mb-4 outline-none focus:bg-white focus:border-[#1a6b4a]/30 focus:ring-4 focus:ring-[#1a6b4a]/10" />
          {err && <div className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2.5 mb-4">{err}</div>}
          <button disabled={loading} className="w-full bg-[#14241d] text-white rounded-xl py-3.5 font-bold inline-flex items-center justify-center gap-2 hover:bg-[#1a6b4a] transition disabled:opacity-60">{loading?'...':t('login')} {!loading && <ArrowRight size={16}/>}</button>
        </form>
      </main>
      <footer className="w-full max-w-6xl mx-auto pt-5 border-t border-[#1a6b4a]/10 flex flex-col sm:flex-row gap-2 justify-between text-xs text-[#6a7b72]">
        <span>© {new Date().getFullYear()} <a href="https://www.linkedin.com/in/khangnekk/" target="_blank" rel="noopener noreferrer" className="hover:text-[#1a6b4a] hover:underline">{t('site_title')}</a></span><span>{t('creator_credit')}</span>
      </footer>
    </div>
  )
}
