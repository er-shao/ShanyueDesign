import axios from "axios";
import type { PageParams } from "../../types/page";
import { fontListURL } from "./url";
/**
 * 获取字体
 * @param params
 */
export function getFonts(params: PageParams) {
    return axios.get(fontListURL, { data: params });
}