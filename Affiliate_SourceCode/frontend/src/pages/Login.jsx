import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { api } from '../api'
import LangSwitch from '../components/LangSwitch.jsx'
export default function Login(){
  const { t } = useTranslation()
  const [email,setEmail]=useState('admin')
  const [pass,setPass]=useState('affiliate@123')
  const [err,setErr]=useState('')
  async function submit(e){
    e.preventDefault(); setErr('')
    const r=await api.login(email,pass)
    if(r.ok){ localStorage.setItem('token', r.token); localStorage.setItem('user', JSON.stringify(r.user)); location.href='/admin'; }
    else setErr(r.error||t('login_fail'))
  }
  return (
    <div className="min-h-screen grid place-items-center bg-[#f5f5f5] p-4">
      <div className="absolute top-4 right-4"><LangSwitch /></div>
      <form onSubmit={submit} className="bg-white w-full max-w-sm rounded-2xl p-6 shadow">
        <h1 className="font-bold text-xl">{t('login_title')}</h1>
        <p className="text-sm text-gray-500 mb-4">{t('login_sub')}</p>
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder={t('email')} className="w-full border rounded-lg px-3 py-2.5 mb-3 outline-none focus:border-black" />
        <input type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder={t('password')} className="w-full border rounded-lg px-3 py-2.5 mb-3 outline-none focus:border-black" />
        {err && <div className="text-sm text-red-600 mb-3">{err}</div>}
        <button className="w-full bg-black text-white rounded-lg py-3 font-semibold">{t('login')}</button>
      </form>
    </div>
  )
}
