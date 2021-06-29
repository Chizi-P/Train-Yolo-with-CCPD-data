const fs = require('fs')

const CCPD = `${__dirname}/CCPD2019`

// 定義為車牌的label
const label = 0

const provinces = ["皖", "沪", "津", "渝", "冀", "晋", "蒙", "辽", "吉", "黑", "苏", "浙", "京", "闽", "赣", "鲁", "豫", "鄂", "湘", "粤", "桂", "琼", "川", "贵", "云", "藏", "陕", "甘", "青", "宁", "新", "警", "学", "O"]
const alphabets = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'O']
const ads = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'O']

const splitFiles = ['blur', 'challenge', 'db', 'fn', 'rotate', 'tilt']

// splitFiles.forEach(splitFile => {
//     fs.readdir(`${CCPD}/ccpd_${splitFile}`, (err, files) => {
//         if (err) throw err
//         files.forEach(file => {
//             console.log(file)
//             const fileName = file.replace(/.(jpg|jpeg|png)$/, '')
//             fs.writeFile(`${CCPD}/ccpd_${splitFile}/${fileName}.txt`, txt(fileName), err => {
//                 if (err) throw err
//                 console.log(`written ccpd_${splitFile}/${fileName}.txt`)
//             })

//             const licensePlateNumber = alpn(fileName)
//             console.log(licensePlateNumber)
//         })
//     })
// })

splitFiles.forEach(splitFile => {
    fs.readFile(`${CCPD}/splits/ccpd_${splitFile}.txt`, (err, data) => {
        if (err) throw err
        const paths = data.toString().split('\n')
        // 不要矩陣中最後一個空元素
        paths.pop()
        paths.forEach(path => {
            path = path.replace(/.(jpg|jpeg|png)$/, '')
            const fileName = path.replace(`ccpd_${splitFile}/`, '')
            fs.writeFile(`${CCPD}/${path}.txt`, txt(fileName), err => {
                if (err) throw err
                console.log(`written ${path}.txt`)
            })
        })
    })
})

function txt(fileName) {
        // let [area, tiltDegree, boundingBoxCoordinates, fourVerticesLocations, licensePlateNumber, brightness, blurriness] = fileName.split('-').map(e => e.split('_'))
        const boundingBoxCoordinates = fileName.split('-')[2].split('_')

        const [p1, p2] = boundingBoxCoordinates.map(p => p.split('&'))
        const w = p2[0] - p1[0]
        const h = p2[1] - p1[1]
        const x = p1[0] + w / 2
        const y = p1[1] + h / 2
        return `${label} ${x} ${y} ${w} ${h}`
}

// Analyze the license plate number
function alpn(fileName) {
    const lpn = fileName.split('-')[4].split('_')
    return provinces[lpn[0]] + alphabets[lpn[1]] + lpn.slice(2).map(char => ads[char]).join('')
}
