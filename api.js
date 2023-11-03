
const fs = require('fs'); 
const csv = require('csv-parser');
function getTable(path) {
    return new Promise((resolve, reject) => { 
        const table = []
        fs.createReadStream(`.${path}`)
        .pipe(csv())
        .on('data', (data) => {
            table.push(data)
        })
        .on('error', reject)
        .on('end', () => {
            resolve(table)
        });  
    })
}

function getXTable() {
    return getTable('/tables/interview.X.csv')
}


function getYTable() {
    return getTable('/tables/interview.y.csv')
}


module.exports = { getXTable, getYTable }