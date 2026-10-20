const $ = s => document.querySelector(s);
const chosen = new Map();
const msgbox = $("#messages");
// Identificador local para que distintas pestañas/sesiones no compartan historial.
let sessionId = sessionStorage.getItem("salu_session_id");
if (!sessionId) {
  sessionId = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : `salu_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  sessionStorage.setItem("salu_session_id", sessionId);
}
let busy = false;
function setState(state, text) {
  $("#corestate").textContent = text;
  document.body.classList.remove("busy","listening");
  if(state) document.body.classList.add(state);
}
function addMessage(who, text, isError=false) {
  const wrap=document.createElement("div"); wrap.className="msg "+(who==="TÚ"?"user":"assistant");
  const label=document.createElement("div"); label.className="who"; label.textContent=(who==="TÚ"?"◈ ":"◆ ")+who;
  const bubble=document.createElement("div"); bubble.className="bubble"+(isError?" error":"");
  if(who==="TÚ" || isError) bubble.textContent=text;
  else {
    const html=window.marked ? marked.parse(text) : text.replaceAll("\n","<br>");
    bubble.innerHTML=window.DOMPurify?DOMPurify.sanitize(html):html;
  }
  wrap.append(label,bubble); msgbox.append(wrap); msgbox.scrollTop=msgbox.scrollHeight;
  if(window.MathJax && who!=="TÚ") MathJax.typesetPromise([bubble]).catch(()=>{});
}
function refreshSelected(){
  $("#selectedhint").textContent=chosen.size ? `${chosen.size} archivo(s) adjunto(s) a la próxima pregunta` : "Sin archivos adjuntos seleccionados";
}
async function uploadFiles(files){
  for(const file of files){
    const data=new FormData(); data.append("file",file);
    const item=document.createElement("div"); item.className="fileitem"; item.innerHTML='<span>◫</span><span class="fname"></span><span>…</span>';
    item.querySelector(".fname").textContent=file.name; $("#filelist").prepend(item);
    try{
      const res=await fetch("/api/upload",{method:"POST",body:data}); const j=await res.json();
      if(!res.ok) throw new Error(j.error||"No se pudo cargar");
      chosen.set(j.id,j.name); item.lastElementChild.textContent="✓"; item.title=j.preview||"";
      item.querySelector(".fname").title=j.note||j.preview||"";
      const remove=document.createElement("button"); remove.textContent="×"; remove.title="Quitar de la selección"; remove.onclick=()=>{chosen.delete(j.id);item.remove();refreshSelected()};item.append(remove);
      addMessage("SALU",`Archivo listo: **${j.name}** (${j.chars.toLocaleString()} caracteres extraídos).${j.note?"\n\nNota: "+j.note:""}\n\nPuedes preguntarme sobre él.`,false);
    }catch(e){item.lastElementChild.textContent="!";item.title=e.message;addMessage("SALU","No pude procesar "+file.name+": "+e.message,true)}
  }
  refreshSelected();
}
$("#filepick").addEventListener("change",e=>uploadFiles([...e.target.files]));
const dz=$("#dropzone"); dz.addEventListener("dragover",e=>{e.preventDefault();dz.classList.add("drag")});dz.addEventListener("dragleave",()=>dz.classList.remove("drag"));dz.addEventListener("drop",e=>{e.preventDefault();dz.classList.remove("drag");uploadFiles([...e.dataTransfer.files])});
async function sendMessage(textOverride){
  if(busy)return;const input=$("#input");const text=(textOverride||input.value).trim();if(!text)return;
  input.value="";busy=true;$("#send").disabled=true;setState("busy","PROCESANDO");addMessage("TÚ",text);
  try{
    const res=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:text,documents:[...chosen.keys()],session_id:sessionId})});
    const j=await res.json();if(!res.ok)throw new Error(j.error||"Error al responder");
    addMessage("SALU",j.answer);setState("listening","EN ESPERA");
  }catch(e){addMessage("SALU",e.message,true);setState("","ERROR")}
  finally{busy=false;$("#send").disabled=false;input.focus()}
}
$("#send").onclick=()=>sendMessage();
$("#input").addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMessage()}});
$("#clear").onclick=async()=>{
  try {
    await fetch("/api/history/clear",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({session_id:sessionId})});
    msgbox.innerHTML="";
    addMessage("SALU","Conversación reiniciada. Ya no usaré los mensajes anteriores como contexto.");
  } catch(e) {
    addMessage("SALU","No pude reiniciar el historial del servidor. Inténtalo de nuevo.",true);
  }
};
document.querySelectorAll("[data-prompt]").forEach(b=>b.onclick=()=>sendMessage(b.dataset.prompt));
async function refreshStatus(){
  try{const r=await fetch("/api/status");const s=await r.json();$("#dot").style.background=s.ok?"#38e6a4":"#ff657f";$("#status").textContent=s.ok?"OLLAMA CONECTADO":"OLLAMA DESCONECTADO";$("#model").textContent=s.model;$("#memcount").textContent=s.memory_count;$("#engine").textContent=s.ok?"En línea":"Sin conexión";$("#corehint").textContent=s.ok?"Listo para ayudarte con tus ideas, documentos y ejercicios.":`No se detecta Ollama. ${s.error||"Inicia Ollama y vuelve a comprobar."}`;if(!s.ok)$("#corestate").textContent="SIN CONEXIÓN";}
  catch(e){$("#status").textContent="BACKEND DESCONECTADO";$("#dot").style.background="#ff657f"}
}
$("#showmemory").onclick=async()=>{const r=await fetch("/api/memory");const j=await r.json();const box=$("#memorybox");box.innerHTML="";const entries=Object.entries(j.memory||{});if(!entries.length){box.textContent="Todavía no hay recuerdos guardados.";return}entries.forEach(([k,v])=>{const p=document.createElement("p");p.textContent=k+": "+(typeof v==="string"?v:JSON.stringify(v));box.append(p)})};
refreshStatus();setInterval(refreshStatus,12000);
