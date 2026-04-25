import fs from 'fs/promises';
import path from 'path';

async function getImages(folder) {
    const dir = path.join('./public/img/portfolioCarousel', folder);
    const files = await fs.readdir(dir);
    return files
        .filter(f => f.endsWith('.webp'))
        // sort nicely
        .sort((a, b) => {
            const numA = parseInt(a.match(/\d+/) || [0])[0];
            const numB = parseInt(b.match(/\d+/) || [0])[0];
            return numA - numB;
        })
        .map(f => `img/portfolioCarousel/${folder}/${f}`);
}

async function updateIndex() {
    let content = await fs.readFile('index.html', 'utf8');
    
    const newCards = `
            <!-- Proyecto 7: Canaveral Port Authority -->
            <div class="group relative overflow-hidden rounded-lg shadow-lg">
                <img src="/img/portfolioCarousel/canaveralPort/cocoaBeach-portada.webp" alt="Canaveral Port Authority" class="w-full h-full object-cover transform group-hover:scale-110 transition duration-500" onerror="this.onerror=null;this.src='https://placehold.co/800x600/ccc/fff?text=Project+7';" loading="lazy">
                <div class="absolute inset-0 bg-black/40 flex flex-col justify-end p-6 transition-opacity duration-300">
                     <div>
                        <h3 class="text-white text-xl font-bold text-shadow">Canaveral Port Authority, FL | 2026</h3>
                        <a href="portfolio.html#project-7" class="mt-2 inline-block bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-300 shadow-md text-sm font-semibold">
                            See gallery
                        </a>
                    </div>
                </div>
            </div>

            <!-- Proyecto 8: Topgolf Parsippany -->
            <div class="group relative overflow-hidden rounded-lg shadow-lg">
                <img src="/img/portfolioCarousel/topGolf/portada-topgolf.webp" alt="Topgolf Parsippany" class="w-full h-full object-cover transform group-hover:scale-110 transition duration-500" onerror="this.onerror=null;this.src='https://placehold.co/800x600/ccc/fff?text=Project+8';" loading="lazy">
                <div class="absolute inset-0 bg-black/40 flex flex-col justify-end p-6 transition-opacity duration-300">
                     <div>
                        <h3 class="text-white text-xl font-bold text-shadow">Topgolf Parsippany, NJ | 2026</h3>
                        <a href="portfolio.html#project-8" class="mt-2 inline-block bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-300 shadow-md text-sm font-semibold">
                            See gallery
                        </a>
                    </div>
                </div>
            </div>            
        </div>
    </div>
</section>`;

    // Find the end of the grid
    content = content.replace(/<\/div>\s*<\/div>\s*<\/section>\s*<!-- Contact Form Section -->/s, newCards + '\n\n        <!-- Contact Form Section -->');
    await fs.writeFile('index.html', content);
}

function buildSection(id, title, desc, images, bgColor) {
    const slides = images.map(img => `                        { src: '${img}' },`).join('\n');
    return `
        <!-- Project ${id.split('-')[1]}: ${title.split(' | ')[0]} -->
        <section id="${id}" class="py-16 md:py-24 ${bgColor}">
            <div class="container mx-auto px-6">
                <div class="text-center mb-10">
                    <h2 class="text-3xl md:text-4xl font-bold text-slate-900">${title}</h2>
                    <p class="text-slate-600 mt-4 max-w-2xl mx-auto">${desc}</p>
                </div>
                <!-- Carousel -->
                <div x-data="{
                    activeSlide: 1,
                    slides: [
${slides}
                    ]
                }" class="relative max-w-5xl mx-auto">
                    <!-- Viewport with a fixed aspect ratio -->
                    <div class="relative w-full aspect-video rounded-lg overflow-hidden shadow-2xl bg-slate-200">
                        <!-- Slides -->
                        <template x-for="(slide, index) in slides" :key="index">
                            <div x-show="activeSlide === index + 1" class="absolute inset-0" x-transition:enter="transition ease-in-out duration-300" x-transition:enter-start="opacity-0" x-transition:enter-end="opacity-100" x-transition:leave="transition ease-in-out duration-300" x-transition:leave-start="opacity-100" x-transition:leave-end="opacity-0">
                                <img :src="slide.src" alt="Project Image" class="w-full h-full object-cover">
                            </div>
                        </template>
                    </div>
                    <!-- Prev/Next Buttons -->
                    <button @click="activeSlide = activeSlide === 1 ? slides.length : activeSlide - 1" class="absolute top-1/2 left-2 md:-left-16 transform -translate-y-1/2 bg-slate-800/50 text-white p-2 md:p-3 rounded-full hover:bg-slate-800 focus:outline-none transition">
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    <button @click="activeSlide = activeSlide === slides.length ? 1 : activeSlide + 1" class="absolute top-1/2 right-2 md:-right-16 transform -translate-y-1/2 bg-slate-800/50 text-white p-2 md:p-3 rounded-full hover:bg-slate-800 focus:outline-none transition">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
            </div>
        </section>`;
}

async function updatePortfolio() {
    const stateNormalImgs = await getImages('state-normal');
    const canaveralImgs = await getImages('canaveralPort');
    const topGolfImgs = await getImages('topGolf');

    let content = await fs.readFile('portfolio.html', 'utf8');

    // Update state-normal slides
    const stateNormalSlides = stateNormalImgs.map(img => `                        { src: '${img}'  },`).join('\n');
    
    // Replace state-normal slides in portfolio.html
    const snRegex = /(<!-- Project 6: State Normal School -->.*?slides: \[).*?(\].*?})/s;
    content = content.replace(snRegex, `$1\n${stateNormalSlides}\n                    $2`);

    // Add new sections at the end of <main>
    const newSections = 
        buildSection('project-7', 'Canaveral Port Authority, FL | 2026', 'Glazing and structured enhancements for Canaveral Port Authority.', canaveralImgs, 'bg-white') +
        buildSection('project-8', 'Topgolf Parsippany, NJ | 2026', 'Modern glass installations for Topgolf Parsippany.', topGolfImgs, 'bg-slate-100');

    content = content.replace(/<\/main>/, `${newSections}\n    </main>`);
    
    await fs.writeFile('portfolio.html', content);
}

Promise.all([updateIndex(), updatePortfolio()]).then(() => console.log('HTML updated successfully')).catch(console.error);
