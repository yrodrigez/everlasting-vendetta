import { Select as HUISelect, type SelectProps } from "@heroui/react"

export function Select<T extends object>({ children, classNames, ...props }: SelectProps<T>) {
    return (
        <HUISelect
            {...props}
            classNames={{
                trigger: 'text-default transition-all duration-200 bg-wood-900 border border-wood-100 text-default hover:border-wood-100 focus:border-wood-100 focus:ring-2 focus:ring-wood-100 data-[hover=true]:border-wood-100 data-[hover=true]:bg-wood',
                value: 'text-default group-data-[filled="true"]:text-default group-data-[has-value=true]:text-default group-data-[filled="true"]:text-default',
                label: 'text-default group-data-[filled="true"]:text-default/60',
                description: 'text-default',
                popoverContent: 'bg-wood-900 border border-wood-100 text-default',
                ...classNames,
            }}
        >
            {children}
        </HUISelect>
    )
}