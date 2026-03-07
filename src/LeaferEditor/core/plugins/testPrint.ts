import type { IPlugin, IPluginHost, ILeaferEditor } from "../interfaces";
import { PluginEvent } from "../interfaces";

export class TestPrint implements IPlugin {
    name = "testPrint";
    description = "A test plugin for printing console log";
    version = "1.0.0";

    install(host: IPluginHost<ILeaferEditor>, options?: any) {
        console.log("TestPrint plugin installed");
        console.log("Host:", host);
        console.log("Options:", options);
        console.log();
        const editor = host.getInstance();
        editor.contentFrame.add({
            "tag": "Image",
            "url": "/1.png",
            "id": "019bbfd2-7b25-763f-82c2-fb6ff164f660",
            "name": "Image 15",
            "zIndex": 3,
            "x": 90.36144578313252,
            "y": 196.45799786107926,
            "width": 309.8673033437398,
            "height": 309.8673033437398,
            "editable": true
        })
        host.hook(PluginEvent.install, (payload) => {
            console.log("TestPrint plugin installed:", payload.plugin.name);
        })
    }
}