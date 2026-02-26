document.addEventListener("DOMContentLoaded", () => {
    const menu = document.querySelector(".menu");
    const links = Array.from(document.querySelectorAll(".menu a"));
    if (!menu || !links.length) return;
    const getDir = () => {
        const dir = (menu?.dir || document.documentElement.dir || "ltr").toLowerCase();
        return dir === "rtl" ? "rtl" : "ltr";
    };
    const isRTL = getDir() === "rtl";
    const leftKey  = isRTL ? "ArrowRight" : "ArrowLeft";
    const rightKey = isRTL ? "ArrowLeft"  : "ArrowRight";
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
        if (linkPath === currentPath) {
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
        links.forEach(l => l.setAttribute("tabindex", "-1"));
        (links[activeIndex] || links[0]).setAttribute("tabindex", "0");
    }
    const isTextInputFocused = () => {
        const el = document.activeElement;
        return el && (
            ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName) ||
            el.isContentEditable
        );
    };
    const goTo = (index) => {
        if (!links[index]) return;
        if (enableRovingTabindex) {
            links.forEach(l => l.setAttribute("tabindex", "-1"));
            links[index].setAttribute("tabindex", "0");
            links[index].focus({ preventScroll: true });
        }
        activeIndex = index;
    };

    document.addEventListener("keydown", (e) => {
        if (isTextInputFocused()) return;
        if (e.ctrlKey || e.altKey || e.metaKey) return;
        const max = links.length;
        if (!max) return;
        if (e.key === "Enter" || e.key === " ") {
            const el = document.activeElement;
            if (el?.tagName === "A") {
                e.preventDefault();
                el.click();
            }
            return;
        }
        if (/^[1-8]$/.test(e.key)) {
            const index = parseInt(e.key, 10) - 1;
            if (links[index]) {
                e.preventDefault();
                links[index].click();
            }
            return;
        }
        let currentIndex = links.indexOf(document.activeElement);
        if (currentIndex === -1) currentIndex = activeIndex >= 0 ? activeIndex : 0;
        if (e.key === rightKey) {
            e.preventDefault();
            goTo((currentIndex + 1) % max).click();
            return;
        }
        if (e.key === leftKey) {
            e.preventDefault();
            goTo((currentIndex - 1 + max) % max).click();
            return;
        }
        if (e.key === "Home") {
            e.preventDefault();
            goTo(0);
            return;
        }
        if (e.key === "End") {
            e.preventDefault();
            goTo(max - 1);
        }
    });

    let lastY = window.scrollY || 0;
    let ticking = false;
    let hover = false;
    let focusInside = false;
    const showMenu = () => menu.classList.remove("hidden");
    const hideMenu = () => menu.classList.add("hidden");
    const shouldKeepVisible = () => (
        hover || focusInside || (window.scrollY || 0) < 10
    );
    const onScroll = () => {
        const y = window.scrollY || 0;
        const delta = y - lastY;
        lastY = y;
        if (shouldKeepVisible()) return showMenu();
        if (delta > 2) return hideMenu();
        if (delta < -2) return showMenu();
    };
    const requestTick = () => {
        if (!ticking) {
            ticking = true;
            requestAnimationFrame(() => {
                onScroll();
                ticking = false;
            });
        }
    };

    window.addEventListener("scroll", requestTick, { passive: true });
    window.addEventListener("resize", requestTick, { passive: true });
    menu.addEventListener("mouseenter", () => { hover = true; showMenu(); });
    menu.addEventListener("mouseleave", () => { hover = false; });
    menu.addEventListener("focusin",  () => { focusInside = true; showMenu(); });
    menu.addEventListener("focusout", (e) => {
        if (!menu.contains(e.relatedTarget)) focusInside = false;
    });
    document.addEventListener("mousemove", (e) => {
        if (e.clientY < 12) showMenu();
    }, { passive: true });

    requestTick();
});
