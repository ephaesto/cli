import type { ExtractsConfig } from "~/src/entities/Extracts";
import component from "./templates/component";
import controller from "./templates/controller";
import controllerff from "./templates/controllerff";

const config: ExtractsConfig = {
	controllerff,
	controller,
	component,
};

export default config;
