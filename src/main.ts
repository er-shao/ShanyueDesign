import "./assets/main.css";
import 'virtual:uno.css'

import './request';
import "./LeaferEditor/layouts/api/mock";

import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import i18n from "./i18n";
import ArcoVue from "@arco-design/web-vue";
import ArcoVueIcon from '@arco-design/web-vue/es/icon';
import "@arco-design/web-vue/dist/arco.css";

import { createLeaferEditor } from "./LeaferEditor";

import Dialog from "./LeaferEditor/layouts/components/dialog";

const app = createApp(App);
const leaferEditor = createLeaferEditor();
app.use(leaferEditor, {
    width: 1000,
    height: 1000,
    fill: "#f5f7fd",
    // disabledMove: true,
    // disabledWheel: true,
    // zoomMode: "mouse",
    historyMaxSize: 50,
    lockRatio: "corner",
    // rulerEnabled: false,
    // pageAddable: false,
    rulerDPI: 96,
    // gridStrokeColor: "#ccc",
    gridStrokeDragColor: "#ff0800ff",
    uploadImageCallback: (file, sourceTag) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // reject("上传超时");
                console.log("uploading", file, sourceTag);

                const img = new Image();
                // 创建对象URL
                const url = URL.createObjectURL(file);
                img.onload = () => {
                    // 获取宽高
                    const width = img.naturalWidth;
                    const height = img.naturalHeight;
                    // 释放对象URL
                    // URL.revokeObjectURL(url);
                    resolve({ url, width, height });
                };
                img.onerror = reject;
                img.src = url;
            }, 100);
        })
    },
    // openImageEnableLocalLoader: false,
    imageFileTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxImageSize: 100 * 1024 * 1024, // 100MB
});
app.use(i18n);
app.use(router);
app.use(ArcoVue);
app.use(ArcoVueIcon);
app.use(Dialog);

app.config.errorHandler = (err, vm, info) => {
    console.error("Global Error:", err, vm, "; \n", "Component Info:", info);
};

app.mount("#app");
