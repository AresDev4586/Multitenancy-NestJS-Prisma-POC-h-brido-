import { AsyncLocalStorage } from 'async_hooks';

export interface RequestContextData {
  tenantId: string;
  userId?: string;
}

export class RequestContext {
  private static storage = new AsyncLocalStorage<RequestContextData>();

  static run(data: RequestContextData, callback: () => void) {
    this.storage.run(data, callback);
  }

  static get(): RequestContextData | undefined {
    return this.storage.getStore();
  }
}
