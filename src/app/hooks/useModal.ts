import {useContext} from "react";
import {ModalContext} from "@/app/providers/ModalProvider";

export function useModal() {
    const {
        onOpen: openModal,
        onClose: closeModal,
        isOpen,
        setTitle:setModalTitle,
        setHeader: setModalHeader,
        setBody: setModalBody,
        setFooter: setModalFooter,
        setClassName: setModalClassName,
        setIsDismissable: setModalIsDismissable,
        setHideCloseButton: setModalHideCloseButton,
        setModalPlacement,
        setModalSize,
        reset
    } = useContext(ModalContext)

    return {
        open: openModal, close: closeModal, isOpen, setModalTitle, setModalHeader, setModalBody, setModalFooter, setModalClassName, setModalIsDismissable, setModalHideCloseButton,
        setModalPlacement, setModalSize, reset
    }
}
