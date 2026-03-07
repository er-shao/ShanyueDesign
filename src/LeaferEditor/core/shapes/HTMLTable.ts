// #HTML 文本
import { Leafer } from 'leafer-ui'
import { HTMLText } from '@leafer-in/html' // 导入 html 插件   

const leafer = new Leafer({ view: window })

const text = new HTMLText({
    text: `
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: sans-serif;
        }
        table {
            border-collapse: collapse;
        }
        td, th {
            border: 1px solid #000;
            padding: 8px;
        }
    </style>
        <table>
            <tr><th>姓名</th><th>年龄</th></tr>
            <tr><td>张三</td><td>25</td></tr>
            <tr><td>李四</td><td>30</td></tr>
        </table>
    `,
    draggable: true,
})

leafer.add(text)