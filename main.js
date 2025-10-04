import * as THREE from "three";  
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.161.0/examples/jsm/controls/OrbitControls.js";

import getStarfield from "./src/getStarfield.js"; 
import { getFresnelMat } from "./src/getFresnelMat.js"; 

const w = window.innerWidth; 
const h = window.innerHeight; 
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000); 
camera.position.z = 2;
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(w, h);
document.body.appendChild(renderer.domElement);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;

const earthGroup = new THREE.Group();
earthGroup.rotation.z = (-23.4 * Math.PI) / 180;
scene.add(earthGroup);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

const detail = 16;
const loader = new THREE.TextureLoader();
const geometry = new THREE.IcosahedronGeometry(1, detail);
const material = new THREE.MeshPhongMaterial({
    map: loader.load("./earth-images/00_earthmap1k.jpg"),
    specularMap: loader.load("./earth-images/02_earthspec1k.jpg"),
    bumpMap: loader.load("./earth-images/01_earthbump1k.jpg"),
    bumpScale: 0.04,
});
const earthMesh = new THREE.Mesh(geometry, material);
earthGroup.add(earthMesh);

const lightsMat = new THREE.MeshBasicMaterial({
    map: loader.load("./earth-images/03_earthlights1k.jpg"),
    blending: THREE.AdditiveBlending,
});
const lightsMesh = new THREE.Mesh(geometry, lightsMat);
earthGroup.add(lightsMesh);

const cloudsMat = new THREE.MeshStandardMaterial({
    map: loader.load("./earth-images/04_earthcloudmap.jpg"),
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    alphaMap: loader.load("./earth-images/05_earthcloudmaptrans.jpg"),
});
const cloudsMesh = new THREE.Mesh(geometry, cloudsMat);
cloudsMesh.scale.setScalar(1.003);
earthGroup.add(cloudsMesh);

const fresnelMat = getFresnelMat();
const glowMesh = new THREE.Mesh(geometry, fresnelMat);
glowMesh.scale.setScalar(1.25);
earthGroup.add(glowMesh);

const stars = getStarfield({ numStars: 2000 });
scene.add(stars);

const sunLight = new THREE.DirectionalLight(0xffffff, 2.0);
sunLight.position.set(-2, 0.5, 1.5);
scene.add(sunLight);

// Meteorito
const meteorGroup = new THREE.Group();
scene.add(meteorGroup);

const meteorDetail = 12;
const meteorGeometry = new THREE.IcosahedronGeometry(0.2, meteorDetail);
const meteorMaterial = new THREE.MeshPhongMaterial({
    map: loader.load("./earth-images/meteor-texture.jpeg"),
    bumpMap: loader.load("./earth-images/meteor-texture.jpeg"),
    bumpScale: 0.04,
});
const meteorMesh = new THREE.Mesh(meteorGeometry, meteorMaterial);
meteorGroup.add(meteorMesh);

const meteorGlowMat = new THREE.MeshBasicMaterial({
    map: loader.load("./earth-images/meteor-texture.jpeg"),
    blending: THREE.AdditiveBlending,
    transparent: true,
    opacity: 0.5,
});
const meteorGlowMesh = new THREE.Mesh(meteorGeometry, meteorGlowMat);
meteorGroup.add(meteorGlowMesh);

const glowSphereGeometry = new THREE.SphereGeometry(0.15, 16, 16);
const glowSphereMaterial = new THREE.MeshBasicMaterial({
    color: 0xff8800,
    transparent: true,
    opacity: 0.9
});
const glowSphere = new THREE.Mesh(glowSphereGeometry, glowSphereMaterial);
meteorGroup.add(glowSphere);

// Impact target marker
// Impact target marker
let impactLat = 30; 
let impactLon = 45; 
const earthRadius = 0.0; // Cambiado a 0.0 para apuntar al centro

function getImpactPosition(lat, lon) {
    const latRad = (lat * Math.PI) / 180;
    const lonRad = (lon * Math.PI) / 180;
    
    // Apunta directamente al centro de la Tierra
    const x = earthRadius * Math.cos(latRad) * Math.cos(lonRad);
    const y = earthRadius * Math.sin(latRad);
    const z = earthRadius * Math.cos(latRad) * Math.sin(lonRad);
    return { x, y, z };
}

