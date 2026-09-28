const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];

// Point de connexion pour une API de téléconsultation réelle.
// Renseigner apiBaseUrl et tokenProvider pour remplacer automatiquement le mode démo.
const TELECONSULTATION_CONFIG={apiBaseUrl:'',roomEndpoint:'/v1/rooms',tokenProvider:async()=>null,iceServers:[{urls:'stun:stun.l.google.com:19302'}]};
class TeleconsultationConnector{
  constructor(config){this.config=config;this.mode=config.apiBaseUrl?'api':'demo'}
  async createRoom(appointmentId='demo-appointment'){
    if(this.mode==='demo') return {roomId:'demo-room',status:'ready',mode:'demo'};
    const token=await this.config.tokenProvider();
    const response=await fetch(`${this.config.apiBaseUrl}${this.config.roomEndpoint}`,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify({appointmentId})});
    if(!response.ok) throw new Error('Impossible de créer la salle');
    return response.json();
  }
  createPeerConnection(){return new RTCPeerConnection({iceServers:this.config.iceServers})}
}
const teleConnector=new TeleconsultationConnector(TELECONSULTATION_CONFIG);

const showToast=message=>{const toast=$('.toast');toast.textContent=message;toast.classList.add('show');clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>toast.classList.remove('show'),2800)};
const openModal=id=>{const modal=$(id);if(!modal){if(id==='#appointmentModal')location.href='services.html#catalogue';return}modal.hidden=false;document.body.classList.add('modal-open');setTimeout(()=>$('.modal-close',modal)?.focus(),50)};
const closeModal=modal=>{modal.hidden=true;document.body.classList.remove('modal-open');if(modal.id==='teleModal') resetTeleconsultation()};

$$('[data-action="appointment"]').forEach(btn=>btn.addEventListener('click',()=>openModal('#appointmentModal')));
$$('[data-action="dashboard"]').forEach(btn=>btn.addEventListener('click',()=>location.href='patient.html'));
$$('[data-action="teleconsult"]').forEach(btn=>btn.addEventListener('click',()=>location.href='teleconsultation.html'));
$$('[data-close]').forEach(btn=>btn.addEventListener('click',()=>closeModal(btn.closest('.modal'))));
$$('.modal').forEach(modal=>modal.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal(modal)}));

const header=$('#header');addEventListener('scroll',()=>header.classList.toggle('scrolled',scrollY>30),{passive:true});
const menuBtn=$('.menu-toggle'), mobileMenu=$('.mobile-menu');menuBtn.addEventListener('click',()=>{const open=mobileMenu.classList.toggle('open');menuBtn.setAttribute('aria-expanded',open);mobileMenu.setAttribute('aria-hidden',!open)});$$('.mobile-menu a').forEach(a=>a.addEventListener('click',()=>mobileMenu.classList.remove('open')));

const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}}),{threshold:.12});$$('.reveal').forEach(el=>observer.observe(el));
const countObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(!entry.isIntersecting)return;const el=entry.target,target=+el.dataset.count;let start=0;const timer=setInterval(()=>{start++;el.textContent=start;if(start>=target)clearInterval(timer)},120);countObserver.unobserve(el)}),{threshold:.7});$$('[data-count]').forEach(el=>countObserver.observe(el));

let booking={type:'',date:'Aujourd’hui 28 septembre',time:''};
const setBookingStep=n=>{$$('.booking-step').forEach(el=>el.classList.toggle('active',el.dataset.step==n));$$('.modal-progress span').forEach((el,i)=>el.classList.toggle('active',i<n))};
$$('[data-booking]').forEach(btn=>btn.addEventListener('click',()=>{booking.type=btn.dataset.booking;setBookingStep(2)}));
$('.back-step').addEventListener('click',()=>setBookingStep(1));
$$('.date').forEach(btn=>btn.addEventListener('click',()=>{$$('.date').forEach(b=>b.classList.remove('active'));btn.classList.add('active');booking.date=`${$('small',btn).textContent} ${$('b',btn).textContent} ${$('span',btn).textContent}`}));
$$('.time-grid button').forEach(btn=>btn.addEventListener('click',()=>{$$('.time-grid button').forEach(b=>b.classList.remove('active'));btn.classList.add('active');booking.time=btn.textContent;$('.confirm-time').disabled=false}));
$('.confirm-time').addEventListener('click',()=>{$('.booking-summary').textContent=`${booking.type} · ${booking.date} à ${booking.time}.`;setBookingStep(3);showToast('Votre rendez-vous est confirmé')});

$$('[data-dash]').forEach(btn=>btn.addEventListener('click',()=>{$$('[data-dash]').forEach(b=>b.classList.remove('active'));btn.classList.add('active');if(btn.dataset.dash!=='overview')showToast('Vue interactive disponible dans la prochaine connexion API')}));

const teleSteps={preflight:$('[data-tele-step="preflight"]'),room:$('[data-tele-step="room"]'),ended:$('[data-tele-step="ended"]')};
const setTeleStep=name=>Object.entries(teleSteps).forEach(([key,el])=>el.classList.toggle('active',key===name));
let stream=null,callTimer=null,seconds=0;
async function toggleCamera(button){
  if(stream){stream.getTracks().forEach(track=>track.stop());stream=null;$('.video-preview video').srcObject=null;$('.camera-placeholder').style.display='grid';button.classList.remove('active');return}
  try{stream=await navigator.mediaDevices.getUserMedia({video:true,audio:false});$('.video-preview video').srcObject=stream;$('.camera-placeholder').style.display='none';button.classList.add('active');showToast('Caméra activée localement')}catch{showToast('Caméra indisponible — la démo continue sans vidéo')}
}
$$('[data-device="camera"]').forEach(btn=>btn.addEventListener('click',()=>{if(btn.closest('.preflight'))toggleCamera(btn);else{btn.classList.toggle('active');showToast(btn.classList.contains('active')?'Caméra activée':'Caméra coupée')}}));
$$('[data-device="mic"]').forEach(btn=>btn.addEventListener('click',()=>{btn.classList.toggle('active');showToast(btn.classList.contains('active')?'Micro activé':'Micro coupé')}));
$('.join-call').addEventListener('click',async()=>{const button=$('.join-call');button.disabled=true;button.textContent='Connexion sécurisée…';try{await teleConnector.createRoom();setTeleStep('room');seconds=0;callTimer=setInterval(()=>{seconds++;$('.call-duration').textContent=`${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`},1000)}catch{showToast('Connexion impossible. Réessayez dans un instant.')}finally{button.disabled=false;button.innerHTML='Rejoindre la salle d’attente <span>→</span>'}});
$('.end-call').addEventListener('click',()=>{clearInterval(callTimer);setTeleStep('ended');if(stream){stream.getTracks().forEach(t=>t.stop());stream=null}});
$$('.rating button').forEach((btn,i)=>btn.addEventListener('click',()=>{$$('.rating button').forEach((b,j)=>b.classList.toggle('selected',j<=i));showToast('Merci pour votre avis')}));
function resetTeleconsultation(){clearInterval(callTimer);if(stream){stream.getTracks().forEach(t=>t.stop());stream=null}setTeleStep('preflight');$('.camera-placeholder').style.display='grid';$('.video-preview video').srcObject=null}

// Garde les interactions locales et légères; le backend peut écouter ces événements.
document.dispatchEvent(new CustomEvent('bmc:ready',{detail:{teleconsultationMode:teleConnector.mode}}));
