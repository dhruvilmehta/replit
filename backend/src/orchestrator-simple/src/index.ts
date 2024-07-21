import { Router } from "express";
import fs from "fs";
import yaml from "yaml";
import path from "path";
import { KubeConfig, AppsV1Api, CoreV1Api, NetworkingV1Api } from "@kubernetes/client-node";
import prisma from "../../prisma";

export const serviceRouter=Router()

const kubeconfig = new KubeConfig();
kubeconfig.loadFromDefault();
const coreV1Api = kubeconfig.makeApiClient(CoreV1Api);
const appsV1Api = kubeconfig.makeApiClient(AppsV1Api);
const networkingV1Api = kubeconfig.makeApiClient(NetworkingV1Api);

// Updated utility function to handle multi-document YAML files
const readAndParseKubeYaml = (filePath: string, replId: string): Array<any> => {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const docs = yaml.parseAllDocuments(fileContent).map((doc) => {
        let docString = doc.toString();
        const regex = new RegExp(`service_name`, 'g');
        const aws_key = new RegExp(`access_key`, 'g');
        const aws_secret = new RegExp(`key_secret`, 'g');
        console.log(process.env.AWS_ACCESS_KEY_ID, process.env.AWS_SECRET_ACCESS_KEY)
        docString = docString.replace(aws_key, process.env.AWS_ACCESS_KEY_ID || "")
        docString = docString.replace(aws_secret, process.env.AWS_SECRET_ACCESS_KEY || "")
        docString = docString.replace(regex, replId);
        console.log(docString);
        return yaml.parse(docString);
    });
    return docs;
};

serviceRouter.post("/start", async (req, res) => {
    const { userId, replId } = req.body; // Assume a unique identifier for each user
    const namespace = "default"; // Assuming a default namespace, adjust as needed
    const repl=await prisma.repl.findFirst({
        where:{
            name: replId
        }
    })
    // if(repl) res.status(200).json({message: "Repl exists!!"});
    const deployments = await appsV1Api.listNamespacedDeployment(namespace);
        
    // Check if the deployment with the specified name exists
    const exists = deployments.body.items.some(deployment => deployment.metadata?.name === replId);
    if(exists) return res.status(200).json({message: "Repl exists!!"});

    try {
        const kubeManifests = readAndParseKubeYaml(path.join(__dirname, "../service.yaml"), replId);
        for (const manifest of kubeManifests) {
            switch (manifest.kind) {
                case "Deployment":
                    await appsV1Api.createNamespacedDeployment(namespace, manifest);
                    break;
                case "Service":
                    await coreV1Api.createNamespacedService(namespace, manifest);
                    break;
                case "Ingress":
                    await networkingV1Api.createNamespacedIngress(namespace, manifest);
                    break;
                default:
                    console.log(`Unsupported kind: ${manifest.kind}`);
            }
        }
        return res.status(200).json({ message: "Resources created successfully" });
    } catch (error) {
        console.error("Failed to create resources", error);
        return res.status(500).json({ message: "Failed to create resources" });
    }
});
