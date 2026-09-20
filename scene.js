/* An actual Three.js photo plane: gently responds to the pointer and breathes with
   ambient light. It pauses offscreen and for reduced-motion users. No scroll hijack. */
import * as THREE from './vendor/three.module.js';
export async function createPhotoScene(container, imageUrl, position = '50% 50%') {
  let renderer;
  try {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('webgl2', { alpha: true, antialias: false, powerPreference: 'low-power' });
    if (!context) return null;
    renderer = new THREE.WebGLRenderer({ canvas, context, alpha: true, antialias: false, powerPreference: 'low-power' });
  }
  catch { return null; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
  camera.position.z = 1;
  const loader = new THREE.TextureLoader();
  let texture;
  try { texture = await loader.loadAsync(imageUrl); }
  catch { renderer.dispose(); return null; }
  const focus = value => { const parts = value.split(/\s+/).map(parseFloat); return new THREE.Vector2((parts[0] || 0) / 100, 1 - (parts[1] ?? 50) / 100); };
  const uniforms = {
    uFocus: { value: focus(position) },
    uPhoto: { value: texture }, uScreen: { value: new THREE.Vector2(1, 1) },
    uPhotoSize: { value: new THREE.Vector2(texture.image.width, texture.image.height) },
    uPointer: { value: new THREE.Vector2() }, uTime: { value: 0 }
  };
  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: `varying vec2 vUv;
      void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
    fragmentShader: `precision highp float;
      uniform sampler2D uPhoto; uniform vec2 uScreen; uniform vec2 uPhotoSize;
      uniform vec2 uPointer; uniform vec2 uFocus; uniform float uTime; varying vec2 vUv;
      float random(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
      void main(){
        float screenRatio=uScreen.x/uScreen.y;
        float photoRatio=uPhotoSize.x/uPhotoSize.y;
        vec2 scale=vec2(min(screenRatio/photoRatio,1.0),min(photoRatio/screenRatio,1.0));
        vec2 uv=vUv*scale*.97+(1.0-scale*.97)*uFocus;
        uv+=uPointer*.006*scale;
        vec3 photo=texture2D(uPhoto,uv).rgb;
        float grain=(random(vUv*uScreen+floor(uTime*9.0))-.5)*.009;
        float light=sin(vUv.x*2.5+uTime*.16)*sin(vUv.y*1.8+uTime*.12)*.016;
        vec3 warm=vec3(.98,.80,.48)*max(0.0,light);
        gl_FragColor=vec4(photo+warm+grain,1.0);
      }`
  });
  const geometry = new THREE.PlaneGeometry(2, 2);
  scene.add(new THREE.Mesh(geometry, material));
  container.append(renderer.domElement);
  let paused = false, visible = true, destroyed = false, frame = 0, requestToken = 0;
  let time = 0, lastTime = 0;
  const target = new THREE.Vector2();
  const resize = () => {
    if (destroyed) return;
    const width = container.clientWidth, height = container.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width, height, false); uniforms.uScreen.value.set(width, height); drawOnce();
  };
  function drawOnce() { if (!destroyed) renderer.render(scene, camera); }
  function animate(now) {
    frame = 0;
    if (destroyed || paused || !visible || document.hidden) return;
    if (lastTime) time += Math.min((now-lastTime)/1000, .05);
    lastTime = now;
    uniforms.uTime.value = time;
    uniforms.uPointer.value.lerp(target, .025);
    drawOnce(); frame = requestAnimationFrame(animate);
  }
  function updateLoop() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0; lastTime = 0;
    if (!paused && visible && !document.hidden && !destroyed) frame = requestAnimationFrame(animate);
  }
  const pointer = event => {
    const rect = container.getBoundingClientRect();
    target.set(((event.clientX-rect.left)/rect.width-.5)*2,-((event.clientY-rect.top)/rect.height-.5)*2);
  };
  const resetPointer = () => target.set(0, 0);
  container.parentElement.addEventListener('pointermove', pointer, { passive: true });
  container.parentElement.addEventListener('pointerleave', resetPointer);
  document.addEventListener('visibilitychange', updateLoop);
  const resizeObserver = new ResizeObserver(resize); resizeObserver.observe(container);
  const intersectionObserver = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; updateLoop(); }); intersectionObserver.observe(container);
  renderer.domElement.addEventListener('webglcontextlost', event => { event.preventDefault(); paused = true; container.classList.remove('ready'); updateLoop(); });
  resize(); container.classList.add('ready'); updateLoop();
  return {
    async setImage(url, position = '50% 50%') {
      const token = ++requestToken;
      // Show the semantic HTML image immediately while the new texture loads.
      container.classList.remove('ready');
      try {
        const next = await loader.loadAsync(url);
        if (destroyed || token !== requestToken) { next.dispose(); return; }
        texture.dispose(); texture = next; uniforms.uPhoto.value = next; uniforms.uFocus.value.copy(focus(position));
        uniforms.uPhotoSize.value.set(next.image.width, next.image.height);
        drawOnce(); container.classList.add('ready');
      } catch { /* Keep the accessible HTML image as the fallback. */ }
    },
    setPaused(value) { paused = value; updateLoop(); drawOnce(); },
    dispose() {
      destroyed = true; requestToken++; cancelAnimationFrame(frame);
      resizeObserver.disconnect(); intersectionObserver.disconnect();
      container.parentElement.removeEventListener('pointermove', pointer);
      container.parentElement.removeEventListener('pointerleave', resetPointer);
      document.removeEventListener('visibilitychange', updateLoop);
      texture.dispose(); geometry.dispose(); material.dispose(); renderer.dispose();
      renderer.domElement.remove(); container.classList.remove('ready');
    }
  };
}
