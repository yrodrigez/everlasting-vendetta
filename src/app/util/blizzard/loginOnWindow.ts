import {BNET_COOKIE_NAME} from "@/app/util/constants";

export const openAuthWindow = (url: string, name: string, width: number, height: number) => {
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2.5;

    return window.open(url, name, `width=${width},height=${height},top=${top},left=${left},scrollbars=yes`);
};

export const createHandleAuthMessage = (event: MessageEvent, callback: () => void) =>  {
    if (event.origin !== window.location.origin) {
        return;
    }

    if (event.data === BNET_COOKIE_NAME) {
        callback()
    }
}
