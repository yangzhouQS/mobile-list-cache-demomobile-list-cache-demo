export const setNavigationBarConfig = (config: any) => {
  if (window.iwop) {
    window.iwop.setNavigationBarConfig(config);
  }
};