let impactPos = getImpactPosition(impactLat, impactLon);
let impactX = impactPos.x;
let impactY = impactPos.y;
let impactZ = impactPos.z;

const markerGeometry = new THREE.RingGeometry(0.12, 0.14, 32);
const markerMaterial = new THREE.MeshBasicMaterial({
    color: 0xff0000,
    transparent: true,
    opacity: 0.6,
    side: THREE.DoubleSide
});
const markerMesh = new THREE.Mesh(markerGeometry, markerMaterial);
markerMesh.position.set(impactX, impactY, impactZ);
markerMesh.visible = false; 
earthMesh.add(markerMesh);

function updateImpactLocation(lat, lon) {
    impactLat = lat;
    impactLon = lon;
    impactPos = getImpactPosition(lat, lon);
    impactX = impactPos.x;
    impactY = impactPos.y;
    impactZ = impactPos.z;
    markerMesh.position.set(impactX, impactY, impactZ);
}

// Meteor movement
const startPos = new THREE.Vector3(5, 3, 4);
const targetPos = new THREE.Vector3(impactX, impactY, impactZ);
meteorGroup.position.copy(startPos);
meteorGroup.visible = false; 

let initialZoom = true; 
const targetZoom = 5;
const zoomSpeed = 0.02;
let time = 0;
let impacted = false;
let resetTimer = 0;
let canLaunchMeteor = true;

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onMouseClick(event) {
    if (!canLaunchMeteor) return;
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(earthMesh);
    if (intersects.length > 0) {
        const localPoint = earthMesh.worldToLocal(intersects[0].point.clone());
        const r = Math.sqrt(localPoint.x ** 2 + localPoint.y ** 2 + localPoint.z ** 2);
        const lat = Math.asin(localPoint.y / r) * (180 / Math.PI);
        const lon = Math.atan2(localPoint.z, localPoint.x) * (180 / Math.PI);
        updateImpactLocation(lat, lon);
        markerMesh.visible = true;
    }
}

function onKeyPress(event) {
    if (event.code === 'Space' && canLaunchMeteor && !impacted) {
        canLaunchMeteor = false;
        time = 0;
        meteorGroup.visible = true;
        meteorGroup.position.copy(startPos);
        markerMesh.visible = false; 
    }
}

window.addEventListener('click', onMouseClick);
window.addEventListener('keypress', onKeyPress);

function animate() {
    requestAnimationFrame(animate);

    if (initialZoom) {
        if (camera.position.z < targetZoom) {
            camera.position.z += zoomSpeed;
        } else {
            initialZoom = false;
        }
    }

    earthMesh.rotation.y += 0.003;
    lightsMesh.rotation.y += 0.003;
    cloudsMesh.rotation.y += 0.0023;
    stars.rotation.y -= 0.0005;

    if (!impacted) {
        if (!canLaunchMeteor) {
            time += 0.016;
            const t = Math.min(time * 0.15, 1);
            meteorGroup.position.lerpVectors(startPos, new THREE.Vector3(impactX, impactY, impactZ), t);
            meteorMesh.rotation.x += 0.03;
            meteorMesh.rotation.y += 0.04;
            
            // Reducir tamaño gradualmente mientras viaja (de 1.5 a 0.3)
            const startScale = 1.5;  // Empieza más grande
            const endScale = 0.3;    // Termina pequeño
            const currentScale = startScale - (startScale - endScale) * t;
            meteorGroup.scale.setScalar(currentScale);
            
            meteorMaterial.emissiveIntensity = 0.5 + t * 1.5;
            glowSphereMaterial.opacity = 0.9 + t * 0.1;
            
            if (t >= 0.95) {
                impacted = true;
                meteorGroup.visible = false;
            }
        }
    } else {
        resetTimer += 0.016;
        if (resetTimer > 2) { 
            impacted = false;
            time = 0;
            resetTimer = 0;
            canLaunchMeteor = true;
            meteorGroup.visible = false;
            meteorGroup.position.copy(startPos);
            meteorGroup.scale.setScalar(2.5); // Restaurar tamaño inicial grande
            meteorMaterial.emissiveIntensity = 0.5;
            glowSphereMaterial.opacity = 0.9;
            markerMesh.visible = true;
        }
    }

    controls.update();
    renderer.render(scene, camera);
}

animate();

function handleWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener("resize", handleWindowResize, false);
