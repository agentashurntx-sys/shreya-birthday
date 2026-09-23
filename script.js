const $=s=>document.querySelector(s);
const target=new Date("2026-09-23T00:00:00+05:30").getTime();
function tick(){let d=Math.max(0,target-Date.now());let D=Math.floor(d/86400000);d%=86400000;let H=Math.floor(d/3600000);d%=3600000;let M=Math.floor(d/60000);let S=Math.floor((d%60000)/1000);$("#days").textContent=String(D).padStart(2,"0");$("#hours").textContent=String(H).padStart(2,"0");$("#mins").textContent=String(M).padStart(2,"0");$("#secs").textContent=String(S).padStart(2,"0");if(target-Date.now()<=0){document.querySelector(".countdown .eyebrow").textContent="Today is your day ♥";burst(45)}}tick();setInterval(tick,1000);
$("#start").onclick=()=>{burst(20);$("#countdown").scrollIntoView({behavior:"smooth"})};
$("#openSecret").onclick=()=>{burst(35);$("#secretText").classList.add("show");$("#openSecret").textContent="I love you ❤️";};
const music=$("#music"),musicBtn=$("#musicBtn");musicBtn.onclick=async()=>{try{if(music.paused){await music.play();musicBtn.textContent="❚❚"}else{music.pause();musicBtn.textContent="♫"}}catch(e){alert("Music ke liye assets folder me music.mp3 naam ki file rakho.")}};
function burst(n){for(let i=0;i<n;i++)setTimeout(()=>{let p=document.createElement("div");p.className="petal";p.textContent=Math.random()>.25?"♥":"✦";p.style.left=Math.random()*100+"vw";p.style.fontSize=10+Math.random()*18+"px";p.style.animationDuration=3+Math.random()*4+"s";$("#petals").appendChild(p);setTimeout(()=>p.remove(),8000)},i*35)}
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add("visible")}),{threshold:.12});document.querySelectorAll(".reveal").forEach(e=>io.observe(e));

// Photo zoom / fullscreen lightbox
const lightbox=$("#lightbox"), lightboxImg=$("#lightboxImg"), closeLb=$("#lightboxClose"), zoomIn=$("#zoomIn"), zoomOut=$("#zoomOut");
let zoom=1;
function setZoom(v){zoom=Math.min(3,Math.max(1,v));lightboxImg.style.transform=`scale(${zoom})`; }
document.querySelectorAll(".zoomable").forEach(img=>img.addEventListener("click",()=>{lightbox.classList.add("open");lightbox.setAttribute("aria-hidden","false");lightboxImg.src=img.src;lightboxImg.alt=img.alt||"Expanded photo";setZoom(1);}));
function closeLightbox(){lightbox.classList.remove("open");lightbox.setAttribute("aria-hidden","true");setZoom(1);lightboxImg.src="";}
closeLb.onclick=closeLightbox;lightbox.addEventListener("click",e=>{if(e.target===lightbox)closeLightbox();});
zoomIn.onclick=()=>setZoom(zoom+.25);zoomOut.onclick=()=>setZoom(zoom-.25);
lightboxImg.addEventListener("click",()=>setZoom(zoom>=3?1:zoom+.5));
document.addEventListener("keydown",e=>{if(!lightbox.classList.contains("open"))return;if(e.key==="Escape")closeLightbox();if(e.key==="+")setZoom(zoom+.25);if(e.key==="-")setZoom(zoom-.25);});
let touchStartDist=0;
lightboxImg.addEventListener("touchstart",e=>{if(e.touches.length===2){touchStartDist=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);}}, {passive:true});
lightboxImg.addEventListener("touchmove",e=>{if(e.touches.length===2&&touchStartDist){const d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);setZoom(zoom+(d-touchStartDist)/500);touchStartDist=d;}},{passive:true});
lightboxImg.addEventListener("touchend",()=>touchStartDist=0);


