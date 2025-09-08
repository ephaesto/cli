import type { InitsConfig } from "~/src/entities/Inits";
import defaultInit from "./templates/inits/default/defaultInit";

const config: InitsConfig = {
	default: { initFn: defaultInit, nameDir: "defaultDir" },
};

export default config;
