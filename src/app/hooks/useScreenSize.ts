import {useEffect, useState} from "react";

export default function useScreenSize() {
    const [screenWidth, setScreenWidth] = useState(0)
    const [screenHeight, setScreenHeight] = useState(0)
    const [isMobile, setIsMobile] = useState(false)
    const [isTablet, setIsTablet] = useState(false)
    const [isDesktop, setIsDesktop] = useState(false)

    useEffect(() => {
        const handleResize = () => {
            setScreenWidth(window.innerWidth)
            setScreenHeight(window.innerHeight)
        }

        if (screenWidth < 768) {
            setIsMobile(true)
            setIsTablet(false)
            setIsDesktop(false)
        } else if (screenWidth >= 768 && screenWidth < 1024) {
            setIsMobile(false)
            setIsTablet(true)
            setIsDesktop(false)
        } else {
            setIsMobile(false)
            setIsTablet(false)
            setIsDesktop(true)
        }

        window.addEventListener('resize', handleResize)
        handleResize()
        return () => {
            window.removeEventListener('resize', handleResize)
        }
    }, [screenWidth])

    return {screenWidth, isMobile, isTablet, isDesktop, screenHeight}
}
