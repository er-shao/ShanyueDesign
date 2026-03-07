import type { App, AppContext, RenderFunction } from "vue";
import { h, render } from "vue";
import _Dialog from "./dialog.vue";
import type { DialogReturn, DialogConfig } from "./interface";
import { isFunction } from "lodash";

const getOverlay = () => {
  const popper = document.createElement("div");
  popper.setAttribute("class", "overlay-dialog");
  return popper;
};

const getSlotFunction = (param: string | RenderFunction | undefined) => {
  if (param) {
    if (isFunction(param)) return param;
    return () => param;
  }
  return undefined;
};

const open = (config: DialogConfig, appContext?: AppContext): DialogReturn => {
  let container: HTMLElement | null = getOverlay();

  const { hideClose, top, left, width, height } = config;

  const vm = h(
    _Dialog,
    {
      hideClose,
      onClose: () => {
        if (container) {
          render(null, container);
          document.body.removeChild(container);
        }
        container = null;

        if (config.onClose) {
          config.onClose();
        }
      },
      top,
      left,
      width,
      height,
    },
    {
      title: getSlotFunction(config.title),
      default: getSlotFunction(config.body),
    },
  );

  vm.appContext = appContext ?? Dialog._context ?? null;

  render(vm, container);
  document.body.appendChild(container);

  return {
    close: () => {
      if (vm.component) {
        vm.component.exposed?.handleClose();
      }
    },
  };
};

const Dialog = Object.assign(_Dialog, {
  open,
  _context: undefined as AppContext | undefined,
  // 添加 install 方法
  install: (app: App) => {
    Dialog._context = app._context; // 保存 app 上下文
    // app.component(Dialog.name || 'Dialog', Dialog)
  },
});


export default Dialog;
