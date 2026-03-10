import Image from "next/image";

export const ItemTooltip = ({item, qualityColor}: {
    item: { description: { icon: string, tooltip: string }, name: string },
    qualityColor: 'poor' | 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
}) => {

    return <div
        className={`flex gap-2 relative`}>
        <img src={item.description.icon} alt={item.name} width={40} height={40}
               className={`max-h-[40px] max-w-[40px] w-[40px] h-[40px] border border-${qualityColor} rounded absolute top-0 -left-10`}/>
        <div
            className={`bg-black border border-${qualityColor} rounded max-w-64 p-2`}
            dangerouslySetInnerHTML={{
                __html: item.description.tooltip
            }}/>
    </div>
}
