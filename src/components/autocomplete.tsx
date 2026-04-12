import { Autocomplete as HUIAutocomplete, AutocompleteItem, AutocompleteSection, type AutocompleteProps } from "@heroui/react"

export { AutocompleteItem, AutocompleteSection }

export function Autocomplete<T extends object>({ children, classNames, inputProps, selectorButtonProps, ...props }: AutocompleteProps<T>) {
    return (
        <HUIAutocomplete
            {...props}
            classNames={{
                base: 'text-default',
                popoverContent: 'bg-wood-900 border border-wood-100 text-default',
                selectorButton: '!text-default',
                ...classNames,
            }}
            selectorButtonProps={{
                ...selectorButtonProps,
                className: `!text-default !bg-transparent ${selectorButtonProps?.className ?? ''}`,
            }}
            inputProps={{
                ...inputProps,
                classNames: {
                    inputWrapper: '!bg-wood-900 border border-wood-100 text-default data-[hover=true]:!bg-wood data-[hover=true]:border-wood-100 group-data-[focus=true]:!bg-wood-900 group-data-[focus=true]:border-wood-100',
                    input: '!text-default placeholder:text-default/50 group-data-[has-value=true]:!text-default group-data-[filled=true]:!text-default',
                    label: '!text-default group-data-[filled=true]:!text-default/60',
                    ...(inputProps?.classNames ?? {}),
                },
            }}
        >
            {children}
        </HUIAutocomplete>
    )
}
