// The cube of a FUJIFILM recipe: the film simulation LUT of FUJIFILM with the recipe's settings, as the
// camera applies them (fujifilm_recipe.mjs). Then fit it like the film simulations:
//   node effects/sources/make_fujifilm_recipe.mjs FLog2_to_CLASSIC-CHROME_65grid_V.1.00.cube \
//     '{"wbRed":2,"wbBlue":-4,"highlight":-1,"shadow":-1,"color":2,"chrome":1,"chromeBlue":0.5}' \
//     fj-reggies-portra-v1.cube "Reggie's Portra"
//   grku effects import --lut fj-reggies-portra-v1.cube --input flog2 --id fj-reggies-portra-v1 ...
import { readCube, recipeCube, writeCube } from './fujifilm_recipe.mjs';
const [sim, json, out, title] = process.argv.slice(2);
writeCube(out, recipeCube(readCube(sim), JSON.parse(json)), title);
console.log('wrote', out);
