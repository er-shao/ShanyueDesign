/// <reference types="vite/client" />

/* eslint-disable */
declare module '*.vue' {
    import type { DefineComponent } from 'vue'
    const component: DefineComponent<{}, {}, any>
    export default component
}
// // 声明 *.svg 文件为 Vue 组件
// declare module '*.svg' {
//     import type { DefineComponent } from 'vue'
//     const component: DefineComponent
//     export default component
// }