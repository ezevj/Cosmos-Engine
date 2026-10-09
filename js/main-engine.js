// --- MOTOR PRINCIPAL: FASES DEL BIG BANG Y LÍNEA DE TIEMPO INTERACTIVA ---

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
    initPlanetArchitect();
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

// --- RENDERIZADO DE LA LÍNEA DE TIEMPO INTERACTIVA EN PANTALLA VICTORIA ---
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
