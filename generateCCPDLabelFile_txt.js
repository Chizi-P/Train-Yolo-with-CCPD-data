const fs = require('fs')

const CCPD = `${__dirname}/CCPD`
// 定義為車牌的label
const label = 0

const provinces = ["皖", "沪", "津", "渝", "冀", "晋", "蒙", "辽", "吉", "黑", "苏", "浙", "京", "闽", "赣", "鲁", "豫", "鄂", "湘", "粤", "桂", "琼", "川", "贵", "云", "藏", "陕", "甘", "青", "宁", "新", "警", "学", "O"]
const alphabets = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'O']
const ads = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'O']

fs.readdir(CCPD, (err, files) => {
    if (err) throw err
    files.forEach(file => {
        console.log(file)
        const fileName = file.replace(/.(jpg|jpeg|png)$/, '')
        let [area, tiltDegree, boundingBoxCoordinates, fourVerticesLocations, licensePlateNumber, brightness, blurriness] = fileName.split('-').map(e => e.split('_'))

        const [p1, p2] = boundingBoxCoordinates.map(p => p.split('&'))
        const w = p2[0] - p1[0]
        const h = p2[1] - p1[1]
        const x = p1[0] + w / 2
        const y = p1[1] + h / 2
        const txt = `${label} ${x} ${y} ${w} ${h}`
        fs.writeFile(`${CCPD}/${fileName}.txt`, txt, err => {
            if (err) throw err
            console.log(`writed ${fileName}.txt`)
        })

        // 重檔案名分析車牌號碼
        licensePlateNumber = [
            provinces[licensePlateNumber[0]], 
            alphabets[licensePlateNumber[1]], 
            ...licensePlateNumber.slice(2).map(char => ads[char])
        ]
        console.log(licensePlateNumber)
    })
})
