<template>
    <a-popover trigger="click" position="bottom">
        <a-button class="icon-btn">
            <icon-folder class="m-r-2px" :size="17" />
            {{ $t('header.filePopover.file') }}
            <icon-down class="m-l-2px" />
        </a-button>
        <template #content>
            <div>
                <ul>
                    <li @click="openImage">
                        <icon-upload class="m-r-5px" />
                        {{ $t('header.filePopover.insertImage') }}
                    </li>
                    <li @click="fileOperPSD()">
                        <icon-import class="m-r-5px" />
                        {{ $t('header.filePopover.importPSD') }}
                    </li>
                    <li @click="fileOperJSON()">
                        <icon-import class="m-r-5px" />
                        {{ $t('header.filePopover.importJSON') }}
                    </li>
                    <li @click="fileOperJSON(true)">
                        <icon-import class="m-r-5px" />
                        {{ $t('header.filePopover.appendJSON') }}
                    </li>
                    <!-- <li @click="exportJSON()">
                        <icon-export class="m-r-5px" />
                        导出JSON(当前页)
                    </li> -->
                </ul>
            </div>
        </template>
    </a-popover>
    <a-modal v-model:visible="visible" :closable="processInfo.process === 1" :mask-closable="processInfo.process === 1">
        <template #title>
            <div>{{ processTitle }}</div>
        </template>
        <div>
            <a-result :status="null" :title="processInfo.text">
                <template #icon>
                    <div v-html="ImageOrgSvg"></div>
                </template>
                <template #extra>
                    <a-progress size="large" color="rgb(12,92,255)" :percent="processInfo.process" />
                </template>
            </a-result>
        </div>
        <template #footer>
            <div>
                <a-button v-if="processInfo.process === 1" type="primary" @click="confirmImported">关闭</a-button>
            </div>
        </template>
    </a-modal>
</template>

<script setup lang="ts">
import { useLeaferEditor } from '../../../index';
import { selectFiles, checkFileExt } from "../../../utils";
import { ParsePsdFile } from '../../../utils/psd';
import { Message } from '@arco-design/web-vue';
import { reactive, ref } from 'vue';
import ImageOrgSvg from '../../assets/images/imageOrg.svg?raw';
import { toFixed } from '../../../../LeaferEditor/utils/math';
import { generateID } from '../../../../LeaferEditor/core/utils';
import { useI18n } from 'vue-i18n';

const { t } = useI18n()

const editor = useLeaferEditor()
const visible = ref(false)
const processTitle = ref(t('header.filePopover.process.importing')) // '正在导入'
const processInfo = reactive({
    process: 0,
    text: t('header.filePopover.process.info-importing'),
})
const confirmImported = () => {
    visible.value = false
    processTitle.value = t('header.filePopover.process.importing')
    processInfo.text = t('header.filePopover.process.info-importing')
    processInfo.process = 0
}

const openImage = () => {
    editor.openImage().then(res => {
        editor.add(res)
    })
}

const fileOperJSON = (isAppend: boolean = false) => {
    selectFiles({ accept: '.json' }).then((files) => {
        if (!files) return;
        const file = files![0];
        if (!file) return;
        const reader = new FileReader();
        reader.readAsText(file!, 'UTF-8');
        reader.onload = () => {
            let ok = false;
            if (!isAppend) ok = editor.reLoadFromJSON(JSON.parse(<string>reader.result));
            else ok = editor.appendPagesFromJSON(JSON.parse(<string>reader.result));
            if (ok) {
                console.log(file.name + '导入成功')
            } else {
                console.log(file.name + '导入失败')
            }
        };
    });
}

const fileOperPSD = () => {
    selectFiles({ accept: '.psd' }).then((files) => {
        if (!files) return;
        const file = files![0];
        if (!file) return;
        if (!checkFileExt(file, ['psd'])) return
        visible.value = true
        processTitle.value = t('header.filePopover.process.parsing')
        const parser = new ParsePsdFile(file)
        parser.parsed.then(() => {
            parser.ParseToLeaferFrame((totalLayers: number, process: number, layerName: string) => {
                processTitle.value = t('header.filePopover.process.importing')
                const p = toFixed(process)
                processInfo.process = p > .99 ? .99 : p
                processInfo.text = `${t('header.filePopover.process.importing')}: ${layerName}`
            }).then((root) => {
                editor.historyClear()
                editor.historyDisable()
                editor.clear()
                const id = generateID()
                const data = {
                    width: parser.width,
                    height: parser.height,
                    pages: {
                        [id]: {
                            name: id,
                            width: parser.width,
                            height: parser.height,
                            contentFrame: root.toJSON(),
                        }
                    },
                    currentCanvas: id,
                }
                editor.reLoadFromJSON(data, true, "ImportPSD")
                // editor.setNormalizeAttr(editor.contentFrame)
                editor.contentFrame.children.forEach(child => {
                    editor.setNormalizeAttr(child)
                })
                editor.historyEnable()
                editor.historySaveState()
                editor.zoom('fit')
                processTitle.value = t('header.filePopover.process.converting')
                processInfo.text = t('header.filePopover.process.info-parsing')
                processInfo.process = 1
            }).catch(reason => {
                Message.warning({
                    content: reason.message,
                    duration: 4000
                })
                visible.value = false
            })
            console.log(
                parser.psd.children
            );
        }).catch(reason => {
            Message.warning({
                content: reason.message,
                duration: 4000
            })
            visible.value = false
        })
    });
}
</script>

<style lang="less" scoped>
ul {
    padding: 0;
    margin: 5px 0;
    list-style: none;
}

li {
    padding: 0 20px;
    cursor: pointer;
    color: #1b2337;
    display: block;
    font-size: 14px;
    line-height: 40px;
    overflow: hidden;
    position: relative;
    text-overflow: ellipsis;
    white-space: nowrap;
}

li:hover {
    cursor: pointer;
    background-color: #f1f2f4;
}
</style>