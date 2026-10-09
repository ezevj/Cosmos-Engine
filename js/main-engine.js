// --- FUNCIONES UTILITARIAS Y DE INTERACCIÓN GLOBAL ---
let activeLoop = null;

function safeRequestAnimationFrame(cb) {
    activeLoop = requestAnimationFrame(cb);
}

function cancelActiveLoop() {
    if (activeLoop) {
        cancelAnimationFrame(activeLoop);
        activeLoop = null;
    }
}

function getMousePos(canvas, evt) {
    const rect = canvas.getBoundingClientRect();
    let clientX = 0, clientY = 0;
    if (evt.touches && evt.touches.length > 0) {
        clientX = evt.touches[0].clientX;
        clientY = evt.touches[0].clientY;
    } else if (evt.changedTouches && evt.changedTouches.length > 0) {
        clientX = evt.changedTouches[0].clientX;
        clientY = evt.changedTouches[0].clientY;
    } else {
        clientX = evt.clientX;
        clientY = evt.clientY;
    }
    return {
        x: (clientX - rect.left) * (canvas.width / (rect.width || 1)),
        y: (clientY - rect.top) * (canvas.height / (rect.height || 1))
    };
}

function bindInteractEvents(canvas, downFn, moveFn, upFn) {
    canvas.onmousedown = downFn;
    canvas.onmousemove = moveFn;
    canvas.onmouseup = upFn;
    
    canvas.addEventListener('touchstart', function(e) {
        e.preventDefault();
        if (downFn) downFn(e);
    }, { passive: false });
    
    canvas.addEventListener('touchmove', function(e) {
        e.preventDefault();
        if (moveFn) moveFn(e);
    }, { passive: false });
    
    canvas.addEventListener('touchend', function(e) {
        e.preventDefault();
        if (upFn) upFn(e);
    }, { passive: false });
}

// --- NAVEGACIÓN Y ESTADO DEL JUEGO ---
let currentStage = 1;
let chosenDestiny = 'freeze';

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(screenId);
    if (target) target.classList.add('active');
}

function togglePlanetArchitectMode() {
    cancelActiveLoop();
    playSound('click');
    showScreen('planet-screen');
    document.getElementById('stage-title').innerText = "TALLER DE PLANETAS";
    document.getElementById('hud-status').innerText = "MODO LIBRE";
    if (typeof initPlanetArchitect === 'function') initPlanetArchitect();
}

function startGame() {
    cancelActiveLoop();
    playSound('click');
    showScreen('stage1-screen');
    initStage1();
}

function goToGalaxy() {
    cancelActiveLoop();
    showScreen('stage5-screen');
    initStage5();
}

function goToDestiny() {
    cancelActiveLoop();
    showScreen('stage6-screen');
    initStage6();
}

function resetGame() {
    cancelActiveLoop();
    playSound('click');
    showScreen('start-screen');
    document.getElementById('stage-title').innerText = "COSMOS ENGINE";
    document.getElementById('hud-status').innerText = "ETAPA 1 / 6";
}

// --- FASE 1: SINGULARIDAD Y COMPRESIÓN ---
let s1Clicks = 0, maxS1Clicks = 8, s1Shake = 0, s1Particles = [], isExpanding = false, explosionRadius = 0;

