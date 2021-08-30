import {Octokit} from "@octokit/rest";
import semver, {SemVer} from "semver";
import {exec, cd} from "shelljs";

const octokit = new Octokit({auth: process.env.GITHUB_TOKEN});

const KUBERNATE_RELEASE_REGEX = /v(.+) for Kubernetes (.+)/gi;

async function getReleaseBuckets(owner: string, repo: string) {
    const releasesResponse = await octokit.rest.repos.listReleases({owner, repo, per_page: 100});
    const releases = releasesResponse.data.filter((x) => !x.prerelease && semver.satisfies(x.tag_name, ">=1.19.0"));

    let releaseBuckets: {[key: string]: {version: SemVer; release: typeof releases[0]}} = {};

    for (let release of releases) {
        const version = semver.parse(release.tag_name);
        if (!version) continue;

        const bucket = `${version?.major}.${version?.minor}`;
        if (!releaseBuckets[bucket]) {
            releaseBuckets[bucket] = {version, release};
        } else {
            if (semver.gt(version, releaseBuckets[bucket].version)) {
                releaseBuckets[bucket] = {version, release};
            }
        }
    }

    return releaseBuckets;
}

async function main() {
    const kubernetesReleases = await getReleaseBuckets("kubernetes", "kubernetes");
    const kubernateReleases = await getReleaseBuckets("laurci", "kubernate");

    async function doRelease(kubernetesRelease: typeof kubernateReleases[0], kubernateRelease?: typeof kubernateReleases[0]) {
        const currentKubernateVersion =
            kubernateRelease?.version ?? semver.parse(`${kubernetesRelease.version.major}.${kubernetesRelease.version.minor}.0`);

        if (!currentKubernateVersion) {
            throw new Error(`Cannot create version for: ${kubernetesRelease.version.major}.${kubernetesRelease.version.minor}.0`);
        }

        const nextKubernateVersion = semver.inc(currentKubernateVersion, "patch")!;
        const nextKubernateReleaseName = `v${nextKubernateVersion} for Kubernetes ${kubernetesRelease.version.major}.${kubernetesRelease.version.minor}.${kubernetesRelease.version.patch}`;

        console.log("will release", nextKubernateVersion, nextKubernateReleaseName);

        exec(
            `yarn run schema:generate ${kubernetesRelease.version.major}.${kubernetesRelease.version.minor}.${kubernetesRelease.version.patch}`
        );
        exec(`yarn run build ${nextKubernateVersion}`);
        cd("dist");
        exec("npm publish");
        cd("..");
        exec(`yarn run clean`);

        await octokit.repos.createRelease({
            owner: "laurci",
            repo: "kubernate",
            tag_name: nextKubernateVersion.toString(),
            name: nextKubernateReleaseName,
        });
    }

    const kubernetesReleaseTags = Object.keys(kubernetesReleases);

    for (let kubernetesReleaseTag of kubernetesReleaseTags) {
        const kubernetesRelease = kubernetesReleases[kubernetesReleaseTag];
        const kubernateRelease = kubernateReleases[kubernetesReleaseTag];

        if (!kubernateRelease) {
            await doRelease(kubernetesRelease);
        } else {
            const [, , latestKubernetesVersionString] = KUBERNATE_RELEASE_REGEX.exec(kubernateRelease.release.name!) ?? [];
            if (!latestKubernetesVersionString) {
                throw new Error("Could not parse kubernetes version from Kubernate version: " + kubernateRelease.release.name);
            }

            const latestKubernetesVersion = semver.parse(latestKubernetesVersionString);

            if (!latestKubernetesVersion) {
                throw new Error("Could not parse kubernetes version from Kubernate version: " + kubernateRelease.release.name);
            }

            if (semver.gt(kubernetesRelease.version, latestKubernetesVersion)) {
                await doRelease(kubernetesRelease, kubernateRelease);
            }
        }
    }
}

main().catch(console.error);
