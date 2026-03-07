import axios from "axios";
import type { PageParams } from "../../types/page";
import type { Response } from "../../types/response";
import { templateListURL, imageMaterialListURL, materialURL } from "./url";

/**
 * 模板数据
 * @param params
 */
export function queryTemplateList(params: PageParams): Promise<Response> {
    return axios.get(templateListURL, { data: params });
}

/**
 * 图片素材
 * @param params
 */
export function queryImageMaterialList(params: PageParams): Promise<Response> {
    return axios.get(imageMaterialListURL, { data: params });
}

/**
 * 元素分类
 * @param params
 */
export function queryMaterialList(params?: PageParams): Promise<Response> {
    return axios.get(materialURL, { data: params });
}
