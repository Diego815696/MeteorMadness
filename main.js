import * as THREE from "three";  
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.161.0/examples/jsm/controls/OrbitControls.js";

import getStarfield from "./src/getStarfield.js"; 
import { getFresnelMat } from "./src/getFresnelMat.js"; 

// =============================================================================
// SISTEMA DE DETECCIÓN DE TIERRA/AGUA
// =============================================================================

class TerrainDetector {
    constructor() {
        this.terrainMap = null;
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.loaded = false;
        this.terrainCache = new Map();
        this.loadTerrainTexture();
    }
    
    loadTerrainTexture() {
        const loader = new THREE.TextureLoader();
        loader.load('./earth-images/02_earthspec1k.jpg', (texture) => {
            this.terrainMap = texture;
            this.prepareAnalysis();
        });
    }
    
    prepareAnalysis() {
        const img = this.terrainMap.image;
        this.canvas.width = img.width;
        this.canvas.height = img.height;
        this.ctx.drawImage(img, 0, 0);
        this.loaded = true;
        console.log('Detector de terreno listo');
    }
    
    getTerrainType(lat, lon) {
        if (!this.loaded) return 'unknown';
        
        const cacheKey = `${Math.round(lat * 10)},${Math.round(lon * 10)}`;
        if (this.terrainCache.has(cacheKey)) {
            return this.terrainCache.get(cacheKey);
        }
        
        const uv = this.latLonToUV(lat, lon);
        const brightness = this.getBrightnessAtUV(uv.u, uv.v);
        // SIMPLIFICADO: Solo tierra y agua
        const terrainType = brightness > 100 ? 'water' : 'land';
        
        this.terrainCache.set(cacheKey, terrainType);
        return terrainType;
    }
    
    latLonToUV(lat, lon) {
        let adjustedLon = lon;
        while (adjustedLon < -180) adjustedLon += 360;
        while (adjustedLon > 180) adjustedLon -= 360;
        
        const u = (adjustedLon + 180) / 360;
        const v = (90 - lat) / 180;
        
        return { 
            u: Math.max(0.001, Math.min(0.999, u)), 
            v: Math.max(0.001, Math.min(0.999, v)) 
        };
    }
    
    getBrightnessAtUV(u, v) {
        const x = Math.floor(u * (this.canvas.width - 1));
        const y = Math.floor((1 - v) * (this.canvas.height - 1));
        const imageData = this.ctx.getImageData(x, y, 1, 1);
        return imageData.data[0];
    }
    
    isReady() {
        return this.loaded;
    }
}

const terrainDetector = new TerrainDetector();

const TerrainEffects = {
    updateMarkerColor(terrainType) {
        const colors = {
            'water': 0x0066ff,
            'land': 0xff0000,
            'unknown': 0xff0000
        };
        markerMaterial.color.setHex(colors[terrainType]);
    },
    
    getTerrainInfo(lat, lon) {
        const terrainType = terrainDetector.getTerrainType(lat, lon);
        const names = {
            'water': 'Agua',
            'land': 'Tierra',
            'unknown': 'Desconocido'
        };
        return {
            type: terrainType,
            name: names[terrainType]
        };
    },
    
    getImpactEffects(terrainType) {
        const effects = {
            'water': { craterColor: 0x0066aa, craterOpacity: 0.4 },
            'land': { craterColor: 0x663300, craterOpacity: 0.9 }
        };
        return effects[terrainType] || effects.land;
    }
};

// =============================================================================
// SISTEMA DE MENSAJES EN PANTALLA
// =============================================================================

// =============================================================================
// SISTEMA DE ALERTAS VISUALES MEJORADO
// =============================================================================

// =============================================================================
// SISTEMA DE ALERTAS VISUALES SIN ICONOS
// =============================================================================

class ImpactMessage {
    constructor() {
        this.element = this.createMessageElement();
    }
    
