import { appStore } from "../store/frame-store";

export const useContext = () => {
  return appStore();
};
