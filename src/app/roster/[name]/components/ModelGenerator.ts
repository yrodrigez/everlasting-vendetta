'use client'
import { generateModels } from 'wow-model-viewer';
import { type WowModelViewer } from 'wow-model-viewer/types/wow_model_viewer';



class ModelGenerator {
    private isExecuting = false;
    private model: WowModelViewer | null = null;

    constructor(private readonly character: { id: number, [key: string]: any } = { id: 0 }) { }

    public destroy() {
        // @ts-ignore - prevent multiple instances
        this.model?.destroy?.();
        this.model = null;
    }

    private isCharacterEqual(charA: { id: number, [key: string]: any }, charB: { id: number, [key: string]: any }) {
        charA = charA || { id: 0 };
        charB = charB || { id: 0 };

        return charA.id === charB.id;
    }

    public generateModels = async (modelId: number, containerId: string, character: { id: number, [key: string]: any } = { id: 0 }) => {
        if (this.isExecuting) return null;
        this.isExecuting = true;
        try {
            
            if (this.model && this.isCharacterEqual(this.character, character)) {
                return this.model;
            }

            this.model = await generateModels(modelId, containerId, character);
            return this.model;
        } catch (error) {
            console.error("Error generating models:", error);
            return null;
        } finally {
            this.isExecuting = false;
        }
    };
}

const modelGenerator = new ModelGenerator();
export { modelGenerator };

