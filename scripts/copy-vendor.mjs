import { mkdir, copyFile } from 'node:fs/promises';
await mkdir('dist/vendor', {recursive:true});
for (const filename of ['three.module.js', 'three.core.js']) {
  await copyFile(`node_modules/three/build/${filename}`, `dist/vendor/${filename}`);
}
await copyFile('node_modules/three/LICENSE','dist/vendor/THREE-LICENSE.txt');
console.log('Tailwind CSS compiled; Three.js copied locally. dist/ is ready to serve.');
