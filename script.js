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
        if (activeIndex >= 0) links[activeIndex].setAttribute("tabindex", "0");
        else { links[0].setAttribute("tabindex", "0"); activeIndex = 0; }
    }
    const isTextInputFocused = () => {
        const el = document.activeElement;
        if (!el) return false;
        const tag = el.tagName;
        if (["INPUT", "TEXTAREA", "SELECT"].includes(tag)) return true;
        if (el.isContentEditable || el.getAttribute("contenteditable") === "true") return true;
        return false;
    };
    const goTo = (index) => {
        if (!links[index]) return;
        if (enableRovingTabindex) {
            links.forEach((l) => l.setAttribute("tabindex", "-1"));
            links[index].setAttribute("tabindex", "0");
            links[index].focus({ preventScroll: true });
        }
        activeIndex = index;
        window.location.href = links[index].href;
    };

document.addEventListener("DOMContentLoaded", () => {
    const menu = document.querySelector(".menu");
    const links = Array.from(document.querySelectorAll(".menu a"));
    if (!menu || links.length === 0) return;

    // 1. Improved Path Normalization
    const normalizePath = (urlStr) => {
        try {
            const url = new URL(urlStr, window.location.href);
            // Ignore external links
            if (url.hostname !== window.location.hostname) return null;

            let p = url.pathname;
            
            // Standardize: Remove index.html and trailing slashes
            p = p.replace(/\/index\.html$/, "");
            if (p.length > 1 && p.endsWith("/")) p = p.slice(0, -1);
            
            return p || "/";
        } catch (e) {
            return null;
        }
    };

    const currentPath = normalizePath(window.location.href);
    let activeIndex = -1;

    // 2. Updated Matching Logic
    links.forEach((link, i) => {
        const linkPath = normalizePath(link.href);
        
        // Remove active states by default
        link.classList.remove("active");
        link.removeAttribute("aria-current");

        if (linkPath && linkPath === currentPath) {
            link.classList.add("active");
            link.setAttribute("aria-current", "page");
            activeIndex = i;
        }
    });

    // Fallback: If no exact match (e.g. on a sub-page), default to first link for keyboard nav
    if (activeIndex === -1) activeIndex = 0;

    // ... [The rest of your keyboard and scroll logic remains the same] ...
    // Note: Ensure your "goTo" function uses the updated activeIndex
});
