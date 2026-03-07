const FONT_CSS_TAG = "data-fonts"


export const defaultFonts = [
    {
        code: 'arial',
        name: 'Arial',
    },
    {
        code: 'Times New Roman',
        name: 'Times New Roman',
    },
    {
        code: 'Microsoft Yahei',
        name: '微软雅黑',
    },
];

export const fontList = [...defaultFonts];

/**
 * 批量添加自定义字体样式
 * @param fonts
 * @returns 已添加的所有字体列表
 */
export function addCustomFonts(fonts: any = []) {
    // 去除重复字体
    fonts = [...new Set(fonts)];
    // 去除已经添加的字体
    fonts = fonts.filter((font: any) => !fontList.some((item: any) => item.code === font.code));
    if (fonts.length === 0) {
        return fontList;
    }
    // 下载字体文件
    let styleTag = document.createElement('style');
    styleTag.setAttribute(FONT_CSS_TAG, 'true');
    let fontRules = fonts.map((font: any) => `@font-face {
        font-family: "${font.name}";
        src: local("${font.name}"), url("${font.download}")
    }`).join('\n');
    styleTag.textContent = fontRules;
    document.head.appendChild(styleTag);
    // console.log(styleTag);
    fontList.push(...fonts);

    // TODO 加载到系统字体库中
    return fontList;
}