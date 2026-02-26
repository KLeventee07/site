document.addEventListener("keydown", (e) => {
    if (isTextInputFocused()) return;
    if (e.ctrlKey || e.altKey || e.metaKey) return;
    const max = links.length;
    if (!max) return;
    if (e.key === "Enter" || e.key === " ") {
        const el = document.activeElement;
        if (el && el.tagName === "A") {
            e.preventDefault();
            el.click();
        }
        return;
    }
    const isTopRowDigit = e.key >= "1" && e.key <= "8";
    const isNumpadDigit = e.code?.startsWith("Numpad") && /^[1-8]$/.test(e.key);

    if (isTopRowDigit || isNumpadDigit) {
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
        goTo((currentIndex + 1) % max);
        return;
    }
    if (e.key === leftKey) {
        e.preventDefault();
        goTo((currentIndex - 1 + max) % max);
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
        return;
    }
});
