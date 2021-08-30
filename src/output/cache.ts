import {stringify} from "yaml";
import {OutputResource, OutputTransformer} from "./transformer";

export class ResourcesBundle {
    private resourceCache: OutputResource[] = [];

    get resources(): OutputResource[] {
        return this.resourceCache;
    }

    addResource(resource: OutputResource) {
        this.resourceCache.push(resource);
    }

    reset() {
        this.resourceCache = [];
    }

    renderAsYaml(transformers: OutputTransformer[] = []) {
        let resources = this.resourceCache;

        return transformers
            .reduce((resources, transformer) => resources.map((resource) => transformer(resource)), resources)
            .map((x) => stringify(x));
    }
}

const cache = new ResourcesBundle();

export default cache;
