'use client'
import {useEffect} from "react";

const ResizeManager = () => {
    useEffect(() => {
        const resize = () => {
            const he = window.innerHeight ;
            document.body.style.height = `${innerHeight}px`;
        }
        window.addEventListener('resize', resize);
        resize();
        return () => window.removeEventListener('resize', resize);
    })
    return null;
}
export default ResizeManager;
