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

    function initProjectInteractions() {
        document.querySelectorAll('a, button, .cta-button, .project-card, .social-link, input, textarea').forEach(el => {
            el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
            el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
        });

        document.querySelectorAll('.project-image-link').forEach(link => {
            const img = link.querySelector('.project-image');
            const imgSrc = link.dataset.img || (img && img.dataset.src);
            const liveUrl = link.dataset.liveUrl && link.dataset.liveUrl.trim();

            if (!imgSrc || !img) {
                const wrapper = link.closest('.project-image-wrapper');
                if (wrapper) wrapper.remove();
                return;
            }

            const loader = new Image();
            loader.onload = () => {
                img.src = imgSrc;
                if (!liveUrl) {
                    link.classList.add('no-live');
                    link.removeAttribute('target');
                    link.removeAttribute('rel');
                }
            };
            loader.onerror = () => {
                console.error(`Failed to load project image: ${imgSrc}`);
                // Optional: set a fallback placeholder image instead of removing the wrapper
                // img.src = 'images/fallback-placeholder.png';
            };
            loader.src = imgSrc;

            if (liveUrl) {
                link.href = liveUrl;
                link.dataset.liveUrl = liveUrl;
                link.setAttribute('target', '_blank');
                link.setAttribute('rel', 'noopener noreferrer');
                const altText = img.alt || img.title || 'Project';
                link.setAttribute('aria-label', `${altText} live preview`);
                link.classList.remove('no-live');
            } else {
                link.addEventListener('click', event => {
                    event.preventDefault();
                    alert('No data found');
                });
            }
        });
    }

    window.addEventListener('load', initProjectInteractions);


    // ============================================================
    // GITHUB STATS EMBED — detailed & side-by-side with .stats
    // ============================================================
    const githubUsername = 'polishettivamshi';

    // — wrap existing .stats + new github wrapper in a side-by-side container —
    const aboutRight = document.querySelector('.about-content .column.right');
    const existingStats = aboutRight ? aboutRight.querySelector('.stats') : null;

    // Create the side-by-side row container
    const bottomRow = document.createElement('div');
    bottomRow.className = 'about-bottom-row';

    // Leave .stats where it is, but move it into bottomRow
    if (existingStats && aboutRight) {
        // Move .stats into bottomRow
        bottomRow.appendChild(existingStats.cloneNode(true));
        existingStats.replaceWith(bottomRow); // replace original .stats with the row (stats is first child)
        // Re-query: bottomRow now holds the cloned stats, update reference
        const newStats = bottomRow.querySelector('.stats');
        // Remove the old .stats reference and keep newStats in bottomRow
    } else if (aboutRight) {
        aboutRight.appendChild(bottomRow);
    }

    const statsContainer = document.createElement('div');
    statsContainer.className = 'github-stats-wrapper';
    statsContainer.innerHTML = `
        <div class="github-stats-title"><i class="fab fa-github"></i> GitHub Activity</div>
        <div class="github-stats-cards">
            <img src="https://github-readme-stats.vercel.app/api?username=${githubUsername}&show_icons=true&theme=react&bg_color=0d1117&title_color=00D1D1&icon_color=00D1D1&text_color=ffffff&border_color=00D1D1&count_private=true"
                 alt="GitHub Stats" class="github-stat-img" onerror="this.parentElement.parentElement.style.display='none'">
            <img src="https://github-readme-streak-stats.herokuapp.com?user=${githubUsername}&theme=dark&ring=00D1D1&fire=00D1D1&currStreakLabel=00D1D1&background=0d1117&border=00D1D1"
                 alt="GitHub Streak" class="github-stat-img" onerror="this.style.display='none'">
            <img src="https://github-readme-stats.vercel.app/api/top-langs/?username=${githubUsername}&langs_count=8&layout=compact&theme=react&bg_color=0d1117&title_color=00D1D1&text_color=ffffff&border_color=00D1D1&hide=html,css"
                 alt="Top Languages" class="github-stat-img" loading="lazy" onerror="this.style.display='none'">
            <div class="github-extra-details">
                <div class="github-detail-item">
                    <i class="fab fa-github"></i>
                    <span><strong>${githubUsername}</strong></span>
                    <span class="github-extra-sub">2.5+ years · Backend · Open Source</span>
                </div>
                <div class="github-detail-item">
                    <i class="fas fa-code-branch"></i>
                    <span><strong>35+ Repositories</strong></span>
                    <span class="github-extra-sub">Python · FastAPI · Flask · React</span>
                </div>
                <div class="github-detail-item">
                    <i class="fas fa-star"></i>
                    <span><strong>Active Contributions</strong></span>
                    <span class="github-extra-sub">JIRA · Commits · PRs · Code Reviews</span>
                </div>
                <a href="https://github.com/${githubUsername}" target="_blank" rel="noopener noreferrer" class="github-view-btn">
                    <i class="fab fa-github"></i> View Full Profile
                </a>
            </div>
        </div>
    `;
    // Append github wrapper as second child of bottomRow
    if (bottomRow.parentNode) {
        bottomRow.appendChild(statsContainer);
    }

    const githubStyle = document.createElement('style');
    githubStyle.textContent = `
        .about-bottom-row {
            display: flex;
            gap: 24px;
            margin-top: 32px;
            align-items: stretch;
            flex-wrap: wrap;
        }
        .about-bottom-row > .stats {
            flex: 1;
            min-width: 280px;
            margin-top: 0;
        }
        .github-stats-wrapper {
            flex: 1;
            min-width: 320px;
            padding: 20px;
            background: rgba(0,209,209,0.05);
            backdrop-filter: blur(4px);
            border: 1px solid rgba(0,209,209,0.2);
            border-radius: 12px;
            transition: all 0.3s ease;
        }
        .github-stats-wrapper:hover {
            border-color: rgba(0,209,209,0.5);
            box-shadow: 0 8px 30px rgba(0,209,209,0.12);
        }
        .github-stats-title {
            color: #00D1D1; font-size: 1.05rem;
            font-weight: 700; margin-bottom: 14px; letter-spacing: 0.5px;
            display: flex; align-items: center; gap: 8px;
        }
        .github-stats-title i { font-size: 1.2rem; }
        .github-stats-cards { display: flex; flex-direction: column; gap: 12px; }
        .github-stat-img {
            border-radius: 8px; max-width: 100%; width: 100%;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .github-stat-img:hover {
            transform: translateY(-3px);
            box-shadow: 0 6px 20px rgba(0,209,209,0.2);
        }
        .github-extra-details {
            display: flex; flex-direction: column; gap: 10px;
            padding: 14px; border-radius: 8px;
            background: rgba(0,209,209,0.04);
            border: 1px solid rgba(0,209,209,0.1);
        }
        .github-detail-item {
            display: flex; flex-direction: column; gap: 2px;
            color: #ccc;
        }
        .github-detail-item i {
            color: #00D1D1; margin-right: 6px;
            font-size: 1rem;
        }
        .github-detail-item strong {
            color: #000000; font-size: 0.95rem;
        }
        .github-extra-sub {
            font-size: 0.8rem; color: #888;
            margin-top: 1px;
        }
        .github-view-btn {
            display: inline-flex; align-items: center; gap: 6px;
            padding: 8px 16px; margin-top: 4px;
            background: rgba(0,209,209,0.1);
            border: 1px solid rgba(0,209,209,0.3);
            color: #00D1D1; border-radius: 6px;
            text-decoration: none; font-size: 0.85rem; font-weight: 600;
            transition: all 0.2s ease; align-self: flex-start;
        }
        .github-view-btn:hover {
            background: rgba(0,209,209,0.2);
            border-color: #00D1D1;
            transform: translateY(-2px);
        }
        @media (max-width: 768px) {
            .about-bottom-row {
                flex-direction: column;
            }
            .about-bottom-row > .stats,
            .github-stats-wrapper {
                min-width: 100%;
            }
        }
    `;
    document.head.appendChild(githubStyle);


    // ============================================================
    // OPEN TO WORK BADGE
    // ============================================================
    // const homeContent = document.querySelector('.home-content');
    // if (homeContent) {
    //     const badge = document.createElement('div');
    //     badge.className = 'open-to-work-badge';
    //     badge.innerHTML = '<span class="otw-dot"></span> Open to Work';
    //     homeContent.insertBefore(badge, homeContent.firstChild);
    // }

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

    const contactFormEnv = import.meta.env || {};
    const CONTACT_FORM_API_URL = contactFormEnv.VITE_FLASK_CONTACT_FORM_API_URL;
    const CONTACT_FORM_API_KEY = contactFormEnv.VITE_API_KEY;

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

        const name = form.querySelector('input[name="name"]').value.trim();
        const email = form.querySelector('input[name="email"]').value.trim();
        const message = form.querySelector('textarea[name="message"]').value.trim();

        // Show success immediately
        updateStatus('Thank you for contacting me. I will get back to you soon!', true);
        form.reset();

        if (!CONTACT_FORM_API_URL || !CONTACT_FORM_API_KEY) {
            return;
        }

        try {
            const res = await fetch(`${CONTACT_FORM_API_URL}/send-email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': CONTACT_FORM_API_KEY
                },
                body: JSON.stringify({
                    name,
                    email,
                    message
                })
            });

            const result = await res.json();

            // Only show something if the request actually failed
            if (!res.ok || !result.success) {
                updateStatus(
                    result.message || 'Message could not be delivered. Please try again.',
                    false
                );
            }
        } catch (err) {
            console.error(err);
            updateStatus(
                'Network error. Your message may not have been delivered.',
                false
            );
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