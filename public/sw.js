if(!self.define){let i,e={};const s=(s,n)=>(s=new URL(s+".js",n).href,e[s]||new Promise((e=>{if("document"in self){const i=document.createElement("script");i.src=s,i.onload=e,document.head.appendChild(i)}else i=s,importScripts(s),e()})).then((()=>{let i=e[s];if(!i)throw new Error(`Module ${s} didn’t register its module`);return i})));self.define=(n,a)=>{const c=i||("document"in self?document.currentScript.src:"")||location.href;if(e[c])return;let t={};const r=i=>s(i,c),o={module:{uri:c},exports:t,require:r};e[c]=Promise.all(n.map((i=>o[i]||r(i)))).then((i=>(a(...i),t)))}}define(["./workbox-a53b5d6f"],(function(i){"use strict";importScripts("/fallback-ce627215c0e4a9af.js","/worker-0fab7f09461e9d0d.js"),self.skipWaiting(),i.clientsClaim(),i.precacheAndRoute([{url:"/_next/static/IXAVLA5nVtsioPiiixXUD/_buildManifest.js",revision:"0ea7e7088aabf697ba3d8aa8c7b54a89"},{url:"/_next/static/IXAVLA5nVtsioPiiixXUD/_ssgManifest.js",revision:"b6652df95db52feb4daf4eca35380933"},{url:"/_next/static/chunks/1112.46567bca35c83bd3.js",revision:"46567bca35c83bd3"},{url:"/_next/static/chunks/1369-af1106e9c013b486.js",revision:"IXAVLA5nVtsioPiiixXUD"},{url:"/_next/static/chunks/1430-abbd941886a0794e.js",revision:"IXAVLA5nVtsioPiiixXUD"},{url:"/_next/static/chunks/1514.5ca8474e6ab406d4.js",revision:"5ca8474e6ab406d4"},{url:"/_next/static/chunks/1553.4229f0d908383dac.js",revision:"4229f0d908383dac"},{url:"/_next/static/chunks/29-1ac32f1d172a941a.js",revision:"IXAVLA5nVtsioPiiixXUD"},{url:"/_next/static/chunks/3172-3f754b1a33708287.js",revision:"IXAVLA5nVtsioPiiixXUD"},{url:"/_next/static/chunks/3258.9fcbc8f5d9daa88d.js",revision:"9fcbc8f5d9daa88d"},{url:"/_next/static/chunks/35.c9651fcb8b1e9205.js",revision:"c9651fcb8b1e9205"},{url:"/_next/static/chunks/479ba886.2217479e7361fc8c.js",revision:"2217479e7361fc8c"},{url:"/_next/static/chunks/4863-cb44717874cd651c.js",revision:"IXAVLA5nVtsioPiiixXUD"},{url:"/_next/static/chunks/5223.60894afb74932a42.js",revision:"60894afb74932a42"},{url:"/_next/static/chunks/550.1d13fb7f78ea91fe.js",revision:"1d13fb7f78ea91fe"},{url:"/_next/static/chunks/5698.939e8c68dae2aee1.js",revision:"939e8c68dae2aee1"},{url:"/_next/static/chunks/5878-0b083d52ce11d382.js",revision:"IXAVLA5nVtsioPiiixXUD"},{url:"/_next/static/chunks/6614-74c7e91d2871ecfe.js",revision:"IXAVLA5nVtsioPiiixXUD"},{url:"/_next/static/chunks/6784.96eb7aaac6e54cb1.js",revision:"96eb7aaac6e54cb1"},{url:"/_next/static/chunks/7130-f6333d237b8a3591.js",revision:"IXAVLA5nVtsioPiiixXUD"},{url:"/_next/static/chunks/7525.747a28bf1a8109db.js",revision:"747a28bf1a8109db"},{url:"/_next/static/chunks/760.3500688696bf3147.js",revision:"3500688696bf3147"},{url:"/_next/static/chunks/8119-b76de7cb7839d07b.js",revision:"IXAVLA5nVtsioPiiixXUD"},{url:"/_next/static/chunks/8134-45c0fcbb2a573af3.js",revision:"IXAVLA5nVtsioPiiixXUD"},{url:"/_next/static/chunks/8635-6386c23e180b9603.js",revision:"IXAVLA5nVtsioPiiixXUD"},{url:"/_next/static/chunks/8844-0cb87fb6ed420d6a.js",revision:"IXAVLA5nVtsioPiiixXUD"},{url:"/_next/static/chunks/8e1d74a4.0ee72bf206bd7f14.js",revision:"0ee72bf206bd7f14"},{url:"/_next/static/chunks/9205-cf589e173fd0c1a2.js",revision:"IXAVLA5nVtsioPiiixXUD"},{url:"/_next/static/chunks/94730671-ba37a8186458685f.js",revision:"IXAVLA5nVtsioPiiixXUD"},{url:"/_next/static/chunks/9489.deea660de0f6a4d6.js",revision:"deea660de0f6a4d6"},{url:"/_next/static/chunks/app/(admin)/admin/blog/page-3ce9750a5b83bc5c.js",revision:"IXAVLA5nVtsioPiiixXUD"},{url:"/_next/static/chunks/app/(admin)/layout-4b66f6813be5f59c.js",revision:"IXAVLA5nVtsioPiiixXUD"},{url:"/_next/static/chunks/app/(blog)/blog/page-13293a643d6c8b54.js",revision:"IXAVLA5nVtsioPiiixXUD"},{url:"/_next/static/chunks/app/(blog)/blog/post/%5Bslug%5D/page-6cc14e101b8749f0.js",revision:"IXAVLA5nVtsioPiiixXUD"},{url:"/_next/static/chunks/app/(landing)/introduce/page-5d6a4d3ddb0ed3ce.js",revision:"IXAVLA5nVtsioPiiixXUD"},{url:"/_next/static/chunks/app/(landing)/layout-74bcf15ce5fb0b70.js",revision:"IXAVLA5nVtsioPiiixXUD"},{url:"/_next/static/chunks/app/(landing)/page-685e504959b7827b.js",revision:"IXAVLA5nVtsioPiiixXUD"},{url:"/_next/static/chunks/app/(main)/layout-ff751ceacc161b84.js",revision:"IXAVLA5nVtsioPiiixXUD"},{url:"/_next/static/chunks/app/(main)/memo/page-4b12c630e5b3831b.js",revision:"IXAVLA5nVtsioPiiixXUD"},{url:"/_next/static/chunks/app/_not-found/page-1522c13639a29e06.js",revision:"IXAVLA5nVtsioPiiixXUD"},{url:"/_next/static/chunks/app/auth/auth-code-error/page-f0b83982789cdb91.js",revision:"IXAVLA5nVtsioPiiixXUD"},{url:"/_next/static/chunks/app/auth/confirm/page-a4b144fb078a7c9e.js",revision:"IXAVLA5nVtsioPiiixXUD"},{url:"/_next/static/chunks/app/auth/page-fc2bec0be8b67b52.js",revision:"IXAVLA5nVtsioPiiixXUD"},{url:"/_next/static/chunks/app/layout-c89fc79878ded4e1.js",revision:"IXAVLA5nVtsioPiiixXUD"},{url:"/_next/static/chunks/app/start/page-7416b9500b80746b.js",revision:"IXAVLA5nVtsioPiiixXUD"},{url:"/_next/static/chunks/app/test/basic-search/page-e092791422a5226a.js",revision:"IXAVLA5nVtsioPiiixXUD"},{url:"/_next/static/chunks/app/user-info/page-d611b6618b437ce3.js",revision:"IXAVLA5nVtsioPiiixXUD"},{url:"/_next/static/chunks/app/~offline/page-3c0a6e7ffd3f80d9.js",revision:"IXAVLA5nVtsioPiiixXUD"},{url:"/_next/static/chunks/fd9d1056-1a8dd5df1bf42925.js",revision:"IXAVLA5nVtsioPiiixXUD"},{url:"/_next/static/chunks/framework-a63c59c368572696.js",revision:"IXAVLA5nVtsioPiiixXUD"},{url:"/_next/static/chunks/main-3d517e53f758f601.js",revision:"IXAVLA5nVtsioPiiixXUD"},{url:"/_next/static/chunks/main-app-844d211365d1e433.js",revision:"IXAVLA5nVtsioPiiixXUD"},{url:"/_next/static/chunks/pages/_app-78ddf957b9a9b996.js",revision:"IXAVLA5nVtsioPiiixXUD"},{url:"/_next/static/chunks/pages/_error-7ce03bcf1df914ce.js",revision:"IXAVLA5nVtsioPiiixXUD"},{url:"/_next/static/chunks/polyfills-42372ed130431b0a.js",revision:"846118c33b2c0e922d7b3a7676f81f6f"},{url:"/_next/static/chunks/webpack-0a2a73908af28055.js",revision:"IXAVLA5nVtsioPiiixXUD"},{url:"/_next/static/css/ea3f90fb2096a339.css",revision:"ea3f90fb2096a339"},{url:"/_next/static/media/4473ecc91f70f139-s.p.woff",revision:"78e6fc13ea317b55ab0bd6dc4849c110"},{url:"/_next/static/media/463dafcda517f24f-s.p.woff",revision:"cbeb6d2d96eaa268b4b5beb0b46d9632"},{url:"/ad-coupang.png",revision:"5400acaf48ffc094d69c6be92152b493"},{url:"/avatar_base.svg",revision:"76f74445e9eb8534e7f1f0986d1cf917"},{url:"/fallback-ce627215c0e4a9af.js",revision:"1e9d74279c35804a7d73ce125e461c8f"},{url:"/icons/icon-192x192.png",revision:"37069052123c61ba4a637bc94eeba2c2"},{url:"/icons/icon-384x384.png",revision:"e1724bb37ee075fcee6d0bb752eab5e7"},{url:"/icons/icon-512x512.png",revision:"ef860dd8dd9a652ae22a284040b0fe13"},{url:"/landing/1-1.webp",revision:"463bfb230e5ff3cae566311f8f8541e0"},{url:"/landing/1-2.webp",revision:"56a37bd220bab16bd15e02823715fdf3"},{url:"/landing/1-3.webp",revision:"8e5899cc5101bcf6763009c5344203aa"},{url:"/landing/2-1.webp",revision:"b96dc8797a0525d109bacdffbc024ab1"},{url:"/landing/2-2.webp",revision:"13a99b44a803228087ac8ecebf12a854"},{url:"/landing/3-1.webp",revision:"7705e729f95c05a3759dc85d34101f9f"},{url:"/landing/3-2.webp",revision:"ea1d9b94a14dd2e756dccf76601eee54"},{url:"/landing/3-3.webp",revision:"81529d2428a944304dc6923324d29461"},{url:"/landing/4-1.webp",revision:"6c1e67dbe32bb3d556cbd3b5cbf0cddc"},{url:"/landing/4-2.webp",revision:"874c6704b008d847a80a9f70287795d2"},{url:"/landing/4-3.webp",revision:"58d2805c17dc5c64e2df82cb4cb83ef9"},{url:"/landing/4-4.webp",revision:"a961162d6c93d0d21210420661a1b1bb"},{url:"/landing/4-5.webp",revision:"c0b622b421a9b3c63e16f11f1a77e57b"},{url:"/landing/4-6.webp",revision:"62b8a088a2123dee48e9b6a43f9f1975"},{url:"/landing/main.webp",revision:"047cd8f434f3386dd005f39faaacdb0a"},{url:"/logo-benefipic.png",revision:"963f4f869319bc1c3fa8f055c5c87e59"},{url:"/logo-benefipic.svg",revision:"115ecd881539ab23f793fb13b148e9d3"},{url:"/main/main-image-fortune.webp",revision:"1725a5efa1bd0083bf5caaf244e62985"},{url:"/main/main-image-main.webp",revision:"e254e4864f786aefaaab7067f6973220"},{url:"/main/main-image-mirror.webp",revision:"582817ed416757b454247bd8eb3e7571"},{url:"/main/main-image-tarot.webp",revision:"596eee0f60080f0ec12a8182c5a4939d"},{url:"/main/main-image-today.webp",revision:"96f91e5f610aabd7789ceb5579b430dc"},{url:"/manifest.json",revision:"ca773c2c64f410ccf6b1f116a8983bee"},{url:"/mirror/moon.jpg",revision:"73a2fa2c8bd7c015b883efb78bd8f26a"},{url:"/mirror/universe.jpg",revision:"11a5569e53ac56d5686c7909c0acab6c"},{url:"/robots.txt",revision:"b2753b9915790715fd056926473d48d2"},{url:"/screenshots/food-analysis.png",revision:"59d4e33820dd54aa413bb884b33d487b"},{url:"/screenshots/menu-recommendation.png",revision:"a3e1d9b8a6cdbc27934cf25b58a32a2d"},{url:"/sitemap-0.xml",revision:"4e202120f9e576b102e13e149ef496a8"},{url:"/sitemap.xml",revision:"1448820856586866d43287e3e5f38ee5"},{url:"/start/start-1.webp",revision:"db648692231a241691b278e6c1eb2b04"},{url:"/start/start-2.webp",revision:"f37b80e1ea5c0f2535e40632cd645887"},{url:"/worker-0fab7f09461e9d0d.js",revision:"409729e9b7c08972b329ac3ce93c732b"},{url:"/~offline",revision:"IXAVLA5nVtsioPiiixXUD"}],{ignoreURLParametersMatching:[/^utm_/,/^fbclid$/]}),i.cleanupOutdatedCaches(),i.registerRoute("/",new i.NetworkFirst({cacheName:"start-url",plugins:[{cacheWillUpdate:async({response:i})=>i&&"opaqueredirect"===i.type?new Response(i.body,{status:200,statusText:"OK",headers:i.headers}):i},{handlerDidError:async({request:i})=>"undefined"!=typeof self?self.fallback(i):Response.error()}]}),"GET"),i.registerRoute(/^https:\/\/link\.coupang\.com/,new i.NetworkOnly({plugins:[new i.BackgroundSyncPlugin("external-links",{maxRetentionTime:86400}),{handlerDidError:async({request:i})=>"undefined"!=typeof self?self.fallback(i):Response.error()}]}),"GET")}));
