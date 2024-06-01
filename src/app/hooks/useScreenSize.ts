import { useEffect, useState } from "react";

export default function useScreenSize() {
    const [screenWidth, setScreenWidth] = useState(window.innerWidth);
    const [screenHeight, setScreenHeight] = useState(window.innerHeight);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [isTablet, setIsTablet] = useState(window.innerWidth >= 768 && window.innerWidth < 1024);
    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

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
