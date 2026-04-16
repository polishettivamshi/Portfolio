// ============================================================
// PAGE LOADING SCREEN - runs immediately before DOM ready
// ============================================================
(function () {
    const loaderHTML = `
    <div id="page-loader">
      <div class="loader-inner">
        <div class="loader-logo">VP</div>
        <div class="loader-name">Vamshi Polishetti</div>
        <div class="loader-bar-wrap"><div class="loader-bar"></div></div>
        <div class="loader-tagline">Python Developer</div>
      </div>
    </div>`;
    document.write(loaderHTML);

    const loaderStyle = document.createElement('style');
    loaderStyle.textContent = `
        #page-loader {
            position: fixed; inset: 0;
            background: #0a0a0a;
            display: flex; align-items: center; justify-content: center;
            z-index: 99999;
            transition: opacity 0.6s ease, visibility 0.6s ease;
        }
        #page-loader.hide { opacity: 0; visibility: hidden; }
        .loader-inner { text-align: center; }
        .loader-logo {
            font-size: 3.5rem; font-weight: 800;
            color: #00D1D1; letter-spacing: 4px;
            animation: pulse-logo 1s ease-in-out infinite alternate;
        }
        @keyframes pulse-logo {
            from { text-shadow: 0 0 10px rgba(0,209,209,0.4); }
            to   { text-shadow: 0 0 30px rgba(0,209,209,0.9), 0 0 60px rgba(0,209,209,0.4); }
        }
        .loader-name {
            color: #fff; font-size: 1.1rem; letter-spacing: 3px;
            margin: 10px 0 24px; opacity: 0.7;
            font-family: 'Poppins', sans-serif;
        }
        .loader-bar-wrap {
            width: 200px; height: 3px;
            background: rgba(255,255,255,0.1);
            border-radius: 10px; margin: 0 auto 16px; overflow: hidden;
        }
        .loader-bar {
            height: 100%; width: 0%;
            background: linear-gradient(90deg, #00D1D1, #00ffff);
            border-radius: 10px;
            animation: fill-bar 1.8s ease forwards;
        }
        @keyframes fill-bar { to { width: 100%; } }
        .loader-tagline {
            color: #00D1D1; font-size: 0.8rem;
            letter-spacing: 5px; text-transform: uppercase; opacity: 0.6;
        }
    `;
    document.head.appendChild(loaderStyle);
})();


    (function() {
        const hideLoader = () => {
            const loader = document.getElementById('page-loader');
            if (loader && !loader.classList.contains('hide')) {
                loader.classList.add('hide');
                setTimeout(() => loader.remove(), 700);
            }
        };

        // Force dismiss after 2 seconds regardless of page state
        setTimeout(hideLoader, 2000);

        // Also dismiss as soon as the window finishes loading (if it happens before 2s)
        window.addEventListener('load', hideLoader);
    })();


    // ============================================================
    // CUSTOM CURSOR
    // ============================================================
    const cursorDot = document.createElement('div');
    cursorDot.id = 'cursor-dot';
    const cursorRing = document.createElement('div');
    cursorRing.id = 'cursor-ring';
    document.body.appendChild(cursorDot);
    document.body.appendChild(cursorRing);

    const cursorStyle = document.createElement('style');
    cursorStyle.textContent = `
        * { cursor: none !important; }
        #cursor-dot {
            position: fixed; top: 0; left: 0;
            width: 8px; height: 8px; border-radius: 50%;
            background: #00D1D1; pointer-events: none; z-index: 99998;
            transform: translate(-50%, -50%);
            transition: width 0.2s, height 0.2s, background 0.2s;
            box-shadow: 0 0 8px rgba(0,209,209,0.8);
        }
        #cursor-ring {
            position: fixed; top: 0; left: 0;
            width: 36px; height: 36px; border-radius: 50%;
            border: 2px solid rgba(0,209,209,0.5);
            pointer-events: none; z-index: 99997;
            transform: translate(-50%, -50%);
            transition: width 0.3s, height 0.3s, border-color 0.3s;
        }
        body.cursor-hover #cursor-dot {
            width: 12px; height: 12px; background: #fff;
            box-shadow: 0 0 14px rgba(0,209,209,1);
        }
        body.cursor-hover #cursor-ring {
            width: 52px; height: 52px;
            border-color: rgba(0,209,209,0.8);
        }
        @media (hover: none) {
            #cursor-dot, #cursor-ring { display: none !important; }
            * { cursor: auto !important; }
        }
    `;
    document.head.appendChild(cursorStyle);

    let ringX = 0, ringY = 0, dotX = 0, dotY = 0;
    document.addEventListener('mousemove', e => {
        dotX = e.clientX; dotY = e.clientY;
        cursorDot.style.left = dotX + 'px';
        cursorDot.style.top = dotY + 'px';
    });
    (function animateRing() {
        ringX += (dotX - ringX) * 0.12;
        ringY += (dotY - ringY) * 0.12;
        cursorRing.style.left = ringX + 'px';
        cursorRing.style.top = ringY + 'px';
        requestAnimationFrame(animateRing);
    })();

    document.querySelectorAll('a, button, .cta-button, .project-card, .social-link, input, textarea').forEach(el => {
        el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });


    // ============================================================
    // GITHUB STATS EMBED
    // ============================================================
    const githubUsername = 'polishettivamshi';
    const statsContainer = document.createElement('div');
    statsContainer.className = 'github-stats-wrapper';
    statsContainer.innerHTML = `
        <div class="github-stats-title"><i class="fab fa-github"></i> GitHub Activity</div>
        <div class="github-stats-cards">
            <img src="https://github-readme-stats.vercel.app/api?username=${githubUsername}&show_icons=true&theme=react&bg_color=0d1117&title_color=00D1D1&icon_color=00D1D1&text_color=ffffff&border_color=00D1D1&count_private=true"
                 alt="GitHub Stats" class="github-stat-img" onerror="this.parentElement.parentElement.style.display='none'">
            <img src="https://github-readme-streak-stats.herokuapp.com?user=${githubUsername}&theme=dark&ring=00D1D1&fire=00D1D1&currStreakLabel=00D1D1&background=0d1117&border=00D1D1"
                 alt="GitHub Streak" class="github-stat-img" onerror="this.style.display='none'">
        </div>
    `;

    const githubStyle = document.createElement('style');
    githubStyle.textContent = `
        .github-stats-wrapper {
            margin-top: 32px; padding: 20px;
            background: rgba(0,209,209,0.05);
            border: 1px solid rgba(0,209,209,0.2);
            border-radius: 12px;
        }
        .github-stats-title {
            color: #00D1D1; font-size: 1rem;
            font-weight: 600; margin-bottom: 16px; letter-spacing: 1px;
        }
        .github-stats-title i { margin-right: 8px; }
        .github-stats-cards { display: flex; gap: 16px; flex-wrap: wrap; }
        .github-stat-img {
            border-radius: 8px; max-width: 100%; flex: 1; min-width: 260px;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .github-stat-img:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 25px rgba(0,209,209,0.25);
        }
    `;
    document.head.appendChild(githubStyle);

    const aboutRight = document.querySelector('.about-content .column.right');
    if (aboutRight) aboutRight.appendChild(statsContainer);


    // ============================================================
    // COPY EMAIL BUTTON
    // ============================================================
    document.querySelectorAll('.info-item').forEach(item => {
        const heading = item.querySelector('h4');
        if (heading && heading.textContent.trim() === 'Email') {
            const infoContent = item.querySelector('.info-content');
            if (infoContent) {
                const copyBtn = document.createElement('button');
                copyBtn.className = 'copy-email-btn';
                copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy';
                copyBtn.title = 'Copy email address';
                infoContent.appendChild(copyBtn);
                copyBtn.addEventListener('click', () => {
                    navigator.clipboard.writeText('polishettivamshi123@gmail.com').then(() => {
                        copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                        copyBtn.classList.add('copied');
                        setTimeout(() => {
                            copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy';
                            copyBtn.classList.remove('copied');
                        }, 2000);
                    });
                });
            }
        }
    });

    const copyStyle = document.createElement('style');
    copyStyle.textContent = `
        .copy-email-btn {
            display: inline-flex; align-items: center; gap: 5px;
            background: transparent;
            border: 1px solid rgba(0,209,209,0.4);
            color: #00D1D1; border-radius: 6px;
            padding: 3px 10px; font-size: 0.75rem;
            cursor: none; margin-top: 6px;
            transition: all 0.2s ease;
        }
        .copy-email-btn:hover { background: rgba(0,209,209,0.15); border-color: #00D1D1; }
        .copy-email-btn.copied { background: rgba(0,209,209,0.2); color: #00ffaa; border-color: #00ffaa; }
    `;
    document.head.appendChild(copyStyle);


    // ============================================================
    // OPEN TO WORK BADGE
    // ============================================================
    const homeContent = document.querySelector('.home-content');
    if (homeContent) {
        const badge = document.createElement('div');
        badge.className = 'open-to-work-badge';
        badge.innerHTML = '<span class="otw-dot"></span> Open to Work';
        homeContent.insertBefore(badge, homeContent.firstChild);
    }

    const badgeStyle = document.createElement('style');
    badgeStyle.textContent = `
        .open-to-work-badge {
            display: inline-flex; align-items: center; gap: 8px;
            background: rgba(0,209,209,0.1);
            border: 1px solid rgba(0,209,209,0.4);
            color: #00D1D1; border-radius: 20px;
            padding: 5px 14px; font-size: 0.82rem;
            font-weight: 600; letter-spacing: 1px;
            margin-bottom: 16px;
            animation: badge-float 3s ease-in-out infinite;
        }
        .otw-dot {
            width: 8px; height: 8px; border-radius: 50%;
            background: #00D1D1; flex-shrink: 0;
            animation: otw-pulse 1.4s ease-in-out infinite;
        }
        @keyframes otw-pulse {
            0%,100% { box-shadow: 0 0 0 0 rgba(0,209,209,0.7); }
            50% { box-shadow: 0 0 0 6px rgba(0,209,209,0); }
        }
        @keyframes badge-float {
            0%,100% { transform: translateY(0); }
            50% { transform: translateY(-4px); }
        }
    `;
    document.head.appendChild(badgeStyle);


    // ============================================================
    // PARTICLE NETWORK CANVAS
    // ============================================================
    (function () {
        const canvas = document.createElement('canvas');
        canvas.id = 'particle-canvas';
        canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;';
        document.body.insertBefore(canvas, document.body.firstChild);
        const ctx = canvas.getContext('2d');
        let W = canvas.width = window.innerWidth;
        let H = canvas.height = window.innerHeight;
        const C = '0, 209, 209';
        let mouse = { x: -9999, y: -9999 };
        window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
        window.addEventListener('resize', () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; });

        class Particle {
            constructor() { this.reset(true); }
            reset(init = false) {
                this.x = Math.random() * W;
                this.y = init ? Math.random() * H : (Math.random() > 0.5 ? -10 : H + 10);
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = (Math.random() - 0.5) * 0.5;
                this.r = Math.random() * 1.8 + 0.8;
                this.opacity = Math.random() * 0.5 + 0.3;
            }
            update() {
                this.x += this.vx; this.y += this.vy;
                if (this.x < -20 || this.x > W + 20 || this.y < -20 || this.y > H + 20) this.reset();
            }
            draw() {
                ctx.beginPath(); ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${C},${this.opacity})`; ctx.fill();
            }
        }

        const particles = Array.from({ length: 55 }, () => new Particle());
        const d = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

        function animate() {
            ctx.clearRect(0, 0, W, H);
            particles.forEach(p => { p.update(); p.draw(); });
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dist = d(particles[i], particles[j]);
                    if (dist < 140) {
                        ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(${C},${(1 - dist / 140) * 0.35})`; ctx.lineWidth = 0.7; ctx.stroke();
                    }
                }
            }
            particles.forEach(p => {
                const dist = d(p, mouse);
                if (dist < 180) {
                    ctx.beginPath(); ctx.moveTo(mouse.x, mouse.y); ctx.lineTo(p.x, p.y);
                    ctx.strokeStyle = `rgba(${C},${(1 - dist / 180) * 0.7})`; ctx.lineWidth = 1.2; ctx.stroke();
                }
            });
            if (mouse.x > 0) {
                const g = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 18);
                g.addColorStop(0, `rgba(${C},0.35)`); g.addColorStop(1, `rgba(${C},0)`);
                ctx.beginPath(); ctx.arc(mouse.x, mouse.y, 18, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
            }
            requestAnimationFrame(animate);
        }
        animate();
    })();


    // ============================================================
    // STICKY NAVBAR
    // ============================================================
    $(document).ready(function() {
        $(window).scroll(function () {
            $('.navbar').toggleClass("sticky", this.scrollY > 20);
            $('.scroll-up-btn').toggleClass("show", this.scrollY > 500);
        });
        $('.scroll-up-btn').click(() => $('html, body').animate({ scrollTop: 0 }));
        $('.menu-btn').click(function () {
            $('.navbar .menu').toggleClass("active");
            $('.menu-btn i').toggleClass("active");
        });
        $('.menu a').click(function (e) {
            e.preventDefault();
            $('html, body').animate({ scrollTop: $($(this).attr('href')).offset().top - 70 }, 300);
            $('.navbar .menu').removeClass("active");
            $('.menu-btn i').removeClass("active");
        });
    });


    // ============================================================
    // TYPING ANIMATION
    // ============================================================
    function createTypingAnimation(selector, strings, options = {}) {
        const el = document.querySelector(selector);
        if (!el) return;
        const cfg = { typeSpeed: 60, deleteSpeed: 40, delayBetweenWords: 1500, ...options };
        let si = 0, ci = 0, isDeleting = false, isWaiting = false;
        function type() {
            const str = strings[si];
            el.textContent = isDeleting ? str.substring(0, ci - 1) : str.substring(0, ci + 1);
            isDeleting ? ci-- : ci++;
            if (!isDeleting && ci === str.length) {
                isWaiting = true;
                return setTimeout(() => { isWaiting = false; isDeleting = true; type(); }, cfg.delayBetweenWords);
            }
            if (isDeleting && ci === 0) { isDeleting = false; si = (si + 1) % strings.length; }
            if (!isWaiting) setTimeout(type, isDeleting ? cfg.deleteSpeed : cfg.typeSpeed);
        }
        setTimeout(type, 1000);
    }

    const jobTitles = ["Python Developer", "Python AWS Developer", "Python Software Engineer", "Backend Developer", "Python API Developer", "Application Developer"];

    // Add a small delay to ensure the DOM elements are fully painted
    setTimeout(() => {
        if (document.querySelector('.typing')) {
            createTypingAnimation('.typing', jobTitles, { typeSpeed: 70, deleteSpeed: 50, delayBetweenWords: 1800 });
        }
        if (document.querySelector('.typing-2')) {
            createTypingAnimation('.typing-2', jobTitles, { typeSpeed: 65, deleteSpeed: 45, delayBetweenWords: 2000 });
        }
    }, 500);

    const typingStyle = document.createElement('style');
    typingStyle.textContent = `
        .typing, .typing-2 { display: inline-block; min-height: 1.2em; }
        .typing::after, .typing-2::after { content:'|'; color:#00D1D1; animation:blink .7s step-end infinite; margin-left:2px; }
        @keyframes blink { 0%,100%{opacity:1;} 50%{opacity:0;} }
    `;
    document.head.appendChild(typingStyle);


    // ============================================================
    // SCROLL REVEAL
    // ============================================================
    const revealStyle = document.createElement('style');
    revealStyle.textContent = `
        .reveal{opacity:0;transform:translateY(40px);transition:opacity .7s cubic-bezier(.22,1,.36,1),transform .7s cubic-bezier(.22,1,.36,1);}
        .reveal.visible{opacity:1;transform:translateY(0);}
        .reveal-left{opacity:0;transform:translateX(-50px);transition:opacity .7s cubic-bezier(.22,1,.36,1),transform .7s cubic-bezier(.22,1,.36,1);}
        .reveal-left.visible{opacity:1;transform:translateX(0);}
        .reveal-right{opacity:0;transform:translateX(50px);transition:opacity .7s cubic-bezier(.22,1,.36,1),transform .7s cubic-bezier(.22,1,.36,1);}
        .reveal-right.visible{opacity:1;transform:translateX(0);}
    `;
    document.head.appendChild(revealStyle);

    document.querySelectorAll('.job-item').forEach((el, i) => { el.classList.add('reveal'); el.style.transitionDelay = `${i * 0.1}s`; });
    document.querySelectorAll('.skill-category,.certificate-item,.education-item,.project-card').forEach((el, i) => { el.classList.add('reveal'); el.style.transitionDelay = `${(i % 3) * 0.12}s`; });
    document.querySelectorAll('.about-content .column.left,.contact-content .column.left').forEach(el => el.classList.add('reveal-left'));
    document.querySelectorAll('.about-content .column.right,.contact-content .column.right').forEach(el => el.classList.add('reveal-right'));

    const revObs = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }), { threshold: 0.12 });
    document.querySelectorAll('.reveal,.reveal-left,.reveal-right').forEach(el => revObs.observe(el));


    // ============================================================
    // SKILL BAR ANIMATION
    // ============================================================
    const skillBars = document.querySelectorAll('.bar span');
    if (skillBars.length > 0) {
        const barObs = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    const bar = e.target, w = bar.getAttribute('data-width');
                    bar.style.width = '0%';
                    setTimeout(() => { bar.style.width = w; }, 100);
                    barObs.unobserve(bar);
                }
            });
        }, { threshold: 0.4 });
        skillBars.forEach(bar => { bar.setAttribute('data-width', bar.style.width); bar.style.width = '0%'; barObs.observe(bar); });
    }


    // ============================================================
    // PROJECT CARD TILT
    // ============================================================
    const tiltStyle = document.createElement('style');
    tiltStyle.textContent = `
        .project-card{transition:transform .15s ease,box-shadow .15s ease !important;transform-style:preserve-3d;will-change:transform;}
        .project-card:hover{box-shadow:0 20px 50px rgba(0,209,209,.18) !important;}
    `;
    document.head.appendChild(tiltStyle);
    document.querySelectorAll('.project-card').forEach(card => {
        card.addEventListener('mousemove', e => {
            const r = card.getBoundingClientRect();
            card.style.transform = `perspective(600px) rotateX(${((e.clientY - r.top - r.height / 2) / (r.height / 2)) * -6}deg) rotateY(${((e.clientX - r.left - r.width / 2) / (r.width / 2)) * 6}deg) translateY(-6px)`;
        });
        card.addEventListener('mouseleave', () => { card.style.transform = 'perspective(600px) rotateX(0) rotateY(0) translateY(0)'; });
    });


    // ============================================================
    // ACTIVE NAV HIGHLIGHT
    // ============================================================
    const navStyle = document.createElement('style');
    navStyle.textContent = `.menu a.active-nav{color:#00D1D1 !important;border-bottom:2px solid #00D1D1;}`;
    document.head.appendChild(navStyle);
    const navObs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                document.querySelectorAll('.menu a').forEach(l => l.classList.remove('active-nav'));
                const lnk = document.querySelector(`.menu a[href="#${e.target.id}"]`);
                if (lnk) lnk.classList.add('active-nav');
            }
        });
    }, { threshold: 0.35 });
    document.querySelectorAll('section[id]').forEach(s => navObs.observe(s));


    // ============================================================
    // BUTTON RIPPLE
    // ============================================================
    const rippleStyle = document.createElement('style');
    rippleStyle.textContent = `
        .cta-button,.compose-btn{position:relative;overflow:hidden;}
        .ripple-effect{position:absolute;border-radius:50%;background:rgba(255,255,255,.3);transform:scale(0);animation:ripple-anim .55s linear;pointer-events:none;}
        @keyframes ripple-anim{to{transform:scale(4);opacity:0;}}
    `;
    document.head.appendChild(rippleStyle);
    document.querySelectorAll('.cta-button,.compose-btn').forEach(btn => {
        btn.addEventListener('click', function (e) {
            const rpl = document.createElement('span');
            rpl.className = 'ripple-effect';
            const rect = this.getBoundingClientRect(), size = Math.max(rect.width, rect.height);
            rpl.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - rect.left - size / 2}px;top:${e.clientY - rect.top - size / 2}px`;
            this.appendChild(rpl);
            setTimeout(() => rpl.remove(), 600);
        });
    });


    // ============================================================
    // MISC
    // ============================================================
    $('.back-to-top').click(e => { e.preventDefault(); $('html, body').animate({ scrollTop: 0 }); });
    $(document).click(e => {
        if (!$(e.target).closest('.navbar').length) {
            $('.navbar .menu').removeClass("active");
            $('.menu-btn i').removeClass("active");
        }
    });


// ============================================================
// CONTACT FORM
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contact-form');
    const statusDiv = document.getElementById('form-status');
    if (!form) return;

    const updateStatus = (message, isSuccess = true) => {
        clearTimeout(statusDiv.timer);
        statusDiv.classList.remove('error');
        statusDiv.style.display = 'block';
        statusDiv.innerHTML = isSuccess
            ? `<i class="fas fa-check-circle"></i> ${message}`
            : `<i class="fas fa-times-circle"></i> ${message}`;
        if (!isSuccess) statusDiv.classList.add('error');
        statusDiv.timer = setTimeout(() => { statusDiv.style.display = 'none'; }, 5000);
    };

    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        if (!form.reportValidity()) return;
        const formData = new FormData(form);
        statusDiv.style.display = 'block';
        statusDiv.classList.remove('error');
        statusDiv.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        clearTimeout(statusDiv.timer);
        try {
            const res = await fetch(form.getAttribute('action'), { method: 'POST', body: formData });
            const result = await res.json();
            if (res.ok && result.success) { updateStatus('Message Sent Successfully!', true); form.reset(); }
            else updateStatus(result.message || 'Could not send message.', false);
        } catch (err) {
            console.error(err);
            updateStatus('Network Error. Please try again.', false);
        }
    });
});

// ============================================================
// VIEW COUNTER WITH PERSISTENCE
// ============================================================
$(document).ready(function() {
    const namespace = 'vamshi-portfolio';
    const counterKey = 'views';
    const localStorageKey = 'portfolio_view_count';
    const viewCountElement = document.getElementById('view-count');

    if (!viewCountElement) return;

    // Function to format numbers with commas
    function formatNumber(num) {
        return num.toLocaleString();
    }

    // Function to get count from localStorage
    function getLocalCount() {
        return parseInt(localStorage.getItem(localStorageKey)) || 0;
    }

    // Function to save count to localStorage
    function saveLocalCount(count) {
        localStorage.setItem(localStorageKey, count.toString());
    }

    // Function to update display
    function updateDisplay(count, source = 'unknown') {
        viewCountElement.textContent = formatNumber(count);
        console.log(`View counter updated: ${count} (source: ${source})`);
    }

    // Function to increment local counter
    function incrementLocalCounter() {
        const currentCount = getLocalCount();
        const newCount = currentCount + 1;
        saveLocalCount(newCount);
        updateDisplay(newCount, 'localStorage');
        return newCount;
    }

    // Function to try CountAPI
    function tryCountAPI() {
        return fetch(`https://api.countapi.xyz/hit/${namespace}/${counterKey}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Portfolio-View-Counter/1.0'
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data && typeof data.value === 'number') {
                // Sync with localStorage for backup
                saveLocalCount(data.value);
                updateDisplay(data.value, 'CountAPI');
                return data.value;
            } else {
                throw new Error('Invalid API response');
            }
        });
    }

    // Main counter logic with fallbacks
    function initializeCounter() {
        viewCountElement.textContent = 'Loading...';

        // First, try to get from CountAPI
        tryCountAPI()
            .then(apiCount => {
                // Successfully got count from API
                console.log('CountAPI working, using API count:', apiCount);
            })
            .catch(apiError => {
                console.warn('CountAPI failed:', apiError.message);
                // Fallback to localStorage
                const localCount = getLocalCount();
                if (localCount > 0) {
                    // We have a local count, use it and try to sync later
                    updateDisplay(localCount, 'localStorage (API failed)');
                    // Try to sync with API in background (don't wait for it)
                    tryCountAPI().catch(() => {
                        // If API still fails, just increment locally
                        incrementLocalCounter();
                    });
                } else {
                    // No local count, start fresh locally
                    incrementLocalCounter();
                }
            });
    }

    // Initialize counter when page loads
    initializeCounter();

    // Optional: Update counter on visibility change (when user returns to tab)
    // This prevents counting multiple times for the same session
    let hasIncremented = false;
    document.addEventListener('visibilitychange', function() {
        if (!document.hidden && !hasIncremented) {
            hasIncremented = true;
            // Only increment if it's been more than 30 minutes since last increment
            const lastIncrement = localStorage.getItem('last_increment_time');
            const now = Date.now();
            if (!lastIncrement || (now - parseInt(lastIncrement)) > 30 * 60 * 1000) {
                incrementLocalCounter();
                localStorage.setItem('last_increment_time', now.toString());
            }
        }
    });
});

