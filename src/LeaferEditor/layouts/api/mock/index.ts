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

import templateData from "./data/templateData.json";
import imageData from "./data/imageData.json";
import elementData from "./data/elementData.json";
import fontsData from "./data/fonts.json";

const mock = new MockAdapter(axios);
export const successResponseWrap = (data: any) => {
    return {
        code: 200,
        msg: "操作成功",
        data,
    };
};

mock.onGet(templateListURL).reply(() => {
    return [200, successResponseWrap(templateData.list)];
});
mock
    .onGet(imageMaterialListURL)
    .reply(200, successResponseWrap(imageData.list));
mock.onGet(materialURL).reply(200, successResponseWrap(elementData.list));
mock.onGet(fontListURL).reply(200, successResponseWrap(fontsData.list));

mock.onPost(uploadURL).reply(200, successResponseWrap({}));
mock.onPost(uploadMaterialURL).reply(200, successResponseWrap({}));