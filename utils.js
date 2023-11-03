const {events} = require('./consts.js')

function prepareData(y, x, eventType, offestMin) {
    function countUnique(iterable) {
        return new Set(iterable).size;
    }
    function prepareChunk(chunk) {
        const impression_count = countUnique(chunk.map((item) => item.uid))
        const event_count = chunk.filter((item) => eventType === item.tag).length
        const coefficient = events.FCLICK === eventType ? 100 : 1000
        return {
            value: Math.round(coefficient * (event_count / impression_count)),
            start_time: chunk[0].time,
            end_time: chunk[chunk.length - 1].time
        }
    }
    function chunkArrayByTime(arr, timeIntervalMinutes) {
        const result = []
        let currentChunk = []
        let itemEndTime = null
        for (let i = 0; i < arr.length; i++) {
          const item = arr[i]
          const itemTime = item.time
          if (!itemEndTime) {
            itemEndTime = new Date(itemTime.getTime() + timeIntervalMinutes * 60000);
          }
          if (Math.sign(itemEndTime - itemTime) === -1) {
            result.push(prepareChunk(currentChunk))
            currentChunk = []
            itemEndTime = null
            i = i - 1
          } else {
            currentChunk.push(item)
            if (arr.length - i === 1) {
                result.push(prepareChunk(currentChunk))
            }
          }
        } 
        return result
    }    

    const impressionMap = {}
    x.forEach((element) => {
        if (Object.values(element).every((item) => item)) {
            impressionMap[element.uid] = {
                time: element.reg_time,
                site_id: element.site_id,
                mm_dma: element.mm_dma
            }
        }
    });
    const mappedY = y.reduce((accumulator, currentValue) => {
        const value = impressionMap[currentValue.uid]
        if (currentValue.tag[0] === 'v') {
            currentValue.tag = currentValue.tag.substring(1)
        } 
        if (value) {
            currentValue.time = new Date(value.time)
            currentValue.site_id = value.site_id
            currentValue.mm_dma = value.mm_dma
            accumulator = [...accumulator, currentValue]   
        }
        return accumulator
    }, [])

    mappedY.sort((a, b) => a.time - b.time)
    if (!eventType && !offestMin) {
        return mappedY.map((item, index) => ({...item, id: index}))
    }
    return chunkArrayByTime(mappedY, offestMin)
}


module.exports = {prepareData}