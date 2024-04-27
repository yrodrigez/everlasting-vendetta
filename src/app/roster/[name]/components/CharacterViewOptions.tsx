'use client'
import {type ReactNode, useState} from "react";


export function CharacterViewOptions({items, top, bottom, containerClassName}: {
    items: {
        label: string
        name: string,
        children: ReactNode
    }[]
    top?: boolean
    bottom?: boolean
    containerClassName?: string
}) {
    const [selectedOption, setSelectedOption] = useState(items[0].label)
    const availableOptions = items.map(item => item.label)

    top = top || !top && !bottom
    bottom = bottom || !top

    return (
        <div className={containerClassName}>
            {top && <div className="flex p-4 gap-3 lg:w-full">
                {availableOptions.map((option, index) => (
                    <button key={index}
                            className={`flex flex-col flex-1 items-center ${selectedOption === option ? 'text-[#404040]' : 'text-gold'} text-xl font-bold py-2 px-3 transition-all
                            ${selectedOption === option ? 'bg-gold' : 'bg-transparent'} ${selectedOption === option ? 'border-b-2 border-gold' : 'border-b-2 border-transparent'}
                            hover:text-gold hover:bg-gold hover:bg-opacity-20 focus:outline-none focus:text-ocean focus:bg-gold border-b-2 border-transparent rounded
                                                        `}
                            onClick={() => setSelectedOption(option)}>
                        <span className="text-sm">{option}</span>
                    </button>
                ))}
            </div>}
            {
                <div key={selectedOption}>
                    {(items.find(item => item.label === selectedOption)?.children)}
                </div>
            }
            {bottom && <div className="flex p-4 gap-3 lg:w-full">
                {availableOptions.map((option, index) => (
                    <button key={index}
                            className={`flex flex-col flex-1 items-center ${selectedOption === option ? 'text-[#404040]' : 'text-gold'} text-xl font-bold py-2 px-3 transition-all
                            ${selectedOption === option ? 'bg-gold' : 'bg-transparent'} ${selectedOption === option ? 'border-b-2 border-gold' : 'border-b-2 border-transparent'}
                            hover:text-gold hover:bg-gold hover:bg-opacity-20 focus:outline-none focus:text-ocean focus:bg-gold border-b-2 border-transparent rounded
                                                        `}
                            onClick={() => setSelectedOption(option)}>
                        <span className="text-sm">{option}</span>
                    </button>
                ))}
            </div>}
        </div>
    )
}
