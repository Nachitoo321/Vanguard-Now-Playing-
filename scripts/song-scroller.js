window.songScroller = (() => {
    const viewport = document.getElementById("song-viewport");
    const text = document.getElementById("song");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let animation = null;
    let frame = null;
    let previousText = null;
    let previousDistance = null;
    let previousMotion = null;

    function measure() {
        frame = null;
        const distance = Math.max(0, text.scrollWidth - viewport.clientWidth);
        if (text.textContent === previousText && distance === previousDistance &&
            reducedMotion.matches === previousMotion) return;
        previousText = text.textContent;
        previousDistance = distance;
        previousMotion = reducedMotion.matches;
        animation?.cancel();
        animation = null;
        viewport.scrollLeft = 0;
        if (distance <= 1 || viewport.clientWidth === 0 || reducedMotion.matches) return;

        const pause = 1500;
        const travel = distance / 24 * 1000;
        const duration = 2 * (pause + travel);
        animation = text.animate([
            { transform: "translateX(0)", offset: 0 },
            { transform: "translateX(0)", offset: pause / duration },
            { transform: `translateX(-${distance}px)`, offset: (pause + travel) / duration },
            { transform: `translateX(-${distance}px)`, offset: (2 * pause + travel) / duration },
            { transform: "translateX(0)", offset: 1 }
        ], { duration, iterations: Infinity, easing: "linear" });
    }

    function refresh() {
        if (frame !== null) cancelAnimationFrame(frame);
        frame = requestAnimationFrame(measure);
    }

    const observer = new ResizeObserver(refresh);
    observer.observe(viewport);
    observer.observe(text);
    reducedMotion.addEventListener("change", refresh);
    document.fonts?.ready.then(refresh);
    refresh();
    return { refresh };
})();