function initStage1() {
    cancelActiveLoop();
    currentStage = 1; s1Clicks = 0; s1Shake = 0; isExpanding = false; explosionRadius = 0; s1Particles = [];
    document.getElementById('stage-title').innerText = "ERA DE PLANCK";
    document.getElementById('hud-status').innerText = "ETAPA 1 / 6";
    const canvas = document.getElementById('singularity-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const handleClick = function(e) {
        if (isExpanding) return;
        const pos = getMousePos(canvas, e);
        if (Math.hypot(pos.x - canvas.width / 2, pos.y - canvas.height / 2) < 120) {
            playSound('click');
            s1Clicks++;
            s1Shake = s1Clicks * 3.5;
            for (let i = 0; i < 15; i++) {
                const angle = Math.random() * Math.PI * 2, r = 180 + Math.random() * 80;
                s1Particles.push({
                    x: canvas.width / 2 + Math.cos(angle) * r,
                    y: canvas.height / 2 + Math.sin(angle) * r,
                    targetX: canvas.width / 2,
                    targetY: canvas.height / 2,
                    speed: 0.08,
                    size: Math.random() * 3 + 1,
                    color: '#00ffff'
                });
            }
            document.getElementById('temp-metric').innerHTML = `Temperatura: 10<sup>${(32 - s1Clicks * 2.5).toFixed(0)}</sup> K`;
            if (s1Clicks >= maxS1Clicks) {
                playSound('bigbang');
                isExpanding = true;
            }
        }
    };
    bindInteractEvents(canvas, handleClick, null, null);

    function animate() {
        ctx.fillStyle = '#010106'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        const cx = canvas.width / 2, cy = canvas.height / 2;
        if (!isExpanding) {
            const size = Math.max(8, 60 - s1Clicks * 6);
            const grad = ctx.createRadialGradient(cx, cy, 2, cx, cy, size);
            grad.addColorStop(0, '#fff'); grad.addColorStop(0.5, '#ff00ff'); grad.addColorStop(1, 'transparent');
            ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(cx, cy, size, 0, Math.PI * 2); ctx.fill();
        } else {
            explosionRadius += 14;
            ctx.beginPath(); ctx.arc(cx, cy, explosionRadius, 0, Math.PI * 2);
            ctx.strokeStyle = '#00ffff'; ctx.lineWidth = 4; ctx.stroke();
        }
        if (explosionRadius < canvas.width) safeRequestAnimationFrame(animate);
        else { cancelActiveLoop(); showScreen('stage2-screen'); initStage2(); }
    }
    animate();
}

// --- FASE 2: QUARKS (PLASMA QGP) ---
let s2Quarks = [], s2Protons = 0, constructionSlot = [];

function initStage2() {
    cancelActiveLoop(); currentStage = 2; s2Protons = 0; constructionSlot = [];
    document.getElementById('stage-title').innerText = "SOPA PRIMORDIAL";
    document.getElementById('hud-status').innerText = "ETAPA 2 / 6";
    const canvas = document.getElementById('quarks-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    s2Quarks = [];
    for (let i = 0; i < 20; i++) {
        s2Quarks.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            type: Math.random() > 0.4 ? 'u' : 'd',
            dx: (Math.random() - 0.5) * 4,
            dy: (Math.random() - 0.5) * 4,
            radius: 15
        });
    }

    const handleClick = function(e) {
        const pos = getMousePos(canvas, e);
        for (let i = s2Quarks.length - 1; i >= 0; i--) {
            const q = s2Quarks[i];
            if (Math.hypot(q.x - pos.x, q.y - pos.y) < q.radius + 20) {
                playSound('confinement');
                constructionSlot.push(q.type);
                s2Quarks.splice(i, 1);
                if (constructionSlot.length === 3) {
                    const countU = constructionSlot.filter(t => t === 'u').length;
                    const countD = constructionSlot.filter(t => t === 'd').length;
                    if (countU === 2 && countD === 1) {
                        s2Protons++; playSound('success');
                        document.getElementById('quarks-metric').innerText = `Protones p⁺ Sintetizados: ${s2Protons} / 5`;
                        document.getElementById('s2-error-log').innerText = "¡SÍNTESIS COMPLETA! 2u + 1d = Protón p⁺";
                        document.getElementById('s2-error-log').style.color = "#00ff00";
                    } else {
                        playSound('error');
                        document.getElementById('s2-error-log').innerText = "¡ERROR DE CARGA! Se requiere exactamente 2u + 1d";
                        document.getElementById('s2-error-log').style.color = "#ff4d4d";
                    }
                    constructionSlot = [];
                }
                break;
            }
        }
    };
    bindInteractEvents(canvas, handleClick, null, null);

    function animate() {
        ctx.fillStyle = '#010108'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        s2Quarks.forEach(q => {
            q.x += q.dx; q.y += q.dy;
            if (q.x < q.radius || q.x > canvas.width - q.radius) q.dx *= -1;
            if (q.y < q.radius || q.y > canvas.height - q.radius) q.dy *= -1;
            ctx.beginPath(); ctx.arc(q.x, q.y, q.radius, 0, Math.PI * 2);
            ctx.fillStyle = q.type === 'u' ? '#ff6b6b' : '#51cf66'; ctx.fill();
            ctx.fillStyle = '#fff'; ctx.font = 'bold 12px Orbitron'; ctx.fillText(q.type, q.x - 4, q.y + 4);
        });
        if (s2Protons < 5) safeRequestAnimationFrame(animate);
        else { cancelActiveLoop(); showScreen('stage3-screen'); initStage3(); }
    }
    animate();
}

