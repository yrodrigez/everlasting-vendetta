import {useEffect, useState} from "react";

export default function useScreenSize() {
    const [screenSize, setScreenSize] = useState(0)
    const [screenHeight, setScreenHeight] = useState(0)
    const [isMobile, setIsMobile] = useState(false)
    const [isTablet, setIsTablet] = useState(false)
    const [isDesktop, setIsDesktop] = useState(false)

    useEffect(() => {
        const handleResize = () => {
            setScreenSize(window.innerWidth)
            setScreenHeight(window.innerHeight)
        }

        if (screenSize < 768) {
            setIsMobile(true)
            setIsTablet(false)
            setIsDesktop(false)
        } else if (screenSize >= 768 && screenSize < 1024) {
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
    }, [])

    return {screenSize, isMobile, isTablet, isDesktop, screenHeight}
}
