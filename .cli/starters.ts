import type { StarterConfig } from "~/src/entities/Starters";
import generators from "./generators";
import inits from "./inits";
import reactDefault from "./templates/default/starters/reactDefault";

const config: StarterConfig = {
	inits,
	generators,
	starters: {
		reactDefault,
	},
};

export default config;
