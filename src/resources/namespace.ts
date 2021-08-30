import kube from "../index";

const namespace = (name: string) => {
    const resource = kube.core.v1.Namespace({metadata: {name}});
    return resource.metadata?.name!!;
};

export default namespace;
