// Gera public/media/og-image.jpg (1200×630), a prévia que aparece ao compartilhar o link.
// Uso: node scripts/generate-og-image.mjs   (o resultado é versionado; só rode ao mudar o visual)
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const WIDTH = 1200;
const HEIGHT = 630;
const GLOBE_SIZE = 620;

// Órbita ao redor do centro do globo, como na página (a metade de trás fica sob ele).
const ORBIT = 'translate(870 315) rotate(-18)';

const media = (name) => fileURLToPath(new URL(`../public/media/${name}`, import.meta.url));

const background = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}">
  <defs>
    <radialGradient id="purple" cx="12%" cy="0%" r="75%">
      <stop offset="0" stop-color="#c4225f" stop-opacity="0.55" />
      <stop offset="1" stop-color="#c4225f" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="pink" cx="95%" cy="100%" r="70%">
      <stop offset="0" stop-color="#e25c26" stop-opacity="0.45" />
      <stop offset="1" stop-color="#e25c26" stop-opacity="0" />
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="#0a0710" />
  <rect width="100%" height="100%" fill="url(#purple)" />
  <rect width="100%" height="100%" fill="url(#pink)" />
  <path transform="${ORBIT}" d="M -372 0 A 372 100 0 0 1 372 0" fill="none" stroke="#f5ddcf" stroke-opacity="0.3" stroke-width="1.5" />
</svg>`);

const text = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}">
  <defs>
    <linearGradient id="role" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#f0436f" />
      <stop offset="1" stop-color="#ffb68f" />
    </linearGradient>
  </defs>
  <g transform="${ORBIT}">
    <path d="M -372 0 A 372 100 0 0 0 372 0" fill="none" stroke="#f5ddcf" stroke-opacity="0.65" stroke-width="1.5" />
    <g transform="translate(-263 71) rotate(15)">
      <line x1="0" y1="-8" x2="0" y2="-17" stroke="#f5ddcf" stroke-width="2" />
      <rect x="-30" y="-6" width="21" height="12" rx="1.5" fill="#b3204e" stroke="#ffb68f" stroke-width="1.5" />
      <rect x="9" y="-6" width="21" height="12" rx="1.5" fill="#b3204e" stroke="#ffb68f" stroke-width="1.5" />
      <rect x="-9" y="-9" width="18" height="18" rx="3" fill="#f5ddcf" />
    </g>
  </g>
  <g font-family="Segoe UI, Helvetica, Arial, sans-serif">
    <text x="72" y="268" font-size="96" font-weight="700" fill="#ffffff" letter-spacing="-3">Esther</text>
    <text x="72" y="368" font-size="96" font-weight="700" fill="#ffffff" letter-spacing="-3">Recio</text>
    <text x="76" y="436" font-size="44" font-weight="500" fill="url(#role)">Backend Developer</text>
    <text x="76" y="488" font-size="28" fill="#bbb0b4">C#  ·  .NET  ·  Kafka  ·  AWS</text>
    <text x="76" y="570" font-size="24" fill="#f5ddcf">recioes.github.io/Esther_Recio</text>
  </g>
</svg>`);

const occluder = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}">
  <circle cx="870" cy="315" r="263" fill="#000000" />
</svg>`);

const globe = await sharp(media('earth-poster.jpg')).resize(GLOBE_SIZE, GLOBE_SIZE).toBuffer();

await sharp(background)
  .composite([
    // Disco preto sob o globo: o blend "screen" sozinho deixaria a órbita de trás aparecer através dele.
    { input: occluder, left: 0, top: 0 },
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
