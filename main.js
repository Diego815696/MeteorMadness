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

// UI Elements
const asteroidNameDiv = document.getElementById('asteroid-name');
const asteroidInfoDiv = document.getElementById('asteroid-info');

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

// Sprite de texto para el nombre del asteroide
const canvas = document.createElement('canvas');
const context = canvas.getContext('2d');
canvas.width = 512;
canvas.height = 128;

function updateAsteroidNameSprite(name) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.font = 'Bold 40px Arial';
    context.fillStyle = 'rgba(255, 107, 53, 1)';
    context.textAlign = 'center';
    context.fillText(name, canvas.width / 2, canvas.height / 2);
    
    context.strokeStyle = 'rgba(0, 0, 0, 0.8)';
    context.lineWidth = 4;
    context.strokeText(name, canvas.width / 2, canvas.height / 2);
    
    spriteTexture.needsUpdate = true;
}

const spriteTexture = new THREE.CanvasTexture(canvas);
const spriteMaterial = new THREE.SpriteMaterial({ 
    map: spriteTexture,
    transparent: true,
    depthTest: false
});
const asteroidNameSprite = new THREE.Sprite(spriteMaterial);
asteroidNameSprite.scale.set(2, 0.5, 1);
asteroidNameSprite.position.set(0, 0.4, 0);
meteorGroup.add(asteroidNameSprite);

// Impact target marker
let impactLat = 30; 
let impactLon = 45; 
const earthRadius = 1;