// ============================================================
// DARK MODE TOGGLE
// ============================================================
$(document).ready(function() {
    const themeToggle = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;
    const body = document.body;
    const themeKey = 'portfolio-theme';

    // Load saved theme preference
    function loadTheme() {
        const savedTheme = localStorage.getItem(themeKey) || 'light';
        applyTheme(savedTheme);
    }

    // Apply theme
    function applyTheme(theme) {
        if (theme === 'dark') {
            body.classList.add('dark-mode');
            htmlElement.setAttribute('data-theme', 'dark');
            if (themeToggle) {
                themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
                themeToggle.title = 'Switch to Light Mode';
            }
        } else {
            body.classList.remove('dark-mode');
            htmlElement.setAttribute('data-theme', 'light');
            if (themeToggle) {
                themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
                themeToggle.title = 'Switch to Dark Mode';
            }
        }
        localStorage.setItem(themeKey, theme);
    }

    // Toggle theme
    function toggleTheme() {
        const currentTheme = localStorage.getItem(themeKey) || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        applyTheme(newTheme);
    }

    // Handle theme toggle button click
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    // Check system preference if no saved preference
    if (!localStorage.getItem(themeKey)) {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        applyTheme(prefersDark ? 'dark' : 'light');
    } else {
        loadTheme();
    }

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (!localStorage.getItem(themeKey)) {
            applyTheme(e.matches ? 'dark' : 'light');
        }
    });
});