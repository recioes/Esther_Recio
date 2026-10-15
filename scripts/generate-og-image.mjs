// Gera public/media/og-image.jpg (1200×630), a prévia que aparece ao compartilhar o link.
// Uso: node scripts/generate-og-image.mjs   (o resultado é versionado; só rode ao mudar o visual)
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const WIDTH = 1200;
const HEIGHT = 630;
const GLOBE_SIZE = 620;

const media = (name) => fileURLToPath(new URL(`../public/media/${name}`, import.meta.url));

const background = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}">
  <defs>
    <radialGradient id="purple" cx="12%" cy="0%" r="75%">
      <stop offset="0" stop-color="#8b5cf6" stop-opacity="0.55" />
      <stop offset="1" stop-color="#8b5cf6" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="pink" cx="95%" cy="100%" r="70%">
      <stop offset="0" stop-color="#ec4899" stop-opacity="0.45" />
      <stop offset="1" stop-color="#ec4899" stop-opacity="0" />
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="#07060b" />
  <rect width="100%" height="100%" fill="url(#purple)" />
  <rect width="100%" height="100%" fill="url(#pink)" />
</svg>`);

const text = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}">
  <defs>
    <linearGradient id="role" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#a78bfa" />
      <stop offset="1" stop-color="#f472b6" />
    </linearGradient>
  </defs>
  <g font-family="Segoe UI, Helvetica, Arial, sans-serif">
    <text x="72" y="268" font-size="96" font-weight="700" fill="#ffffff" letter-spacing="-3">Esther</text>
    <text x="72" y="368" font-size="96" font-weight="700" fill="#ffffff" letter-spacing="-3">Recio</text>
    <text x="76" y="436" font-size="44" font-weight="500" fill="url(#role)">Backend Developer</text>
    <text x="76" y="488" font-size="28" fill="#a1a1aa">C#  ·  .NET  ·  Kafka  ·  AWS</text>
    <text x="76" y="570" font-size="24" fill="#c4b5fd">recioes.github.io/Esther_Recio</text>
  </g>
</svg>`);

const globe = await sharp(media('earth-poster.jpg')).resize(GLOBE_SIZE, GLOBE_SIZE).toBuffer();

await sharp(background)
  .composite([
    {
      input: globe,
      left: WIDTH - GLOBE_SIZE - 20,
      top: Math.round((HEIGHT - GLOBE_SIZE) / 2),
      blend: 'screen',
    },
    { input: text, left: 0, top: 0 },
  ])
  .jpeg({ quality: 86, mozjpeg: true })
  .toFile(media('og-image.jpg'));

console.log('Gerado public/media/og-image.jpg');
