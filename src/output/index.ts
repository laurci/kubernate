import cache, {ResourcesBundle} from "./cache";
import {writeFile} from "fs/promises";
import * as fs from "fs";
import {dirname} from "path";
import {OutputTransformer} from "./transformer";

export * from "./transformer";

const getOutputAsFile = (bundle: ResourcesBundle, transformers: OutputTransformer[] = []) => {
    const yamls = bundle.renderAsYaml(transformers);
    return yamls.join("---\n");
};

export interface OutputOptions {
    transformers?: OutputTransformer[];
    source?: ResourcesBundle;
}

const output = {
    bundle(options?: OutputOptions) {
        return getOutputAsFile(options?.source ?? cache, options?.transformers ?? []);
    },
    async bundleToDisk(path: string, options?: OutputOptions) {
        const bundle = getOutputAsFile(options?.source ?? cache, options?.transformers ?? []);

        if (fs.existsSync(dirname(path))) {
            fs.mkdirSync(dirname(path), {recursive: true});
        }

        await writeFile(path, bundle);
        return bundle;
    },
    resetBundle() {
        cache.reset();
    },
    makeEmptyBundle() {
        return new ResourcesBundle();
    },
};

export default output;
