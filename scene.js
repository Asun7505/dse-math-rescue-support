/* Original procedural geometry. No borrowed models, images, fonts or remote requests. */
(()=>{
  'use strict';
  const wrap=document.querySelector('.scene-wrap'),canvas=wrap?.querySelector('canvas');if(!canvas)return;
  const ctx=canvas.getContext('2d',{alpha:true});if(!ctx)return;
  const type=wrap.dataset.scene,reduce=matchMedia('(prefers-reduced-motion: reduce)');
  let width=0,height=0,dpr=1,time=0,last=0,raf=0,visible=true,paused=reduce.matches,yaw=.1,targetYaw=.1,px=0,py=0,tx=0,ty=0;
  const TAU=Math.PI*2,phi=(1+Math.sqrt(5))/2;
  const icoV=[[-1,phi,0],[1,phi,0],[-1,-phi,0],[1,-phi,0],[0,-1,phi],[0,1,phi],[0,-1,-phi],[0,1,-phi],[phi,0,-1],[phi,0,1],[-phi,0,-1],[-phi,0,1]].map(v=>v.map(n=>n/Math.sqrt(1+phi*phi)));
  const icoF=[[0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],[1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],[3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],[4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1]];
  const cubeV=[[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]],cubeF=[[0,3,2,1],[4,5,6,7],[0,4,7,3],[1,2,6,5],[0,1,5,4],[3,7,6,2]];
  const octV=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]],octF=[[0,2,4],[4,2,1],[1,2,5],[5,2,0],[0,4,3],[4,1,3],[1,5,3],[5,0,3]];
  const rotate=(v,x,y,z=0)=>{let [a,b,c]=v;[b,c]=[b*Math.cos(x)-c*Math.sin(x),b*Math.sin(x)+c*Math.cos(x)];[a,c]=[a*Math.cos(y)+c*Math.sin(y),-a*Math.sin(y)+c*Math.cos(y)];return [a*Math.cos(z)-b*Math.sin(z),a*Math.sin(z)+b*Math.cos(z),c];};
  const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
  const sub=(a,b)=>a.map((n,i)=>n-b[i]);
  const colours={ice:[160,194,238],gold:[245,212,82],navy:[42,70,119],cyan:[155,214,223]};
  let scale=1,cx=0,cy=0;
  const project=v=>{const depth=5/(5+v[2]);return [cx+v[0]*scale*depth,cy+v[1]*scale*depth];};
  const line=(points,stroke,lineWidth=1,closed=false)=>{ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));if(closed)ctx.closePath();ctx.strokeStyle=stroke;ctx.lineWidth=lineWidth;ctx.stroke();};
  function mesh(vertices,faces,position,size,rotation,colour,wire=false){
    const transformed=vertices.map(v=>rotate(v,...rotation).map((n,i)=>n*size+position[i]));
    const polys=faces.map(face=>{const points=face.map(i=>transformed[i]);const normal=cross(sub(points[1],points[0]),sub(points[2],points[0])),length=Math.hypot(...normal)||1;const light=.62+.3*Math.max(-.8,Math.min(1,(normal[0]*-.35+normal[1]*-.65+normal[2]*-1)/length));return {points,z:points.reduce((s,p)=>s+p[2],0)/points.length,light};}).sort((a,b)=>b.z-a.z);
    for(const poly of polys){const points=poly.points.map(project);ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.closePath();if(!wire){ctx.fillStyle=`rgb(${colour.map(n=>Math.round(Math.min(255,n*poly.light))).join(',')})`;ctx.fill();}ctx.strokeStyle=wire?'rgba(183,221,250,.63)':'rgba(22,50,94,.72)';ctx.lineWidth=wire?1.3:.85;ctx.stroke();}
  }
  function ring(radius,ry,rotation,colour,z=0){const points=[];for(let i=0;i<=96;i++){const a=i/96*TAU;points.push(project(rotate([Math.cos(a)*radius,Math.sin(a)*ry,z],...rotation)));}line(points,colour,.8);}
  function sparkle(x,y,size,colour){ctx.save();ctx.translate(x,y);ctx.beginPath();ctx.moveTo(0,-size);ctx.quadraticCurveTo(size*.2,-size*.2,size,0);ctx.quadraticCurveTo(size*.2,size*.2,0,size);ctx.quadraticCurveTo(-size*.2,size*.2,-size,0);ctx.quadraticCurveTo(-size*.2,-size*.2,0,-size);ctx.fillStyle=colour;ctx.fill();ctx.restore();}
  function render(){
    if(!width||!height)return;ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,width,height);scale=Math.min(width*.32,height*.39);cx=width*.51;cy=height*.48;
    const bob=Math.sin(time*.6)*.06,rot=paused ? .22 : time*.07;
    const glow=ctx.createRadialGradient(cx,cy,0,cx,cy,scale*1.65);glow.addColorStop(0,'rgba(160,202,255,.1)');glow.addColorStop(1,'rgba(140,190,255,0)');ctx.fillStyle=glow;ctx.fillRect(0,0,width,height);
    for(let i=0;i<25;i++){const x=((i*173.39)%997)/997*width,y=((i*293.17)%991)/991*height,alpha=.18+Math.sin(time*.4+i)*.08;ctx.fillStyle=`rgba(210,227,255,${alpha})`;ctx.beginPath();ctx.arc(x,y,i%4===0?1.2:.6,0,TAU);ctx.fill();}
    const cameraX=.15+py*.08,cameraY=yaw+px*.12;
    ring(1.47,.43,[.28,.15,-.3],'rgba(175,205,246,.24)',.4);ring(1.63,.5,[.28,.15,-.3],'rgba(175,205,246,.1)',.4);
    const shadow=ctx.createRadialGradient(cx,cy+scale*.95,0,cx,cy+scale*.95,scale*.8);shadow.addColorStop(0,'rgba(2,18,50,.3)');shadow.addColorStop(1,'rgba(2,18,50,0)');ctx.save();ctx.translate(0,cy+scale*.95);ctx.scale(1,.2);ctx.translate(0,-cy-scale*.95);ctx.fillStyle=shadow;ctx.fillRect(cx-scale,cy-scale,scale*2,scale*3);ctx.restore();
    mesh(cubeV,cubeF,[-1.15,-.7+bob,1.2],.17,[.3,rot+.6,.25],colours.navy);
    mesh(octV,octF,[1.35,.67-bob,.9],.22,[rot,.3,.3],colours.ice);
    if(type==='home'){
      mesh(icoV,icoF,[.15,bob,0],.85,[cameraX+.3,cameraY+rot,-.2],colours.ice);
      mesh(cubeV,cubeF,[-.85,.85-bob,-.8],.22,[.15,cameraY+.5,-.28],colours.gold);
      mesh(octV,octF,[.85,-1.02-bob,-.5],.19,[.4,rot,.3],colours.cyan);
    }else if(type==='privacy'){
      mesh(cubeV,cubeF,[0,bob,.25],.64,[cameraX-.16,cameraY+.45,-.12],colours.ice,true);
      mesh(icoV,icoF,[0,bob,-.1],.48,[cameraX+.3,cameraY+rot,-.2],colours.cyan);
      const shield=[[-.24,-.31,-.85],[.24,-.31,-.85],[.26,.04,-.85],[0,.34,-.85],[-.26,.04,-.85]].map(v=>project(rotate(v,.02,cameraY*.2,0)));ctx.beginPath();shield.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.closePath();ctx.fillStyle='#f6d958';ctx.fill();ctx.strokeStyle='#233e6c';ctx.lineWidth=1.4;ctx.stroke();line([[-.12,.01,-.86],[-.02,.11,-.86],[.15,-.09,-.86]].map(v=>project(v)),'#213b67',2);
      mesh(cubeV,cubeF,[-1.1,.77-bob,-.4],.17,[.2,rot,.3],colours.gold);
    }else{
      const turn=[cameraX-.1,cameraY+.35,-.14];
      for(const [pos,dimensions] of [[[-.8,0,.1],[.12,.92,.12]],[[.8,0,.1],[.12,.92,.12]],[[0,.8,.1],[.68,.12,.12]],[[0,-.8,.1],[.68,.12,.12]]]){const position=rotate(pos,...turn);position[1]+=bob;mesh(cubeV.map(v=>v.map((n,i)=>n*dimensions[i])),cubeF,position,1,turn,colours.ice);}
      mesh(cubeV,cubeF,[0,bob,-.3],.48,[cameraX-.12,cameraY+.38,-.14],colours.gold);
      const p=project([0,bob,-1.1]);sparkle(...p,scale*.23,'#ffed9e');
      mesh(octV,octF,[-1.03,.85-bob,-.5],.2,[.4,rot,.3],colours.cyan);
    }
    const spark=project([1.1,-.8,-.1]);sparkle(...spark,scale*.075,'#f8e899');const spark2=project([-1.15,.45,-.2]);sparkle(...spark2,scale*.035,'#c0d9fa');
  }
  function tick(stamp){raf=0;if(!visible||document.hidden||paused)return;if(width<700&&last&&stamp-last<32){raf=requestAnimationFrame(tick);return;}if(last){const delta=Math.min(.06,(stamp-last)/1000);time+=delta;}last=stamp;px+=(tx-px)*.045;py+=(ty-py)*.045;yaw+=(targetYaw-yaw)*.025;render();raf=requestAnimationFrame(tick);}
  const start=()=>{if(!raf&&!paused&&visible&&!document.hidden){last=0;raf=requestAnimationFrame(tick);}else render();};
  const stop=()=>{cancelAnimationFrame(raf);raf=0;last=0;};
  const resize=()=>{const rect=wrap.getBoundingClientRect();width=rect.width;height=rect.height;dpr=Math.min(devicePixelRatio||1,width<700?1.75:2);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);render();};
  new ResizeObserver(resize).observe(wrap);resize();wrap.classList.add('scene-ready');
  wrap.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse'||paused)return;const r=wrap.getBoundingClientRect();tx=(e.clientX-r.left)/r.width-.5;ty=(e.clientY-r.top)/r.height-.5;},{passive:true});
  wrap.addEventListener('pointerleave',()=>{tx=ty=0;},{passive:true});
  wrap.querySelector('.scene-interact')?.addEventListener('click',()=>{targetYaw+=Math.PI*.48;if(paused){yaw=targetYaw;render();}else start();});
  window.addEventListener('dse:motion',e=>{paused=!!e.detail.paused;if(paused){stop();render();}else start();});
  reduce.addEventListener('change',()=>{paused=reduce.matches||document.documentElement.classList.contains('motion-paused');if(paused)stop();start();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();else start();});
  if('IntersectionObserver'in window)new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)start();else stop();},{rootMargin:'100px'}).observe(wrap);
  window.addEventListener('pagehide',stop);start();
})();
