'use client'
import {generateModels} from 'wow-model-viewer';
import {type WowModelViewer} from 'wow-model-viewer/types/wow_model_viewer';

function deepEqual(obj1: any, obj2: any): boolean {
    if (obj1 === obj2) {
        return true;
    }

    if (obj1 == null || typeof obj1 !== 'object' || obj2 == null || typeof obj2 !== 'object') {
        return false;
    }

    if (Array.isArray(obj1) !== Array.isArray(obj2)) {
        return false;
    }

    let keys1 = Object.keys(obj1);
    let keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) {
        return false;
    }

    for (let key of keys1) {
        if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
            return false;
        }
    }

    return true;
}

class ModelGenerator {
    private isExecuting = false;
    private model: WowModelViewer | null = null;

    public generateModels = async (modelId: number, containerId: string, character = {}) => {
        if (this.isExecuting) return null;
        this.isExecuting = true;
        try {
            // @ts-ignore - model is a private property
            if (this.model && this.model.destroy) this.model.destroy();
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
export {modelGenerator};
