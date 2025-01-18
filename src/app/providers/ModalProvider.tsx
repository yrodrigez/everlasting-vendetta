import * as React from "react";
import type {ReactNode} from "react";
import {Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure} from "@nextui-org/react";

export const ModalContext = React.createContext({
    isOpen: false,
    onOpen: () => {
    },
    onClose: () => {
    },
    setHeader: (header?: ReactNode) => {
    },
    setBody: (body?: ReactNode) => {
    },
    setFooter: (footer?: ReactNode) => {
    },
    isDismissable: true,
    setIsDismissable: (isDismissable: boolean) => {
    },
    hideCloseButton: false,
    setHideCloseButton: (hideCloseButton: boolean) => {
    },
    setTitle: (title?: string) => {
    },
    setClassName: (className?: string) => {
    },
    setModalSize: (size?: "sm" | "md" | "lg" | "xl" | "2xl" | "xs" | "3xl" | "4xl" | "5xl" | "full" | undefined) => {
    },
    setModalPlacement: (placement?: "center" | "auto" | "top" | "top-center" | "bottom" | "bottom-center") => {
    },
    reset: () => {
    }
})

export function ModalProvider({children}: { children: ReactNode }) {
    const {isOpen, onOpen, onClose, onOpenChange, } = useDisclosure()
    const [header, setHeader] = React.useState<ReactNode | null>(null)
    const [body, setBody] = React.useState<ReactNode | null>(null)
    const [footer, setFooter] = React.useState<ReactNode | null>(null)
    const [isDismissable, setIsDismissable] = React.useState(true)
    const [hideCloseButton, setHideCloseButton] = React.useState(false)
    const [title, setTitle] = React.useState<string | undefined>('')
    const [className, setClassName] = React.useState<string | undefined>('bg-wood border border-wood-100 text-common')
    const [size, setModalSize] = React.useState<"sm" | "md" | "lg" | "xl" | "2xl" | "xs" | "3xl" | "4xl" | "5xl" | "full" | undefined>('lg')
    const [placement, setModalPlacement] = React.useState<"center" | "auto" | "top" | "top-center" | "bottom" | "bottom-center" | undefined>('center')

    return (
        <>
            <ModalContext.Provider value={{
                isOpen,
                onOpen,
                onClose,
                setHeader,
                setBody,
                setFooter,
                isDismissable,
                setIsDismissable,
                hideCloseButton,
                setHideCloseButton,
                setTitle,
                setClassName,
                setModalSize,
                setModalPlacement,
                reset: () => {
                    setHeader(null)
                    setBody(null)
                    setFooter(null)
                    setIsDismissable(true)
                    setHideCloseButton(false)
                    setTitle(undefined)
                    setClassName(undefined)
                    setModalSize('lg')
                    setModalPlacement('center')
                }
            }}>
                {children}
                <Modal
                    onOpenChange={onOpenChange}
                    className={className}
                    isOpen={isOpen}
                    onClose={onClose}
                    title={title}
                    hideCloseButton={hideCloseButton}
                    isDismissable={isDismissable}
                    size={size}
                    placement={placement}
                >
                    <ModalContent>
                        {() => (
                            <>
                                {header && (
                                    <ModalHeader>
                                        {header}
                                    </ModalHeader>
                                )}
                                <ModalBody>
                                    {body}
                                </ModalBody>
                                {footer && (
                                    <ModalFooter>
                                        {footer}
                                    </ModalFooter>
                                )}
                            </>
                        )}
                    </ModalContent>
                </Modal>
            </ModalContext.Provider>
        </>
    )
}
