import { setupServer } from "msw/node";
import { eventHandlers } from "./handlers/events.handlers";

export const server = setupServer(...eventHandlers);
