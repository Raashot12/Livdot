import { setupWorker } from "msw/browser";
import { eventHandlers } from "./handlers/events.handlers";

export const worker = setupWorker(...eventHandlers);
