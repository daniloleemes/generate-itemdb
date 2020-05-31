const { zipObject, findIndex, snakeCase } = require('lodash');
const fs = require('fs');

const itemInfo_csv = fs.readFileSync('./itemInfo.csv', 'utf8').split('\n');
const itemInfoColumns = itemInfo_csv.shift().split(',');

const itemDb_txt = fs.readFileSync('./item_db.txt', 'utf8');
const columns = "ID,AegisName,Name,Type,Buy,Sell,Weight,AtkMatk,DEF,Range,Slots,Job,Class,Gender,Loc,wLV,eLVMaxLvl,Refineable,View,Script,OnEquip_Script,OnUnequip_Script".split(",")

const itemInfo = itemInfo_csv.map(line => {
    let l = line.split(",").map(l => l.includes("|") ? l.split("|") : l);
    l[0] = Number(l[0]);
    return zipObject(itemInfoColumns, l);
})

const itemDb = itemDb_txt.split('\n').filter(line => !line.startsWith('/')).map(item => {
    try {
        const values = item.replace(/(\{[^,]*,.*?\})(?=,)/g, (m, p1) => p1.replace(/,/g, '\x01'))
            .split(/,/)
            .map(item => item.replace(/\x01/g, ','));

        const itemObj = zipObject(columns, values)
        return {
            ...itemObj,
            ID: Number(itemObj.ID)
        }
    } catch (e) {
        console.log(item)
    }
})

const missingItemInfo = itemInfo.filter(item => findIndex(itemDb, { ID: item.itemId }) < 0 && item.identifiedDescriptionName.length > 0)
const missingDb = itemDb.filter(item => findIndex(itemInfo, { itemId: item.ID }) < 0)

fs.writeFileSync('./missingItemDb_original.json', JSON.stringify(missingItemInfo).replace(/\\r/g, ''));