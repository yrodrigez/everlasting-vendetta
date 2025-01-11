import {Button as MuiButton, type ButtonProps} from '@nextui-org/react';
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

	return <MuiButton {...props}>{children}</MuiButton>;
}