function getImpactPosition(lat, lon) {
    const latRad = (lat * Math.PI) / 180;
    const lonRad = (lon * Math.PI) / 180;
    
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
let canLaunchMeteor = false;

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// NASA API Data
const API_KEY = 'IqAp5gerc5b0ohBPVXMinTc0IQfHmSMQmdJYm6Lw';
let asteroidsData = [];
let currentAsteroidIndex = 0;

// Variables para almacenar los valores iniciales del asteroide actual
let initialDistance = 0;
let initialDiameter = 0;
let initialVelocity = 0;
let currentAsteroidDate = '';
let currentAsteroidName = '';

function updateAsteroidUI(asteroid, progress = 0) {
    if (!asteroid) {
        asteroidNameDiv.innerHTML = '🌠 No hay asteroides disponibles';
        asteroidInfoDiv.innerHTML = '';
        return;
    }
    
    // Pillamos los datos que hemos recibido de la api y los guardamos en variables para mostrar en el UI
    const name = asteroid.name.replace(/[()]/g, '');
    const date = asteroid.close_approach_data[0].close_approach_date;
    
    // Si es un asteroide nuevo (progress = 0), guardar valores iniciales
    if (progress === 0) {
        initialDistance = parseFloat(asteroid.close_approach_data[0].miss_distance.kilometers);
        initialDiameter = parseFloat(asteroid.estimated_diameter.meters.estimated_diameter_max);
        initialVelocity = parseFloat(asteroid.close_approach_data[0].relative_velocity.kilometers_per_hour);
        currentAsteroidDate = date;
        currentAsteroidName = name;
    }
    
    // Calcular valores progresivos durante la animación
    // La animación termina en t=0.95, así que escalamos el progreso para que llegue a 0 exactamente
    const adjustedProgress = Math.min(progress / 0.95, 1);
    let currentDistance = initialDistance * (1 - adjustedProgress);
    
    let currentDiameter;
    if (initialDiameter > 50) {
        // Si es mayor de 50m, reducir hasta el 50% de su masa inicial
        currentDiameter = initialDiameter - (initialDiameter * 0.5 * adjustedProgress);
    } else {
        // Si es menor o igual a 50m, reducir hasta 0 a mitad de la animación
        if (adjustedProgress >= 0.95) {
            currentDiameter = 0;
        } else {
            currentDiameter = initialDiameter * (1 - adjustedProgress); // Se desintegra en la primera mitad
        }
    }
    
    // La velocidad aumenta progresivamente al entrar en la atmósfera
    // Aumenta hasta 1.5x la velocidad inicial (simula aceleración gravitatoria)
    // Velocidad de la luz: ~1,079,252,848 km/h (nunca nos acercaremos a esto con asteroides)
    const maxVelocityMultiplier = 1.5;
    let currentVelocity = initialVelocity * (1 + (adjustedProgress * (maxVelocityMultiplier - 1)));
    
    // Formatear valores para mostrar
    const distance = currentDistance.toLocaleString(undefined, {maximumFractionDigits: 0});
    const diameter = currentDiameter.toFixed(0);
    const velocity = currentVelocity.toLocaleString(undefined, {maximumFractionDigits: 0});
    
    asteroidNameDiv.innerHTML = `🌠 ${currentAsteroidName}`;
    asteroidInfoDiv.innerHTML = `
        📏 Distancia: ${distance} km<br>
        📐 Diámetro: ~${diameter} m<br>
        🚀 Velocidad: ${velocity} km/h<br>
        📅 Aproximación: ${currentAsteroidDate}<br>
    `;
    //Hemos quitado el print de si impacta
}

//Filtramos para obtener los asteroides mascercanos a la tierra ya que son los mas peligrosos
async function fetchClosestAsteroids() {
    try {
        asteroidNameDiv.innerHTML = '🌠 Cargando asteroides de NASA...';
        asteroidInfoDiv.innerHTML = 'Por favor espera...';
        //Filtramos paa los mas actuales
        const today = new Date();
        const startDate = today.toISOString().split('T')[0];
        const endDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        //Llamada a la api y guardamos el json en una variable y posteriormente en unn array
        const url = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${startDate}&end_date=${endDate}&api_key=${API_KEY}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        let allAsteroids = [];
        for (const date in data.near_earth_objects) {
            allAsteroids = allAsteroids.concat(data.near_earth_objects[date]);
        }
        //Ordenamos por distancia
        allAsteroids.sort((a, b) => {
            const distA = parseFloat(a.close_approach_data[0].miss_distance.kilometers);
            const distB = parseFloat(b.close_approach_data[0].miss_distance.kilometers);
            return distA - distB;
        });
        //Pillamos los 5 mas cercanos
        asteroidsData = allAsteroids.slice(0, 5);
        currentAsteroidIndex = 0;
        //Confirmamos que los hemos recibido bien
        if (asteroidsData.length > 0) {
            updateAsteroidUI(asteroidsData[currentAsteroidIndex]);
            canLaunchMeteor = true;
            const asteroidName = asteroidsData[0].name.replace(/[()]/g, '').substring(0, 30);
            updateAsteroidNameSprite(asteroidName);
        } else {
            asteroidNameDiv.innerHTML = '🌠 No se encontraron asteroides';
            asteroidInfoDiv.innerHTML = '';
        }
        
        
    } catch (error) {
        console.error('❌ Error al obtener datos de asteroides:', error);
        asteroidNameDiv.innerHTML = '❌ Error al cargar asteroides';
        asteroidInfoDiv.innerHTML = 'Intenta recargar la página';
    }
}

function onMouseClick(event) {
    if (!canLaunchMeteor || impacted) return;
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
//Lanzamos el asteroide pulsando el espacio
function onKeyPress(event) {
    if (event.code === 'Space' && canLaunchMeteor && !impacted && asteroidsData.length > 0) {
        canLaunchMeteor = false;
        time = 0;
        meteorGroup.visible = true;
        meteorGroup.position.copy(startPos);
        markerMesh.visible = false;
        
        // Inicializar los valores del asteroide actual
        updateAsteroidUI(asteroidsData[currentAsteroidIndex], 0);
        
        const asteroidName = asteroidsData[currentAsteroidIndex].name.replace(/[()]/g, '').substring(0, 30);
        updateAsteroidNameSprite(asteroidName);
    }
}

window.addEventListener('click', onMouseClick);
window.addEventListener('keypress', onKeyPress);

fetchClosestAsteroids();
//Ejectamos animacion
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
    //Comprobar si impacta para poder volver a lanzar la animacion
    if (!impacted) {
        if (!canLaunchMeteor && meteorGroup.visible) {
            time += 0.016;
            const t = Math.min(time * 0.15, 1);
            meteorGroup.position.lerpVectors(startPos, new THREE.Vector3(impactX, impactY, impactZ), t);
            meteorMesh.rotation.x += 0.03;
            meteorMesh.rotation.y += 0.04;
            
            const startScale = 1.5;
            const endScale = 0.3;
            const currentScale = startScale - (startScale - endScale) * t;
            meteorGroup.scale.setScalar(currentScale);
            
            meteorMaterial.emissiveIntensity = 0.5 + t * 1.5;
            glowSphereMaterial.opacity = 0.9 + t * 0.1;
            
            // Actualizar UI con valores progresivos durante la animación
            if (asteroidsData.length > 0) {
                updateAsteroidUI(asteroidsData[currentAsteroidIndex], t);
            }
            
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
            meteorGroup.scale.setScalar(1.5);
            meteorMaterial.emissiveIntensity = 0.5;
            glowSphereMaterial.opacity = 0.9;
            markerMesh.visible = true;
            
            // Avanzar al siguiente asteroide después del impacto
            currentAsteroidIndex = (currentAsteroidIndex + 1) % asteroidsData.length;
            
            if (asteroidsData.length > 0) {
                updateAsteroidUI(asteroidsData[currentAsteroidIndex], 0);
            }
        }
    }

    controls.update();
    renderer.render(scene, camera);
}

animate();
//Responsiveeee
function handleWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener("resize", handleWindowResize, false);