// Interactive candle blowing using the device microphone.
const blowBtn = $("#blowBtn"), relightBtn = $("#relightBtn"), micStatus = $("#micStatus");
const candles = [...document.querySelectorAll(".candle")];
let audioContext = null, analyser = null, micStream = null, blowTimer = null, micLoop = null, candlesOut = false;
function setCandlesOut(out){ candlesOut=out; document.querySelector(".cake-scene").classList.toggle("blown",out); candles.forEach(c=>c.classList.toggle("out",out)); }
function stopMic(){ if(micLoop)cancelAnimationFrame(micLoop); micLoop=null; if(micStream){micStream.getTracks().forEach(t=>t.stop()); micStream=null;} if(audioContext){audioContext.close().catch(()=>{}); audioContext=null;} analyser=null; }
async function startBlowing(){
  try{
    if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){ throw new Error("Mic unavailable"); }
    micStatus.textContent="Listening… now blow! 🎤💨";
    micStream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true}});
    audioContext=new (window.AudioContext||window.webkitAudioContext)();
    const source=audioContext.createMediaStreamSource(micStream);
    analyser=audioContext.createAnalyser(); analyser.fftSize=1024; analyser.smoothingTimeConstant=.75;
    source.connect(analyser);
    const data=new Uint8Array(analyser.fftSize);
    const check=()=>{
      if(!analyser||candlesOut)return;
      analyser.getByteTimeDomainData(data); let sum=0;
      for(let i=0;i<data.length;i++){const x=(data[i]-128)/128; sum+=x*x;}
      const rms=Math.sqrt(sum/data.length);
      // Require a clearly audible blow for a short sustained period.
      if(rms>.095){ if(!blowTimer)blowTimer=performance.now(); if(performance.now()-blowTimer>260){ setCandlesOut(true); micStatus.textContent="YAY! Candles blown out! 🎉❤️ Make your wish!"; burst(55); stopMic(); return; }} else {blowTimer=null;}
      micLoop=requestAnimationFrame(check);
    };
    check();
  }catch(e){
    micStatus.textContent="Microphone permission nahi mili. Browser settings me mic allow karke phir try karo. 🎤";
    stopMic();
  }
}
blowBtn?.addEventListener("click",()=>{ if(candlesOut)setCandlesOut(false); startBlowing(); });
relightBtn?.addEventListener("click",()=>{stopMic(); blowTimer=null; setCandlesOut(false); micStatus.textContent="Ready! Tap the mic button and blow again. 🎤";});

// Live floating birthday balloons
const balloonLayer=$("#balloons");
const balloonTones=["#ff78ad","#ffb3c9","#d99cff","#ffd166","#ff8f70","#9ddcff","#f7a8d8"];
function launchBalloon(){
  if(!balloonLayer)return;
  const b=document.createElement("span"); b.className="balloon";
  b.style.left=(Math.random()*96)+"vw";
  b.style.background=balloonTones[Math.floor(Math.random()*balloonTones.length)];
  b.style.setProperty("--drift",(-90+Math.random()*180)+"px");
  b.style.animationDuration=(9+Math.random()*8)+"s";
  b.style.animationDelay=(Math.random()*.8)+"s";
  b.style.transform=`scale(${.75+Math.random()*.5})`;
  balloonLayer.appendChild(b);
  setTimeout(()=>b.remove(),18000);
}
for(let i=0;i<9;i++)setTimeout(launchBalloon,i*450);
setInterval(launchBalloon,1200);

// Direct-letter version: no microphone gate. The birthday letter is visible on load.

// Floating hearts confined to the birthday letter.
(function(){
  const box=document.getElementById('letterHearts');
  if(!box) return;
  const hearts=['❤️','💗','💕','💖','💞','🩷','♥️'];
  function spawnHeart(){
    const h=document.createElement('span');
    h.className='letter-heart';
    h.textContent=hearts[Math.floor(Math.random()*hearts.length)];
    h.style.left=(3+Math.random()*94)+'%';
    h.style.setProperty('--drift',((Math.random()*2-1)*90)+'px');
    h.style.setProperty('--dur',(5.5+Math.random()*4.5)+'s');
    h.style.fontSize=(16+Math.random()*17)+'px';
    box.appendChild(h);
    h.addEventListener('animationend',()=>h.remove(),{once:true});
  }
  for(let i=0;i<10;i++) setTimeout(spawnHeart,i*280);
  setInterval(spawnHeart,520);
})();
