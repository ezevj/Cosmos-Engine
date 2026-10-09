// Fondo animado global de Polvo Estelar y Nebulosa Cósmica
const bgCanvas = document.getElementById('space-bg-canvas');
const bgCtx = bgCanvas.getContext('2d');
let bgStars = [];

function resizeBg() {
    bgCanvas.width = window.innerWidth;
    bgCanvas.height = window.innerHeight;
    bgStars = [];
    for (let i = 0; i < 130; i++) {
        bgStars.push({
            x: Math.random() * bgCanvas.width,
            y: Math.random() * bgCanvas.height,
            size: Math.random() * 2 + 0.5,
            alpha: Math.random(),
            speed: Math.random() * 0.015 + 0.005
        });
    }
}
window.addEventListener('resize', resizeBg);
resizeBg();

function renderBg() {
    bgCtx.fillStyle = '#020208';
    bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);

    // Resplandor de nebulosa
    const grad = bgCtx.createRadialGradient(
        bgCanvas.width / 2, bgCanvas.height / 2, 100,
        bgCanvas.width / 2, bgCanvas.height / 2, bgCanvas.width / 1.1
    );
    grad.addColorStop(0, 'rgba(59, 59, 227, 0.12)');
    grad.addColorStop(0.5, 'rgba(150, 0, 200, 0.06)');
    grad.addColorStop(1, 'transparent');
    bgCtx.fillStyle = grad;
    bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);

    // Titileo de estrellas
    bgStars.forEach(s => {
        s.alpha += s.speed;
        if (s.alpha > 1 || s.alpha < 0) s.speed *= -1;
        bgCtx.fillStyle = `rgba(255, 255, 255, ${Math.abs(s.alpha)})`;
        bgCtx.beginPath();
        bgCtx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        bgCtx.fill();
    });

    requestAnimationFrame(renderBg);
}
renderBg();
