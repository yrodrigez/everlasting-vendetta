'use client'
import {useEffect, useState} from "react";
import {useCharacterItemsStore} from "@/app/roster/[name]/characterItemsStore";
import useScreenSize from "@/app/hooks/useScreenSize";


export function TDModelViewer({characterAppearance}: {
    characterAppearance: { race: number, gender: number }
}) {
    const [isClient, setIsClient] = useState(false);
    const items = useCharacterItemsStore(state => state.items);
    const [isLoading, setIsLoading] = useState(true);
    const [modelGenerator, setGenerateModels] = useState<any>(null);
    const {isDesktop} = useScreenSize();

    const loadGenerateModels = async () => {
        // @ts-ignore
        window.CONTENT_PATH = `${window.location.origin}/api/v1/bypass/`;
        // @ts-ignore
        window.WOTLK_TO_RETAIL_DISPLAY_ID_API = `https://wotlk.murlocvillage.com/api/items`

        const {modelGenerator} = await import('@/app/roster/[name]/components/ModelGenerator');

        setGenerateModels(() => modelGenerator);
    };

    useEffect(() => {
        if (!isDesktop) return;
        setIsClient(true);
        loadGenerateModels();
    }, [isDesktop, characterAppearance]);

    useEffect(() => {
        if (!isDesktop) return;
        if (!isClient || !modelGenerator) return;
        if (!items.length) return
        if (items.some((item: any) => item.loading)) return

        const effectiveItems = items.map((item: any) => {
            const {slot, displayId, details} = item
            switch (slot?.type) {
                case 'HEAD':
                    return [1, displayId]
                case 'SHOULDER':
                    return [3, displayId]
                case 'CHEST':
                    if (details?.item_subclass?.name.toLowerCase() === 'cloth' && !JSON.stringify(item ?? {}).toLowerCase().includes('vest')) {
                        return [20, displayId]
                    } else return [5, displayId]
                case 'WAIST':
                    return [6, displayId]
                case 'LEGS':
                    return [7, displayId]
                case 'FEET':
                    return [8, displayId]
                case 'WRIST':
                    return [9, displayId]
                case 'HANDS':
                    return [10, displayId]
                case 'BACK':
                    return [15, displayId]
                case 'MAIN_HAND':
                    return [17, displayId]
                case 'OFF_HAND':
                    return [22, displayId]
                default:
                    return null
            }
        }).filter(Boolean)

        const character = {
            ...characterAppearance,
            skin: 4, // min 0, max 11
            face: 9, // min 0, max 11
            hairStyle: 2, // min 0, max 26
            hairColor: 5,
            facialStyle: 0,
            items: effectiveItems
        };


        modelGenerator.generateModels(1, '#model_3d', character).then((model: any) => {
            const $element = document.getElementById('model_3d')
            if ($element) {
                $element.removeAttribute('style')
            }
            // @ts-ignore
            model?.setZoom(-8)
            model?.setOffset(0, -1.5)

            setIsLoading(!model)
        }).catch((error: any) => {
            console.error('Error generating model:', error)
            setIsLoading(false)
        })

    }, [items, characterAppearance, isClient, isDesktop])

    return !isDesktop ? null : isLoading ? (<div
        className="w-full h-full flex items-center justify-center absolute top-0 left-0 right-0 bottom-0 bg-dark rounded-lg bg-opacity-50 backdrop-filter backdrop-blur-md text-gold"
    >
        loading model...
    </div>) : null;
}
