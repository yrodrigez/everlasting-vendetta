import {toast} from "sonner"
import React, {ReactNode} from "react"

type ToastOptions =
    | string
    | ReactNode
    | {
    message: string | ReactNode
    position?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "top-center" | "bottom-center"
    duration?: number
    icon?: ReactNode
}

export default function useToast() {
    const defaultPlacement = "bottom-right"
    const defaultDuration = 5000

    const toastDefault = (options: ToastOptions) => {
        const {message, position, duration, icon} = normalizeOptions(
            options,
            defaultPlacement,
            defaultDuration
        )
        toast(
            <div className="bg-wood border border-wood-100 p-4">
                {typeof message === 'string' ? <span>{message}</span> : message}
            </div>
            , {
                position,
                duration,
                icon: icon || null,
            }
        )
    }

    const epic = (options: ToastOptions) => {

        const {message, position, duration, icon} = normalizeOptions(
            options,
            defaultPlacement,
            defaultDuration
        )

        toast.custom(
            () => (
                <ToastContainer
                    className="bg-wood border border-gold glow-animation">
                    {typeof message === 'string' ? <span>{message}</span> : message}
                </ToastContainer>
            ), {
                position,
                duration,
                icon: icon || null,
                dismissible: true,
            }
        )
    }

    const success = (options: ToastOptions) => {
        const {message, position, duration, icon} = normalizeOptions(
            options,
            defaultPlacement,
            defaultDuration
        )
        toast.success(
            <ToastContainer className="bg-moss border border-moss">
                {(typeof message === 'string' ? <span>{message}</span> : message)}
            </ToastContainer>
            , {
                position,
                duration,
                icon: icon || null,
            }
        )
    }

    const error = (options: ToastOptions) => {
        const {message, position, duration, icon} = normalizeOptions(
            options,
            defaultPlacement,
            defaultDuration
        )
        toast.error(
            <ToastContainer className="bg-red-500 border border-red-400">
                {(typeof message === 'string' ? <span>{message}</span> : message)}
            </ToastContainer>
            , {
                position,
                duration,
                icon: icon || null,
            }
        )
    }

    return {
        toastDefault,
        epic,
        success,
        error,
    }
}

function ToastContainer({children, className}: { children: ReactNode, className: string }) {
    return (
        <div className={'flex gap-2 items-center justify-between p-4 rounded text-default ' + className}>
            {children}
        </div>
    )
}

function normalizeOptions(
    options: ToastOptions,
    defaultPlacement: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "top-center" | "bottom-center",
    defaultDuration: number
) {
    if (typeof options === "string") {

        return {
            message: options,
            position: defaultPlacement,
            duration: defaultDuration,
            icon: null,
        }
    } else if (

        options &&
        typeof options === "object" &&
        !Array.isArray(options) &&
        "message" in options
    ) {
        return {
            message: options.message,
            position: options.position ?? defaultPlacement,
            duration: options.duration ?? defaultDuration,
            icon: options.icon ?? null,
        }
    } else {

        return {
            message: options,
            position: defaultPlacement,
            duration: defaultDuration,
            icon: null,
        }
    }
}
