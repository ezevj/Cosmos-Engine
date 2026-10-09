// --- TALLER DE PLANETAS (DETALLES HD, ROCHE LIMIT & ACRECIÓN CINEMÁTICA) ---

let planetType = 'rocky';
let planetSize = 60;
let planetRings = true;
let moons = [];
let isColliding = false;

function initPlanetArchitect() {
    cancelActiveLoop();
    const canvas = document.getElementById('planet-canvas');
    if (!canvas) return;
    moons = [];
    isColliding = false;

    // Disparar animación de inicio
    triggerCollisionAnimation('rocky');

    const handleClick = function(e) {
        if (isColliding) return;
        const pos = getMousePos(canvas, e);
        const cx = canvas.width / 2, cy = canvas.height / 2;
        const dist = Math.hypot(pos.x - cx, pos.y - cy);

        // Si toca fuera del planeta, lanza una luna
        if (dist > planetSize + 25) {
            moons.push({
                radius: dist,
                angle: Math.atan2(pos.y - cy, pos.x - cx),
                speed: (0.15 / Math.sqrt(dist)) * 2,
                size: Math.random() * 3 + 2.5,
                color: '#dcdcfe'
            });
            playSound('confinement');
            updatePlanetCard();
        }
    };

    bindInteractEvents(canvas, handleClick, null, null);
}

