import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';

const outDir = '/home/juliano/Desktop/portfolio/photo';

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(dest);
    client.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return download(res.headers.location || url, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error('HTTP ' + res.statusCode + ' for ' + url));
      }
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(dest); });
    }).on('error', (err) => { fs.unlink(dest, () => {}); reject(err); });
  });
}

(async () => {
  const images = [
    { url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&h=1000&q=80', name: 'home-rooms-main.jpg' },
    { url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&h=500&q=80', name: 'home-rooms-1.jpg' },
    { url: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=800&h=500&q=80', name: 'home-rooms-2.jpg' },
    { url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=800&q=80', name: 'home-portrait.jpg' },
    { url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&h=600&q=80', name: 'home-events.jpg' },
    { url: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=800&h=600&q=80', name: 'home-fashion.jpg' },
    { url: 'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?auto=format&fit=crop&w=600&q=80', name: 'home-about-1.jpg' },
    { url: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=600&q=80', name: 'home-about-2.jpg' },
    { url: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?auto=format&fit=crop&w=600&q=80', name: 'home-about-3.jpg' },
    { url: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=600&q=80', name: 'home-about-4.jpg' },
    { url: 'https://images.unsplash.com/photo-1554080353-a576cf803bda?auto=format&fit=crop&w=1200&q=80', name: 'home-passion-1.jpg' },
    { url: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?auto=format&fit=crop&w=1200&q=80', name: 'home-passion-2.jpg' }
  ];

  for (const img of images) {
    const dest = path.join(outDir, img.name);
    if (fs.existsSync(dest) && (await fs.promises.stat(dest)).size > 0) {
      console.log(`SKIP ${img.name}`);
      continue;
    }
    try {
      const saved = await download(img.url, dest);
      const stat = await fs.promises.stat(saved);
      console.log(`OK ${img.name} (${(stat.size / 1024).toFixed(1)} KB)`);
    } catch (e) {
      console.warn(`FAIL ${img.name}: ${e.message}`);
    }
  }
})();
