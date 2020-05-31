const { zipObject, snakeCase, orderBy } = require('lodash');
const fs = require('fs');

const columns = "ID,DBName,ScreenName,Type,Price,Sell,Weight,ATK,DEF,Range,Slot,Job,Class,Gender,Loc,wLV,eLV, Refineable,View,{Script},{OnEquip_Script},{OnUnequip_Script}"
const itemsMissingFromDb = require('./missingItemDb_original.json');
const itemDb_txt = fs.readFileSync('./item_db.txt', 'utf8');
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
        console.log(e)
    }
})

const findItemType = (item) => {
    // 0 = Usable : healing 
    // 2 = Usable : other 
    // 3 = Misc
    // 4 = Armor
    // 5 = Weapon 
    // 6 = Card 
    // 7 = Pet Egg 
    // 8 = Pet Equipment 
    // 10 = Arrow/Ammunition 
    // 11 = Usable with delayed consumption (intended for 'itemskill'). Items using the 'itemskill' script command are consumed after selecting a target. Any other command will NOT consume the item. 
    // 12 = Shadow Equipment 
    // 18 = Another delayed consume that requires user confirmation before using item.
    switch (item.unidentifiedDisplayName) {
        case "Unknown Hat":
        case "Unidentified Accessory": 
        case "Unidentified Armor": 
        case "Unidentified Clothing": 
        case "Unidentified Garment": 
        case "Unidentified Glasses": 
        case "Unidentified Hairband": 
        case "Unidentified Hat": 
        case "Unidentified Helmet": 
        case "Unidentified Mask": 
        case "Unidentified Ribbon": 
        case "Unidentified Shoes":
            return 4;
        case "Unidentified Axe": 
        case "Unidentified Book": 
        case "Unidentified Bow": 
        case "Unidentified Dagger": 
        case "Unidentified Gatling Gun": 
        case "Unidentified Grenade Launcher": 
        case "Unidentified Instrument": 
        case "Unidentified Katar": 
        case "Unidentified Knuckle": 
        case "Unidentified Mace": 
        case "Unidentified Revolver": 
        case "Unidentified Rifle": 
        case "Unidentified Shield": 
        case "Unidentified Shotgun": 
        case "Unidentified Spear": 
        case "Unidentified Staff": 
        case "Unidentified Sword": 
        case "Unidentified Whip":
            return 5;
        case "Unidentified Shadow Armor": 
        case "Unidentified Shadow Earring": 
        case "Unidentified Shadow Pendant": 
        case "Unidentified Shadow Shield": 
        case "Unidentified Shadow Shoes": 
        case "Unidentified Shadow Weapon":
            return 12;
        default:
            return 3;
    }
}

const findItemLocation = (item) => {
    switch (item.unidentifiedDisplayName) {
        case "Unidentified Accessory":
            return 136;
        case "Unidentified Armor":
        case "Unidentified Clothing":
            return 16;
        case "Unidentified Garment":
            return 4; 
        case "Unidentified Glasses":
        case "Unidentified Mask":
            return item.costume === 'true' ? 2048 : 512;
        case "Unidentified Hairband":
        case "Unknown Hat":
        case "Unidentified Hat":
        case "Unidentified Helmet":
        case "Unidentified Ribbon":
            return item.costume === 'true' ? 1024 : 256;
        case "Unidentified Shoes":
            return 4;
        case "Unidentified Bow":
        case "Unidentified Katar":
            return 34;
        case "Unidentified Axe":
        case "Unidentified Book":
        case "Unidentified Dagger":
        case "Unidentified Gatling Gun":
        case "Unidentified Grenade Launcher":
        case "Unidentified Instrument":
        case "Unidentified Knuckle":
        case "Unidentified Mace":
        case "Unidentified Revolver":
        case "Unidentified Rifle":
        case "Unidentified Shotgun":
        case "Unidentified Spear":
        case "Unidentified Staff":
        case "Unidentified Sword":
        case "Unidentified Whip":
            return 2;
        case "Unidentified Shield":
            return 32;                        
        case "Unidentified Shadow Armor":
            return 65536;
        case "Unidentified Shadow Earring": 
        case "Unidentified Shadow Pendant":
            return 3145728;
        case "Unidentified Shadow Shield":
            return 262144;
        case "Unidentified Shadow Shoes": 
            return 524288;
        case "Unidentified Shadow Weapon":
            return 131072;
        default:
            return '';
    }
}

const findItemRefineable = (item) => {
    switch (item.unidentifiedDisplayName) {
        case "Unidentified Armor":
        case "Unidentified Clothing":
        case "Unidentified Garment":
        case "Unidentified Glasses":
        case "Unidentified Mask":
        case "Unidentified Hairband":
        case "Unknown Hat":
        case "Unidentified Hat":
        case "Unidentified Helmet":
        case "Unidentified Ribbon":
        case "Unidentified Shoes":
        case "Unidentified Bow":
        case "Unidentified Katar":
        case "Unidentified Axe":
        case "Unidentified Book":
        case "Unidentified Dagger":
        case "Unidentified Gatling Gun":
        case "Unidentified Grenade Launcher":
        case "Unidentified Instrument":
        case "Unidentified Knuckle":
        case "Unidentified Mace":
        case "Unidentified Revolver":
        case "Unidentified Rifle":
        case "Unidentified Shotgun":
        case "Unidentified Spear":
        case "Unidentified Staff":
        case "Unidentified Sword":
        case "Unidentified Whip":
        case "Unidentified Shield":
            return 1;                        
        case "Unidentified Accessory":
        case "Unidentified Shadow Armor":    
        case "Unidentified Shadow Earring": 
        case "Unidentified Shadow Pendant":
        case "Unidentified Shadow Shield":
        case "Unidentified Shadow Shoes": 
        case "Unidentified Shadow Weapon":
        default:
            return 0;
    }
}

orderBy(itemsMissingFromDb, ['itemId']).forEach(item => {
    let itemDbLine = new Array(22).fill("");

    let itemType = findItemType(item);

    itemDbLine[0] = item.itemId;
    itemDbLine[1] = snakeCase(`${item.identifiedDisplayName}_${item.itemId}`).toUpperCase(); // Aegis
    itemDbLine[2] = item.identifiedDisplayName; // Name
    itemDbLine[3] = itemType; // Type
    itemDbLine[4] = 10; // Buy
    itemDbLine[5] = 0; // Sell
    itemDbLine[6] = 0; // Weight
    itemDbLine[7] = ''; // Atk:MATK
    itemDbLine[8] = ''; // DEF
    itemDbLine[9] = ''; // Range
    itemDbLine[10] = itemType > 3 ? item.slotCount : ''; // Slots
    itemDbLine[11] = itemType > 3 ? '0xFFFFFFFF' : ''; // Job
    itemDbLine[12] = itemType > 3 ? 63 : ''; // Class
    itemDbLine[13] = itemType > 3 ? 2 : ''; // Gender
    itemDbLine[14] = itemType > 3 ? findItemLocation(item) : ''; // Loc
    itemDbLine[15] = ''; // wLv
    itemDbLine[16] = ''; // eLV:MaxLVL
    itemDbLine[17] = findItemRefineable(item); // Refineable
    itemDbLine[18] = itemType > 3 ? Number(item.ClassNum) : ''; // View
    itemDbLine[19] = '{}'; // Script
    itemDbLine[20] = '{}'; // OnEquip_Script
    itemDbLine[21] = '{}'; // OnUnEquip_Script

    fs.appendFileSync('item_db.import.txt', itemDbLine.join(',') + '\n')
})

