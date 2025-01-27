'use client'
import {type ReactNode, useEffect, useMemo, useRef, useState} from "react";


const Controls = ({availableOptions, onSelect}: { availableOptions: string[], onSelect: (option: string) => void }) => {
	const [selectedOption, setSelectedOption] = useState(availableOptions[0])

	const ref = useRef<HTMLDivElement>(null)
	const containerRef = useRef<HTMLDivElement>(null)
	const timeout = useRef<NodeJS.Timeout>()

	const calculatePosition = () => {
		if(!ref.current || !containerRef.current) return
		ref.current.scrollIntoView({behavior: 'smooth', block: 'center'})
		const selectedElement = document.getElementById(selectedOption)
		if(!selectedElement) return
		const rect = selectedElement.getBoundingClientRect()
		const containerRect = containerRef.current.getBoundingClientRect()


		ref.current.style.left = `${rect.left - containerRect.left}px`

		if(timeout.current) clearTimeout(timeout.current)


		ref.current.style.width = `${rect.width}px`
	}

	window?.addEventListener('resize', calculatePosition)

	useEffect(()=> {calculatePosition()}, [selectedOption, ref.current, containerRef.current])

	return (
		<div className="block w-full h-11 mb-2">
			<div
				ref={containerRef}
				className="flex my-4 gap-3 w-full justify-between overflow-auto scrollbar-pill h-10 relative">
				<div
					ref={ref}
					className="absolute h-full bg-gold transition-all duration-400 rounded-lg border border-gold-100"/>
				{availableOptions.map((option, index) => (
					<button
						id={option}
						className={`flex w-fit whitespace-pre flex-col flex-1 items-center ${selectedOption === option ? 'text-wood-900' : 'text-gold'} text-xl font-bold py-2 px-3 transition-all max-h-10
                            ${selectedOption === option ? '' : 'bg-transparent hover:bg-opacity-20 hover:text-gold hover:border-gold-100 border-opacity-25'} border ${selectedOption!== option ? 'border-transparent' : 'border-gold-100'}
                             border-b-2 border-transparent rounded-lg z-10
                                                        `} key={index}
					        onClick={() => {
								setSelectedOption(option);
								onSelect(option)
							}}>
						<span className="text-sm">{option}</span>
					</button>
				))}

			</div>
		</div>
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
	const availableOptions = useMemo(() => items.map(item => item.label), [items])

	top = top || !top && !bottom
	bottom = bottom || !top

	return (
		<div className={containerClassName}>
			{top && <Controls availableOptions={availableOptions} onSelect={setSelectedOption}/>}
			{
				<div key={selectedOption}
				     className={innerContainerClassName}
				>
					{(items.find(item => item.label === selectedOption)?.children)}
				</div>
			}
			{bottom && <Controls availableOptions={availableOptions} onSelect={setSelectedOption}/>}
		</div>
	)
}
