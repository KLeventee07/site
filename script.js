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
    
    // 🚀 THE ULTIMATE FIX: The "Phantom Extension" Killer
    const normalizePath = (urlStr) => {
        try {
            const url = new URL(urlStr, window.location.href);
            if (url.origin !== window.location.origin) return null;
            
            let p = url.pathname.toLowerCase();
            
            // 1. Forcefully rip off the .html extension if it exists
            p = p.replace(/\.html$/, "");
            
            // 2. Erase /index so the homepage matches perfectly
            p = p.replace(/\/index$/, "");
            
            // 3. Shave off trailing slashes (unless it's the root domain)
            if (p.length > 1 && p.endsWith("/")) {
                p = p.slice(0, -1);
            }
            
            // If the path became empty, it means we are at the root "/"
            return p || "/";
        } catch (error) {
            return null; 
        }
    };
    
    const currentPath = normalizePath(window.location.href);
    let activeIndex = -1;
    
    links.forEach((link, i) => {
        const linkPath = normalizePath(link.href);
        
        if (!linkPath || currentPath === null) {
            link.classList.remove("active");
            link.removeAttribute("aria-current");
            return;
        }
        
        // Debugging log: You will see it match perfectly in your F12 Console
        console.log(`Comparing: Current [${currentPath}] vs Link [${linkPath}]`);
        
        if (linkPath === currentPath) {
            links.forEach((l) => { 
                l.classList.remove("active"); 
                l.removeAttribute("aria-current"); 
            });
            
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
            activeIndex = 0; 
        }
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

    document.addEventListener("keydown", (e) => {
        if (isTextInputFocused()) return;
        if (e.ctrlKey || e.altKey || e.metaKey) return;
        
        const max = links.length;
        if (max === 0) return;
        
        const isTopRowDigit = e.key >= "1" && e.key <= "8";
        const isNumpadDigit = e.code && e.code.startsWith("Numpad") && /^[1-8]$/.test(e.key);
        
        if (isTopRowDigit || isNumpadDigit) {
            const index = parseInt(e.key, 10) - 1;
            if (links[index]) { e.preventDefault(); goTo(index); return; }
        }
        
        if (e.key === rightKey) { e.preventDefault(); goTo((Math.max(activeIndex, 0) + 1) % max); return; }
        if (e.key === leftKey) { e.preventDefault(); goTo((Math.max(activeIndex, 0) - 1 + max) % max); return; }
        if (e.key === "Home") { e.preventDefault(); goTo(0); return; }
        if (e.key === "End") { e.preventDefault(); goTo(max - 1); return; }
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
        if ((window.scrollY || 0) < 10) return true;
        return false;
    };
    
    const onScroll = () => {
        const y = window.scrollY || 0;
        const delta = y - lastY;
        lastY = y;
        if (shouldKeepVisible()) { showMenu(); return; }
        if (delta > 2) { hideMenu(); return; }
        if (delta < -2) { showMenu(); return; }
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
