import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export function createScene(viewport) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x111318);

  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
  camera.position.set(6, 5, 7);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  viewport.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.target.set(0, 0.5, 0);

  const ambientLight = new THREE.HemisphereLight(0xffffff, 0x242936, 1.8);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 2.2);
  directionalLight.position.set(4, 7, 5);
  directionalLight.castShadow = true;
  scene.add(directionalLight);

  const grid = new THREE.GridHelper(20, 20, 0x3d4658, 0x252b36);
  scene.add(grid);

  const resizeObserver = new ResizeObserver(() => {
    const { clientWidth, clientHeight } = viewport;
    camera.aspect = clientWidth / Math.max(clientHeight, 1);
    camera.updateProjectionMatrix();
    renderer.setSize(clientWidth, clientHeight, false);
  });

  resizeObserver.observe(viewport);

  function animate() {
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  animate();

  return {
    scene,
    camera,
    renderer,
    controls,
    dispose() {
      resizeObserver.disconnect();
      renderer.dispose();
    },
  };
}
