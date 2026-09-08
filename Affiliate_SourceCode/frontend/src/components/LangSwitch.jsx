import { useTranslation } from 'react-i18next'
export default function LangSwitch({ compact }){
  const { i18n } = useTranslation()
  const lang = i18n.language?.startsWith('en') ? 'en' : 'vi'
  function set(l){ i18n.changeLanguage(l); localStorage.setItem('lang', l) }
  if(compact) return (
    <div className="flex rounded-full overflow-hidden border border-black/10 text-xs font-bold bg-white">
      <button onClick={()=>set('vi')} className={`px-3 py-1.5 transition ${lang==='vi'?'bg-[#1a6b4a] text-white':'bg-white text-[#1a6b4a] hover:bg-zinc-50'}`}>VI</button>
      <button onClick={()=>set('en')} className={`px-3 py-1.5 transition ${lang==='en'?'bg-[#1a6b4a] text-white':'bg-white text-[#1a6b4a] hover:bg-zinc-50'}`}>EN</button>
    </div>
  )
  return (
    <select value={lang} onChange={e=>set(e.target.value)} className="border border-black/10 rounded-full px-3 py-1.5 text-xs font-semibold bg-white text-[#1a6b4a]">
      <option value="vi">VI - Tiếng Việt</option>
      <option value="en">EN - English</option>
    </select>
  )
}
