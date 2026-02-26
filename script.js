/**
 * THE NAVIGATOR'S KEY
 * A robust, accessible, and keyboard-friendly menu controller.
 */
document.addEventListener("DOMContentLoaded", () => {
    const menu = document.querySelector(".menu");
    const links = Array.from(document.querySelectorAll(".menu a"));
    
    // Safety check: Exit if the menu doesn't exist on this page
    if (!menu || links.length === 0) return;

    // --- 1. CONFIGURATION & RTL DETECTION ---
    const getDir = () => {
        const dir = (menu?.dir || document.documentElement.dir || "ltr").toLowerCase();
        return dir === "rtl" ? "rtl" : "ltr";
    };

    const isRTL = getDir() === "rtl";
    const leftKey = isRTL ? "ArrowRight" : "ArrowLeft";
    const rightKey = isRTL ? "ArrowLeft" : "ArrowRight";

    // --- 2. PATH NORMALIZATION (The "Matchmaker") ---
    // This ensures "/about", "/about/", and "/about/index.html" all match the same link.
    const normalizePath = (urlStr) => {
        try {
            const url = new URL(urlStr, window.location.href);
            let p = url.pathname;

            // Remove trailing slashes and index.html for comparison
            p = p.replace(/\/index\.html$/, "");
            if (p.length > 1 && p.endsWith("/")) p = p.slice(0, -1);
            
            return p || "/";
        } catch (e) {
            return null;
        }
    };

    const currentPath = normalizePath(window.location.href);

    // --- 3. ACTIVE STATE INITIALIZATION ---
    // We find which link matches the current URL.
    let activeIndex = links.findIndex(link => normalizePath(link.href) === currentPath);

    // CRITICAL FIX: If no link matches (e.g., on a sub-page), default to 0.
    // This prevents the Arrow Keys from getting stuck at index -1.
    if (activeIndex === -1) activeIndex = 0;

    const updateUI = () => {
        links.forEach((link, i) => {
            if (i === activeIndex) {
                link.classList.add("active");
                link.setAttribute("aria-current", "page");
                link.setAttribute("tabindex", "0");
            } else {
                link.classList.remove("active");
                link.removeAttribute("aria-current");
                link.setAttribute("tabindex", "-1");
            }
        });
    };

    // Run initial UI update
    updateUI();

    // --- 4. NAVIGATION LOGIC ---
    const isTextInputFocused = () => {
        const el = document.activeElement;
        if (!el) return false;
        const tag = el.tagName;
        return ["INPUT", "TEXTAREA", "SELECT"].includes(tag) || 
               el.isContentEditable || 
               el.getAttribute("contenteditable") === "true";
    };

    const goTo = (index) => {
        if (!links[index]) return;
        
        // Update index and UI before the page starts unloading
        activeIndex = index;
        updateUI();
        links[index].focus({ preventScroll: true });

        // Trigger the redirect
        window.location.href = links[index].href;
    };

    // --- 5. EVENT LISTENERS: KEYBOARD ---
    document.addEventListener("keydown", (e) => {
        if (isTextInputFocused()) return;
        if (e.ctrlKey || e.altKey || e.metaKey) return;

        const max = links.length;

        // Number Key Navigation (1-8)
        const isTopRowDigit = e.key >= "1" && e.key <= "8";
        if (isTopRowDigit) {
            const index = parseInt(e.key, 10) - 1;
            if (links[index]) {
                e.preventDefault();
                goTo(index);
                return;
            }
        }

        // Arrow Key Navigation
        if (e.key === rightKey) {
            e.preventDefault();
            goTo((activeIndex + 1) % max);
        } else if (e.key === leftKey) {
            e.preventDefault();
            goTo((activeIndex - 1 + max) % max);
        } else if (e.key === "Home") {
            e.preventDefault();
            goTo(0);
        } else if (e.key === "End") {
            e.preventDefault();
            goTo(max - 1);
        }
    });

    // --- 6. EVENT LISTENERS: VISIBILITY & SCROLL ---
    let lastY = window.scrollY || 0;
    let ticking = false;
    let hover = false;
    let focusInside = false;

    const showMenu = () => menu.classList.remove("hidden");
    const hideMenu = () => menu.classList.add("hidden");

    const shouldKeepVisible = () => {
        return hover || focusInside || (window.scrollY < 10);
    };

    const onScroll = () => {
        const y = window.scrollY || 0;
        const delta = y - lastY;
        lastY = y;

        if (shouldKeepVisible()) {
            showMenu();
        } else if (delta > 2) {
            hideMenu();
        } else if (delta < -2) {
            showMenu();
        }
    };

    window.addEventListener("scroll", () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                onScroll();
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });

    // Hover & Focus management
    menu.addEventListener("mouseenter", () => { hover = true; showMenu(); });
    menu.addEventListener("mouseleave", () => { hover = false; });
    menu.addEventListener("focusin", () => { focusInside = true; showMenu(); });
    menu.addEventListener("focusout", (e) => {
        if (!menu.contains(e.relatedTarget)) focusInside = false;
    });

    // Mouse proximity to top of screen
    document.addEventListener("mousemove", (e) => {
        if (e.clientY < 15) showMenu();
    }, { passive: true });
});
