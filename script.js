/* =========================================================
   AETHERIS RUNTIME ENGINE — v7 CINEMATIC
   ========================================================= */

(function () {
  'use strict';

  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return [].slice.call((c || document).querySelectorAll(s)); }

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;


  /* =========================================================
     1. MATRIX RAIN (cu glitch magenta)
     ========================================================= */
  function initRain() {
    var canvas = $('#rain');
    if (!canvas) return;

    var ctx = canvas.getContext('2d');
    var FONT = 14;
    var CHARS = '零一二三四五六七八九十百千万0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    var cols = 0;
    var drops = [];
    var glitchTimer = 0;

    function resize() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      cols = Math.floor(canvas.width / FONT);
      drops = [];
      for (var i = 0; i < cols; i++) drops.push(1);
    }

    function frame() {
      ctx.fillStyle = 'rgba(0,0,0,0.06)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = FONT + 'px monospace';

      glitchTimer++;
      var glitching = glitchTimer > 300 && Math.random() > 0.95;
      if (glitching) glitchTimer = 0;

      for (var i = 0; i < drops.length; i++) {
        var ch = CHARS[Math.floor(Math.random() * CHARS.length)];

        if (glitching && Math.random() > 0.7) {
          ctx.fillStyle = '#ff00ff';
          ctx.shadowColor = '#ff00ff';
          ctx.shadowBlur = 15;
        } else if (Math.random() > 0.97) {
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = '#00ff66';
          ctx.shadowBlur = 14;
        } else if (Math.random() > 0.85) {
          ctx.fillStyle = '#5ac8fa';
          ctx.shadowColor = '#5ac8fa';
          ctx.shadowBlur = 8;
        } else {
          ctx.fillStyle = '#00ff66';
          ctx.shadowColor = '#00ff66';
          ctx.shadowBlur = 4;
        }

        ctx.fillText(ch, i * FONT, drops[i] * FONT);

        if (drops[i] * FONT > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }

      ctx.shadowBlur = 0;
      ctx.shadowColor = 'transparent';
    }

    resize();
    window.addEventListener('resize', resize);

    if (reduced) { frame(); return; }

    var last = 0;
    function loop(ts) {
      if (!last) last = ts;
      if (ts - last >= 33) { frame(); last = ts; }
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }


  /* =========================================================
     2. PARTICULE (interactive, fug de mouse)
     ========================================================= */
  function initParticles() {
    var canvas = $('#particles');
    if (!canvas || reduced) return;

    var ctx = canvas.getContext('2d');
    var particles = [];
    var mouse = { x: -1000, y: -1000 };
    var W = 0, H = 0;

    function resize() {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }

    function spawn() {
      var count = Math.floor((W * H) / 28000);
      particles = [];
      for (var i = 0; i < count; i++) {
        var rnd = Math.random();
        particles.push({
          x: Math.random() * W,
          y: Math.random() * H,
          r: Math.random() * 1.6 + 0.4,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25,
          baseA: Math.random() * 0.5 + 0.2,
          phase: Math.random() * Math.PI * 2,
          hue: rnd > 0.92 ? 'white' : (rnd > 0.85 ? 'cyan' : 'green')
        });
      }
    }

    function frame(t) {
      ctx.clearRect(0, 0, W, H);

      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < -10) p.x = W + 10;
        if (p.x > W + 10) p.x = -10;
        if (p.y < -10) p.y = H + 10;
        if (p.y > H + 10) p.y = -10;

        var dx = p.x - mouse.x;
        var dy = p.y - mouse.y;
        var d2 = dx * dx + dy * dy;
        if (d2 < 10000) {
          var d = Math.sqrt(d2) || 1;
          var force = (100 - d) / 100;
          p.x += (dx / d) * force * 1.5;
          p.y += (dy / d) * force * 1.5;
        }

        var a = p.baseA * (0.6 + 0.4 * Math.sin(t * 0.002 + p.phase));
        var color;
        if (p.hue === 'cyan')       color = 'rgba(90, 200, 250, ' + a + ')';
        else if (p.hue === 'white') color = 'rgba(255, 255, 255, ' + a + ')';
        else                        color = 'rgba(0, 255, 102, ' + a + ')';

        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 8;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.shadowBlur = 0;
      requestAnimationFrame(frame);
    }

    resize();
    spawn();
    window.addEventListener('resize', function () { resize(); spawn(); });

    window.addEventListener('mousemove', function (e) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    }, { passive: true });

    requestAnimationFrame(frame);
  }


  /* =========================================================
     2b. CONSTELLATION (linii între particule apropiate)
     ========================================================= */
  function initConstellation() {
    var canvas = $('#constellation');
    if (!canvas || reduced) return;
    if (window.innerWidth < 800) return;

    var ctx = canvas.getContext('2d');
    var W = 0, H = 0;
    var points = [];
    var mouse = { x: -1000, y: -1000 };

    function resize() {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }

    function spawn() {
      var count = Math.floor((W * H) / 45000);
      points = [];
      for (var i = 0; i < count; i++) {
        points.push({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35
        });
      }
    }

    function frame() {
      ctx.clearRect(0, 0, W, H);

      for (var i = 0; i < points.length; i++) {
        var p = points[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;

        // conexiuni
        for (var j = i + 1; j < points.length; j++) {
          var q = points[j];
          var dx = p.x - q.x;
          var dy = p.y - q.y;
          var d2 = dx * dx + dy * dy;

          if (d2 < 12000) {
            var alpha = (1 - d2 / 12000) * 0.35;
            ctx.strokeStyle = 'rgba(0, 255, 102, ' + alpha + ')';
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }

        // conexiune cu mouse
        var mdx = p.x - mouse.x;
        var mdy = p.y - mouse.y;
        var md2 = mdx * mdx + mdy * mdy;
        if (md2 < 22000) {
          var malpha = (1 - md2 / 22000) * 0.6;
          ctx.strokeStyle = 'rgba(90, 200, 250, ' + malpha + ')';
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }

        // punctul
        ctx.beginPath();
        ctx.fillStyle = 'rgba(0, 255, 102, 0.7)';
        ctx.shadowColor = '#00ff66';
        ctx.shadowBlur = 6;
        ctx.arc(p.x, p.y, 1.4, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.shadowBlur = 0;
      requestAnimationFrame(frame);
    }

    resize();
    spawn();
    window.addEventListener('resize', function () { resize(); spawn(); });

    window.addEventListener('mousemove', function (e) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    }, { passive: true });

    requestAnimationFrame(frame);
  }


  /* =========================================================
     3. TYPEWRITER
     ========================================================= */
  function initType() {
    var target = $('#typer');
    if (!target) return;

    var msgs = [
      'initiating_system_handshake...',
      'establishing secure link with cluster node alpha...',
      'compiling deep kernel runtime scripts...',
      'status: defensive perimeter fully deployed.',
      'welcome to the aetheris collective portal.'
    ];

    var i = 0, ch = 0, del = false;

    function tick() {
      var m = msgs[i];
      var next = m.charAt(ch);

      if (!del) {
        target.textContent = m.substring(0, ch + 1);
        ch++;
        if (ch === m.length) {
          setTimeout(function () { del = true; tick(); }, 2600);
          return;
        }
      } else {
        target.textContent = m.substring(0, ch - 1);
        ch--;
        if (ch === 0) {
          del = false;
          i = (i + 1) % msgs.length;
        }
      }

      var d = del ? 24 : 70 + Math.random() * 45;
      if (next === ' ' || next === '_' || next === '.') d = Math.max(16, d - 30);

      setTimeout(tick, d);
    }

    if (reduced) { target.textContent = msgs[0]; return; }
    setTimeout(tick, 1200);
  }


  /* =========================================================
     4. TILT 3D
     ========================================================= */
  function initTilt() {
    if (reduced) return;
    if (window.matchMedia('(hover: none)').matches) return;

    var MAX = 10;

    $$('[data-tilt]').forEach(function (el) {
      var r = null;

      el.addEventListener('mouseenter', function () {
        r = el.getBoundingClientRect();
        el.style.transition = 'transform 0.15s ease-out';
        el.style.animation = 'none';
      });

      el.addEventListener('mousemove', function (e) {
        if (!r) r = el.getBoundingClientRect();
        var x = e.clientX - r.left;
        var y = e.clientY - r.top;
        var px = (x / r.width) - 0.5;
        var py = (y / r.height) - 0.5;

        var ry =  px * MAX * 2;
        var rx = -py * MAX * 2;

        el.style.transform =
          'perspective(1000px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg) scale(1.04)';
      });

      el.addEventListener('mouseleave', function () {
        r = null;
        el.style.transition = 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)';
        el.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
      });
    });
  }


  /* =========================================================
     5. SPOTLIGHT MOUSE
     ========================================================= */
  function initSpotlight() {
    if (reduced) return;
    var spot = $('#spotlight');
    if (!spot) return;

    var ticking = false;

    window.addEventListener('mousemove', function (e) {
      if (!ticking) {
        requestAnimationFrame(function () {
          spot.style.setProperty('--mx', (e.clientX / window.innerWidth * 100) + '%');
          spot.style.setProperty('--my', (e.clientY / window.innerHeight * 100) + '%');
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }


  /* =========================================================
     6. CARD GLOW
     ========================================================= */
  function initCardGlow() {
    if (reduced) return;

    $$('.bento-card').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  }


  /* =========================================================
     7. SCROLL REVEAL
     ========================================================= */
  function initReveal() {
    var items = $$('.reveal');
    if (!items.length) return;

    if (reduced || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('in'); });
      return;
    }

    items.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.9 && r.bottom > 0) {
        el.classList.add('in');
      }
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e, k) {
        if (e.isIntersecting) {
          setTimeout(function () {
            e.target.classList.add('in');
          }, k * 70);
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    items.forEach(function (el) { io.observe(el); });
  }


  /* =========================================================
     8. STATS COUNTER
     ========================================================= */
  function initStats() {
    var stats = $$('.stat-val');
    if (!stats.length) return;

    function animate(el) {
      var target   = parseInt(el.dataset.count, 10) || 0;
      var prefix   = el.dataset.prefix || '';
      var suffix   = el.dataset.suffix || '';
      var duration = 1600;
      var start    = performance.now();

      function step(now) {
        var t = Math.min((now - start) / duration, 1);
        var eased = 1 - Math.pow(1 - t, 3);
        var val = Math.floor(target * eased);
        el.textContent = prefix + val + suffix;
        if (t < 1) requestAnimationFrame(step);
      }

      requestAnimationFrame(step);
    }

    if (reduced) {
      stats.forEach(function (el) {
        el.textContent =
          (el.dataset.prefix || '') + el.dataset.count + (el.dataset.suffix || '');
      });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          animate(e.target);
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.5 });

    stats.forEach(function (el) { io.observe(el); });
  }


  /* =========================================================
     9. TERMINAL
     ========================================================= */
  function initTerm() {
    var body  = $('#terminal');
    var out   = $('#term-out');
    var input = $('#term-input');
    if (!body || !out || !input) return;

    var PROMPT = 'aetheris@cluster-alpha:~$';

    var nodes = [
      { id: 'node-alpha',   region: 'eu-central',   status: 'operational', load: 34 },
      { id: 'node-beta',    region: 'us-east',      status: 'operational', load: 51 },
      { id: 'node-gamma',   region: 'ap-south',     status: 'operational', load: 28 },
      { id: 'node-delta',   region: 'us-west',      status: 'degraded',    load: 87 },
      { id: 'node-epsilon', region: 'eu-west',      status: 'operational', load: 42 },
      { id: 'node-zeta',    region: 'ap-northeast', status: 'operational', load: 19 }
    ];

    function esc(s) {
      return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function line(text, type) {
      type = type || 'cmd';
      var sp = document.createElement('span');
      sp.className = 'term-line term-line-' + type;
      sp.textContent = text;
      out.appendChild(sp);
      out.appendChild(document.createTextNode('\n'));
      body.scrollTop = body.scrollHeight;
    }

    function prompt(cmd) {
      var sp = document.createElement('span');
      sp.className = 'term-line';
      sp.innerHTML =
        '<span class="term-line-success">' + PROMPT + '</span> ' +
        '<span class="term-line-cmd">' + esc(cmd) + '</span>';
      out.appendChild(sp);
      out.appendChild(document.createTextNode('\n'));
      body.scrollTop = body.scrollHeight;
    }

    function pad(s, n) { s = String(s); while (s.length < n) s += ' '; return s; }
    function rnd(min, max) { return Math.floor(Math.random() * (max - min)) + min; }

    function cmdHelp() {
      line('Available commands:', 'info');
      line('  /help          - show this', 'cmd');
      line('  /scan          - run perimeter scan', 'cmd');
      line('  /status        - cluster status', 'cmd');
      line('  /nodes         - list nodes', 'cmd');
      line('  /decrypt       - crypto audit', 'cmd');
      line('  /trace <ip>    - trace threat', 'cmd');
      line('  /clear         - clear', 'cmd');
      line('  /whoami        - identify', 'cmd');
      line('  /coffee        - brew', 'cmd');
    }

    function cmdScan() {
      line('> initiating deep perimeter scan...', 'info');
      line('> probing 247 distributed nodes...', 'info');
      var n = rnd(3, 9);
      for (var i = 0; i < n; i++) {
        var ip = '10.' + rnd(0, 255) + '.' + rnd(0, 255) + '.' + rnd(1, 254);
        line('  OK ' + ip + ' - clean', 'success');
      }
      line('> scan complete. 0 threats. ' + n + ' nodes verified.', 'success');
    }

    function cmdStatus() {
      line('cluster status: OPERATIONAL', 'success');
      line('  uptime:       247d 11h 03m', 'info');
      line('  active nodes: 6 / 6', 'info');
      line('  latency:      0.4ms', 'info');
      line('  throughput:   12.4 GB/s', 'info');
      line('  encryption:   AES-256-GCM / active', 'info');
      line('  perimeter:    INTEGRITY 100%', 'success');
    }

    function cmdNodes() {
      line('> registered nodes:', 'info');
      nodes.forEach(function (n) {
        var ok = n.status === 'operational';
        line('  ' + (ok ? 'OK ' : '!  ') +
             pad(n.id, 16) + pad(n.region, 14) + pad(n.status, 14) +
             'load ' + n.load + '%', ok ? 'success' : 'error');
      });
    }

    function cmdDecrypt() {
      line('> initializing cryptographic audit...', 'info');
      line('  OK AES-256-GCM keys verified', 'success');
      line('  OK ChaCha20-Poly1305 handshake', 'success');
      line('  OK Ed25519 signatures valid', 'success');
      line('  entropy pool: 4096 bits, healthy', 'info');
      line('> audit passed. no anomalies detected.', 'success');
    }

    function cmdWhoami() {
      line('operator:  sovereign_entity_0x8FBC9B0', 'success');
      line('clearance: TIER-1 (absolute)', 'info');
      line('session:   encrypted / ephemeral', 'info');
    }

    function cmdCoffee() {
      line('> brewing...', 'info');
      line('  ###....... 30%', 'info');
      line('  ######.... 60%', 'info');
      line('  ########## 100%', 'info');
      line('  here you go, operator. stay sharp.', 'success');
    }

    function cmdTrace(ip) {
      ip = ip || '0.0.0.0';
      line('> tracing threat vector ' + ip + '...', 'info');
      line('  hop 1: gateway      12ms', 'info');
      line('  hop 2: edge-router  24ms', 'info');
      line('  hop 3: mesh-relay   41ms', 'info');
      line('  -> target located in eu-central.', 'success');
      line('  -> no active threat detected.', 'success');
    }

    function run(raw) {
      var cmd = raw.trim();
      if (!cmd) return;

      prompt(cmd);

      var c = cmd.toLowerCase();

      if (c === '/help')    { cmdHelp();    return; }
      if (c === '/scan')    { cmdScan();    return; }
      if (c === '/status')  { cmdStatus();  return; }
      if (c === '/nodes')   { cmdNodes();   return; }
      if (c === '/decrypt') { cmdDecrypt(); return; }
      if (c === '/whoami')  { cmdWhoami();  return; }
      if (c === '/coffee')  { cmdCoffee();  return; }
      if (c === '/clear')   { out.innerHTML = ''; return; }

      if (c.indexOf('/trace') === 0) {
        cmdTrace(cmd.split(/\s+/)[1]);
        return;
      }

      line('command not found: ' + cmd, 'error');
      line('type /help to see available commands.', 'info');
    }

    body.addEventListener('click', function () { input.focus(); });

    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        var v = input.value;
        input.value = '';
        run(v);
      }
    });

    $$('.term-hint code').forEach(function (code) {
      code.addEventListener('click', function () {
        input.value = code.textContent;
        input.focus();
      });
    });

    var boot = [
      ['success', 'aetheris runtime v7.0.0 initialized'],
      ['success', 'secure enclave handshake complete'],
      ['info',    'welcome, operator.'],
      ['info',    'type /help to see available commands.'],
      [null,      null]
    ];

    var k = 0;
    function bootStep() {
      if (k >= boot.length) return;
      var b = boot[k];
      k++;
      if (b[1] !== null) line(b[1], b[0]);
      else out.appendChild(document.createTextNode('\n'));
      setTimeout(bootStep, 180);
    }
    setTimeout(bootStep, 400);
  }


  /* =========================================================
     10. FLOATIES (scântei DOM)
     ========================================================= */
  function initFloaties() {
    if (reduced) return;
    var container = $('#floaties');
    if (!container) return;

    var count = 25;

    for (var i = 0; i < count; i++) {
      var s = document.createElement('div');
      s.className = 'floaty';
      s.style.left = Math.random() * 100 + '%';
      s.style.animationDelay = (Math.random() * 12) + 's';
      s.style.animationDuration = (8 + Math.random() * 8) + 's';
      var size = 1 + Math.random() * 3;
      s.style.width = size + 'px';
      s.style.height = size + 'px';

      if (Math.random() > 0.85) {
        s.style.background = '#5ac8fa';
        s.style.boxShadow = '0 0 10px 2px rgba(90, 200, 250, 0.8)';
      } else if (Math.random() > 0.9) {
        s.style.background = '#ffffff';
        s.style.boxShadow = '0 0 10px 2px rgba(255, 255, 255, 0.8)';
      }

      container.appendChild(s);
    }
  }


  /* =========================================================
     11. PARALLAX DEVICES
     ========================================================= */
  function initParallaxDevices() {
    if (reduced) return;
    if (window.matchMedia('(hover: none)').matches) return;

    var iphone = $('.hero-iphone, .hero-stage .iphone');
    var macbook = $('.hero-stage .macbook');
    if (!iphone && !macbook) return;

    var ticking = false;

    window.addEventListener('mousemove', function (e) {
      if (!ticking) {
        requestAnimationFrame(function () {
          var cx = window.innerWidth / 2;
          var cy = window.innerHeight / 2;
          var dx = (e.clientX - cx) / cx;
          var dy = (e.clientY - cy) / cy;

          if (iphone) {
            iphone.style.transform =
              'translate3d(' + (dx * 12) + 'px,' + (dy * 8) + 'px,0)';
          }
          if (macbook) {
            macbook.style.transform =
              'translate3d(' + (dx * 18) + 'px,' + (dy * 10) + 'px,0)';
          }
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }


  /* =========================================================
     BOOT
     ========================================================= */
  function boot() {
    initRain();
    initParticles();
    initConstellation();
    initType();
    initTilt();
    initSpotlight();
    initCardGlow();
    initReveal();
    initStats();
    initTerm();
    initFloaties();
    initParallaxDevices();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();