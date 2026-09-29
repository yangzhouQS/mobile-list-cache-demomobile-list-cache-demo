import { showToast } from "@cs/nutui-pro";

export class GlobalToast {
  static text(message: string, options = {}) {
    showToast.text(message, options);
  }

  static success(message: string, options = {}) {
    showToast.success(message, options);
  }

  static error(message: string, options = {}) {
    showToast.fail(message, options);
  }

  static warn(message: string, options = {}) {
    showToast.warn(message, options);
  }

  static warning(message: string, options = {}) {
    showToast.warn(message, options);
  }

  static loading(message: string, options = {}) {
    showToast.loading(message, options);
  }

  static hide(id?: string) {
    showToast.hide(id);
  }
}
