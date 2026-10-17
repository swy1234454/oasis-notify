'use strict';
(() => {
 const root = document.getElementById('notifications');
 const positions = new Set(['top','top-right','top-left','bottom','bottom-right','bottom-left','center-right','center-left']);
 const titles = {success:'SUCCESS',warning:'WARNING',error:'ERROR',inform:'INFORMATION'};
 const queue = [], active = new Map(), ids = new Set();
 let maxVisible = 5, maxQueued = 30, sequence = 0;
 const bounded = (value, fallback, min, max) => Number.isFinite(Number(value)) ? Math.max(min,Math.min(Number(value),max)) : fallback;
 function pump() {
  while (queue.length && active.size < maxVisible) {
   const d = queue.shift(), key = ++sequence;
   let stack = root.querySelector('.' + d.position);
   if (!stack) { stack = document.createElement('section'); stack.className = 'stack ' + d.position; root.append(stack); }
   const card = document.createElement('article'); card.className = 'toast ' + d.type; card.setAttribute('role',d.type === 'error' ? 'alert' : 'status');
   const icon = document.createElement('img'); icon.src = 'assets/' + (d.type === 'success' ? 'success' : d.type === 'inform' ? 'info' : 'warning') + '.svg'; icon.alt = '';
   const title = document.createElement('div'); title.className = 'title'; title.textContent = d.title;
   const description = document.createElement('div'); description.className = 'description'; description.textContent = d.description;
   const track = document.createElement('div'); track.className = 'track'; const bar = document.createElement('div'); bar.className = 'bar'; track.append(bar);
   card.style.setProperty('--duration', d.duration + 'ms'); card.append(icon,title,description,track); stack.append(card); active.set(key,card);
   setTimeout(() => { card.classList.add('leaving'); setTimeout(() => {
    card.remove(); active.delete(key); if(d.id) ids.delete(d.id); if(!stack.children.length) stack.remove(); pump();
   },250); },d.duration);
  }
 }
 function receive(event) {
  const d = event.data; if (!d || typeof d !== 'object') return;
  if(d.action === 'config') { maxVisible = bounded(d.maxVisible,5,1,10); maxQueued = bounded(d.maxQueued,30,1,100); root.style.setProperty('--scale',bounded(d.scale,1,.65,2)); return; }
  if(d.action !== 'notify') return;
  const id = d.id == null ? null : String(d.id); if(id && ids.has(id)) return;
  if(queue.length >= maxQueued) return;
  const type = Object.hasOwn(titles,d.type) ? d.type : 'inform';
  queue.push({id,type,title:String(d.title || titles[type]).slice(0,160),description:String(d.description || '').slice(0,2000),position:positions.has(d.position) ? d.position : 'center-right',duration:bounded(d.duration,5000,500,60000)});
  if(id) ids.add(id); pump();
 }
 window.addEventListener('message',receive);
 if(typeof GetParentResourceName === 'function') {
  const ready = () => fetch(`https://${GetParentResourceName()}/ready`,{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'}).catch(() => setTimeout(ready,1000)); ready();
 } else if(new URLSearchParams(location.search).has('preview')) {
  document.body.style.setProperty('background-color','#5d646c','important');
  ['success','warning','inform'].forEach(type => receive({data:{action:'notify',type,description:'You have successfully failed.',duration:60000}}));
 }
})();
