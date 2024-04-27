import {useEffect} from "react";

export function useWoWZamingCss() {
    useEffect(() => {
        const wowZamingCssUrl = 'https://wow.zamimg.com/css/universal.css?19'
        const cssId = 'wow-zaming-css'
        if (document.getElementById(cssId)) return () => {
            const css = document.getElementById(cssId)
            if (css) {
                css.remove()
            }
        }
        const css = document.createElement('link')
        css.rel = 'stylesheet'
        css.id = cssId
        css.href = wowZamingCssUrl
        document.head.appendChild(css)

        return () => {
            const css = document.getElementById(cssId)
            if (css) {
                css.remove()
            }
        }
    });
}
