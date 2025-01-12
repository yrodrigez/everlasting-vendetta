import {useModal} from "@hooks/useModal";
import {ReactNode} from "react";
import {Button} from "@nextui-org/react";

export function useMessageBox() {

    const {
        setModalTitle,
        setModalHeader,
        setModalBody,
        setModalFooter,
        open: openModal,
        setModalIsDismissable,
        setModalHideCloseButton,
        setModalClassName,
        setModalSize,
        close: onClose,
        reset
    } = useModal()

    return {
        alert: (data: string | {
            message: string | ReactNode,
            title?: string,
            type?: 'success' | 'error' | 'epic' | 'window'
        }) => {
            const {message, title, type = 'success'} = typeof data === 'string' ? {message: data} : data
            reset()
            if (title) {
                setModalTitle(title)
                setModalHeader(title)
            }
            setModalIsDismissable(false)
            setModalHideCloseButton(true)
            setModalBody(message)
            setModalFooter(null)
            if (type === 'error') {
                setModalClassName('bg-red-600 text-white border-red-400')
            }
            if (type === 'epic') {
                setModalClassName('border-gold glow-animation')
            }
            if(type !== 'window') {
                setModalFooter(
                    <div
                        className="float-right"
                    >
                        <Button className="bg-moss text-gold border border-moss-100 float-right rounded"
                                onPress={onClose}>OK</Button>
                    </div>
                )
            } else {
                setModalFooter(null)
                setModalHideCloseButton(false)
                setModalSize('4xl')
            }
            openModal()
        },
        yesNo: async ({message, title, yesText = 'Yes', noText = 'No', modYes = 'default', modNo = 'danger'}: {
            message: string | ReactNode,
            title?: string,
            yesText?: string,
            noText?: string,
            modYes?: "success" | "default" | "primary" | "secondary" | "warning" | "danger",
            modNo?: "success" | "default" | "primary" | "secondary" | "warning" | "danger"
        }): Promise<'yes' | 'no'> => {
            reset()
            return new Promise((resolve) => {
                if (title) {
                    setModalTitle(title)
                    setModalHeader(title)
                }

                const classNameYes = `${modYes === 'default' ? 'bg-moss border border-moss-100 text-gold' : modYes === 'danger' ? 'bg-red-600 border border-red-400' : ''}`
                const classNameNo = `${modNo === 'default' ? 'bg-moss border border-moss-100 text-gold' : modNo === 'danger' ? 'bg-red-600 border border-red-400' : ''}`
                setModalBody(message)
                setModalIsDismissable(false)
                setModalHideCloseButton(true)
                setModalFooter(
                    <>
                        <Button
                            className={`rounded ${classNameNo}`}
                            color={modNo} onPress={() => {
                            onClose()
                            resolve('no')
                        }}>{noText}
                        </Button>
                        <Button
                            className={`rounded ${classNameYes}`}
                            color={modYes} onPress={() => {
                            onClose()
                            resolve('yes')
                        }}>{yesText}
                        </Button>
                    </>
                )
                openModal()
            })
        }
    }
}
