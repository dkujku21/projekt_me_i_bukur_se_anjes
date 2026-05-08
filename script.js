const canvas  = document.getElementById('c');
const ctx     = canvas.getContext('2d');
const overlay = document.getElementById('overlay');
const scoreEl = document.getElementById('score');
const bestEl  = document.getElementById('best');
const startBtn = document.getElementById('startBtn');

const COLS = 21, ROWS = 21;
const CELL = canvas.width / COLS;

let snake, dir, nextDir, food, score, best = 0, loop, alive, speed;

/* ── Inicializimi ── */
function init() {
  snake   = [{x:10,y:10},{x:9,y:10},{x:8,y:10}];
  dir     = {x:1, y:0};
  nextDir = {x:1, y:0};
  score   = 0;
  speed   = 130;
  alive   = true;
  placeFood();
  scoreEl.textContent = 0;
  overlay.style.display = 'none';
  if (loop) clearInterval(loop);
  loop = setInterval(tick, speed);
}

/* ── Vendos ushqimin ── */
function placeFood() {
  let pos;
  do {
    pos = {x: Math.floor(Math.random()*COLS), y: Math.floor(Math.random()*ROWS)};
  } while (snake.some(s => s.x===pos.x && s.y===pos.y));
  food = pos;
}

/* ── Cikli kryesor ── */
function tick() {
  dir = {...nextDir};
  const head = {x: snake[0].x + dir.x, y: snake[0].y + dir.y};

  if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) { die(); return; }
  if (snake.some(s => s.x===head.x && s.y===head.y))                 { die(); return; }

  const ate = head.x===food.x && head.y===food.y;
  snake.unshift(head);

  if (ate) {
    score += 10;
    if (score > best) { best = score; bestEl.textContent = best; }
    scoreEl.textContent = score;
    placeFood();
    if (score % 50 === 0) {
      clearInterval(loop);
      speed = Math.max(55, speed - 8);
      loop  = setInterval(tick, speed);
    }
  } else {
    snake.pop();
  }
  draw();
}

/* ── Vdekja ── */
function die() {
  alive = false;
  clearInterval(loop);
  let count = 0;
  const fl = setInterval(() => {
    draw(count % 2 === 0);
    if (++count > 5) {
      clearInterval(fl);
      overlay.innerHTML = `
        <h2>💀 Loja Mbaroi!</h2>
        <p>Pikë: <strong style="color:#4ade80">${score}</strong>
           &nbsp;|&nbsp;
           Rekord: <strong style="color:#fbbf24">${best}</strong></p>
        <button id="startBtn">Luaj Sërish</button>`;
      overlay.style.display = 'flex';
      document.getElementById('startBtn').addEventListener('click', init);
    }
  }, 120);
}

/* ── Vizatimi i qelizave ── */
function drawCell(x, y, color, r = 3) {
  const pad = 1.5;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(x*CELL+pad, y*CELL+pad, CELL-pad*2, CELL-pad*2, r);
  ctx.fill();
}

