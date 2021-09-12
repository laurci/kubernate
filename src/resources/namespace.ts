import kube, {ResourceCallOptions} from "../index";

const namespace = (name: string, options?: ResourceCallOptions) => {
    const resource = kube.core.v1.Namespace({metadata: {name}}, options);
    return resource.metadata?.name!!;
};

export default namespace;
