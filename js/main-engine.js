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
        clientX = evt.touches.clientX; clientY = evt.touches.clientY;
    } else if (evt.changedTouches && evt.changedTouches.length > 0) {
        clientX = evt.changedTouches.clientX; clientY = evt.changedTouches.clientY;
    } else {
        clientX = evt.clientX; clientY = evt.clientY;
    }
    return {
        x: (clientX - rect.left) * (canvas.width / (rect.width || 1)),
        y: (clientY - rect.top) * (canvas.height / (rect.height || 1))
    };
}

function bindInteractEvents(canvas, downFn, moveFn, upFn) {
    canvas.onmousedown = downFn; canvas.onmousemove = moveFn; canvas.onmouseup = upFn;
    
    canvas.addEventListener('touchstart', function(e) {
        e.preventDefault(); if (downFn) downFn(e);
    }, { passive: false });
    
    canvas.addEventListener('touchmove', function(e) {
        e.preventDefault(); if (moveFn) moveFn(e);
    }, { passive: false });
    
    canvas.addEventListener('touchend', function(e) {
        e.preventDefault(); if (upFn) upFn(e);
    }, { passive: false });
}

// --- NAVEGACIÓN COMPLETA Y ESTADO DEL JUEGO ---
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

// --- FASE 1: SINGULARIDAD Y COMPRESIÓN (BIG BANG ÉPICO) ---
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
            s1Shake = s1Clicks * 4.5;

            for (let i = 0; i < 20; i++) {
                const angle = Math.random() * Math.PI * 2, r = 180 + Math.random() * 80;
                s1Particles.push({
                    x: canvas.width / 2 + Math.cos(angle) * r,
                    y: canvas.height / 2 + Math.sin(angle) * r,
                    targetX: canvas.width / 2,
                    targetY: canvas.height / 2,
                    speed: 0.09,
                    size: Math.random() * 3 + 1.5,
                    color: `hsl(${Math.random() * 360}, 100%, 75%)`
                });
            }

            document.getElementById('temp-metric').innerHTML = `Temperatura: 10<sup>${(32 - s1Clicks * 2.5).toFixed(0)}</sup> K`;
            document.getElementById('density-metric').innerText = `Densidad: ${100 + s1Clicks * 50}% Crítica`;

            if (s1Clicks >= maxS1Clicks) {
                playSound('bigbang');
                isExpanding = true;
                s1Particles = [];
                for (let i = 0; i < 150; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    s1Particles.push({
                        x: canvas.width / 2, y: canvas.height / 2,
                        dx: Math.cos(angle) * (Math.random() * 12 + 4),
                        dy: Math.sin(angle) * (Math.random() * 12 + 4),
                        size: Math.random() * 3 + 1,
                        color: `hsl(${Math.random() * 60 + 180}, 100%, 70%)`
                    });
                }
            }
        }
    };
    bindInteractEvents(canvas, handleClick, null, null);

    function animate() {
        ctx.fillStyle = '#010106'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        const cx = canvas.width / 2, cy = canvas.height / 2;

        ctx.save();
        if (s1Shake > 0) {
            ctx.translate((Math.random() - 0.5) * s1Shake, (Math.random() - 0.5) * s1Shake);
            s1Shake *= 0.9;
        }

        if (!isExpanding) {
            ctx.strokeStyle = `rgba(0, 255, 255, ${0.1 + s1Clicks * 0.08})`;
            ctx.lineWidth = 1;
            for (let r = 20; r < 200; r += 30) {
                ctx.beginPath(); ctx.arc(cx, cy, Math.max(5, r - s1Clicks * 3), 0, Math.PI * 2); ctx.stroke();
            }

            const size = Math.max(8, 60 - s1Clicks * 6);
            const grad = ctx.createRadialGradient(cx, cy, 2, cx, cy, size);
            grad.addColorStop(0, '#ffffff'); grad.addColorStop(0.4, '#ff00ff'); grad.addColorStop(1, 'transparent');
            ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(cx, cy, size, 0, Math.PI * 2); ctx.fill();

            s1Particles.forEach(p => {
                p.x += (p.targetX - p.x) * p.speed;
                p.y += (p.targetY - p.y) * p.speed;
                ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fillStyle = p.color; ctx.fill();
            });

        } else {
            explosionRadius += 16;
            ctx.beginPath(); ctx.arc(cx, cy, explosionRadius, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(0, 255, 255, 0.8)'; ctx.lineWidth = 8; ctx.stroke();

            ctx.beginPath(); ctx.arc(cx, cy, explosionRadius * 0.7, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(255, 0, 255, 0.6)'; ctx.lineWidth = 4; ctx.stroke();

            s1Particles.forEach(p => {
                p.x += p.dx; p.y += p.dy;
                ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fillStyle = p.color; ctx.fill();
            });
        }

        ctx.restore();

        if (explosionRadius < canvas.width * 1.2) safeRequestAnimationFrame(animate);
        else { cancelActiveLoop(); showScreen('stage2-screen'); initStage2(); }
    }
    animate();
}

// --- FASE 2: QUARKS (PLASMA QGP CON REPOSICIÓN CONTINUA) ---
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
            x: Math.random() * canvas.width, y: Math.random() * (canvas.height - 50) + 25,
            type: Math.random() > 0.45 ? 'u' : 'd',
            dx: (Math.random() - 0.5) * 4, dy: (Math.random() - 0.5) * 4, radius: 15
        });
    }

    const handleClick = function(e) {
        const pos = getMousePos(canvas, e);
        for (let i = s2Quarks.length - 1; i >= 0; i--) {
            const q = s2Quarks[i];
            if (Math.hypot(q.x - pos.x, q.y - pos.y) < q.radius + 20) {
                playSound('confinement'); constructionSlot.push(q.type); s2Quarks.splice(i, 1);

                if (s2Quarks.length < 15) {
                    s2Quarks.push({
                        x: Math.random() * canvas.width, y: Math.random() * (canvas.height - 50) + 25,
                        type: Math.random() > 0.45 ? 'u' : 'd',
                        dx: (Math.random() - 0.5) * 4, dy: (Math.random() - 0.5) * 4, radius: 15
                    });
                }

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

// --- FASE 3: RECOMBINACIÓN (ÁTOMOS DE HIDRÓGENO REALISTAS ¹H) ---
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

    let orbitAngle = 0;
    function animate() {
        orbitAngle += 0.05;
        ctx.fillStyle = '#010106'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        s3Particles.forEach(p => {
            if (p.type === 'electron' && !p.bound && p !== s3Selected) {
                p.x += p.dx; p.y += p.dy;
                if (p.x < p.radius || p.x > canvas.width - p.radius) p.dx *= -1;
                if (p.y < p.radius || p.y > canvas.height - p.radius) p.dy *= -1;
            }

            if (p.type === 'proton') {
                if (!p.bound) {
                    const grad = ctx.createRadialGradient(p.x, p.y, 2, p.x, p.y, p.radius + 6);
                    grad.addColorStop(0, '#ff66cc'); grad.addColorStop(0.6, '#ff00aa'); grad.addColorStop(1, 'transparent');
                    ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(p.x, p.y, p.radius + 6, 0, Math.PI * 2); ctx.fill();

                    ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                    ctx.fillStyle = '#ff1a75'; ctx.fill();
                    ctx.fillStyle = '#ffffff'; ctx.font = 'bold 12px Orbitron'; ctx.fillText('p⁺', p.x - 7, p.y + 4);
                } else {
                    // ÁTOMO DE HIDRÓGENO COMPLETO (¹H)
                    ctx.beginPath(); ctx.ellipse(p.x, p.y, 32, 18, 0.3, 0, Math.PI * 2);
                    ctx.strokeStyle = 'rgba(0, 255, 255, 0.4)'; ctx.lineWidth = 1.5; ctx.stroke();

                    ctx.beginPath(); ctx.arc(p.x, p.y, 14, 0, Math.PI * 2);
                    ctx.fillStyle = '#ff1a75'; ctx.fill();
                    ctx.fillStyle = '#ffffff'; ctx.font = 'bold 10px Orbitron'; ctx.fillText('p⁺', p.x - 6, p.y + 3);

                    const ex = p.x + Math.cos(orbitAngle) * 32;
                    const ey = p.y + Math.sin(orbitAngle) * 18;
                    ctx.beginPath(); ctx.arc(ex, ey, 6, 0, Math.PI * 2);
                    ctx.fillStyle = '#00ffff'; ctx.shadowColor = '#00ffff'; ctx.shadowBlur = 10; ctx.fill();
                    ctx.shadowBlur = 0;
                }
            } else if (p.type === 'electron' && !p.bound) {
                ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = '#00ffff'; ctx.shadowColor = '#00ffff'; ctx.shadowBlur = 8; ctx.fill();
                ctx.shadowBlur = 0;
                ctx.fillStyle = '#000000'; ctx.font = 'bold 10px Orbitron'; ctx.fillText('e⁻', p.x - 6, p.y + 3);
            }
        });

        if (s3Atoms < 6) safeRequestAnimationFrame(animate);
        else { cancelActiveLoop(); showScreen('stage4-screen'); initStage4(); }
    }
    animate();
}

// --- FASE 4: FUSIÓN ESTELAR (SOL/ESTRELLA RESPLANDECIENTE CON NÚCLEO DE HELIO ⁴He) ---
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
        s4Atoms.push({ x: 50 + Math.random() * 700, y: 50 + Math.random() * 200, radius: 16, fused: false, dx: (Math.random() - 0.5) * 3, dy: (Math.random() - 0.5) * 3 });
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

    let sunTime = 0;
    function animate() {
        sunTime += 0.03;
        ctx.fillStyle = '#010108'; ctx.fillRect(0, 0, canvas.width, canvas.height);

        const gx = s4GravityWell.x, gy = s4GravityWell.y;

        if (!s4Ignited) {
            // Pozo Gravitatorio en Calentamiento
            ctx.beginPath(); ctx.arc(gx, gy, s4GravityWell.radius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(255, ${Math.min(255, s4FusedCount * 40)}, 0, 0.5)`; ctx.lineWidth = 3; ctx.stroke();

            ctx.fillStyle = '#ffaa00'; ctx.font = '12px Orbitron'; ctx.textAlign = 'center';
            ctx.fillText(`${(s4FusedCount * 2.5).toFixed(1)}M K`, gx, gy + 4);
            ctx.textAlign = 'left';
        } else {
            // ☀️ SOL / ESTRELLA RESPLANDECIENTE (ANIMACIÓN DE FUSIÓN ACTIVA)
            
            // 1. Corona Solar (Resplandor térmico exterior)
            const coronaG = ctx.createRadialGradient(gx, gy, 20, gx, gy, 140);
            coronaG.addColorStop(0, 'rgba(255, 230, 100, 0.9)');
            coronaG.addColorStop(0.3, 'rgba(255, 120, 0, 0.5)');
            coronaG.addColorStop(0.7, 'rgba(255, 50, 0, 0.2)');
            coronaG.addColorStop(1, 'transparent');
            ctx.fillStyle = coronaG; ctx.beginPath(); ctx.arc(gx, gy, 140, 0, Math.PI * 2); ctx.fill();

            // 2. Llamaradas y Prominencias Solares (Erupciones)
            ctx.strokeStyle = '#ff3300'; ctx.lineWidth = 3;
            for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
                const flareR = 65 + Math.sin(sunTime * 3 + a) * 12;
                const fx = gx + Math.cos(a + sunTime * 0.5) * flareR;
                const fy = gy + Math.sin(a + sunTime * 0.5) * flareR;
                ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(fx, fy); ctx.stroke();
            }

            // 3. Fotosfera brillante
            const sunG = ctx.createRadialGradient(gx - 10, gy - 10, 5, gx, gy, 60);
            sunG.addColorStop(0, '#ffffff'); sunG.addColorStop(0.4, '#fff066');
            sunG.addColorStop(0.8, '#ff6600'); sunG.addColorStop(1, '#cc1100');
            ctx.fillStyle = sunG; ctx.beginPath(); ctx.arc(gx, gy, 60, 0, Math.PI * 2); ctx.fill();

            // 4. Etiqueta del Núcleo
            ctx.fillStyle = '#ffffff'; ctx.font = 'bold 12px Orbitron'; ctx.textAlign = 'center';
            ctx.fillText('SOL (⁴He)', gx, gy + 85);
            ctx.textAlign = 'left';
        }

        // DIBUJO DE ÁTOMOS (HIDRÓGENO Y HELIO SINTETIZADO)
        s4Atoms.forEach(a => {
            if (!a.fused && a !== s4Selected) {
                a.x += a.dx; a.y += a.dy;
                if (a.x < 15 || a.x > canvas.width - 15) a.dx *= -1;
                if (a.y < 15 || a.y > canvas.height - 15) a.dy *= -1;
            }

            if (!a.fused) {
                // Átomo de Hidrógeno libre (¹H)
                ctx.beginPath(); ctx.ellipse(a.x, a.y, 16, 9, 0.2, 0, Math.PI * 2);
                ctx.strokeStyle = 'rgba(0, 255, 255, 0.4)'; ctx.lineWidth = 1; ctx.stroke();
                
                ctx.beginPath(); ctx.arc(a.x, a.y, 8, 0, Math.PI * 2);
                ctx.fillStyle = '#ff1a75'; ctx.fill();
                
                const ex = a.x + Math.cos(sunTime * 3) * 16;
                const ey = a.y + Math.sin(sunTime * 3) * 9;
                ctx.beginPath(); ctx.arc(ex, ey, 3.5, 0, Math.PI * 2);
                ctx.fillStyle = '#00ffff'; ctx.fill();
            } else if (!s4Ignited) {
                // ÁTOMO DE HELIO-4 SINTETIZADO (⁴He): 2 Protones + 2 Neutrones + 2 Electrones
                const hx = a.x, hy = a.y;
                // Protones
                ctx.beginPath(); ctx.arc(hx - 4, hy - 4, 5, 0, Math.PI * 2); ctx.fillStyle = '#ff1a75'; ctx.fill();
                ctx.beginPath(); ctx.arc(hx + 4, hy + 4, 5, 0, Math.PI * 2); ctx.fillStyle = '#ff1a75'; ctx.fill();
                // Neutrones
                ctx.beginPath(); ctx.arc(hx + 4, hy - 4, 5, 0, Math.PI * 2); ctx.fillStyle = '#8888aa'; ctx.fill();
                ctx.beginPath(); ctx.arc(hx - 4, hy + 4, 5, 0, Math.PI * 2); ctx.fillStyle = '#8888aa'; ctx.fill();
                // 2 Electrones en órbitas
                ctx.beginPath(); ctx.ellipse(hx, hy, 18, 10, 0.4, 0, Math.PI * 2);
                ctx.strokeStyle = 'rgba(255, 204, 0, 0.5)'; ctx.lineWidth = 1; ctx.stroke();
            }
        });

        safeRequestAnimationFrame(animate);
    }
    animate();
}

// --- FASE 5: GALAXIA (AGUJERO NEGRO SUPERMASIVO SAGITARIO A* / M87) ---
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
        if (dist > 35) {
            s5Stars.push({
                radius: dist,
                angle: Math.atan2(pos.y - cy, pos.x - cx),
                speed: (0.18 / Math.sqrt(dist)) * 3,
                size: Math.random() * 3 + 1
            });
            playSound('click');
            document.getElementById('galaxy-stars').innerText = `Sistemas en Órbita: ${s5Stars.length} / 40`;
            if (s5Stars.length >= 40) {
                s5Complete = true; playSound('success');
                document.getElementById('galaxy-next-btn').style.display = 'inline-block';
            }
        }
    };
    bindInteractEvents(canvas, handleClick, null, null);

    let bhTime = 0;
    function animate() {
        bhTime += 0.04;
        ctx.fillStyle = 'rgba(1, 1, 5, 0.25)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        const cx = canvas.width / 2, cy = canvas.height / 2;

        // 🕳️ AGUJERO NEGRO SUPERMASIVO (SAGITARIO A* CON DISCO DE ACRECIÓN Y CHORROS RELATIVISTAS)
        
        // 1. Chorros Relativistas (Jets verticales de plasma)
        const jetG = ctx.createLinearGradient(cx, cy - 120, cx, cy + 120);
        jetG.addColorStop(0, 'rgba(0, 255, 255, 0.8)'); jetG.addColorStop(0.4, 'transparent');
        jetG.addColorStop(0.6, 'transparent'); jetG.addColorStop(1, 'rgba(0, 255, 255, 0.8)');
        ctx.fillStyle = jetG; ctx.fillRect(cx - 3, cy - 120, 6, 240);

        // 2. Disco de Acreción Inclinado (Lente Gravitatoria e Incandescencia)
        ctx.save(); ctx.translate(cx, cy); ctx.scale(1, 0.38); ctx.rotate(0.2);
        const accG = ctx.createRadialGradient(0, 0, 20, 0, 0, 75);
        accG.addColorStop(0, '#ffffff'); accG.addColorStop(0.2, '#ffaa00');
        accG.addColorStop(0.6, '#ff3300'); accG.addColorStop(1, 'transparent');
        ctx.fillStyle = accG; ctx.beginPath(); ctx.arc(0, 0, 75, 0, Math.PI * 2); ctx.fill();
        ctx.restore();

        // 3. Horizonte de Sucesos (Esfera Negra Absoluta)
        ctx.beginPath(); ctx.arc(cx, cy, 22, 0, Math.PI * 2);
        ctx.fillStyle = '#000000'; ctx.fill();

        // 4. Anillo Fotónico Lente Gravitacional (Borde Brillante)
        ctx.beginPath(); ctx.arc(cx, cy, 23.5, 0, Math.PI * 2);
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2.5;
        ctx.shadowColor = '#00ffff'; ctx.shadowBlur = 15; ctx.stroke();
        ctx.shadowBlur = 0;

        // SISTEMAS SOLARES EN ÓRBITA
        s5Stars.forEach(s => {
            s.angle += s.speed;
            const sx = cx + Math.cos(s.angle) * s.radius;
            const sy = cy + Math.sin(s.angle) * s.radius;
            ctx.beginPath(); ctx.arc(sx, sy, s.size, 0, Math.PI * 2);
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
