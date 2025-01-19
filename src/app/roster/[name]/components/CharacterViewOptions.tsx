'use client'
import {type ReactNode, useState} from "react";


const Option = ({label, selected, onClick}: {
	label: string,
	children: ReactNode,
	selected: boolean,
	onClick: () => void
}) => {
	return (
		<button
			className={`flex w-fit whitespace-pre flex-col flex-1 items-center ${selected ? 'text-[#404040]' : 'text-gold'} text-xl font-bold py-2 px-3 transition-all max-h-10
                            ${selected ? 'bg-gold' : 'bg-transparent'} border ${!selected ? 'border-transparent' : 'border-gold-100'}
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
			{top && <div
              className="block w-full h-11 mb-2">
              <div className="flex my-4 gap-3 w-full justify-between overflow-auto scrollbar-pill h-10">
				  {availableOptions.map((option, index) => (
					  <Option key={index}
					          label={option}
					          selected={selectedOption === option}
					          onClick={() => setSelectedOption(option)}>
						  {option}
					  </Option>
				  ))}
              </div>
            </div>}
			{
				<div key={selectedOption}
				     className={innerContainerClassName}
				>
					{(items.find(item => item.label === selectedOption)?.children)}
				</div>
			}
			{bottom && <div className="flex my-4 gap-3 w-full justify-between overflow-auto scrollbar-pill h-10">
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
