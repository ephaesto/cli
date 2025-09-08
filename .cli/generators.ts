import type { GeneratorsConfig } from "~/src/entities/Generators";
import component from "./templates/component";
import controller from "./templates/controller";
import controllerff from "./templates/controllerff";

const config: GeneratorsConfig = {
	subGenConf: true,
	default: {
		controllerff,
	},
	react: {
		controllerff,
		controller,
		component,
	},
	testReact: {
		controllerff,
		controller,
		component,
	},
};

export default config;
