import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import {
    templateListURL,
    imageMaterialListURL,
    materialURL,
    fontListURL,
    uploadURL,
    uploadMaterialURL,
} from "../url";

// import templateData from "./data/templateData.json";
// import imageData from "./data/imageData.json";
// import elementData from "./data/elementData.json";
import fontsData from "./data/fonts.json";

const mock = new MockAdapter(axios);
export const successResponseWrap = (data: any) => {
    return {
        code: 200,
        msg: "操作成功",
        data,
    };
};

mock.onGet(templateListURL).reply(async () => {
    const templateData =  import("./data/templateData.json");
    const data = await templateData;
    return [200, successResponseWrap(data)];
});
mock.onGet(imageMaterialListURL).reply(async ()=>{
    const imageData = await import("./data/imageData.json");
    return [200, successResponseWrap(imageData.list)]
    });
mock.onGet(materialURL).reply(async () => {
    const elementData = await import("./data/elementData.json");
    return [200, successResponseWrap(elementData.list)];
});
mock.onGet(fontListURL).reply(200, successResponseWrap(fontsData.list));

mock.onPost(uploadURL).reply(200, successResponseWrap({}));
mock.onPost(uploadMaterialURL).reply(200, successResponseWrap({}));