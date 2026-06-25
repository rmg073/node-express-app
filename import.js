```javascript
const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");

const files = [
{
file:"BIOCHEMIC_SALTS_MARG.xlsx",
category:"Biochemic Salts"
},
{
file:"BIOCOMBINATION_MARG.xlsx",
category:"Biocombination"
},
{
file:"MOTHER_TINCTURE_MARG_20ML.xlsx",
category:"Mother Tincture"
},
{
file:"RECKWEG_DILUTION_MARG_IMPORT.xlsx",
category:"Dilution"
},
{
file:"R_NUMBERS_MARG.xlsx",
category:"R Drops"
}
];

let medicines=[];

files.forEach(item=>{

const workbook=XLSX.readFile(
path.join(__dirname,"uploads",item.file)
);

const sheet=workbook.Sheets[workbook.SheetNames[0]];

const data=XLSX.utils.sheet_to_json(sheet);

data.forEach(row=>{

medicines.push({

name:row["ITEM NAME"]||"",

category:item.category,

company:row["COMPANY"]||"",

packing:row["PACKING"]||"",

mrp:row["MRP"]||0,

unit:row["UNIT"]||"PCS",

hsn:row["HSN"]||"",

cgst:row["CGST"]||0,

sgst:row["SGST"]||0,

igst:row["IGST"]||0,

keywords:[]

});

});

});

fs.writeFileSync(

"medicines.json",

JSON.stringify(medicines,null,2)

);

console.log("SUCCESS");
console.log("Medicines Imported :",medicines.length);
```

