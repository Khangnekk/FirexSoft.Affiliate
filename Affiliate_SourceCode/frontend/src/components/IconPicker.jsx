import { useState } from 'react'
import * as Icons from 'lucide-react'

const ICONS = [
'Leaf','Package','ShoppingBag','ShoppingCart','Store','Tag','Heart','Star','Sparkles','Flame','Zap','Sun','Moon','Cloud','Home','Building','Briefcase','Gift','Crown','Gem',
'Apple','Coffee','Utensils','Pizza','Cake','Milk','Beef','Fish','Carrot','Cherry',
'Shirt','Watch','Glasses','Handbag','Footprints','Crown','Gem','Palette','Brush','Scissors',
'Smartphone','Laptop','Headphones','Camera','Gamepad2','Tv','Watch','Printer','HardDrive','Cpu',
'Car','Bike','Plane','Rocket','Ship','Truck','Bus','Train','Anchor','Compass',
'Dumbbell','Trophy','Medal','Target','Award','Flag','Music','Mic','Headphones','Film',
'Book','GraduationCap','Pencil','PenTool','Lightbulb','Wrench','Hammer','Settings','Shield','Key',
'Baby','Dog','Cat','Flower','TreePine','SunSnow','CloudRain','Wind','Droplet','FlameKindling',
]

function IconPreview({name, size=18}){
  const C = Icons[name]
  if(!C) return <span>{name}</span>
  return <C size={size}/>
}

export default function IconPicker({value, onChange}){
  const [open,setOpen]=useState(false)
  const Current = Icons[value]
  return (
    <div className="relative">
      <button type="button" onClick={()=>setOpen(!open)} className="w-full flex items-center gap-2 bg-[#f3f5f3] rounded-xl px-3.5 py-3 text-sm border border-transparent hover:border-[#1a6b4a]/20">
        <span className="w-8 h-8 rounded-lg bg-white border grid place-items-center text-[#1a6b4a] shrink-0">
          {Current ? <Current size={16}/> : <Icons.Image size={16}/>}
        </span>
        <span className="flex-1 text-left truncate text-sm">{value || 'Chọn icon'}</span>
        <Icons.ChevronDown size={14} className={`text-zinc-400 transition ${open?'rotate-180':''}`}/>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={()=>setOpen(false)}/>
          <div className="absolute z-30 mt-2 left-0 right-0 bg-white border shadow-xl rounded-2xl p-3 max-h-[280px] overflow-auto">
            <div className="grid grid-cols-8 sm:grid-cols-10 gap-1.5">
              {ICONS.map(n=>{
                const Active = n===value
                const C = Icons[n]
                return (
                  <button key={n} title={n} onClick={()=>{onChange(n); setOpen(false)}} className={`aspect-square rounded-xl grid place-items-center border text-[#1a6b4a] hover:bg-[#f3f5f3] ${Active?'bg-[#1a6b4a] text-white border-[#1a6b4a]': 'bg-white border-black/5'}`}>
                    {C ? <C size={16}/> : n[0]}
                  </button>
                )
              })}
            </div>
            <div className="pt-2 flex gap-2">
              <input value={value||''} onChange={e=>onChange(e.target.value)} placeholder="Hoặc nhập tên icon / emoji" className="flex-1 bg-[#f3f5f3] rounded-xl px-3 py-2 text-xs outline-none"/>
              <button onClick={()=>setOpen(false)} className="px-3 py-2 bg-[#1a6b4a] text-white rounded-xl text-xs font-bold">Xong</button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
export function RenderIcon({name, size=16, className=''}){
  const C = Icons[name]
  if(C) return <C size={size} className={className}/>
  return <span className={className} style={{fontSize:size}}>{name}</span>
}
