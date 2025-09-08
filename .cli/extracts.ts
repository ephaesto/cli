import type { ExtractConfig } from "~/src/entities/Extract";
import component from "./templates/component";
import controller from "./templates/controller";
import controllerff from "./templates/controllerff";

const config: ExtractConfig = {
	controllerff,
	controller,
	component,
};

export default config;
