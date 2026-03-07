import axios from "axios";
import { uploadURL, uploadMaterialURL } from "./url";
import type { Response } from "../../types/response";

/**
 * 上传文件
 * @param req
 */
export function uploadFile(req: any): Promise<Response> {
    return axios.post(uploadURL, req);
}

/**
 * 上传素材
 * @param req
 */
export function uploadMaterial(req: any): Promise<Response> {
    return axios.post(uploadMaterialURL, req);
}
