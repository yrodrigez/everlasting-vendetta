import { useEffect, useState } from "react";

export default function useScreenSize() {
    const [screenWidth, setScreenWidth] = useState(1080);
    const [screenHeight, setScreenHeight] = useState(1920);
    const [isMobile, setIsMobile] = useState(false);
    const [isTablet, setIsTablet] = useState(false);
        const [isDesktop, setIsDesktop] = useState(true);

    useEffect(() => {
        const handleResize = () => {
            setScreenWidth(window.innerWidth);
            setScreenHeight(window.innerHeight);
        };

        let debounceTimeout = setTimeout(() => {}, 0);
        const debouncedHandleResize = () => {
            clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(handleResize, 300);
        };

        window.addEventListener('resize', debouncedHandleResize);

        handleResize();

        return () => {
            window.removeEventListener('resize', debouncedHandleResize);
            clearTimeout(debounceTimeout);
        };
    }, []);

    useEffect(() => {
        if (screenWidth < 768) {
            setIsMobile(true);
            setIsTablet(false);
            setIsDesktop(false);
        } else if (screenWidth >= 768 && screenWidth < 1024) {
            setIsMobile(false);
            setIsTablet(true);
            setIsDesktop(false);
        } else {
            setIsMobile(false);
            setIsTablet(false);
            setIsDesktop(true);
        }
    }, [screenWidth]);

    return { screenWidth, isMobile, isTablet, isDesktop, screenHeight };
}
