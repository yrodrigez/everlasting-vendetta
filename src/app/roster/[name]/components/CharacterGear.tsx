import CharacterItem from "@/app/components/CharacterItem";
import {TDModelViewer} from "@/app/roster/[name]/components/TDModelViewer";

export function CharacterGear({gear, token, characterName, characterAppearance}: {
    gear: { group1: any[], group2: any[], group3: any[] },
    token: string,
    characterName: string,
    characterAppearance: { race: number, gender: number }
}) {
    const {group1, group2, group3} = gear
    return (
        <div className="w-full h-full flex flex-col items-center">
            <div className="w-full flex justify-between items-center relative">
                <div
                    className="absolute top-0 left-0 right-0 bottom-0 overflow-hidden flex"
                >
                    <div
                        id="model_3d"
                        className="w-full h-full relative"
                    >
                        <TDModelViewer characterAppearance={characterAppearance}/>
                    </div>

                </div>
                <div className="flex flex-1 gap-4 flex-col">
                    {group1.map((item: any, index: number) => {
                        return <CharacterItem characterName={characterName} key={'item-' + index} item={item}
                                              token={token}/>
                    })}
                </div>

                <div className="flex flex-1 flex-col gap-4 self-baseline">
                    {group2.map((item: any, index: number) => {
                        return <CharacterItem characterName={characterName} key={'item-' + index} reverse item={item}
                                              token={token}/>
                    })}
                </div>
            </div>
            <div className="flex flex-1 gap-4">
                {group3.map((item: any, index: number) => {
                    return <CharacterItem characterName={characterName} key={'item-' + index} reverse={index === 0}
                                          bottom item={item}
                                          token={token}/>
                })}
            </div>
        </div>
    )
}
