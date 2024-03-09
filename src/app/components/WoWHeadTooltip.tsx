'use client'
import {useEffect} from "react";
export default function WoWHeadTooltip() {
    useEffect(() => {
        const javascript = document.createElement('script');

        javascript.src = 'https://wow.zamimg.com/js/tooltips.js';
        document.body.appendChild(javascript);

        const wowHeadOptions = document.createElement('script');
        wowHeadOptions.innerHTML = `var whTooltips = {colorLinks: false, iconizeLinks: false, renameLinks: false};`;
        document.body.appendChild(wowHeadOptions);

        return () => {
            document.body.removeChild(javascript);
            document.body.removeChild(wowHeadOptions);
        }
    }, []);
    return null;
}
