/* ==========================================================================
   Kayden Knapik, Portfolio Motion Layer
   Every feature below is isolated in its own try/catch: one broken feature
   (a CDN hiccup, a missing element) must never silently kill the others.
   ========================================================================== */

(function () {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hasGsap = !!window.gsap;
    const hasScrollTrigger = hasGsap && !!window.ScrollTrigger;

    const run = (label, fn) => {
        try {
            fn();
        } catch (err) {
            console.error(`[main.js] "${label}" failed:`, err);
        }
    };

    run('register ScrollTrigger', () => {
        if (hasScrollTrigger) gsap.registerPlugin(ScrollTrigger);
    });

    run('page fade-in', () => {
        document.documentElement.classList.add('is-ready');
    });

    run('nav scroll state', () => {
        const nav = document.querySelector('nav');
        if (!nav) return;
        const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
    });

    run('nav active section spy', () => {
        const navLinks = document.querySelectorAll('.nav-link');
        if (!navLinks.length || !('IntersectionObserver' in window)) return;
        const sections = Array.from(navLinks)
            .map(link => document.querySelector(link.getAttribute('href')))
            .filter(Boolean);
        if (!sections.length) return;
        const spy = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const link = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
                if (!link) return;
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            });
        }, { rootMargin: '-45% 0px -50% 0px' });
        sections.forEach(s => spy.observe(s));
    });

    /* ---- Hero background video: static photo first, then a rotating 5s-per-clip highlight reel.
       Two stacked <video> elements crossfade into each other so the wallpaper photo underneath
       never shows through mid-swap, the next clip is fully preloaded before it's ever revealed. ---- */
    run('hero background video rotation', () => {
        const videos = document.querySelectorAll('.hero-bg-video');
        if (videos.length < 2 || reduceMotion) return;
        let [front, back] = videos;

        const clips = [
            'media/hero-loop/bdx-r-video.mp4',
            'media/hero-loop/bdx-walk-real.mp4',
            'media/hero-loop/sim-training.mp4',
            'media/hero-loop/booster-t1-dance.mp4',
            'media/hero-loop/booster-kick-improved-real.mp4',
            'media/hero-loop/booster-kick-sim-2.mp4',
            'media/hero-loop/booster-kick-real.mp4',
            'media/hero-loop/stompy-main.mp4',
            'media/hero-loop/stompy-outside.mp4',
            'media/hero-loop/booster-t1-locomotion.mp4'
        ];
        const shuffle = (arr) => {
            const a = arr.slice();
            for (let i = a.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [a[i], a[j]] = [a[j], a[i]];
            }
            return a;
        };

        let queue = shuffle(clips);
        let pos = 0;

        const loadInto = (el, src) => {
            let source = el.querySelector('source');
            if (!source) {
                source = document.createElement('source');
                source.type = 'video/mp4';
                el.appendChild(source);
            }
            source.src = src;
            el.load();
        };

        loadInto(back, queue[(pos + 1) % queue.length]);
        front.play().catch(() => {});

        const reveal = () => setTimeout(() => front.classList.add('is-active'), 1000);
        if (front.readyState >= 3) reveal();
        else front.addEventListener('canplay', reveal, { once: true });

        setInterval(() => {
            pos += 1;
            if (pos >= queue.length) {
                queue = shuffle(clips);
                pos = 0;
            }
            back.currentTime = 0;
            back.play().catch(() => {});
            back.parentNode.appendChild(back); // always paint the incoming clip on top, regardless of DOM history
            back.classList.add('is-active');
            front.classList.remove('is-active');
            [front, back] = [back, front];
            setTimeout(() => {
                back.pause();
                loadInto(back, queue[(pos + 1) % queue.length]);
            }, 700);
        }, 5000);
    });

    /* ---- Lazy video playback: only decode video that's actually on screen.
       A page with 6+ looping cards autoplaying at once is the classic cause
       of "the site feels slow", pausing off-screen video fixes that directly. ---- */
    run('lazy video playback', () => {
        const videos = document.querySelectorAll('video[autoplay]');
        if (!videos.length || !('IntersectionObserver' in window)) return;
        const io = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                const video = entry.target;
                if (entry.isIntersecting) {
                    video.play().catch(() => {});
                } else {
                    video.pause();
                }
            });
        }, { rootMargin: '200px 0px', threshold: 0.1 });
        videos.forEach((v) => io.observe(v));
    });

    if (reduceMotion || !hasGsap) return;

    /* ---- Scroll reveal ---- */
    run('scroll reveal', () => {
        const revealGroup = (selector, opts = {}) => {
            const els = gsap.utils.toArray(selector);
            els.forEach((el, i) => {
                gsap.from(el, {
                    opacity: 0,
                    y: opts.y ?? 24,
                    duration: opts.duration ?? 0.6,
                    ease: 'power2.out',
                    scrollTrigger: hasScrollTrigger ? {
                        trigger: el,
                        start: 'top 88%',
                        toggleActions: 'play none none reverse'
                    } : undefined,
                    delay: opts.stagger ? (i % (opts.staggerLimit ?? 8)) * opts.stagger : 0
                });
            });
        };

        revealGroup('.section-eyebrow, .section-title', { y: 16, duration: 0.5 });
        revealGroup('.project-card', { stagger: 0.08, staggerLimit: 4 });
        revealGroup('.skill-group', { stagger: 0.08 });
        revealGroup('.about-text');
        revealGroup('.contact-section h2, .contact-section p, .contact-link', { y: 16, duration: 0.5 });

        /* project detail pages */
        revealGroup('.content h2', { y: 16, duration: 0.5 });
        revealGroup('.content p, .achievement-box, .winner-box, .viral-box, .tech-list', { y: 16, duration: 0.5 });
        revealGroup('.media-item, .hero-img', { y: 20 });
        revealGroup('.photo-grid img', { stagger: 0.06, staggerLimit: 6, y: 16 });
    });

    /* ---- Body dot-grid: subtle parallax drift on scroll ---- */
    run('body grid parallax', () => {
        if (!hasScrollTrigger) return;
        gsap.to('body', {
            backgroundPositionY: '48px',
            ease: 'none',
            scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 0.8 }
        });
    });

    /* ---- Project cards: 3D tilt + spotlight, one focal interaction per card ---- */
    run('project card tilt', () => {
        document.querySelectorAll('.project-card:not(.project-card-soon)').forEach((card) => {
            const maxTilt = 6;
            card.addEventListener('mousemove', (e) => {
                const r = card.getBoundingClientRect();
                const px = (e.clientX - r.left) / r.width;
                const py = (e.clientY - r.top) / r.height;
                const rotY = (px - 0.5) * maxTilt * 2;
                const rotX = (0.5 - py) * maxTilt * 2;
                gsap.to(card, {
                    rotateX: rotX,
                    rotateY: rotY,
                    translateY: -6,
                    duration: 0.4,
                    ease: 'power2.out',
                    transformPerspective: 800
                });
                card.style.setProperty('--spot-x', `${px * 100}%`);
                card.style.setProperty('--spot-y', `${py * 100}%`);
            });
            card.addEventListener('mouseleave', () => {
                gsap.to(card, { rotateX: 0, rotateY: 0, translateY: 0, duration: 0.5, ease: 'power2.out' });
            });
        });
    });

    /* ---- Magnetic pull on primary hero CTA only (single focal element) ---- */
    run('magnetic CTA', () => {
        const magnetic = document.querySelector('.hero-ctas .btn-solid');
        if (!magnetic) return;
        const xTo = gsap.quickTo(magnetic, 'x', { duration: 0.4, ease: 'elastic.out(1,0.4)' });
        const yTo = gsap.quickTo(magnetic, 'y', { duration: 0.4, ease: 'elastic.out(1,0.4)' });
        magnetic.addEventListener('mousemove', (e) => {
            const r = magnetic.getBoundingClientRect();
            xTo((e.clientX - r.left - r.width / 2) * 0.3);
            yTo((e.clientY - r.top - r.height / 2) * 0.3);
        });
        magnetic.addEventListener('mouseleave', () => { xTo(0); yTo(0); });
    });
})();
