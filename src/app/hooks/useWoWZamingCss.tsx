import {useCallback, useEffect} from "react";

export function useWoWZamingCss() {
    const wowZamingCssUrl = 'https://wow.zamimg.com/css/universal.css?19'
    const cssId = 'wow-zaming-css'

    const removeCss = useCallback(() => {
        const css = document.getElementById(cssId)
        if (css) {
            css.remove()
        }
    }, [cssId])

    useEffect(() => {

        if (document.getElementById(cssId)) return removeCss
        const css = document.createElement('link')
        css.rel = 'stylesheet'
        css.id = cssId
        css.href = wowZamingCssUrl
        document.head.appendChild(css)

        return removeCss
    });
}
