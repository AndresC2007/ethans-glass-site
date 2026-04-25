import fs from 'fs/promises';

async function processHtml(file) {
  let content = await fs.readFile(file, 'utf-8');
  
  // Replace CDN with local CSS
  content = content.replace(
    '<script src="https://cdn.tailwindcss.com"></script>',
    '<link href="/src/style.css" rel="stylesheet">'
  );

  // Replace image extensions
  content = content.replace(/\.jpe?g/g, '.webp');

  // Add loading="lazy" to all img tags except logo and hero
  // We can do this with a regex: find <img ...> that doesn't have loading="lazy"
  // But simpler: just add it to specific classes or just do it globally and then remove from hero
  
  // Add loading="lazy" to project images which have class="w-full h-full object-cover transform...
  content = content.replace(/<img src="\/img\/(?!modern-building-1\.webp)(.*?)"(.*?)(?!loading="lazy")>/g, '<img src="/img/$1"$2 loading="lazy">');

  await fs.writeFile(file, content);
}

Promise.all([
  processHtml('index.html'),
  processHtml('portfolio.html')
]).then(() => console.log('HTML files updated.'))
  .catch(console.error);