    createMessageElement() {
        const messageDiv = document.createElement('div');
        messageDiv.style.position = 'absolute';
        messageDiv.style.top = '20px';
        messageDiv.style.left = '50%';
        messageDiv.style.transform = 'translateX(-50%)';
        messageDiv.style.padding = '20px 40px';
        messageDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.95)';
        messageDiv.style.color = 'white';
        messageDiv.style.borderRadius = '12px';
        messageDiv.style.fontFamily = 'Arial, sans-serif';
        messageDiv.style.fontSize = '24px';
        messageDiv.style.fontWeight = 'bold';
        messageDiv.style.textAlign = 'center';
        messageDiv.style.zIndex = '1000';
        messageDiv.style.opacity = '0';
        messageDiv.style.transition = 'all 0.5s ease';
        messageDiv.style.pointerEvents = 'none';
        messageDiv.style.boxShadow = '0 6px 25px rgba(0,0,0,0.7)';
        messageDiv.style.minWidth = '400px';
        messageDiv.style.backdropFilter = 'blur(12px)';
        
        document.body.appendChild(messageDiv);
        return messageDiv;
    }
    
    show(terrainInfo, lat, lon) {/*
        const alertStyles = {
            'water': {
                border: '4px solid #0066ff',
                background: 'linear-gradient(135deg, rgba(0,102,255,0.4), rgba(0,0,0,0.95))',
                title: 'IMPACTO EN AGUA',
                color: '#0066ff'
            },
            'land': {
                border: '4px solid #ff4444',
                background: 'linear-gradient(135deg, rgba(255,68,68,0.4), rgba(0,0,0,0.95))',
                title: 'IMPACTO EN TIERRA',
                color: '#ff4444'
            }
        };
        
        const style = alertStyles[terrainInfo.type] || alertStyles.land;
        
        const messageHTML = `
            <div style="color: ${style.color}; margin-bottom: 8px; font-size: 26px;">
                ${style.title}
            </div>
            <div style="font-size: 16px; opacity: 0.9; color: #cccccc; margin-top: 8px;">
                ${terrainInfo.name.toUpperCase()} • Lat: ${lat.toFixed(1)}° • Lon: ${lon.toFixed(1)}°
            </div>
        `;
        
        this.element.innerHTML = messageHTML;
        this.element.style.border = style.border;
        this.element.style.background = style.background;
        this.element.style.opacity = '1';
        this.element.style.transform = 'translateX(-50%) translateY(-20px)';
        */
        setTimeout(() => {
            this.element.style.transform = 'translateX(-50%) translateY(0)';
        }, 50);
        
        setTimeout(() => this.hide(), 4000);
    }
    
    hide() {
        this.element.style.opacity = '0';
        this.element.style.transform = 'translateX(-50%) translateY(-20px)';
    }
}

const impactMessage = new ImpactMessage();


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


// =============================================================================
// SISTEMA DE CONSECUENCIAS DE IMPACTO
// =============================================================================

// Crear el cuadro de consecuencias (agregar después de crear el renderer)
const consequencesBox = document.createElement('div');
consequencesBox.id = 'consequences-box';
consequencesBox.style.cssText = `
    position: absolute;
    bottom: 20px;
    left: 20px;
    background: rgba(0, 0, 0, 0.85);
    color: white;
    padding: 20px 25px;
    border-radius: 8px;
    max-width: 450px;
    font-family: 'Arial', sans-serif;
    border-left: 4px solid #ff4444;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
    display: none;
    line-height: 1.6;
    font-size: 14px;
`;
document.body.appendChild(consequencesBox);
// Función para determinar el rango de tamaño
function getSizeCategory(diameter) {
    if (diameter < 50) return 'disintegrated';
    if (diameter < 10) return 'tiny';
    if (diameter < 50) return 'small';
    if (diameter < 300) return 'medium';
    if (diameter < 1000) return 'large';
    return 'catastrophic';
}

