const luaparse = require('luaparse');
const { zipObject, findIndex } = require('lodash');
const fs = require('fs');

const accessoryId_lua = luaparse.parse(fs.readFileSync('./accessoryid.lua', 'utf8'));
const itemInfo_lua = luaparse.parse(fs.readFileSync('./itemInfo_bro.lua', 'utf8'));
const itemDb_txt = fs.readFileSync('./item_db.txt', 'utf8');
const columns = "ID,AegisName,Name,Type,Buy,Sell,Weight,AtkMatk,DEF,Range,Slots,Job,Class,Gender,Loc,wLV,eLVMaxLvl,Refineable,View,Script,OnEquip_Script,OnUnequip_Script".split(",")

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

const accessoryId = accessoryId_lua.body[0].init[0].fields.reduce((result, item) => {
    const viewId = item.value.value;
    const aegisName = item.key.name.substring(10);

    result[viewId] = aegisName;

    return result;
})

const itemInfo = itemInfo_lua.body[0].init[0].fields.map(item => {
    const itemId = item.key.value
    const fields = item.value.fields.reduce((result, field) => {
        result[field.key.name] = field.value.raw || field.value.fields.map(it => it.value.raw)
        return result
    }, {})

    return {
        itemId,
        aegisName: accessoryId[fields['ClassNum']],
        ...fields
    }
})


const missingItemInfo = itemInfo.filter(item => findIndex(itemDb, { ID: item.itemId }) < 0 && item.identifiedDescriptionName.length > 0)

fs.writeFileSync('./missingItemDb.json', JSON.stringify(missingItemInfo));