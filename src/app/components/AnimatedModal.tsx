'use client'
import { ReactNode, useEffect, useState, useRef } from "react";

interface AnimatedModalProps {
    isOpen: boolean;
    onClose: () => void;
    triggerRef: React.RefObject<HTMLElement | null>;
    title?: string;
    children: ReactNode;
}

export const AnimatedModal = ({ isOpen, onClose, triggerRef, title, children }: AnimatedModalProps) => {
    const [isClosing, setIsClosing] = useState(false);
    const [buttonRect, setButtonRect] = useState<DOMRect | null>(null);

    useEffect(() => {
        if (isOpen && triggerRef.current) {
            setButtonRect(triggerRef.current.getBoundingClientRect());
        }
    }, [isOpen, triggerRef]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setIsClosing(false);
        }, 400);
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                style={{
                    animation: isClosing
                        ? 'fadeOut 300ms ease-out forwards'
                        : 'fadeIn 300ms ease-out forwards'
                }}
                onClick={handleClose}
            />

            {/* Modal */}
            <div
                className="fixed z-50 bg-wood rounded-lg shadow-2xl border border-gray-700"
                style={{
                    left: buttonRect ? `${buttonRect.left}px` : '50%',
                    top: buttonRect ? `${buttonRect.top}px` : '50%',
                    width: buttonRect ? `${buttonRect.width}px` : 'auto',
                    height: buttonRect ? `${buttonRect.height}px` : 'auto',
                    animation: isClosing
                        ? 'modalCollapse 400ms cubic-bezier(0.4, 0, 0.2, 1) forwards'
                        : 'modalExpand 400ms cubic-bezier(0.4, 0, 0.2, 1) forwards',
                }}
            >
                <div className="p-6 relative">
                    {/* Close Button */}
                    <button
                        onClick={handleClose}
                        className="absolute top-1 right-1 text-default transition-colors opacity-0 hover:text-wood hover:bg-white/70 hover:shadow-sm hover:shadow-white/30 rounded-full p-1"
                        style={{
                            animation: isClosing
                                ? 'fadeOut 150ms ease-out forwards'
                                : 'fadeIn 300ms ease-out 200ms forwards'
                        }}
                        aria-label="Close"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>

                    {/* Title */}
                    {title && (
                        <h3
                            className="text-2xl font-semibold text-white mb-8 opacity-0 text-center"
                            style={{
                                animation: isClosing
                                    ? 'fadeOut 150ms ease-out forwards'
                                    : 'fadeIn 300ms ease-out 200ms forwards'
                            }}
                        >
                            {title}
                        </h3>
                    )}

                    {/* Content */}
                    <div
                        className="opacity-0"
                        style={{
                            animation: isClosing
                                ? 'fadeOut 150ms ease-out forwards'
                                : 'fadeIn 300ms ease-out 250ms forwards'
                        }}
                    >
                        {children}
                    </div>
                </div>
            </div>

            <style jsx global>{`
                @keyframes modalExpand {
                    0% {
                        opacity: 1;
                    }
                    100% {
                        left: 50%;
                        top: 50%;
                        transform: translate(-50%, -50%);
                        width: 400px;
                        min-height: 250px;
                        opacity: 1;
                    }
                }

                @keyframes modalCollapse {
                    0% {
                        left: 50%;
                        top: 50%;
                        transform: translate(-50%, -50%);
                        width: 400px;
                        min-height: 250px;
                        opacity: 1;
                    }
                    100% {
                        left: ${buttonRect?.left}px;
                        top: ${buttonRect?.top}px;
                        transform: translate(0, 0);
                        width: ${buttonRect?.width}px;
                        height: ${buttonRect?.height}px;
                        opacity: 0;
                    }
                }

                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes fadeOut {
                    from {
                        opacity: 1;
                    }
                    to {
                        opacity: 0;
                    }
                }
            `}</style>
        </>
    );
};
