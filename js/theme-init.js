/* ==========================================================================
   OkraLinux 官网 — 首屏主题预设
   必须以阻塞方式在 <head> 中加载：
   若等到页面底部才判断主题，深色模式用户会看到一瞬间的白屏（FOUC）。
   ========================================================================== */
(function () {
    try {
        var saved = localStorage.getItem('theme');
        var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (saved === 'dark' || (!saved && prefersDark)) {
            document.documentElement.classList.add('dark');
        }
    } catch (e) {
        /* 隐私模式下 localStorage 可能不可用，忽略即可 */
    }
})();