// Función para obtener el texto de consecuencias
function getConsequencesText(diameter, terrainType) {
    const size = getSizeCategory(diameter);
    const isOcean = (terrainType === 'water');
    
    // CASO ESPECIAL: Desintegración
    if (size === 'disintegrated') {
        return {
            title: 'DESINTEGRACIÓN ATMOSFÉRICA',
            severity: 'SEGURO',
            severityColor: '#4CAF50',
            content: `<strong>Diámetro inicial:</strong> ${diameter.toFixed(1)} m<br><br>
                El asteroide se ha <strong>desintegrado completamente</strong> en la atmósfera antes de impactar la superficie.<br><br>
                <strong>Efectos:</strong><br>
                • Airburst atmosférico sin llegada al suelo<br>
                • Posible estallido luminoso visible<br>
                • Sin daños en superficie<br>
                • Posibles fragmentos pequeños inofensivos<br><br>`
        };
    }
    
    // IMPACTOS EN EL MAR
    if (isOcean) {
        if (size === 'small') { // 50-300m
            return {
                title: 'IMPACTO OCEÁNICO REGIONAL',
                severity: 'PELIGRO REGIONAL',
                severityColor: '#FF9800',
                content: `<strong>Diámetro al impactar:</strong> ${diameter.toFixed(1)/2} m<br>
                    <strong>Localización:</strong> Océano<br><br>
                    <strong>Consecuencias inmediatas:</strong><br>
                    • Gran volumen de agua desplazado<br>
                    • Formación de cráter submarino<br>
                    • Columna de agua que colapsa<br><br>
                    <strong>Tsunami regional:</strong><br>
                    • Olas importantes propagándose decenas-cientos de km<br>
                    • Inundaciones costeras significativas<br>
                    • Altura de ola dependiente de profundidad y distancia<br>`
            };
        }
        
        if (size === 'medium') { // 300m-1km
            return {
                title: 'MEGA-TSUNAMI OCEÁNICO',
                severity: 'CATÁSTROFE CONTINENTAL',
                severityColor: '#FF5722',
                content: `<strong>Diámetro al impactar:</strong> ${diameter.toFixed(1/2)} m<br>
                    <strong>Localización:</strong> Océano<br><br>
                    <strong>Impacto devastador:</strong><br>
                    • Expulsión masiva de agua, rocas y vapor<br>
                    • Olas de cientos de metros cerca del impacto<br>
                    • Tsunami cruzando cuencas oceánicas completas<br><br>
                    <strong>Efectos globales:</strong><br>
                    • Inundaciones costeras generalizadas<br>
                    • Destrucción de infraestructuras en múltiples países<br>
                    • Millones de personas afectadas<br>`
            };
        }
        
        if (size === 'large' || size === 'catastrophic') { // >1km
            return {
                title: 'EXTINCIÓN POR MEGA-IMPACTO OCEÁNICO',
                severity: 'EXTINCIÓN GLOBAL',
                severityColor: '#D32F2F',
                content: `<strong>Diámetro al impactar:</strong> ${diameter.toFixed(1/2)} m<br>
                    <strong>Localización:</strong> Océano<br><br>
                    <strong>Catástrofe planetaria:</strong><br>
                    • Tsunami transoceánico con olas colosales<br>
                    • Todo litoral del océano gravemente devastado<br>
                    • Olas de varios kilómetros de altura inicialmente<br><br>
                    <strong>Efectos de extinción masiva:</strong><br>
                    • Eyección masiva de material a la atmósfera<br>
                    • Invierno de impacto global (bloqueo solar)<br>
                    • Colapso de ecosistemas marinos y terrestres<br>`
            };
        }
    }
    
    // IMPACTOS EN TIERRA
    else {
        if (size === 'small') { // 50-300m
            return {
                title: 'IMPACTO TERRESTRE DEVASTADOR',
                severity: 'CATÁSTROFE REGIONAL',
                severityColor: '#FF9800',
                content: `<strong>Diámetro al impactar:</strong> ${diameter.toFixed(1/2)} m<br>
                    <strong>Localización:</strong> Tierra<br><br>
                    <strong>Impacto directo:</strong><br>
                    • Cráteres grandes (varios km de diámetro)<br>
                    • Onda de choque regional intensa<br>
                    • Terremoto local por energía liberada<br><br>
                    <strong>Efectos regionales:</strong><br>
                    • Daño serio en cientos de km²<br>
                    • Incendios masivos por radiación térmica<br>
                    • Destrucción de ciudades en zona de impacto<br>
                    • Consecuencias económicas enormes<br>`
            };
        }
        
        if (size === 'medium') { // 300m-1km
            return {
                title: 'IMPACTO CONTINENTAL',
                severity: 'DESASTRE CONTINENTAL',
                severityColor: '#FF5722',
                content: `<strong>Diámetro al impactar:</strong> ${diameter.toFixed(1/2)} m<br>
                    <strong>Localización:</strong> Tierra<br><br>
                    <strong>Devastación masiva:</strong><br>
                    • Cráteres enormes (decenas de km)<br>
                    • Inyección masiva de polvo y aerosoles<br>
                    • Terremotos fuertes (>7.0) en área extensa<br>
                    • Tsunamis secundarios si hay océano cercano<br><br>
                    <strong>Efectos continentales:</strong><br>
                    • Enfriamiento regional por bloqueo solar<br>
                    • Reducción drástica de radiación solar durante años<br>
                    • Colapso de cosechas en continente afectado<br>`
            };
        }
        
        if (size === 'large' || size === 'catastrophic') { // >1km
            return {
                title: 'EXTINCIÓN POR MEGA-IMPACTO TERRESTRE',
                severity: 'EXTINCIÓN GLOBAL',
                severityColor: '#D32F2F',
                content: `<strong>Diámetro al impactar:</strong> ${diameter.toFixed(1/2)} m<br>
                    <strong>Localización:</strong> Tierra<br><br>
                    <strong>Apocalipsis planetario:</strong><br>
                    • Cráter de cientos de kilómetros<br>
                    • Incendios globales instantáneos<br>
                    • Inyección masiva de polvo/hollín bloqueando sol<br>
                    • Terremotos >9.0 en todo el planeta<br><br>
                    <strong>Extinción masiva:</strong><br>
                    • Colapso total de fotosíntesis mundial<br>
                    • Invierno de impacto durante años/décadas<br>
                    • Hambrunas globales inevitables<br>
                    • Colapso ecológico completo<br>`
            };
        }
    }
    
    // Fallback por seguridad
    return {
        title: 'IMPACTO DESCONOCIDO',
        severity: 'EVALUANDO',
        severityColor: '#9E9E9E',
        content: 'Calculando consecuencias del impacto...'
    };
}

