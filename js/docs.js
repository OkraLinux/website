/* ==========================================================================
   OkraLinux 文档页 — 交互逻辑
   功能：代码块复制按钮、目录滚动高亮、移动端目录折叠
   ========================================================================== */
(function () {
    'use strict';

    /* ---------------- 代码块复制 ---------------- */
    function initCopyButtons() {
        var blocks = document.querySelectorAll('.code-block');
        if (!blocks.length) return;

        blocks.forEach(function (block) {
            var head = block.querySelector('.code-head');
            if (!head) return;

            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'copy-btn';
            btn.textContent = '复制';
            btn.setAttribute('aria-label', '复制代码');

            btn.addEventListener('click', function () {
                var code = block.querySelector('pre code');
                if (!code) return;
                var text = code.innerText;

                function done() {
                    btn.textContent = '已复制';
                    btn.classList.add('copied');
                    setTimeout(function () {
                        btn.textContent = '复制';
                        btn.classList.remove('copied');
                    }, 1600);
                }

                if (navigator.clipboard && window.isSecureContext) {
                    navigator.clipboard.writeText(text).then(done).catch(fallback);
                } else {
                    fallback();
                }

                // 非 HTTPS 环境下 clipboard API 不可用，退回 execCommand
                function fallback() {
                    var ta = document.createElement('textarea');
                    ta.value = text;
                    ta.style.position = 'fixed';
                    ta.style.opacity = '0';
                    document.body.appendChild(ta);
                    ta.select();
                    try { document.execCommand('copy'); done(); } catch (e) { /* 忽略 */ }
                    document.body.removeChild(ta);
                }
            });

            head.appendChild(btn);
        });
    }

    /* ---------------- 目录滚动高亮 ---------------- */
    function initTocSpy() {
        var links = Array.prototype.slice.call(document.querySelectorAll('.toc-link[href^="#"]'));
        if (!links.length || !('IntersectionObserver' in window)) return;

        var map = {};
        var sections = [];

        links.forEach(function (link) {
            var id = link.getAttribute('href').slice(1);
            var el = document.getElementById(id);
            if (!el) return;
            map[id] = link;
            sections.push(el);
        });

        if (!sections.length) return;

        // 记录当前可见区块，取最靠上的一个作为高亮目标
        var visible = new Set();

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    visible.add(entry.target.id);
                } else {
                    visible.delete(entry.target.id);
                }
            });

            if (!visible.size) return;

            var current = null;
            for (var i = 0; i < sections.length; i++) {
                if (visible.has(sections[i].id)) {
                    current = sections[i].id;
                    break;
                }
            }
            if (!current) return;

            links.forEach(function (l) { l.classList.remove('active'); });
            if (map[current]) map[current].classList.add('active');
        }, { rootMargin: '-80px 0px -70% 0px', threshold: 0 });

        sections.forEach(function (s) { observer.observe(s); });
    }

    /* ---------------- 启动 ---------------- */
    function boot() {
        initCopyButtons();
        initTocSpy();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();
