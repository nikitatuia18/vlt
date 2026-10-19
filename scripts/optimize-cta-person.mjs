// One-off: turns the Figma export of the person (PNG 1536 x 2688, 2.8 MB) into a WebP of 2x the displayed size,
// keeping the transparency. Run: node scripts/optimize-cta-person.mjs <source.png> (the source is not kept in the repo).
import sharp from 'sharp'

const [source] = process.argv.slice(2)
if (!source) throw new Error('Give the path of the source PNG')
// The design shows the picture 507 px wide (at 1x); 1014 px is enough for 2x screens.
const info = await sharp(source).resize({ width: 1014 }).webp({ quality: 88, alphaQuality: 100 }).toFile('src/assets/cta/img-cta-person.webp')
console.log(info)