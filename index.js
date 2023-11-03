const api = require('./api.js');
const {events} = require('./consts.js')
const {prepareData} = require('./utils.js')
const express = require('express')
const joi = require('joi')
const cors = require('cors')
const fs = require('fs')
const csv = require('csv-parser');

const {parse, transform, stringify} = require('csv');
const {createReadStream, createWriteStream} = require('fs');
 



async function main() {
    
    // const data = await api.getYTable()
    // const array = Array.from(new Set(data.map(({uid}) => uid)))

    // createReadStream(`./tables/interview.X.csv`)
    // .pipe(parse())
    // .pipe(transform(data => {
    //     console.log(data[1])
    //     return array.includes(data[1]) ? data : null
    //     }))
    // .pipe(stringify({}))
    // .pipe(createWriteStream(`./result.csv`))
    // .on('finish', data => console.log('Done'));
    
    const app = express()
    const port = 3000
    const [tableY, tableX] = await Promise.all([api.getYTable(), api.getXTable()])
    app.use(cors())
    app.get('/table', (_, res) => {
        res.send(prepareData(tableY, tableX))
    })
    app.get('/chart', (req, res) => {
        const schema = joi.object({
            event: joi.string().valid(...Object.values(events)).required(),
            minutes: joi.string().pattern(/^[0-9]+$/).required(),
        })
        const { error } = schema.validate(req.query, {abortEarly: false})
        if (error) {
            res.status(404).send({
                message: error.message
            });
            return
        }
        res.send(prepareData(tableY, tableX, req.query.event, parseInt(req.query.minutes)))
    })
    app.listen(port, () => {
        console.log(`App listening on port ${port}`)
    })

}

main()