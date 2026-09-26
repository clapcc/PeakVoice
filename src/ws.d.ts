declare module "ws" {
  import { EventEmitter } from "node:events";
  import type { IncomingMessage } from "node:http";

  class WebSocket extends EventEmitter {
    constructor(address: string, options?: { headers?: Record<string, string> });
    on(event: "open", listener: () => void): this;
    on(event: "message", listener: (data: Buffer, isBinary: boolean) => void): this;
    on(event: "error", listener: (err: Error) => void): this;
    on(event: "close", listener: () => void): this;
    on(
      event: "unexpected-response",
      listener: (req: unknown, res: IncomingMessage) => void,
    ): this;
    send(data: string | Buffer): void;
    close(): void;
  }

  export = WebSocket;
}
