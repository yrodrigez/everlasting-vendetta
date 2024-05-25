import { Button as MuiButton } from '@nextui-org/react';
import {ReactNode} from "react";


export function Button ({ children, ...props }: { children?: ReactNode, [key: string]: any}) {

    const defaultClassNames = 'bg-moss text-gold rounded'

    if (props.className) {
        props.className = `${defaultClassNames} ${props.className}`
    } else {
        props.className = defaultClassNames
    }

    return <MuiButton {...props}>{children}</MuiButton>;
}