// --- ANIMACIÓN 1: ACRECIÓN Y CHOQUE DE METEORITOS (RALENTIZADA Y CINEMÁTICA) ---
function triggerCollisionAnimation(newType) {
    planetType = newType;
    isColliding = true;
    updatePlanetCard();

    const canvas = document.getElementById('planet-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const cx = canvas.width / 2, cy = canvas.height / 2;

    let progress = 0;
    let meteorLeft = { x: -80, y: cy - 20, size: 32 };
    let meteorRight = { x: canvas.width + 80, y: cy + 20, size: 26 };
    let impactDebris = [];
    let flashAlpha = 0;

    function animateCollision() {
        progress += 0.008; // Transición suave y lenta (4 segundos)
        ctx.fillStyle = '#02020a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (progress < 0.45) {
            // Aproximación de protoplanetas con colas incandescentes
            const t = progress / 0.45;
            meteorLeft.x = -80 + (cx - 15 - (-80)) * t;
            meteorRight.x = (canvas.width + 80) - ((canvas.width + 80) - (cx + 15)) * t;

            // Meteorito Izquierdo
            ctx.beginPath(); ctx.arc(meteorLeft.x, meteorLeft.y, meteorLeft.size, 0, Math.PI * 2);
            ctx.fillStyle = '#8b5a2b'; ctx.shadowColor = '#ff6600'; ctx.shadowBlur = 20; ctx.fill();

            // Meteorito Derecho
            ctx.beginPath(); ctx.arc(meteorRight.x, meteorRight.y, meteorRight.size, 0, Math.PI * 2);
            ctx.fillStyle = '#5c5c5c'; ctx.shadowColor = '#ffaa00'; ctx.shadowBlur = 20; ctx.fill();
            ctx.shadowBlur = 0;

        } else if (progress >= 0.45 && progress < 0.6) {
            // Colisión violenta con destello
            if (impactDebris.length === 0) {
                playSound('impact');
                flashAlpha = 1.0;
                for (let i = 0; i < 60; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    const speed = Math.random() * 9 + 2;
                    impactDebris.push({
                        x: cx, y: cy,
                        dx: Math.cos(angle) * speed,
                        dy: Math.sin(angle) * speed,
                        size: Math.random() * 4 + 1.5,
                        color: `hsl(${Math.random() * 50 + 10}, 100%, 60%)`,
                        life: 1.0
                    });
                }
            }

            ctx.fillStyle = `rgba(255, 230, 180, ${flashAlpha})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            flashAlpha *= 0.88;

            impactDebris.forEach(d => {
                d.x += d.dx; d.y += d.dy; d.life -= 0.02;
                ctx.beginPath(); ctx.arc(d.x, d.y, Math.max(1, d.size * d.life), 0, Math.PI * 2);
                ctx.fillStyle = d.color; ctx.fill();
            });

        } else {
            // Condensación progresiva del planeta
            const tScale = Math.min(1, (progress - 0.6) / 0.4);
            const currentR = planetSize * tScale;

            renderPlanetBase(ctx, cx, cy, currentR, progress * 2);

            if (tScale >= 1) {
                isColliding = false;
                startPlanetMainLoop();
                return;
            }
        }

        requestAnimationFrame(animateCollision);
    }

    animateCollision();
}

// --- ANIMACIÓN 2: LÍMITE DE ROCHE (DESTRUCCIÓN DE LUNAS Y FORMACIÓN DE ANILLOS) ---
function triggerMoonDestructionAnimation() {
    if (isColliding) return;
    const canvas = document.getElementById('planet-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const cx = canvas.width / 2, cy = canvas.height / 2;

    if (moons.length === 0) {
        // Si no hay lunas, agregar 2 lunas ficticias para destruirlas
        moons.push({ radius: planetSize + 60, angle: 0, speed: 0.05, size: 4, color: '#fff' });
    }

    playSound('impact');
    planetRings = true;
    const toggleBtn = document.getElementById('btn-toggle-ring');
    if (toggleBtn) toggleBtn.innerText = "Anillos: SI";

    let rocheParticles = [];
    let progress = 0;

    function animateRoche() {
        progress += 0.015;
        ctx.fillStyle = '#02020a'; ctx.fillRect(0, 0, canvas.width, canvas.height);

        renderPlanetBase(ctx, cx, cy, planetSize, progress);

        // Espiral de lunas cayendo al planeta
        moons.forEach((m, idx) => {
            m.radius = Math.max(planetSize + 15, m.radius - 1.2);
            m.angle += 0.08;
            const mx = cx + Math.cos(m.angle) * m.radius;
            const my = cy + Math.sin(m.angle) * m.radius;

            if (m.radius <= planetSize + 22) {
                // Fractura en partículas
                for (let i = 0; i < 15; i++) {
                    const pAngle = m.angle + (Math.random() - 0.5);
                    const pDist = m.radius + (Math.random() - 0.5) * 20;
                    rocheParticles.push({
                        angle: pAngle,
                        radius: pDist,
                        speed: (0.04 / Math.sqrt(pDist)) * 2,
                        size: Math.random() * 2 + 1,
                        color: planetType === 'ice' ? '#00ffff' : '#ffcc88'
                    });
                }
                moons.splice(idx, 1);
            } else {
                ctx.beginPath(); ctx.arc(mx, my, m.size, 0, Math.PI * 2);
                ctx.fillStyle = '#ff6b6b'; ctx.fill();
            }
        });

        // Partículas formando el anillo
        ctx.save(); ctx.translate(cx, cy); ctx.scale(1, 0.35); ctx.rotate(0.2);
        rocheParticles.forEach(p => {
            p.angle += p.speed;
            const px = Math.cos(p.angle) * p.radius;
            const py = Math.sin(p.angle) * p.radius;
            ctx.beginPath(); ctx.arc(px, py, p.size, 0, Math.PI * 2);
            ctx.fillStyle = p.color; ctx.fill();
        });
        ctx.restore();

        if (progress < 1.0 || moons.length > 0) {
            requestAnimationFrame(animateRoche);
        } else {
            startPlanetMainLoop();
        }
    }

    animateRoche();
}

// --- RENDERIZADO HD DE PLANETAS (TEXTURAS DETALLADAS EN CANVAS 2D) ---
function renderPlanetBase(ctx, cx, cy, size, time = 0) {
    // 1. ANILLOS TRASEROS CON DIVISIÓN DE CASSINI
    if (planetRings) {
        ctx.save(); ctx.translate(cx, cy); ctx.scale(1, 0.32); ctx.rotate(0.25);
        
        // Anillo Exterior
        ctx.beginPath(); ctx.arc(0, 0, size * 1.85, 0, Math.PI * 2);
        ctx.strokeStyle = planetType === 'ice' ? 'rgba(0, 255, 255, 0.5)' : 'rgba(230, 180, 120, 0.5)';
        ctx.lineWidth = 10; ctx.stroke();

        // División de Cassini (Brecha oscura)
        ctx.beginPath(); ctx.arc(0, 0, size * 1.62, 0, Math.PI * 2);
        ctx.strokeStyle = '#02020a'; ctx.lineWidth = 4; ctx.stroke();

        // Anillo Interior
        ctx.beginPath(); ctx.arc(0, 0, size * 1.45, 0, Math.PI * 2);
        ctx.strokeStyle = planetType === 'ice' ? 'rgba(0, 200, 255, 0.6)' : 'rgba(180, 130, 80, 0.6)';
        ctx.lineWidth = 12; ctx.stroke();

        ctx.restore();
    }

    // 2. CUERPO DEL PLANETA
    ctx.save();
    ctx.beginPath(); ctx.arc(cx, cy, size, 0, Math.PI * 2); ctx.clip();

    if (planetType === 'gas') {
        // GASEOSO TIPO JÚPITER (BANDAS Y GRAN MANCHA ROJA)
        const pGrad = ctx.createLinearGradient(0, cy - size, 0, cy + size);
        pGrad.addColorStop(0, '#8a3c1b'); pGrad.addColorStop(0.2, '#d4a373');
        pGrad.addColorStop(0.4, '#a3481e'); pGrad.addColorStop(0.6, '#faedcd');
        pGrad.addColorStop(0.8, '#a3481e'); pGrad.addColorStop(1, '#5c240d');
        ctx.fillStyle = pGrad; ctx.fillRect(cx - size, cy - size, size * 2, size * 2);

        // Bandas de nubes turbulentas
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        for (let i = -size; i < size; i += 12) {
            ctx.fillRect(cx - size, cy + i + Math.sin(time + i) * 2, size * 2, 4);
        }

        // Gran Mancha Roja (Tormenta)
        const spotX = cx + size * 0.3;
        const spotY = cy + size * 0.2;
        ctx.beginPath(); ctx.ellipse(spotX, spotY, size * 0.3, size * 0.18, 0.1, 0, Math.PI * 2);
        ctx.fillStyle = '#b02a02'; ctx.fill();
        ctx.beginPath(); ctx.ellipse(spotX, spotY, size * 0.18, size * 0.09, 0.1, 0, Math.PI * 2);
        ctx.fillStyle = '#e65c00'; ctx.fill();

    } else if (planetType === 'rocky') {
        // ROCOSO TIPO TIERRA (CONTINENTES Y CRÁTERES)
        ctx.fillStyle = '#1c425c'; ctx.fillRect(cx - size, cy - size, size * 2, size * 2); // Océano

        // Continentes procedimentales
        ctx.fillStyle = '#2d6a4f';
        ctx.beginPath(); ctx.arc(cx - size * 0.2, cy - size * 0.2, size * 0.5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(cx + size * 0.3, cy + size * 0.3, size * 0.4, 0, Math.PI * 2); ctx.fill();

        // Cráteres de impacto
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'; ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'; ctx.lineWidth = 1.5;
        [[0.1, -0.3, 8], [-0.4, 0.2, 12], [0.3, -0.1, 6]].forEach(([rx, ry, r]) => {
            ctx.beginPath(); ctx.arc(cx + size * rx, cy + size * ry, r, 0, Math.PI * 2);
            ctx.fill(); ctx.stroke();
        });

    } else if (planetType === 'ice') {
        // CRIOPLANETA DE HIELO (GRIETAS Y GLACIARES)
        const pGrad = ctx.createRadialGradient(cx - size * 0.3, cy - size * 0.3, 5, cx, cy, size);
        pGrad.addColorStop(0, '#e0ffff'); pGrad.addColorStop(0.6, '#00b4d8'); pGrad.addColorStop(1, '#03045e');
        ctx.fillStyle = pGrad; ctx.fillRect(cx - size, cy - size, size * 2, size * 2);

        // Grietas cristalinas
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(cx - size * 0.6, cy - size * 0.2); ctx.lineTo(cx, cy); ctx.lineTo(cx + size * 0.5, cy + size * 0.4); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx + size * 0.2, cy - size * 0.7); ctx.lineTo(cx - size * 0.1, cy + size * 0.3); ctx.stroke();

    } else {
        // MAGMÁTICO (CORTEZA VOLCÁNICA Y RÍOS DE LAVA INCANDESCENTE)
        ctx.fillStyle = '#1a0505'; ctx.fillRect(cx - size, cy - size, size * 2, size * 2);

        // Ríos de lava brillante
        ctx.strokeStyle = '#ff3300'; ctx.lineWidth = 4; ctx.shadowColor = '#ff6600'; ctx.shadowBlur = 10;
        ctx.beginPath(); ctx.moveTo(cx - size * 0.8, cy); ctx.quadraticCurveTo(cx, cy - size * 0.4, cx + size * 0.8, cy + size * 0.2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx - size * 0.2, cy - size * 0.7); ctx.lineTo(cx + size * 0.1, cy + size * 0.6); ctx.stroke();
        ctx.shadowBlur = 0;
    }

    // Sombra de iluminación 3D
    const shadeGrad = ctx.createRadialGradient(cx - size * 0.4, cy - size * 0.4, size * 0.2, cx, cy, size);
    shadeGrad.addColorStop(0, 'transparent'); shadeGrad.addColorStop(0.8, 'rgba(0, 0, 0, 0.5)'); shadeGrad.addColorStop(1, 'rgba(0, 0, 0, 0.95)');
    ctx.fillStyle = shadeGrad; ctx.fillRect(cx - size, cy - size, size * 2, size * 2);

    ctx.restore();

    // Resplandor de Atmósfera
    ctx.beginPath(); ctx.arc(cx, cy, size + 2, 0, Math.PI * 2);
    ctx.strokeStyle = planetType === 'rocky' ? 'rgba(0, 255, 255, 0.4)' : (planetType === 'gas' ? 'rgba(255, 180, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)');
    ctx.lineWidth = 2.5; ctx.stroke();
}

// --- BUCLE PRINCIPAL ---
function startPlanetMainLoop() {
    cancelActiveLoop();
    const canvas = document.getElementById('planet-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let time = 0;

    function animate() {
        if (isColliding) return;
        time += 0.02;
        ctx.fillStyle = '#02020a'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        const cx = canvas.width / 2, cy = canvas.height / 2;

        renderPlanetBase(ctx, cx, cy, planetSize, time);

        // Lunas
        moons.forEach(m => {
            m.angle += m.speed;
            const mx = cx + Math.cos(m.angle) * m.radius;
            const my = cy + Math.sin(m.angle) * m.radius;
            ctx.beginPath(); ctx.arc(mx, my, m.size, 0, Math.PI * 2);
            ctx.fillStyle = m.color; ctx.fill();
        });

        safeRequestAnimationFrame(animate);
    }
    animate();
}

function toggleRingsManual() {
    planetRings = !planetRings;
    const btn = document.getElementById('btn-toggle-ring');
    if (btn) btn.innerText = planetRings ? "Anillos: SI" : "Anillos: NO";
}

function setPlanetType(type) {
    if (isColliding) return;
    document.querySelectorAll('.btn-type').forEach(b => b.classList.remove('active'));
    if (event && event.target) event.target.classList.add('active');
    triggerCollisionAnimation(type);
}

function updatePlanetParams() {
    planetSize = parseInt(document.getElementById('planet-size').value);
    document.getElementById('p-size-val').innerText = planetSize;
}

function updatePlanetCard() {
    const card = document.getElementById('planet-fact-card');
    if (!card) return;
    const moonSpan = `<span id="moon-count">${moons.length}</span>`;

    if (planetType === 'rocky') {
        card.innerHTML = `📊 <strong>Ficha del Exoplaneta:</strong> Composición: Silicatos e Hierro (Fe) | Habitabilidad: Zona Ricitos de Oro | Lunas: ${moonSpan}`;
    } else if (planetType === 'gas') {
        card.innerHTML = `📊 <strong>Ficha del Exoplaneta:</strong> Composición: Hidrógeno (H₂) y Helio (He) | Habitabilidad: Gas Asfixiante | Lunas: ${moonSpan}`;
    } else if (planetType === 'ice') {
        card.innerHTML = `📊 <strong>Ficha del Exoplaneta:</strong> Composición: Hielo de Agua y Metano | Habitabilidad: Criogénico (-210°C) | Lunas: ${moonSpan}`;
    } else {
        card.innerHTML = `📊 <strong>Ficha del Exoplaneta:</strong> Composición: Lava de Basalto y Azufre | Habitabilidad: Magma Inhóspito | Lunas: ${moonSpan}`;
    }
}
