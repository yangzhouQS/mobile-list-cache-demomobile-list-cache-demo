// global JSX namespace registration
// somehow we have to copy=pase the jsx-runtime types here to make TypeScript happy
import type { VNode, ReservedProps, NativeElements } from "vue";
import { IEventBus } from "./utils";

declare global {
  const dayjs: typeof dayjs;
  const vue: typeof vue;

  interface HTMLCollection {
    [Symbol.iterator](): IterableIterator<Element>;
  }

  const process: {
    env: {
      NODE_ENV: string;
    };
  };

  namespace JSX {
    interface IntrinsicAttributes {
      [emit: string]: any;
    }
  }

  /*namespace JSX {
    export type Element = VNode;

    interface IntrinsicElements {
      [elemName: string]: any;
    }

    interface IntrinsicAttributes {
      class?: any;
      style?: any;
    }

    export interface ElementClass {
      $props: {
        [name: string]: any;
      };

      [name: string]: any;
    }

    export interface ElementAttributesProperty {
      $props: {
        [name: string]: any;
      };
    }

    export interface IntrinsicElements extends NativeElements {
      [name: string]: any;
    }

    export interface IntrinsicElementAttributes extends NativeElements {
      [name: string]: any;
    }

    export type IntrinsicAttributes = ReservedProps;
  }*/

  interface Window {
    iwop: any;
    AssemboxMobile: any;
    AssemComponentLibs: any;
    thirdPartyDeps: any;
    Vue: any;
    ExcelConduct: any;
    printCore: any;
    AssemGlobalNotify: IEventBus;
    assemBoxIsEdit: boolean;
    CLODOP: boolean;
  }
}

declare module "@vue/runtime-dom" {
  interface HTMLAttributes {
    [attr: string]: any;
  }

  interface CSSProperties {
    [attr: string]: any;
  }
}

declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    // todo
    [x: string]: any;
  }
}
