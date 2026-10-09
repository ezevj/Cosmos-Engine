// --- TALLER DE PLANETAS (PLANET ARCHITECT ENGINE CON ANIMACIONES CINEMÁTICAS) ---

let planetType = 'rocky';
let planetSize = 60;
let planetRings = true;
let moons = [];
let isColliding = false;

function initPlanetArchitect() {
    cancelActiveLoop();
    const canvas = document.getElementById('planet-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    moons = [];
    isColliding = false;

    // Disparar animación cinemática inicial de creación por choque de asteroides
    triggerCollisionAnimation('rocky');

    const handleClick = function(e) {
        if (isColliding) return;
        const pos = getMousePos(canvas, e);
        const cx = canvas.width / 2, cy = canvas.height / 2;
        const dist = Math.hypot(pos.x - cx, pos.y - cy);

        // Si el usuario toca fuera del planeta, lanza una luna en órbita
        if (dist > planetSize + 20) {
            moons.push({
                radius: dist,
                angle: Math.atan2(pos.y - cy, pos.x - cx),
                speed: (0.15 / Math.sqrt(dist)) * 2,
                size: Math.random() * 3 + 2,
                color: '#dcdcfe'
            });
            playSound('confinement');
            updatePlanetCard();
        }
    };

    bindInteractEvents(canvas, handleClick, null, null);
}

// --- ANIMACIÓN 1: ACRECIÓN Y CHOQUE DE METEORITOS ---
function triggerCollisionAnimation(newType) {
    planetType = newType;
    isColliding = true;
    updatePlanetCard();

    const canvas = document.getElementById('planet-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const cx = canvas.width / 2, cy = canvas.height / 2;

    let progress = 0;
    let meteorLeft = { x: -50, y: cy - 20, size: 28 };
    let meteorRight = { x: canvas.width + 50, y: cy + 20, size: 22 };
    let impactDebris = [];
    let flashAlpha = 0;

    function animateCollision() {
        progress += 0.02;
        ctx.fillStyle = '#02020a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (progress < 0.5) {
            // Aproximación de meteoritos protoplanetarios
            const t = progress / 0.5;
            meteorLeft.x = -50 + (cx - 15 - (-50)) * t;
            meteorRight.x = (canvas.width + 50) - ((canvas.width + 50) - (cx + 15)) * t;

            ctx.beginPath();
            ctx.arc(meteorLeft.x, meteorLeft.y, meteorLeft.size, 0, Math.PI * 2);
            ctx.fillStyle = '#8b5a2b';
            ctx.shadowColor = '#ff6600';
            ctx.shadowBlur = 15;
            ctx.fill();

            ctx.beginPath();
            ctx.arc(meteorRight.x, meteorRight.y, meteorRight.size, 0, Math.PI * 2);
            ctx.fillStyle = '#5c5c5c';
            ctx.shadowColor = '#ffaa00';
            ctx.shadowBlur = 15;
            ctx.fill();
            ctx.shadowBlur = 0;

        } else if (progress >= 0.5 && progress < 0.65) {
            // Impacto violento y destello de energía
            if (impactDebris.length === 0) {
                playSound('impact');
                flashAlpha = 1.0;
                for (let i = 0; i < 40; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    const speed = Math.random() * 8 + 2;
                    impactDebris.push({
                        x: cx, y: cy,
                        dx: Math.cos(angle) * speed,
                        dy: Math.sin(angle) * speed,
                        size: Math.random() * 4 + 1,
                        color: `hsl(${Math.random() * 60 + 10}, 100%, 60%)`,
                        life: 1.0
                    });
                }
            }

            ctx.fillStyle = `rgba(255, 220, 150, ${flashAlpha})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            flashAlpha *= 0.85;

            impactDebris.forEach(d => {
                d.x += d.dx; d.y += d.dy; d.life -= 0.03;
                ctx.beginPath(); ctx.arc(d.x, d.y, Math.max(1, d.size * d.life), 0, Math.PI * 2);
                ctx.fillStyle = d.color; ctx.fill();
            });

        } else {
            // Enfriamiento y condensación del planeta
            const tScale = Math.min(1, (progress - 0.65) / 0.35);
            const currentR = planetSize * tScale;

            renderPlanetBase(ctx, cx, cy, currentR);

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

// --- ANIMACIÓN 2: DESTRUCCIÓN DE LUNA Y CREACIÓN DE ANILLOS (LÍMITE DE ROCHE) ---
function triggerMoonDestructionAnimation() {
    if (isColliding) return;

    const canvas = document.getElementById('planet-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const cx = canvas.width / 2, cy = canvas.height / 2;

    playSound('impact');

    let ringParticles = [];
    for (let i = 0; i < 80; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = planetSize * 1.3 + Math.random() * 25;
        ringParticles.push({
            angle: angle,
            radius: radius,
            speed: (0.05 / Math.sqrt(radius)) * 3,
            size: Math.random() * 2.5 + 1,
            color: planetType === 'ice' ? '#00ffff' : '#ffcc88'
        });
    }

    planetRings = true;
    updatePlanetParams();

    let ringProgress = 0;
    function animateRingFormation() {
        ringProgress += 0.04;
        ctx.fillStyle = '#02020a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        renderPlanetBase(ctx, cx, cy, planetSize);

        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(1, 0.35);
        ctx.rotate(0.2);

        ringParticles.forEach(p => {
            p.angle += p.speed;
            const px = Math.cos(p.angle) * p.radius;
            const py = Math.sin(p.angle) * p.radius;
            ctx.beginPath(); ctx.arc(px, py, p.size, 0, Math.PI * 2);
            ctx.fillStyle = p.color; ctx.fill();
        });

        ctx.restore();

        if (ringProgress < 1) {
            requestAnimationFrame(animateRingFormation);
        } else {
            startPlanetMainLoop();
        }
    }

    animateRingFormation();
}

// --- RENDERIZADO DEL PLANETA BASE ---
function renderPlanetBase(ctx, cx, cy, size) {
    if (planetRings) {
        ctx.save(); ctx.translate(cx, cy); ctx.scale(1, 0.35); ctx.rotate(0.2);
        ctx.beginPath(); ctx.arc(0, 0, size * 1.7, 0, Math.PI * 2);
        ctx.strokeStyle = planetType === 'ice' ? 'rgba(0, 255, 255, 0.6)' : 'rgba(255, 180, 100, 0.5)';
        ctx.lineWidth = 12; ctx.stroke(); ctx.restore();
    }

    ctx.beginPath(); ctx.arc(cx, cy, size, 0, Math.PI * 2);
    let pGrad = ctx.createRadialGradient(cx - size * 0.3, cy - size * 0.3, 5, cx, cy, size);

    if (planetType === 'rocky') {
        pGrad.addColorStop(0, '#4d94ff'); pGrad.addColorStop(0.6, '#2b5c3f'); pGrad.addColorStop(1, '#05101a');
    } else if (planetType === 'gas') {
        pGrad.addColorStop(0, '#ffaa4d'); pGrad.addColorStop(0.5, '#cc5500'); pGrad.addColorStop(1, '#2a0a00');
    } else if (planetType === 'ice') {
        pGrad.addColorStop(0, '#e0ffff'); pGrad.addColorStop(0.7, '#008b8b'); pGrad.addColorStop(1, '#001a1a');
    } else {
        pGrad.addColorStop(0, '#ff4d4d'); pGrad.addColorStop(0.5, '#800000'); pGrad.addColorStop(1, '#1a0000');
    }

    ctx.fillStyle = pGrad; ctx.fill();

    ctx.beginPath(); ctx.arc(cx, cy, size + 3, 0, Math.PI * 2);
    ctx.strokeStyle = planetType === 'rocky' ? 'rgba(0, 255, 255, 0.4)' : (planetType === 'gas' ? 'rgba(255, 160, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)');
    ctx.lineWidth = 3; ctx.stroke();
}

// --- BUCLE PRINCIPAL DE ROTACIÓN Y ÓRBITA DE LUNAS ---
function startPlanetMainLoop() {
    cancelActiveLoop();
    const canvas = document.getElementById('planet-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function animate() {
        if (isColliding) return;
        ctx.fillStyle = '#02020a'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        const cx = canvas.width / 2, cy = canvas.height / 2;

        renderPlanetBase(ctx, cx, cy, planetSize);

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