// Función para mostrar las consecuencias
function showConsequences(diameter, terrainType) {
    const data = getConsequencesText(diameter, terrainType);
    
    consequencesBox.innerHTML = `
        <div style="border-bottom: 2px solid ${data.severityColor}; padding-bottom: 10px; margin-bottom: 15px;">
            <div style="color: ${data.severityColor}; font-weight: bold; font-size: 11px; letter-spacing: 1px; margin-bottom: 5px;">
                ${data.severity}
            </div>
            <div style="font-size: 16px; font-weight: bold; color: #fff;">
                ${data.title}
            </div>
        </div>
        <div style="color: #ddd;">
            ${data.content}
        </div>
    `;
    
    consequencesBox.style.display = 'block';
}

// Función para ocultar las consecuencias
function hideConsequences() {
    consequencesBox.style.display = 'none';
}

// UI Elements
const asteroidNameDiv = document.getElementById('asteroid-name');
const asteroidInfoDiv = document.getElementById('asteroid-info');

const earthGroup = new THREE.Group();
earthGroup.rotation.z = (-23.4 * Math.PI) / 180;
scene.add(earthGroup);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// LÍMITES MÁS ESTRICTOS
controls.minDistance = 2;     // No puedes acercarte más de 2 unidades
controls.maxDistance = 10;    // No puedes alejarte más de 10 unidades

