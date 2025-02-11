import {Button as MuiButton, type ButtonProps} from "@heroui/react";
import {type ReactNode} from "react";


export function Button({children, ...props}: { children?: ReactNode } & ButtonProps) {

	const defaultClassNames = props.color ? '' : 'bg-moss text-gold rounded border border-moss-100'

	if (props.variant) {
		// do nothing
	} else if (props.className) {
		props.className = `${defaultClassNames} ${props.className}`
	} else {
		props.className = defaultClassNames
	}

	if(props.color === 'danger') {
		props.className = `${defaultClassNames} bg-red-700 text-white border border-red-600 ${props.className? props.className : ''}`
		props.color = undefined
	}

	if(props.color === 'success') {
		props.className = `${defaultClassNames} bg-green-800 text-white border border-green-700 ${props.className? props.className : ''}`
		props.color = undefined
	}

	return <MuiButton {...props}>{children}</MuiButton>;
}
