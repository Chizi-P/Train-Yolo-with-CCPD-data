const fs = require('fs')
const gracefulFs = require('gracefal-fs')
gracefulFs.gracefulify(fs)

const CCPD = 'CCPD2019'
const CCPDPath = `${__dirname}/${CCPD}`

// 定義為車牌的label
const label = ['license plate']
const licensePlateLabel = label.indexOf('license plate')

const imgSize = { w: 1160, h: 720, c: 3 }

const provinces = ["皖", "沪", "津", "渝", "冀", "晋", "蒙", "辽", "吉", "黑", "苏", "浙", "京", "闽", "赣", "鲁", "豫", "鄂", "湘", "粤", "桂", "琼", "川", "贵", "云", "藏", "陕", "甘", "青", "宁", "新", "警", "学", "O"]
const alphabets = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'O']
const ads = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'O']

const splitFiles = ['blur', 'challenge', 'db', 'fn', 'rotate', 'tilt']

// splitFiles.forEach(splitFile => {
//     fs.readdir(`${CCPDPath}/ccpd_${splitFile}`, (err, files) => {
//         if (err) throw err
//         files.forEach(file => {
//             console.log(file)
//             const fileName = file.replace(/.(jpg|jpeg|png)$/, '')
//             const { boundingBoxCoordinates } = analyzeFileName(fileName)
//             fs.writeFile(`${CCPDPath}/ccpd_${splitFile}/${fileName}.txt`, txt(boundingBoxCoordinates), err => {
//                 if (err) throw err
//                 console.log(`written ccpd_${splitFile}/${fileName}.txt`)
//             })

//             const licensePlateNumber = alpn(boundingBoxCoordinates)
//             console.log(licensePlateNumber)
//         })
//     })
// })

splitFiles.forEach(splitFile => {
    fs.readFile(`${CCPDPath}/splits/ccpd_${splitFile}.txt`, (err, data) => {
        if (err) throw err
        const paths = data.toString().split('\n')
        // 不要矩陣中最後一個空元素
        paths.pop()
        paths.forEach(path => {
            path = path.replace(/.(jpg|jpeg|png)$/, '')
            const fileName = path.replace(`ccpd_${splitFile}/`, '')
            fs.writeFile(`${CCPDPath}/${path}.txt`, txt(fileName), err => {
                if (err) throw err
                console.log(`written ${path}.txt`)
            })
        })
    })
})

function analyzeFileName(fileName) {
    const [area, tiltDegree, boundingBoxCoordinates, fourVerticesLocations, licensePlateNumber, brightness, blurriness] = fileName.split('-').map(e => e.split('_'))
    return { area, tiltDegree, boundingBoxCoordinates, fourVerticesLocations, licensePlateNumber, brightness, blurriness }
}

// Analyze the license plate number
function alpn(lpn) {
    return provinces[lpn[0]] + alphabets[lpn[1]] + lpn.slice(2).map(char => ads[char]).join('')
}

function analyzeBoundingBoxCoordinates(boundingBoxCoordinates) {
    const [p1, p2] = boundingBoxCoordinates.map(p => p.split('&'))
    return {
        p1: { x: p1[0], y: p1[1] },
        p2: { x: p2[0], y: p2[1] }
    }
}

/*
* txt格式
* 類別 中心點x在圖片中的比例 中心點y在圖片中的比例 標注矩形寬佔圖片的比例 標注矩形高佔圖片的比例
*/
function txt(fileName) {
    const { boundingBoxCoordinates } = analyzeFileName(fileName)
    const { p1, p2 } = analyzeBoundingBoxCoordinates(boundingBoxCoordinates)
    const w = (p2.x - p1.x) / imgSize.w
    const h = (p2.y - p1.y) / imgSize.h
    const x = (p1.x + w / 2) / imgSize.w
    const y = (p1.y + h / 2) / imgSize.h
    return `${licensePlateLabel} ${x} ${y} ${w} ${h}`
}

function xml(path) {
    const [folder, file] = path.split('/')
    const fileName = file.replace(/.(jpg|jpeg|png)$/, '')
    const { boundingBoxCoordinates } = analyzeFileName(fileName)
    const { p1, p2 } = analyzeBoundingBoxCoordinates(boundingBoxCoordinates)
        
    const xml = 
        ```
        <annotation>
            <folder>${folder}</folder>
            <filename>${file}</filename>
            <size>
                <width>${imgSize.w}</width>
                <height>${imgSize.h}</height>
                <depth>${imgSize.c}</depth>
            </size>
            <object>
                <name>${'license plate'}</name>  <!--目标类别-->
                <bndbox>  <!--GT矩形框坐标-->
                    <xmin>${p1.x}</xmin>
                    <xmax>${p2.x}</xmax>
                    <ymin>${p1.y}</ymin>
                    <ymax>${p2.y}</ymax>
                </bndbox>
                <truncated>0</truncated>  <!--物体是否被遮挡（>15%）-->
                <difficult>0</difficult>  <!--物体是否难以辨别，主要指需结合背景才能判断出类别的物体-->
            </object>
            <segmented>0</segmented>  <!--是否有分割label-->
        </annotation>
        ```
    fs.writeFile(`${folder}/${fileName}.xml`, err => {
        if (err) throw err
        console.log(`written ${folder}/${fileName}.xml`)
    })
}
