import { ROOTS } from "~/src/const/roots";

export interface Roots {
	[ROOTS.PARENT]: string | null;
	[ROOTS.ROOT]: string | null;
}
