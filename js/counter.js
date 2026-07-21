/* ============================================
   Ecklet Engineering — counter.js
   Stat number counter animation (index.html only)
   ============================================ */
const cObs=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(!entry.isIntersecting)return;
    const el=entry.target;
    const tn=[...el.childNodes].find(n=>n.nodeType===3);
    const target=parseInt(tn?.textContent||el.textContent);
    if(isNaN(target))return;
    let cur=0;const step=Math.ceil(target/40);
    const t=setInterval(()=>{cur=Math.min(cur+step,target);tn.textContent=cur;if(cur>=target)clearInterval(t);},40);
    cObs.unobserve(el);
  });
},{threshold:.5});
document.querySelectorAll('.stat-number').forEach(el=>cObs.observe(el));
