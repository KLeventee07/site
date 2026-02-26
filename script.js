document.addEventListener("DOMContentLoaded", () => {
    const menu = document.querySelector(".menu");
    const links = Array.from(document.querySelectorAll(".menu a"));
    if (!menu || links.length === 0) return;
    const getDir = () => {
        const dir = (menu?.dir || document.documentElement.dir || "ltr").toLowerCase();
        return dir === "rtl" ? "rtl" : "ltr";
    };
    const isRTL = getDir() === "rtl";
    const leftKey = isRTL ? "ArrowRight" : "ArrowLeft";
    const rightKey = isRTL ? "ArrowLeft" : "ArrowRight";
    const normalizePath = (urlStr) => {
        const url = new URL(urlStr, location.href);
        if (url.origin !== location.origin) return null;
        let p = url.pathname;
        if (p.length > 1 && p.endsWith("/")) p = p.slice(0, -1);
        if (p.endsWith("/index.html")) p = p.slice(0, -"/index.html".length) || "/";
        if (p.endsWith("index.html") && !p.endsWith("/index.html")) {
            p = p.slice(0, -"index.html".length) || "/";
            if (p.length > 1 && p.endsWith("/")) p = p.slice(0, -1);
        }
        return p || "/";
    };
    const currentPath = normalizePath(location.href);
    let activeIndex = -1;
    links.forEach((link, i) => {
        const linkPath = normalizePath(link.href);
        if (!linkPath || currentPath == null) {
            link.classList.remove("active");
            link.removeAttribute("aria-current");
            return;
        }
        if (linkPath === currentPath) {
            links.forEach((l) => { l.classList.remove("active"); l.removeAttribute("aria-current"); });
            link.classList.add("active");
            link.setAttribute("aria-current", "page");
            activeIndex = i;
        } else {
            link.classList.remove("active");
            link.removeAttribute("aria-current");
        }
    });
    const enableRovingTabindex = true;
    if (enableRovingTabindex) {
        links.forEach((l) => l.setAttribute("tabindex", "-1"));
        if (activeIndex >= 0) {
            links[activeIndex].setAttribute("tabindex", "0");
        } else {
            links[0].setAttribute("tabindex", "0");
        }
    }
    const isTextInputFocused = () => {
        const el = document.activeElement;
        if (!el) return false;
        const tag = el.tagName;
        if (["INPUT", "TEXTAREA", "SELECT"].includes(tag)) return true;
        return el.isContentEditable || el.getAttribute("contenteditable") === "true";

    };
    const goTo = (index) => {
        if (!links[index]) return;
        if (enableRovingTabindex) {
            links.forEach((l) => l.setAttribute("tabindex", "-1"));
            links[index].setAttribute("tabindex", "0");
            links[index].focus({ preventScroll: true });
        }
        activeIndex = index;
    };
    const navigateTo = (index) => {
        if (!links[index]) return;
        goTo(index);
        window.location.href = links[index].href;
    };

    document.addEventListener("keydown", (e) => {
        if (isTextInputFocused()) return;
        if (e.ctrlKey || e.altKey || e.metaKey) return;
        const max = links.length;
        if (max === 0) return;
        const isTopRowDigit = e.key >= "1" && e.key <= "8";
        const isNumpadDigit = e.code && e.code.startsWith("Numpad") && /^[1-8]$/.test(e.key);
        if (isTopRowDigit || isNumpadDigit) {
            const index = parseInt(e.key, 10) - 1;
            if (links[index]) { e.preventDefault(); navigateTo(index); return; }
        }
        if (e.key === rightKey) {
            e.preventDefault();
            // Find currently focused link or start from active/first
            let currentIndex = links.findIndex(l => l === document.activeElement);
            if (currentIndex === -1) currentIndex = activeIndex >= 0 ? activeIndex : 0;
            navigateTo((currentIndex + 1) % max);
            return;
        }
        if (e.key === leftKey) {
            e.preventDefault();
            // Find currently focused link or start from active/first
            let currentIndex = links.findIndex(l => l === document.activeElement);
            if (currentIndex === -1) currentIndex = activeIndex >= 0 ? activeIndex : 0;
            navigateTo((currentIndex - 1 + max) % max);
            return;
        }
        if (e.key === "Home") { e.preventDefault(); navigateTo(0); return; }
        if (e.key === "End") { e.preventDefault(); navigateTo(max - 1);  }
    });
    let lastY = window.scrollY || 0;
    let ticking = false;
    let hover = false;
    let focusInside = false;
    const showMenu = () => menu.classList.remove("hidden");
    const hideMenu = () => menu.classList.add("hidden");
    const shouldKeepVisible = () => {
        if (hover) return true;
        if (focusInside) return true;
        return (window.scrollY || 0) < 10;

    };
    const onScroll = () => {
        const y = window.scrollY || 0;
        const delta = y - lastY;
        lastY = y;
        if (shouldKeepVisible()) { showMenu(); return; }
        if (delta > 2) { hideMenu(); return; }
        if (delta < -2) { showMenu();  }
    };
    const requestTick = () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => { onScroll(); ticking = false; });
    };
    window.addEventListener("scroll", requestTick, { passive: true });
    menu.addEventListener("mouseenter", () => { hover = true; showMenu(); });
    menu.addEventListener("mouseleave", () => { hover = false; });
    menu.addEventListener("focusin", () => { focusInside = true; showMenu(); });
    menu.addEventListener("focusout", (e) => {
        if (!menu.contains(e.relatedTarget)) focusInside = false;
    });
    let lastMoveY = 0;
    document.addEventListener("mousemove", (e) => {
        lastMoveY = e.clientY || 0;
        if (lastMoveY < 12) showMenu();
    }, { passive: true });
    window.addEventListener("resize", () => { requestTick(); }, { passive: true });
    requestTick();
});