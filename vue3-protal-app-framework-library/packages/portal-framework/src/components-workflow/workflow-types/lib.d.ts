import { ComponentPublicInstance } from "vue";

declare module "@cs/assembox-mobile" {
  // export const AssemPlugin: Function;
  // export const getAssemCore: Function;
  export const views: ComponentPublicInstance;

  export const utils: Record<string, any>;
}
