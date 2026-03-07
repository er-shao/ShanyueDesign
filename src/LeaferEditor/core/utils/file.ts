
/**
 * 将文件读取为DataURL
 * @param file 文件对象
 * @returns 文件的DataURL
 */
export async function readFileAsDataURL(file: File): Promise<{
    url: string;
    width: number;
    height: number;
    name?: string;
}> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const reader = new FileReader();
        reader.onload = (e) => {
            img.src = e.target?.result as string;
            img.onload = () => {
                const url = img.src;
                const width = img.width;
                const height = img.height;
                resolve({ url, width, height });
            };
        };
        reader.onerror = (e) => {
            reject(e);
        };
        reader.readAsDataURL(file);
    });
}
