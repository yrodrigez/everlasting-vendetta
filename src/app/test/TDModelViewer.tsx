'use client'
import {useEffect, useState} from "react";
import {type WowModelViewer} from "wow-model-viewer/types/wow_model_viewer";

type GenerateModelsFunction = (aspect: number, containerSelector: string, model: {} | {
    id: number;
    type: number;
}) => Promise<WowModelViewer>;

export function TDModelViewer({items}: { items: number[][] }) {
    const [isClient, setIsClient] = useState(false);
    const [generateModels, setGenerateModels] = useState<GenerateModelsFunction | undefined>();

    useEffect(() => {
        const loadGenerateModels = async () => {
            // @ts-ignore
            window.CONTENT_PATH = `${window.location.origin}/api/v1/bypass/`;
            // @ts-ignore
            window.WOTLK_TO_RETAIL_DISPLAY_ID_API = `https://wotlk.murlocvillage.com/api/items`
            const {generateModels} = await import('wow-model-viewer');

            setGenerateModels(() => generateModels as GenerateModelsFunction);
        };

        if (typeof window !== 'undefined') {
            setIsClient(true);
            loadGenerateModels();
        }
    }, []);

    useEffect(() => {

        if (!isClient || !generateModels) return;

        const character = {
            "race": 4, // 7 is for Gnome, 1 is for Human, 3 is for Dwarf, 4 is for Night Elf
            "gender": 0, // 0 is male, 1 is female
            "skin": 4,
            "face": 0,
            "hairStyle": 2,
            "hairColor": 5,
            "facialStyle": 0,
            "items": items
        };

        let model: any;
        generateModels(1, '#model_3d', character).then((m) => {
            model = m
            model.setDistance(-5)
            model.setFullscreen(false)
        })

        return () => {
            if (model) {
                model.destroy()
            }
        }
    }, [generateModels])

    return null;
}
