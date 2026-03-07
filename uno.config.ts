// uno.config.ts
import { defineConfig, presetUno, presetIcons } from "unocss";
// 引入文件系统加载器
import { FileSystemIconLoader } from "@iconify/utils/lib/loader/node-loaders";

export default defineConfig({
  presets: [
    // 可选：保留基础原子类预设
    presetUno(),
    // 配置图标预设
    presetIcons({
      scale: 1.2, // 缩放比例
      extraProperties: {
        display: "inline-block",
        "vertical-align": "middle",
        // 默认尺寸和颜色继承
        width: "1em",
        height: "1em",
      },
      collections: {
        // 关键配置：'svg' 是自定义集合名称，可更改
        // './src/assets/icons' 是你的 SVG 图标存放目录
        svg: FileSystemIconLoader(
          "./src/LeaferEditor/layouts/assets/icons",
          // 可选：对 SVG 内容进行统一处理
          (svg) => {
            svg = svg.replace(/<svg([^>]*)>/i, (match, attributes) => {
              // 移除已有的 fill 属性，并添加 fill="currentColor"
              const newAttrs = attributes
                .replace(/\bfill\s*=\s*["'][^"']*["']/gi, "")
                .trim();
              return `<svg ${newAttrs} fill="currentColor">`;
            });

            // 2. 替换内部所有元素（如 <path>, <circle>）的 fill 属性
            // 注意：会跳过 fill="none" 的情况（通常用于描边图标）
            svg = svg.replace(
              /\bfill\s*=\s*["'](?!none)[^"']*["']/gi,
              'fill="currentColor"',
            );

            return svg;
          },
        ),
      },
    }),
  ],
});
