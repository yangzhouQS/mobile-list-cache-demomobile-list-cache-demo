import EventEmitter from "eventemitter2";

export type IPublicTypeDisposable = () => void;

export interface IPublicApiEvent {
  /**
   * 监听事件
   * add monitor to a event
   * @param event 事件名称
   * @param listener 事件回调
   */
  on: (event: string, listener: (...args: any[]) => void) => IPublicTypeDisposable;

  /**
   * 取消监听事件
   * cancel a monitor from a event
   * @param event 事件名称
   * @param listener 事件回调
   */
  off: (event: string, listener: (...args: any[]) => void) => void;

  /**
   * 触发事件
   * emit a message fot a event
   * @param event 事件名称
   * @param args 事件参数
   * @returns
   */
  emit: (event: string, ...args: any[]) => void;
}

export interface IEventBus extends IPublicApiEvent {
  removeListener: (event: string | symbol, listener: (...args: any[]) => void) => any;

  addListener: (event: string | symbol, listener: (...args: any[]) => void) => any;

  // 设置监听数量
  setMaxListeners: (n: number) => any;

  // 获取监听数量
  getMaxListeners: () => number;

  removeAllListeners: (event?: string | symbol) => any;
}

export class EventBus implements IEventBus {
  private readonly eventEmitter: EventEmitter;
  private readonly name?: string;
  private _len = 0;

  /**
   * 内核触发的事件名
   */
  readonly names = [];

  constructor(emitter: EventEmitter, name?: string) {
    this.eventEmitter = emitter;
    this.name = name;

    if (!this.name) {
      console.warn("prefix is required while initializing Event", `[${this.name ?? "事件名称"}]`);
    }
  }

  private getMsgPrefix(type: string): string {
    if (this.name && this.name.length > 0) {
      return `[${this.name}][event-${type}]`;
    } else {
      return `[*][event-${type}]`;
    }
  }

  /**
   * 监听事件
   * @param event 事件名称
   * @param listener 事件回调
   */
  on(event: string, listener: (...args: any[]) => void): () => void {
    // console.log('-----', this.name, this._len);
    this._len += 1;
    this.eventEmitter.on(event, listener);
    return () => {
      this.off(event, listener);
    };
  }

  /**
   * 取消监听事件
   * @param event 事件名称
   * @param listener 事件回调
   */
  off(event: string, listener: (...args: any[]) => void) {
    this._len -= 1;
    this.eventEmitter.off(event, listener);
  }

  /**
   * 触发事件
   * @param event 事件名称
   * @param args 事件参数
   * @returns
   */
  emit(event: string, ...args: any[]) {
    this.eventEmitter.emit(event, ...args);
  }

  removeListener(event: string | symbol, listener: (...args: any[]) => void): any {
    return this.eventEmitter.removeListener(event, listener);
  }

  addListener(event: string | symbol, listener: (...args: any[]) => void): any {
    return this.eventEmitter.addListener(event, listener);
  }

  setMaxListeners(n: number): any {
    return this.eventEmitter.setMaxListeners(n);
  }

  getMaxListeners(): number {
    return this.eventEmitter.getMaxListeners();
  }

  removeAllListeners(event?: string | symbol): any {
    return this.eventEmitter.removeAllListeners(event);
  }
}

export const createModuleEventBus = (moduleName: string, maxListeners?: number): EventBus => {
  const emitter = new EventEmitter();
  if (maxListeners) {
    emitter.setMaxListeners(maxListeners);
  }
  return new EventBus(emitter, moduleName);
};