/* ── Vizatimi kryesor ── */
function draw(dead = false) {
  /* Sfond */
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  /* Tabllë me ngjyrë alternative */
  for (let x = 0; x < COLS; x++)
    for (let y = 0; y < ROWS; y++)
      if ((x+y) % 2 === 0) {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(x*CELL, y*CELL, CELL, CELL);
      }

  /* Rrjeta */
  ctx.strokeStyle = 'rgba(255,255,255,0.03)';
  ctx.lineWidth   = 0.5;
  for (let x = 0; x <= COLS; x++) {
    ctx.beginPath(); ctx.moveTo(x*CELL, 0); ctx.lineTo(x*CELL, canvas.height); ctx.stroke();
  }
  for (let y = 0; y <= ROWS; y++) {
    ctx.beginPath(); ctx.moveTo(0, y*CELL); ctx.lineTo(canvas.width, y*CELL); ctx.stroke();
  }

  /* Ushqimi */
  const fx = food.x*CELL + CELL/2;
  const fy = food.y*CELL + CELL/2;
  const g  = ctx.createRadialGradient(fx, fy, 1, fx, fy, CELL*0.75);
  g.addColorStop(0, 'rgba(249,115,22,0.4)');
  g.addColorStop(1, 'rgba(249,115,22,0)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(fx, fy, CELL*0.75, 0, Math.PI*2); ctx.fill();
  drawCell(food.x, food.y, '#f97316', 6);
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.beginPath(); ctx.ellipse(fx-2, fy-3, 3, 2, -0.5, 0, Math.PI*2); ctx.fill();

  /* Trupi i gjarprit */
  for (let i = snake.length - 1; i >= 1; i--) {
    const t   = i / snake.length;
    const col = dead ? '#ef4444' : `hsl(${140 - t*20}, ${70 - t*10}%, ${45 - t*10}%)`;
    drawCell(snake[i].x, snake[i].y, col, 4);
  }

  /* Koka */
  const h = snake[0];
  drawCell(h.x, h.y, dead ? '#ef4444' : '#4ade80', 5);

  const ex  = h.x*CELL + CELL/2;
  const ey  = h.y*CELL + CELL/2;
  const e1x = ex + dir.y*4 + dir.x*3;
  const e1y = ey - dir.x*4 + dir.y*3;
  const e2x = ex - dir.y*4 + dir.x*3;
  const e2y = ey + dir.x*4 + dir.y*3;

  ctx.fillStyle = dead ? '#fff' : '#052e16';
  ctx.beginPath(); ctx.arc(e1x, e1y, 2.5, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(e2x, e2y, 2.5, 0, Math.PI*2); ctx.fill();

  if (!dead) {
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.beginPath(); ctx.arc(e1x+0.5, e1y-0.5, 1, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(e2x+0.5, e2y-0.5, 1, 0, Math.PI*2); ctx.fill();
  }
}

/* ── Tastiera ── */
document.addEventListener('keydown', e => {
  const map = {
    ArrowUp:'u', ArrowDown:'d', ArrowLeft:'l', ArrowRight:'r',
    w:'u', s:'d', a:'l', d:'r',
    W:'u', S:'d', A:'l', D:'r'
  };
  const k = map[e.key];
  if (!k) return;
  if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) e.preventDefault();
  if (!alive) return;
  if (k==='u' && dir.y !==  1) nextDir = {x:0,  y:-1};
  if (k==='d' && dir.y !== -1) nextDir = {x:0,  y:1};
  if (k==='l' && dir.x !==  1) nextDir = {x:-1, y:0};
  if (k==='r' && dir.x !== -1) nextDir = {x:1,  y:0};
});

/* ── D-Pad butonat ── */
function setDir(dx, dy) {
  if (!alive) return;
  if (dx === 0  && dy === -1 && dir.y !==  1) nextDir = {x:0,  y:-1};
  if (dx === 0  && dy ===  1 && dir.y !== -1) nextDir = {x:0,  y:1};
  if (dx === -1 && dy ===  0 && dir.x !==  1) nextDir = {x:-1, y:0};
  if (dx ===  1 && dy ===  0 && dir.x !== -1) nextDir = {x:1,  y:0};
}

document.getElementById('dUp').addEventListener('click',    () => setDir(0, -1));
document.getElementById('dDown').addEventListener('click',  () => setDir(0,  1));
document.getElementById('dLeft').addEventListener('click',  () => setDir(-1, 0));
document.getElementById('dRight').addEventListener('click', () => setDir(1,  0));

/* ── Swipe për celular ── */
let tx = 0, ty = 0;
canvas.addEventListener('touchstart', e => {
  tx = e.touches[0].clientX;
  ty = e.touches[0].clientY;
}, {passive: true});
canvas.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - tx;
  const dy = e.changedTouches[0].clientY - ty;
  if (Math.abs(dx) > Math.abs(dy)) setDir(dx > 0 ? 1 : -1, 0);
  else setDir(0, dy > 0 ? 1 : -1);
});

/* ── Start ── */
startBtn.addEventListener('click', init);

/* Vizato sfondin fillestar */
ctx.fillStyle = '#0f172a';
ctx.fillRect(0, 0, canvas.width, canvas.height);
