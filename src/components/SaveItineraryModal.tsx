"use client";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, Check, Download, Share2 } from "lucide-react";
import LZString from "lz-string";

interface Stop { id:string; name:string; description:string; lat:number; lng:number; startTime:string; durationMinutes:number; tip?:string; municipality?:string; category?:string; imageUrl?:string; photos?:string[]; distance:number; type:"destination"|"experience"; }
interface LocationResult { lat:number; lng:number; address?:string; }

export default function SaveItineraryModal({
  isOpen, onClose, days, answers, itinerary, locationData,
}:{
  isOpen:boolean; onClose:()=>void; days:number; answers:any; itinerary:Stop[]; locationData:LocationResult|null;
}) {
  const [copied, setCopied] = useState(false);

  const payload = useMemo(()=>({
    v:1, generatedAt:Date.now(), days, answers, itinerary, locationData
  }),[days,answers,itinerary,locationData]);

  const shareUrl = useMemo(()=>{
    if (typeof window==="undefined") return "";
    const raw = JSON.stringify(payload);
    const compressed = LZString.compressToEncodedURIComponent(raw);
    return `${window.location.origin}/itinerary?d=${compressed}`;
  },[payload]);

  const copyToClipboard = async ()=>{
    try { await navigator.clipboard.writeText(shareUrl); setCopied(true); setTimeout(()=>setCopied(false), 1500); } catch {}
  };

  const downloadFile = (filename:string, content:string, type:string)=>{
    const blob = new Blob([content], {type});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  const downloadOfflineHTML = ()=>{
    const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Mi itinerario - Atlántico</title><style>body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Inter,Arial,sans-serif;margin:0;background:#0b0b0c;color:#eee}.wrap{max-width:900px;margin:0 auto;padding:16px 16px 40px}.card{background:#151517;border:1px solid #242428;border-radius:14px;padding:16px;margin:12px 0}.row{display:flex;gap:12px;align-items:center}.badge{display:inline-block;background:#e11d48;color:#fff;padding:4px 8px;border-radius:999px;font-size:12px}h1{font-size:22px;margin:8px 0 12px}h2{font-size:16px;margin:6px 0 8px;color:#fff}p,li,span,small{color:#b8b8be}img{max-width:100%;border-radius:10px;border:1px solid #242428}</style></head><body><div class="wrap"><div class="card"><span class="badge">Itinerario guardado</span><h1>Atlántico: tu aventura</h1><p id="meta"></p></div><div id="list"></div></div><script id="data" type="application/json">${JSON.stringify(payload)}</script><script>try{const d=JSON.parse(document.getElementById('data').textContent||'{}');const meta=document.getElementById('meta');const list=document.getElementById('list');const daysLabel=d.days===0?'Modo exploración':(d.days||1)+' día'+(((d.days||1)>1)?'s':'');meta.textContent='Duración: '+daysLabel+' • Lugares: '+(d.itinerary?.length||0);(d.itinerary||[]).forEach((s,i)=>{const card=document.createElement('div');card.className='card';card.innerHTML=\`<div class="row"><div class="badge">\${i+1}</div><h2 style="margin:0">\${s.name||'Destino'} <small>• \${s.municipality||''}</small></h2></div>\${s.imageUrl?'<img src="'+s.imageUrl+'" alt="foto" style="margin:10px 0" />':''}\${s.description?'<p>'+s.description+'</p>':''}<p><small>Tiempo sugerido: \${s.durationMinutes||60} min</small></p>\`;list.appendChild(card);});}catch(e){}</script></body></html>`;
    downloadFile("itinerario-offline.html", html, "text/html;charset=utf-8");
  };

  const webShare = async ()=>{
    if (navigator.share) { try { await navigator.share({ title:"Mi itinerario - Atlántico", url:shareUrl }); } catch {} }
    else { copyToClipboard(); }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}/>
        <motion.div initial={{y:40,opacity:0}} animate={{y:0,opacity:1}} exit={{y:40,opacity:0}} className="relative z-[121] w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl p-5 shadow-2xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-gray-900">Guardar & Compartir</h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-5 h-5 text-gray-500"/></button>
          </div>

          <div className="mb-4">
            <label className="text-sm text-gray-600 mb-1 block">Enlace para compartir</label>
            <div className="flex gap-2">
              <input value={shareUrl} readOnly className="flex-1 px-3 py-2 rounded-lg border border-gray-300 text-sm" onFocus={(e)=>e.currentTarget.select()}/>
              <button onClick={copyToClipboard} className="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50" title="Copiar">
                {copied ? <Check className="w-4 h-4 text-green-600"/> : <Copy className="w-4 h-4"/>}
              </button>
              <button onClick={webShare} className="px-3 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700" title="Compartir">
                <Share2 className="w-4 h-4"/>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-1 gap-3">
            <button onClick={downloadOfflineHTML} className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gray-900 text-white hover:bg-black">
              <Download className="w-4 h-4"/> HTML offline
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-3">El enlace incluye tu itinerario (comprimido). El archivo HTML funciona sin internet.</p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
