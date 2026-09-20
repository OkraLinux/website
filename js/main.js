/* ==========================================================================
   OkraLinux 官网 — 交互逻辑
   模块划分：图标 / 主题 / 移动端菜单 / 滚动渐现 / 粒子 / 打字机 /
             返回顶部 / 数字滚动
   ========================================================================== */
(function () {
    'use strict';

    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------------- 图标渲染 ---------------- */
    function renderIcons() {
        if (window.lucide && typeof window.lucide.createIcons === 'function') {
            window.lucide.createIcons();
        }
    }

    /* ---------------- 主题切换 ---------------- */
    function initTheme() {
        var html = document.documentElement;
        var buttons = [
            document.getElementById('theme-toggle'),
            document.getElementById('theme-toggle-mobile')
        ].filter(Boolean);

        function toggle() {
            var isDark = html.classList.toggle('dark');
            try {
                localStorage.setItem('theme', isDark ? 'dark' : 'light');
            } catch (e) {
                /* 隐私模式：仅当次生效 */
            }
        }

        buttons.forEach(function (btn) {
            btn.addEventListener('click', toggle);
        });
    }

    /* ---------------- 移动端菜单 ---------------- */
    function initMobileMenu() {
        var btn = document.getElementById('mobile-menu-btn');
        var menu = document.getElementById('mobile-menu');
        if (!btn || !menu) return;

        btn.addEventListener('click', function () {
            var isHidden = menu.classList.toggle('hidden');
            btn.setAttribute('aria-expanded', String(!isHidden));
        });

        menu.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                menu.classList.add('hidden');
                btn.setAttribute('aria-expanded', 'false');
            });
        });
    }

    /* ---------------- 滚动渐现 ----------------
       用 IntersectionObserver 替代 scroll 事件，
       避免每次滚动都触发 getBoundingClientRect 强制重排。 */
    function initReveal() {
        var targets = document.querySelectorAll('.reveal');
        if (!targets.length) return;

        if (prefersReducedMotion || !('IntersectionObserver' in window)) {
            targets.forEach(function (el) { el.classList.add('active'); });
            return;
        }

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -80px 0px' });

        targets.forEach(function (el) { observer.observe(el); });
    }

    /* ---------------- 首屏粒子 ---------------- */
    function initParticles() {
        var container = document.getElementById('hero-particles');
        if (!container || prefersReducedMotion) return;

        var count = window.innerWidth < 768 ? 10 : 20;
        var frag = document.createDocumentFragment();

        for (var i = 0; i < count; i++) {
            var p = document.createElement('div');
            p.className = 'particle';
            p.style.left = Math.random() * 100 + '%';
            p.style.top = Math.random() * 100 + '%';
            p.style.animationDelay = Math.random() * 15 + 's';
            p.style.animationDuration = (10 + Math.random() * 10) + 's';
            frag.appendChild(p);
        }
        container.appendChild(frag);
    }

    /* ---------------- 打字机效果 ---------------- */
    function initTyping() {
        var el = document.getElementById('hero-typing');
        if (!el) return;

        var phrases = ['轻量', '安全', '现代化', '为 AI 而生'];

        if (prefersReducedMotion) {
            el.textContent = phrases[0];
            return;
        }

        var pi = 0, ci = 0, deleting = false;

        function tick() {
            var phrase = phrases[pi];
            if (!deleting) {
                el.textContent = phrase.slice(0, ++ci);
                if (ci === phrase.length) {
                    deleting = true;
                    setTimeout(tick, 1500);
                    return;
                }
            } else {
                el.textContent = phrase.slice(0, --ci);
                if (ci === 0) {
                    deleting = false;
                    pi = (pi + 1) % phrases.length;
                }
            }
            setTimeout(tick, deleting ? 60 : 120);
        }
        tick();
    }

    /* ---------------- 返回顶部 ----------------
       用 IntersectionObserver 监听首屏哨兵，
       取代 scroll 事件里的 scrollY 比对。 */
    function initBackToTop() {
        var btn = document.getElementById('back-to-top');
        if (!btn) return;

        btn.addEventListener('click', function () {
            window.scrollTo({
                top: 0,
                behavior: prefersReducedMotion ? 'auto' : 'smooth'
            });
        });

        var sentinel = document.getElementById('hero-sentinel');
        if (sentinel && 'IntersectionObserver' in window) {
            new IntersectionObserver(function (entries) {
                btn.classList.toggle('visible', !entries[0].isIntersecting);
            }, { threshold: 0 }).observe(sentinel);
        } else {
            // 退化方案：无 IntersectionObserver 时用节流的 scroll
            var ticking = false;
            window.addEventListener('scroll', function () {
                if (ticking) return;
                ticking = true;
                requestAnimationFrame(function () {
                    btn.classList.toggle('visible', window.scrollY > 600);
                    ticking = false;
                });
            }, { passive: true });
        }
    }

    /* ---------------- 统计数字滚动 ---------------- */
    function initCounters() {
        var counters = document.querySelectorAll('[data-count]');
        if (!counters.length) return;

        function run(el) {
            var target = parseInt(el.getAttribute('data-count'), 10);
            var suffix = el.dataset.suffix || '';

            if (prefersReducedMotion || isNaN(target)) {
                el.textContent = (isNaN(target) ? '' : target) + suffix;
                return;
            }

            var duration = 1500;
            var start = null;

            function step(ts) {
                if (start === null) start = ts;
                var progress = Math.min((ts - start) / duration, 1);
                // easeOutCubic，收尾更自然
                var eased = 1 - Math.pow(1 - progress, 3);
                el.textContent = Math.round(target * eased) + suffix;
                if (progress < 1) requestAnimationFrame(step);
            }
            requestAnimationFrame(step);
        }

        if (!('IntersectionObserver' in window)) {
            counters.forEach(run);
            return;
        }

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    run(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(function (c) { observer.observe(c); });
    }

    /* ---------------- 启动 ---------------- */
    function boot() {
        renderIcons();
        initTheme();
        initMobileMenu();
        initReveal();
        initParticles();
        initTyping();
        initBackToTop();
        initCounters();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();
