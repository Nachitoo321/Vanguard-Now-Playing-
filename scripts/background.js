window.widgetBackground = (() => {
    const content = document.getElementById("content");
    const container = document.getElementById("background-media");
    let signature = null;
    let params = null;
    const viewer = new MediaViewer({
        container,
        onMediaLoaded: element => {
            if (element === viewer.mediaElement) content.classList.add("has-custom-background");
        },
        onMediaError: () => {
            content.classList.remove("has-custom-background");
            container.style.visibility = "hidden";
            signature = null;
        }
    });

    function finite(value, fallback, positive = false) {
        return typeof value === "number" && Number.isFinite(value) && (!positive || value > 0)
            ? value : fallback;
    }

    function update() {
        const media = typeof backgroundMedia === "undefined" ? null : backgroundMedia;
        if (!media || typeof media.pathToAsset !== "string" || !media.pathToAsset.trim()) {
            viewer.clear();
            content.classList.remove("has-custom-background");
            signature = null;
            params = null;
            return;
        }
        const next = {
            path: media.pathToAsset,
            baseWidth: finite(media.baseWidth, container.clientWidth || 480, true),
            baseHeight: finite(media.baseHeight, container.clientHeight || 272, true),
            scale: finite(media.scale, 1, true),
            positionX: finite(media.positionX, 0),
            positionY: finite(media.positionY, 0),
            angle: finite(media.angle, 0)
        };
        const nextSignature = JSON.stringify(next);
        if (nextSignature === signature) return;
        if (!params || next.path !== params.path || signature === null) {
            viewer.clear();
            content.classList.remove("has-custom-background");
        }
        params = next;
        signature = nextSignature;
        try {
            viewer.loadMedia(params);
        } catch (error) {
            viewer.clear();
            content.classList.remove("has-custom-background");
            signature = null;
            console.error("No se pudo cargar el fondo:", error);
        }
    }

    new ResizeObserver(() => {
        if (params) viewer.applyTransform(params);
    }).observe(container);
    update();
    return { update };
})();
