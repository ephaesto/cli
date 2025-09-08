import { EventEmitter } from "node:events";

interface EventBus {
	[x: string]: EventEmitter;
}
const eventBus: EventBus = {};

export const createEventBus = (seed: string): void => {
	const emitter = new EventEmitter();
	emitter.setMaxListeners(100);
	eventBus[seed] = emitter;
};

export const getEventBus = (seed: string): EventEmitter => eventBus[seed];