// Restringir ángulos para mejor experiencia
controls.minPolarAngle = 0.1;     // Evitar ver exactamente desde los polos
controls.maxPolarAngle = Math.PI - 0.1; // Evitar ver desde abajo exactamente

// Opcional: hacer que la cámara siempre mire hacia la Tierra
controls.enableRotate = true;
// =============================================================================
// CREACIÓN DE LA TIERRA
// =============================================================================
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

// Sistema de cráteres (agregar después del marcador)
const craterGroup = new THREE.Group();
earthMesh.add(craterGroup);

const craterGeometry = new THREE.CircleGeometry(0.1, 32);
const craterMaterial = new THREE.MeshBasicMaterial({
    color: 0x663300,
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide
});
const craterMesh = new THREE.Mesh(craterGeometry, craterMaterial);
craterMesh.position.set(impactX, impactY, impactZ);
craterGroup.add(craterMesh);

function showCraterAtImpact(lat, lon) {
    const terrainInfo = TerrainEffects.getTerrainInfo(lat, lon);
    const impactEffects = TerrainEffects.getImpactEffects(terrainInfo.type);
    const pos = getImpactPosition(lat, lon);
    
    craterMesh.position.set(pos.x, pos.y, pos.z);
    craterMaterial.color.setHex(impactEffects.craterColor);
    craterMaterial.opacity = impactEffects.craterOpacity;
    
    const normal = new THREE.Vector3(pos.x, pos.y, pos.z).normalize();
    craterMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
    
    // ✅ MOSTRAR MENSAJE DE IMPACTO
    impactMessage.show(terrainInfo, lat, lon);
    
    // MOSTRAR CONSECUENCIAS
    showConsequences(initialDiameter, terrainInfo.type);
    
    console.log(`💥 Impacto: ${terrainInfo.name} (Lat: ${lat.toFixed(1)}°, Lon: ${lon.toFixed(1)}°)`);
}

function hideCrater() {
    craterMaterial.opacity = 0;
}

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
        asteroidNameDiv.innerHTML = 'No hay asteroides disponibles';
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
    
    asteroidNameDiv.innerHTML = `${currentAsteroidName}`;
    asteroidInfoDiv.innerHTML = `
        Distancia: ${distance} km<br>
        Diámetro: ~${diameter} m<br>
        Velocidad: ${velocity} km/h<br>
        Aproximación: ${currentAsteroidDate}<br>
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
            asteroidNameDiv.innerHTML = 'No se encontraron asteroides';
            asteroidInfoDiv.innerHTML = '';
        }
        
        
    } catch (error) {
        console.error('Error al obtener datos de asteroides:', error);
        asteroidNameDiv.innerHTML = 'Error al cargar asteroides';
        asteroidInfoDiv.innerHTML = 'Intenta recargar la página';
    }
}
function onMouseClick(event) {
    if (!canLaunchMeteor || impacted) return;
    
    if (!terrainDetector.isReady()) {
        console.warn(' Detector de terreno aún no está listo');
        return;
    }
    
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
        
        const terrainInfo = TerrainEffects.getTerrainInfo(lat, lon);
        TerrainEffects.updateMarkerColor(terrainInfo.type);
        
        console.log(`Objetivo: ${terrainInfo.name} (Lat: ${lat.toFixed(1)}°, Lon: ${lon.toFixed(1)}°)`);
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
        hideConsequences();
        
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
                
                // MOSTRAR CRÁTER Y ALERTA SEGÚN TERRENO
                showCraterAtImpact(impactLat, impactLon);
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
            
            // OCULTAR CRÁTER AL RESET
            hideCrater();
            
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