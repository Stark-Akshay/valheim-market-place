import fs from "fs";
import path from "path";

const dataDir = path.join(__dirname, "..", "data");
const files = ["armour.json", "food.json", "potions.json", "weapons.json"];

function isObject(v) {
  return v && typeof v === "object" && !Array.isArray(v);
}

function updatePrices(obj) {
  let count = 0;
  if (Array.isArray(obj)) {
    obj.forEach((item) => {
      const c = updatePrices(item);
      count += c;
    });
    return count;
  }

  if (isObject(obj)) {
    for (const key of Object.keys(obj)) {
      const val = obj[key];
      if (typeof val === "number" && key.toLowerCase().includes("price")) {
        const newVal = Number((val * 0.1).toFixed(2));
        obj[key] = newVal;
        count++;
      } else if (
        typeof val === "string" &&
        key.toLowerCase().includes("price")
      ) {
        // try parse numeric strings
        const n = Number(val.replace(/[^0-9.-]/g, ""));
        if (!Number.isNaN(n)) {
          const newVal = Number((n * 0.1).toFixed(2));
          obj[key] = newVal;
          count++;
        }
      } else if (isObject(val) || Array.isArray(val)) {
        count += updatePrices(val);
      }
    }
  }
  return count;
}

let total = 0;
files.forEach((fname) => {
  const p = path.join(dataDir, fname);
  if (!fs.existsSync(p)) {
    console.warn("File not found:", p);
    return;
  }
  const raw = fs.readFileSync(p, "utf8");
  const data = JSON.parse(raw);

  // backup
  fs.writeFileSync(p + ".bak", raw, "utf8");

  const count = updatePrices(data);
  total += count;

  fs.writeFileSync(p, JSON.stringify(data, null, 2) + "\n", "utf8");
  console.log(`Updated ${count} price-like fields in ${fname}`);
});
console.log(`Total updated fields: ${total}`);
