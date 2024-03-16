'use client'
import {useEffect} from "react";

const ResizeManager = () => {
    useEffect(() => {
        const resize = () => {
            document.body.style.height = `${innerHeight}px`;
            const container = document.getElementById('content-container');
            container?.style.setProperty('height', `${innerHeight - 85}px`);
            container?.style.setProperty('max-height', `${innerHeight - 85}px`);

        }
        window.addEventListener('resize', resize);
        resize();
        return () => window.removeEventListener('resize', resize);
    })
    return null;
}
export default ResizeManager;