// --- FASE 3: RECOMBINACIÓN ---
let s3Particles = [], s3Atoms = 0, s3Selected = null;

function initStage3() {
    cancelActiveLoop(); currentStage = 3; s3Atoms = 0; s3Selected = null;
    document.getElementById('stage-title').innerText = "RECOMBINACIÓN";
    document.getElementById('hud-status').innerText = "ETAPA 3 / 6";
    const canvas = document.getElementById('desacople-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    s3Particles = [];
    for (let i = 0; i < 6; i++) {
        s3Particles.push({ x: 100 + i * 115, y: 160, type: 'proton', radius: 18, bound: false });
        s3Particles.push({ x: Math.random() * canvas.width, y: 50, type: 'electron', radius: 10, bound: false, dx: (Math.random() - 0.5) * 3, dy: (Math.random() - 0.5) * 2 });
    }

    const handleDown = function(e) {
        const pos = getMousePos(canvas, e);
        s3Particles.forEach(p => {
            if (p.type === 'electron' && !p.bound && Math.hypot(p.x - pos.x, p.y - pos.y) < p.radius + 25) {
                s3Selected = p;
            }
        });
    };
    const handleMove = function(e) {
        if (s3Selected) {
            const pos = getMousePos(canvas, e);
            s3Selected.x = pos.x; s3Selected.y = pos.y;
        }
    };
    const handleUp = function() {
        if (s3Selected) {
            s3Particles.forEach(p => {
                if (p.type === 'proton' && !p.bound && Math.hypot(p.x - s3Selected.x, p.y - s3Selected.y) < 50) {
                    s3Selected.bound = true; p.bound = true;
                    s3Selected.x = p.x; s3Selected.y = p.y;
                    s3Atoms++; playSound('success');
                    document.getElementById('desacople-metric').innerText = `Átomos de ¹H: ${s3Atoms} / 6`;
                    document.getElementById('opacity-metric').innerText = `Opacidad: ${Math.max(0, 100 - s3Atoms * 16.6).toFixed(0)}%`;
                }
            });
            s3Selected = null;
        }
    };
    bindInteractEvents(canvas, handleDown, handleMove, handleUp);

    function animate() {
        ctx.fillStyle = '#010106'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        s3Particles.forEach(p => {
            if (p.type === 'electron' && !p.bound && p !== s3Selected) {
                p.x += p.dx; p.y += p.dy;
                if (p.x < p.radius || p.x > canvas.width - p.radius) p.dx *= -1;
                if (p.y < p.radius || p.y > canvas.height - p.radius) p.dy *= -1;
            }
            ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = p.type === 'proton' ? (p.bound ? '#ffcc00' : '#ff4dfa') : '#00ffff'; ctx.fill();
        });
        if (s3Atoms < 6) safeRequestAnimationFrame(animate);
        else { cancelActiveLoop(); showScreen('stage4-screen'); initStage4(); }
    }
    animate();
}

// --- FASE 4: FUSIÓN ESTELAR ---
let s4Atoms = [], s4GravityWell = { x: 400, y: 150, radius: 75 }, s4FusedCount = 0, s4Ignited = false, s4Selected = null;

function initStage4() {
    cancelActiveLoop(); currentStage = 4; s4FusedCount = 0; s4Ignited = false;
    document.getElementById('stage-title').innerText = "IGNICIÓN ESTELAR";
    document.getElementById('hud-status').innerText = "ETAPA 4 / 6";
    document.getElementById('star-next-btn').style.display = 'none';
    const canvas = document.getElementById('star-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    s4Atoms = [];
    for (let i = 0; i < 12; i++) {
        s4Atoms.push({ x: 50 + Math.random() * 700, y: 50 + Math.random() * 200, radius: 14, fused: false, dx: (Math.random() - 0.5) * 3, dy: (Math.random() - 0.5) * 3 });
    }

    const handleDown = function(e) {
        if (!s4Ignited) {
            const pos = getMousePos(canvas, e);
            s4Atoms.forEach(a => {
                if (!a.fused && Math.hypot(a.x - pos.x, a.y - pos.y) < a.radius + 25) s4Selected = a;
            });
        }
    };
    const handleMove = function(e) {
        if (s4Selected) {
            const pos = getMousePos(canvas, e);
            s4Selected.x = pos.x; s4Selected.y = pos.y;
        }
    };
    const handleUp = function() {
        if (s4Selected) {
            if (Math.hypot(s4Selected.x - s4GravityWell.x, s4Selected.y - s4GravityWell.y) < s4GravityWell.radius + 20) {
                s4Selected.fused = true; s4FusedCount++; playSound('confinement');
                document.getElementById('star-temp').innerText = `Temperatura: ${(s4FusedCount * 2.5).toFixed(1)} M Kelvin`;
                if (s4FusedCount * 2.5 >= 15) {
                    s4Ignited = true; playSound('bigbang');
                    document.getElementById('star-fusion').innerText = "¡FUSIÓN ACTIVA! (Helio ⁴He)";
                    document.getElementById('star-fusion').style.color = "#00ff00";
                    document.getElementById('star-next-btn').style.display = 'inline-block';
                }
            }
            s4Selected = null;
        }
    };
    bindInteractEvents(canvas, handleDown, handleMove, handleUp);

    function animate() {
        ctx.fillStyle = '#010108'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath(); ctx.arc(s4GravityWell.x, s4GravityWell.y, s4GravityWell.radius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)'; ctx.stroke();
        s4Atoms.forEach(a => {
            if (!a.fused && a !== s4Selected) {
                a.x += a.dx; a.y += a.dy;
                if (a.x < 10 || a.x > canvas.width - 10) a.dx *= -1;
                if (a.y < 10 || a.y > canvas.height - 10) a.dy *= -1;
            }
            ctx.beginPath(); ctx.arc(a.x, a.y, a.radius, 0, Math.PI * 2);
            ctx.fillStyle = a.fused ? '#ff5c00' : '#ffcc00'; ctx.fill();
        });
        safeRequestAnimationFrame(animate);
    }
    animate();
}

// --- FASE 5: GALAXIAS ---
let s5Stars = [], s5Complete = false;

function initStage5() {
    cancelActiveLoop(); currentStage = 5; s5Stars = []; s5Complete = false;
    document.getElementById('stage-title').innerText = "GALAXIAS";
    document.getElementById('hud-status').innerText = "ETAPA 5 / 6";
    document.getElementById('galaxy-next-btn').style.display = 'none';
    const canvas = document.getElementById('galaxy-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const handleClick = function(e) {
        if (s5Complete) return;
        const pos = getMousePos(canvas, e);
        const cx = canvas.width / 2, cy = canvas.height / 2;
        const dist = Math.hypot(pos.x - cx, pos.y - cy);
        s5Stars.push({
            radius: dist,
            angle: Math.atan2(pos.y - cy, pos.x - cx),
            speed: (0.15 / Math.sqrt(dist)) * 3,
            size: Math.random() * 3 + 1
        });
        playSound('click');
        document.getElementById('galaxy-stars').innerText = `Sistemas en Órbita: ${s5Stars.length} / 40`;
        if (s5Stars.length >= 40) {
            s5Complete = true; playSound('success');
            document.getElementById('galaxy-next-btn').style.display = 'inline-block';
        }
    };
    bindInteractEvents(canvas, handleClick, null, null);

    function animate() {
        ctx.fillStyle = 'rgba(1, 1, 5, 0.2)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        const cx = canvas.width / 2, cy = canvas.height / 2;
        s5Stars.forEach(s => {
            s.angle += s.speed;
            ctx.beginPath();
            ctx.arc(cx + Math.cos(s.angle) * s.radius, cy + Math.sin(s.angle) * s.radius, s.size, 0, Math.PI * 2);
            ctx.fillStyle = '#00ffff'; ctx.fill();
        });
        safeRequestAnimationFrame(animate);
    }
    animate();
}

// --- FASE 6: DESTINO FINAL ---
let s6Stars = [], s6Type = null;

function initStage6() {
    cancelActiveLoop(); currentStage = 6; s6Type = null;
    document.getElementById('stage-title').innerText = "DESTINO FINAL";
    document.getElementById('hud-status').innerText = "ETAPA 6 / 6";
    const canvas = document.getElementById('destiny-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    s6Stars = [];
    for (let i = 0; i < 80; i++) {
        const r = 20 + Math.random() * 150;
        s6Stars.push({ radius: r, angle: Math.random() * Math.PI * 2, speed: (0.1 / Math.sqrt(r)) * 2, opacity: 1 });
    }

    function animate() {
        ctx.fillStyle = '#000003'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        const cx = canvas.width / 2, cy = canvas.height / 2;
        s6Stars.forEach(s => {
            if (s6Type === 'freeze') { s.speed *= 0.95; s.radius += 0.6; s.opacity -= 0.003; }
            else if (s6Type === 'rip') { s.radius += 10; }
            else if (s6Type === 'crunch') { s.radius = Math.max(2, s.radius - 3.5); }
            s.angle += s.speed;
            ctx.beginPath();
            ctx.arc(cx + Math.cos(s.angle) * s.radius, cy + Math.sin(s.angle) * s.radius, 2, 0, Math.PI * 2);
            ctx.fillStyle = s6Type === 'rip' ? '#f56565' : (s6Type === 'crunch' ? '#ffa000' : '#63b3ed');
            ctx.globalAlpha = Math.max(0.1, s.opacity); ctx.fill(); ctx.globalAlpha = 1;
        });
        safeRequestAnimationFrame(animate);
    }
    animate();
}

function updateSliders() {
    const darkElem = document.getElementById('dark-energy');
    const gravElem = document.getElementById('gravity');
    if (darkElem) document.getElementById('dark-val').innerText = darkElem.value + '%';
    if (gravElem) document.getElementById('grav-val').innerText = gravElem.value + '%';
}

function triggerFinalDestiny() {
    playSound('bigbang');
    const dark = parseInt(document.getElementById('dark-energy').value);
    const grav = parseInt(document.getElementById('gravity').value);
    const txt = document.getElementById('destiny-text');
    if (dark > 65 && grav < 35) {
        s6Type = 'rip'; chosenDestiny = 'rip';
        txt.innerHTML = "<strong style='color:#f56565;'>¡BIG RIP!</strong> La Energía Oscura desintegra las galaxias.";
    } else if (grav > 65 && dark < 35) {
        s6Type = 'crunch'; chosenDestiny = 'crunch';
        txt.innerHTML = "<strong style='color:#ffa000;'>¡BIG CRUNCH!</strong> La Gravedad colapsa el cosmos en una singularidad.";
    } else {
        s6Type = 'freeze'; chosenDestiny = 'freeze';
        txt.innerHTML = "<strong style='color:#63b3ed;'>¡BIG FREEZE!</strong> El universo se congela en Muerte Térmica.";
    }

    const oldBtn = document.getElementById('v-btn');
    if (oldBtn) oldBtn.remove();
    const btn = document.createElement('button');
    btn.id = 'v-btn'; btn.className = 'btn-cosmic btn-sm';
    btn.style.marginTop = '10px'; btn.innerText = "Ver Línea de Tiempo";
    btn.onclick = goToVictory;
    txt.appendChild(document.createElement('br'));
    txt.appendChild(btn);
}

// --- RENDERIZADO DE LA LÍNEA DE TIEMPO INTERACTIVA ---
let timelineAnimationLoop = null;

function showTimelineDetail(idx) {
    playSound('click');
    document.querySelectorAll('.timeline-node').forEach((n, i) => n.classList.toggle('active', i === idx - 1));

    const titles = [
        "Era de Planck (Singularidad)",
        "Confinamiento de Quarks",
        "Recombinación y Desacople de Luz",
        "Ignición Estelar (Fusión Nuclear)",
        "Estructura Galáctica (Sgr A*)",
        "Destino Cosmológico Final"
    ];

    const descs = [
        "Toda la materia y la energía estaban concentradas en una densidad y temperatura de Planck infinitas.",
        "La fuerza nuclear fuerte confina los quarks libres en protones (2u + 1d) de carga +1.",
        "Los electrones se acoplan a los protones formando Hidrógeno (¹H) y liberando la primera luz libre del universo.",
        "Las nubes de Hidrógeno colapsan por gravedad, superando 15 Millones K para fusionar Helio (⁴He).",
        "Formación de brazos espirales alrededor de un agujero negro supermasivo como Sagitario A*.",
        "El balance entre la Energía Oscura y la Gravedad determinará si el universo se congela, colapsa o desintegra."
    ];

    document.getElementById('timeline-title').innerText = `Fase ${idx}: ${titles[idx - 1]}`;
    document.getElementById('timeline-desc').innerText = descs[idx - 1];

    renderTimelineMiniature(idx);
}

function renderTimelineMiniature(nodeIndex) {
    if (timelineAnimationLoop) cancelAnimationFrame(timelineAnimationLoop);

    const mCanvas = document.getElementById('timeline-mini-canvas');
    if (!mCanvas) return;
    const mCtx = mCanvas.getContext('2d');
    let frame = 0;

    let miniStars = [];
    for (let i = 0; i < 45; i++) {
        const r = 10 + Math.random() * 55;
        miniStars.push({ radius: r, angle: Math.random() * Math.PI * 2, speed: (0.1 / Math.sqrt(r)) * 1.5 });
    }

    function drawMini() {
        frame++;
        mCtx.fillStyle = '#020208';
        mCtx.fillRect(0, 0, mCanvas.width, mCanvas.height);
        const cx = mCanvas.width / 2, cy = mCanvas.height / 2;

        if (nodeIndex === 1) {
            const pulse = (frame % 40) * 2;
            const g = mCtx.createRadialGradient(cx, cy, 1, cx, cy, pulse + 5);
            g.addColorStop(0, '#fff'); g.addColorStop(0.5, '#ff00ff'); g.addColorStop(1, 'transparent');
            mCtx.fillStyle = g; mCtx.beginPath(); mCtx.arc(cx, cy, pulse + 5, 0, Math.PI * 2); mCtx.fill();
        } else if (nodeIndex === 2) {
            mCtx.beginPath(); mCtx.arc(cx, cy, 35, 0, Math.PI * 2);
            mCtx.strokeStyle = 'rgba(59,59,227,0.5)'; mCtx.lineWidth = 2; mCtx.stroke();
            const angles = [0, 2.09, 4.18];
            const colors = ['#ff6b6b', '#ff6b6b', '#51cf66'];
            for (let i = 0; i < 3; i++) {
                const qx = cx + Math.cos(angles[i] + frame * 0.02) * 20;
                const qy = cy + Math.sin(angles[i] + frame * 0.02) * 20;
                mCtx.beginPath(); mCtx.arc(qx, qy, 8, 0, Math.PI * 2); mCtx.fillStyle = colors[i]; mCtx.fill();
            }
        } else if (nodeIndex === 3) {
            mCtx.beginPath(); mCtx.arc(cx, cy, 12, 0, Math.PI * 2); mCtx.fillStyle = '#ffcc00'; mCtx.fill();
            const ex = cx + Math.cos(frame * 0.04) * 32;
            const ey = cy + Math.sin(frame * 0.04) * 32;
            mCtx.beginPath(); mCtx.arc(ex, ey, 5, 0, Math.PI * 2); mCtx.fillStyle = '#00ffff'; mCtx.fill();
        } else if (nodeIndex === 4) {
            const size = 25 + Math.sin(frame * 0.1) * 3;
            const g = mCtx.createRadialGradient(cx, cy, 2, cx, cy, size);
            g.addColorStop(0, '#fff'); g.addColorStop(0.5, '#ffa000'); g.addColorStop(1, 'transparent');
            mCtx.fillStyle = g; mCtx.beginPath(); mCtx.arc(cx, cy, size, 0, Math.PI * 2); mCtx.fill();
        } else if (nodeIndex === 5 || nodeIndex === 6) {
            miniStars.forEach(s => {
                s.angle += s.speed;
                const x = cx + Math.cos(s.angle) * s.radius;
                const y = cy + Math.sin(s.angle) * s.radius;
                mCtx.beginPath(); mCtx.arc(x, y, 1.8, 0, Math.PI * 2);
                mCtx.fillStyle = nodeIndex === 6 ? (chosenDestiny === 'rip' ? '#f56565' : '#63b3ed') : '#00ffff';
                mCtx.fill();
            });
        }

        timelineAnimationLoop = requestAnimationFrame(drawMini);
    }

    drawMini();
}

function goToVictory() {
    cancelActiveLoop();
    playSound('success');
    showScreen('win-screen');
    document.getElementById('stage-title').innerText = "UNIVERSO CONSOLIDADO";
    document.getElementById('hud-status').innerText = "LÍNEA DE TIEMPO";
    showTimelineDetail(1);
}
