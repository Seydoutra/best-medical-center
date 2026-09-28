const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const toast=message=>{const el=$('.toast');if(!el)return;el.textContent=message;el.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('show'),2600)};

// Navigation et animation progressive, sans bibliothèque externe.
const header=$('.site-header');if(header)addEventListener('scroll',()=>header.classList.toggle('scrolled',scrollY>25),{passive:true});
const menu=$('.menu-toggle'),mobile=$('.mobile-menu');if(menu&&mobile)menu.addEventListener('click',()=>{const open=mobile.classList.toggle('open');menu.setAttribute('aria-expanded',open)});
if('IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}}),{threshold:.1});$$('.reveal').forEach(el=>observer.observe(el))}else $$('.reveal').forEach(el=>el.classList.add('visible'));
$$('[data-toast]').forEach(button=>button.addEventListener('click',()=>toast(button.dataset.toast)));

// Sélecteur de service et créneaux.
const drawer=$('.service-drawer');
if(drawer){$$('[data-service]').forEach(button=>button.addEventListener('click',()=>{$('.drawer-service').textContent=button.dataset.service;drawer.hidden=false;document.body.classList.add('modal-open')}));$$('[data-drawer-close]').forEach(button=>button.addEventListener('click',()=>{drawer.hidden=true;document.body.classList.remove('modal-open')}));$$('.slot-days button').forEach(button=>button.addEventListener('click',()=>{$$('.slot-days button').forEach(b=>b.classList.remove('active'));button.classList.add('active')}));$$('.slot-times button').forEach(button=>button.addEventListener('click',()=>{$$('.slot-times button').forEach(b=>b.classList.remove('active'));button.classList.add('active');$('.drawer-confirm').disabled=false}));$('.drawer-confirm').addEventListener('click',()=>{toast('Rendez-vous de démonstration confirmé');drawer.hidden=true;document.body.classList.remove('modal-open')})}

// Recherche et réservation laboratoire.
const labSearch=$('.lab-search input');if(labSearch)labSearch.addEventListener('input',()=>{let visible=0;$$('.lab-row[data-lab]').forEach(row=>{const show=row.dataset.lab.toLowerCase().includes(labSearch.value.toLowerCase());row.hidden=!show;if(show)visible++});$('.lab-empty').hidden=visible>0});
$$('[data-lab] button,[data-lab-book]').forEach(button=>button.addEventListener('click',()=>toast('Créneau de prélèvement ajouté à la sélection')));

// Annuaire et parcours des médecins.
$$('[data-filter]').forEach(button=>button.addEventListener('click',()=>{$$('[data-filter]').forEach(b=>b.classList.remove('active'));button.classList.add('active');$$('.doctor-card').forEach(card=>card.hidden=button.dataset.filter!=='all'&&card.dataset.specialty!==button.dataset.filter)}));
const profileModal=$('.profile-modal');$$('[data-doctor]').forEach(button=>button.addEventListener('click',()=>{if(!profileModal)return;$('.profile-modal h2').textContent=button.dataset.doctor;$('.profile-path').textContent=button.dataset.path;$('.profile-avatar').textContent=button.dataset.doctor.split(' ').slice(-1)[0].slice(0,2).toUpperCase();profileModal.hidden=false;document.body.classList.add('modal-open')}));$$('[data-profile-close]').forEach(button=>button.addEventListener('click',()=>{profileModal.hidden=true;document.body.classList.remove('modal-open')}));

// Simulateur d’assurance.
const coverage=$('#coverageForm');if(coverage)coverage.addEventListener('submit',event=>{event.preventDefault();$('.coverage-result').hidden=false;toast('Simulation terminée — résultat indicatif')});

// Tableau de bord patient.
function openPatientView(name){$$('[data-view]').forEach(button=>button.classList.toggle('active',button.dataset.view===name));$$('[data-panel]').forEach(panel=>panel.classList.toggle('active',panel.dataset.panel===name));scrollTo({top:0,behavior:'smooth'})}
$$('[data-view]').forEach(button=>button.addEventListener('click',()=>openPatientView(button.dataset.view)));$$('[data-view-jump]').forEach(button=>button.addEventListener('click',()=>openPatientView(button.dataset.viewJump)));
$$('[data-doc]').forEach(card=>card.addEventListener('click',()=>{$$('[data-doc]').forEach(c=>c.classList.remove('selected'));card.classList.add('selected');const title=$('strong',card).textContent;$('.preview-toolbar>span').textContent=title.replaceAll(' ','_')+'.pdf';$('.paper h2').textContent=title;toast('Aperçu du document chargé')}));
const messageForm=$('.conversation form');if(messageForm)messageForm.addEventListener('submit',event=>{event.preventDefault();const input=$('input',messageForm);if(!input.value.trim())return;const message=document.createElement('p');message.className='sent';message.innerHTML=`${input.value.replace(/[<>]/g,'')}<small>À l’instant</small>`;$('.messages').append(message);input.value='';toast('Message ajouté à la conversation de démonstration')});

// Téléconsultation: couche prête à brancher à un endpoint de création de salle.
const VIDEO_API={baseUrl:'',createRoomEndpoint:'/v1/teleconsultations',tokenProvider:async()=>null};
let consultationContext={mode:'scheduled',symptom:'Consultation programmée'},mediaStream=null,clock=null,elapsed=0;
const teleIntro=$('.tele-intro'),teleFlow=$('.tele-flow');
function showFlow(name,step=1){if(!teleFlow)return;teleIntro.hidden=true;teleFlow.hidden=false;$$('[data-flow]').forEach(el=>el.hidden=el.dataset.flow!==name);$$('.flow-progress span').forEach((el,i)=>el.classList.toggle('active',i<step));$('.flow-progress small b').textContent=step}
$$('[data-care-mode]').forEach(button=>button.addEventListener('click',()=>{consultationContext.mode=button.dataset.careMode;showFlow(button.dataset.careMode,1)}));
if(teleFlow){const mode=new URLSearchParams(location.search).get('mode');if(mode==='urgent'||mode==='scheduled'){consultationContext.mode=mode;showFlow(mode,1)}}
const flowBack=$('[data-flow-back]');if(flowBack)flowBack.addEventListener('click',()=>{teleFlow.hidden=true;teleIntro.hidden=false;$$('[data-flow]').forEach(el=>el.hidden=true)});
const triage=$('#triageForm');if(triage)triage.addEventListener('submit',event=>{event.preventDefault();const data=new FormData(triage);consultationContext.symptom=data.get('symptom')||'Autre';$('.summary-symptom').textContent=consultationContext.symptom;$('.room-symptom').textContent=`${consultationContext.symptom} · ${data.get('duration')}`;showFlow('result',2)});
$$('[data-start-preflight]').forEach(button=>button.addEventListener('click',()=>showFlow('preflight',2)));
const cameraButton=$('.preflight-page [data-device="camera"]');if(cameraButton)cameraButton.addEventListener('click',async()=>{if(mediaStream){mediaStream.getTracks().forEach(track=>track.stop());mediaStream=null;$('.video-preview video').srcObject=null;$('.camera-placeholder').style.display='grid';cameraButton.classList.remove('active');return}try{mediaStream=await navigator.mediaDevices.getUserMedia({video:true,audio:false});$('.video-preview video').srcObject=mediaStream;$('.camera-placeholder').style.display='none';cameraButton.classList.add('active');toast('Caméra activée localement')}catch{toast('Caméra indisponible — vous pouvez continuer sans vidéo')}});
const micButton=$('.preflight-page [data-device="mic"]');if(micButton)micButton.addEventListener('click',()=>{micButton.classList.toggle('active');toast(micButton.classList.contains('active')?'Micro activé':'Micro coupé')});
async function createRemoteRoom(){if(!VIDEO_API.baseUrl)return {id:'demo-room',mode:'demo'};const token=await VIDEO_API.tokenProvider();const response=await fetch(`${VIDEO_API.baseUrl}${VIDEO_API.createRoomEndpoint}`,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify(consultationContext)});if(!response.ok)throw new Error('room_creation_failed');return response.json()}
const enterRoom=$('[data-enter-room]');if(enterRoom)enterRoom.addEventListener('click',async()=>{enterRoom.disabled=true;enterRoom.textContent='Connexion…';try{await createRemoteRoom();showFlow('room',3);elapsed=0;clock=setInterval(()=>{elapsed++;$('.call-duration').textContent=`${String(Math.floor(elapsed/60)).padStart(2,'0')}:${String(elapsed%60).padStart(2,'0')}`},1000)}catch{toast('Connexion impossible. Réessayez.')}finally{enterRoom.disabled=false;enterRoom.textContent='Entrer dans la salle →'}});
$$('[data-room-device]').forEach(button=>button.addEventListener('click',()=>button.classList.toggle('active')));const endConsult=$('.end-consult');if(endConsult)endConsult.addEventListener('click',()=>{clearInterval(clock);if(mediaStream)mediaStream.getTracks().forEach(track=>track.stop());showFlow('ended',3)});
