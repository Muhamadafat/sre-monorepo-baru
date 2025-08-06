// lib/event-bus.ts
import mitt, { Emitter } from 'mitt';

type Events = {
  sessionCreated: void;
  sessionDeleted: string; // bisa pakai string atau { id: string } kalau mau fleksibel
  sessionUpdated: string;
  articleDeleted: void;
};

//  const eventBus = mitt<Events>();
const eventBus: Emitter<Events> = mitt<Events>();

export default eventBus;
