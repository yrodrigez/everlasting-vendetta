'use client'
import {type ReactNode, useState} from "react";


const Option = ({label, children, selected, onClick}: {
    label: string,
    children: ReactNode,
    selected: boolean,
    onClick: () => void
}) => {
    return (
        <button
            className={`flex flex-col flex-1 items-center ${selected ? 'text-[#404040]' : 'text-gold'} text-xl font-bold py-2 px-3 transition-all max-h-10
                            ${selected ? 'bg-gold' : 'bg-transparent'} ${selected ? 'border-b-2 border-gold' : 'border-b-2 border-transparent'}
                            hover:text-gold hover:bg-gold hover:bg-opacity-20 focus:outline-none focus:text-ocean focus:bg-gold border-b-2 border-transparent rounded
                                                        `}
            onClick={onClick}>
            <span className="text-sm">{label}</span>
        </button>
    )
}

export function CharacterViewOptions({items, top, bottom, containerClassName, innerContainerClassName}: {
    items: {
        label: string
        name: string,
        children: ReactNode
    }[]
    top?: boolean
    bottom?: boolean
    containerClassName?: string
    innerContainerClassName?: string
}) {
    const [selectedOption, setSelectedOption] = useState(items[0].label)
    const availableOptions = items.map(item => item.label)

    top = top || !top && !bottom
    bottom = bottom || !top

    return (
        <div className={containerClassName}>
            {top && <div className="flex p-4 gap-3 lg:w-full">
                {availableOptions.map((option, index) => (
                    <Option key={index}
                            label={option}
                            selected={selectedOption === option}
                            onClick={() => setSelectedOption(option)}>
                        {option}
                    </Option>
                ))}
            </div>}
            {
                <div key={selectedOption}
                        className={innerContainerClassName}
                >
                    {(items.find(item => item.label === selectedOption)?.children)}
                </div>
            }
            {bottom && <div className="flex p-4 gap-3 lg:w-full">
                {availableOptions.map((option, index) => (
                    <Option key={index}
                            label={option}
                            selected={selectedOption === option}
                            onClick={() => setSelectedOption(option)}>
                        {option}
                    </Option>
                ))}
            </div>}
        </div>
    )
}
