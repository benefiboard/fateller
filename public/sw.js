if(!self.define){let e,a={};const r=(r,i)=>(r=new URL(r+".js",i).href,a[r]||new Promise((a=>{if("document"in self){const e=document.createElement("script");e.src=r,e.onload=a,document.head.appendChild(e)}else e=r,importScripts(r),a()})).then((()=>{let e=a[r];if(!e)throw new Error(`Module ${r} didn’t register its module`);return e})));self.define=(i,n)=>{const c=e||("document"in self?document.currentScript.src:"")||location.href;if(a[c])return;let t={};const s=e=>r(e,c),f={module:{uri:c},exports:t,require:s};a[c]=Promise.all(i.map((e=>f[e]||s(e)))).then((e=>(n(...e),t)))}}define(["./workbox-a53b5d6f"],(function(e){"use strict";importScripts("/fallback-ce627215c0e4a9af.js","/worker-0fab7f09461e9d0d.js"),self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"/_next/static/0tmv5kPkVjUCUabDxAl7n/_buildManifest.js",revision:"c155cce658e53418dec34664328b51ac"},{url:"/_next/static/0tmv5kPkVjUCUabDxAl7n/_ssgManifest.js",revision:"b6652df95db52feb4daf4eca35380933"},{url:"/_next/static/chunks/112.251a52a54f9213b4.js",revision:"251a52a54f9213b4"},{url:"/_next/static/chunks/130-20100213b4a5e414.js",revision:"0tmv5kPkVjUCUabDxAl7n"},{url:"/_next/static/chunks/140-2b569313f41e3ba8.js",revision:"0tmv5kPkVjUCUabDxAl7n"},{url:"/_next/static/chunks/172-1ae4493ffe75cbf5.js",revision:"0tmv5kPkVjUCUabDxAl7n"},{url:"/_next/static/chunks/223.97fbc89dbe48cc1e.js",revision:"97fbc89dbe48cc1e"},{url:"/_next/static/chunks/258.a833a850b26bb0e3.js",revision:"a833a850b26bb0e3"},{url:"/_next/static/chunks/29-f1db5f2b1a3d2d06.js",revision:"0tmv5kPkVjUCUabDxAl7n"},{url:"/_next/static/chunks/331-6dd749f8648895d5.js",revision:"0tmv5kPkVjUCUabDxAl7n"},{url:"/_next/static/chunks/35.c9651fcb8b1e9205.js",revision:"c9651fcb8b1e9205"},{url:"/_next/static/chunks/430-bcd9b445fb28cb9d.js",revision:"0tmv5kPkVjUCUabDxAl7n"},{url:"/_next/static/chunks/479ba886.64604d570c910b50.js",revision:"64604d570c910b50"},{url:"/_next/static/chunks/514.92d84619babe10bf.js",revision:"92d84619babe10bf"},{url:"/_next/static/chunks/515-2f54701a8d2c4fb1.js",revision:"0tmv5kPkVjUCUabDxAl7n"},{url:"/_next/static/chunks/550.1d13fb7f78ea91fe.js",revision:"1d13fb7f78ea91fe"},{url:"/_next/static/chunks/553.0f004769aab6c03a.js",revision:"0f004769aab6c03a"},{url:"/_next/static/chunks/614-8b71d53883b32caa.js",revision:"0tmv5kPkVjUCUabDxAl7n"},{url:"/_next/static/chunks/635-3d57ac3de3a01325.js",revision:"0tmv5kPkVjUCUabDxAl7n"},{url:"/_next/static/chunks/751-3e37c2cb9a1211c1.js",revision:"0tmv5kPkVjUCUabDxAl7n"},{url:"/_next/static/chunks/760.3500688696bf3147.js",revision:"3500688696bf3147"},{url:"/_next/static/chunks/784.c00996926ad96737.js",revision:"c00996926ad96737"},{url:"/_next/static/chunks/863-a61aaa9fad3cbb27.js",revision:"0tmv5kPkVjUCUabDxAl7n"},{url:"/_next/static/chunks/8e1d74a4.fef3a34f3ec4827a.js",revision:"fef3a34f3ec4827a"},{url:"/_next/static/chunks/94730671-ba37a8186458685f.js",revision:"0tmv5kPkVjUCUabDxAl7n"},{url:"/_next/static/chunks/app/(landing)/introduce/page-686592f3f4301d95.js",revision:"0tmv5kPkVjUCUabDxAl7n"},{url:"/_next/static/chunks/app/(landing)/layout-0c00430c32ad67bd.js",revision:"0tmv5kPkVjUCUabDxAl7n"},{url:"/_next/static/chunks/app/(landing)/page-c15177e79e06a9af.js",revision:"0tmv5kPkVjUCUabDxAl7n"},{url:"/_next/static/chunks/app/(main)/layout-12f00d8b24dcca5e.js",revision:"0tmv5kPkVjUCUabDxAl7n"},{url:"/_next/static/chunks/app/(main)/memo/page-af91378144e35a3a.js",revision:"0tmv5kPkVjUCUabDxAl7n"},{url:"/_next/static/chunks/app/_not-found/page-fad1c788f372dd43.js",revision:"0tmv5kPkVjUCUabDxAl7n"},{url:"/_next/static/chunks/app/auth/auth-code-error/page-e4e962a7adc36b86.js",revision:"0tmv5kPkVjUCUabDxAl7n"},{url:"/_next/static/chunks/app/auth/confirm/page-f811a4f4ffb9d1d4.js",revision:"0tmv5kPkVjUCUabDxAl7n"},{url:"/_next/static/chunks/app/auth/page-351ea0f7c35a3b87.js",revision:"0tmv5kPkVjUCUabDxAl7n"},{url:"/_next/static/chunks/app/layout-720a70b0c20fde5d.js",revision:"0tmv5kPkVjUCUabDxAl7n"},{url:"/_next/static/chunks/app/start/page-f5ef509c847a6ec0.js",revision:"0tmv5kPkVjUCUabDxAl7n"},{url:"/_next/static/chunks/app/test/basic-search/page-4b5b4852eff2ccbb.js",revision:"0tmv5kPkVjUCUabDxAl7n"},{url:"/_next/static/chunks/app/user-info/page-c15ba67295a11e5c.js",revision:"0tmv5kPkVjUCUabDxAl7n"},{url:"/_next/static/chunks/app/~offline/page-4c16ffd0f8b701e3.js",revision:"0tmv5kPkVjUCUabDxAl7n"},{url:"/_next/static/chunks/fd9d1056-d952c94cdb623b59.js",revision:"0tmv5kPkVjUCUabDxAl7n"},{url:"/_next/static/chunks/framework-f66176bb897dc684.js",revision:"0tmv5kPkVjUCUabDxAl7n"},{url:"/_next/static/chunks/main-app-6afffb4d31e0f365.js",revision:"0tmv5kPkVjUCUabDxAl7n"},{url:"/_next/static/chunks/main-cb2e2f28233d1bb9.js",revision:"0tmv5kPkVjUCUabDxAl7n"},{url:"/_next/static/chunks/pages/_app-72b849fbd24ac258.js",revision:"0tmv5kPkVjUCUabDxAl7n"},{url:"/_next/static/chunks/pages/_error-7ba65e1336b92748.js",revision:"0tmv5kPkVjUCUabDxAl7n"},{url:"/_next/static/chunks/polyfills-42372ed130431b0a.js",revision:"846118c33b2c0e922d7b3a7676f81f6f"},{url:"/_next/static/chunks/webpack-ae29fb155574b2f3.js",revision:"0tmv5kPkVjUCUabDxAl7n"},{url:"/_next/static/css/ab089049a2f9b118.css",revision:"ab089049a2f9b118"},{url:"/_next/static/media/4473ecc91f70f139-s.p.woff",revision:"78e6fc13ea317b55ab0bd6dc4849c110"},{url:"/_next/static/media/463dafcda517f24f-s.p.woff",revision:"cbeb6d2d96eaa268b4b5beb0b46d9632"},{url:"/ad-coupang.png",revision:"5400acaf48ffc094d69c6be92152b493"},{url:"/avatar_base.svg",revision:"76f74445e9eb8534e7f1f0986d1cf917"},{url:"/dailytalk_persona/influence.jpg",revision:"310ea0ecffb1f66431c86bbe5b54b20a"},{url:"/dailytalk_persona/manager.jpg",revision:"eb2037be5649fc5ed004a090c4ef7f1c"},{url:"/dailytalk_persona/original.jpg",revision:"18bd66b14892ea77aab6c8830e4d1912"},{url:"/dailytalk_persona/philosophy.jpg",revision:"9352de8bda28b5869662c26191c595f0"},{url:"/dailytalk_persona/poetic.jpg",revision:"d399718e0ad37838e43e37cc08bac6f9"},{url:"/fallback-ce627215c0e4a9af.js",revision:"1e9d74279c35804a7d73ce125e461c8f"},{url:"/fortune/crystal/amethyst-cave.jpg",revision:"06eaa449732f2ca5b910cbca15b0068f"},{url:"/fortune/crystal/ancient-sanctuary.jpg",revision:"cb51130c0ec5bd96f98fbaa5977e746a"},{url:"/fortune/crystal/aurora-cave.jpg",revision:"3a2bf7d3a12deb84320bdcde68142343"},{url:"/fortune/crystal/golden-temple.jpg",revision:"c24ba7560ffe219ac1e0c138ffca62d8"},{url:"/fortune/crystal/marble-sanctuary.jpg",revision:"98c7d9bbfe965cfc32e8cfd01cfb87f9"},{url:"/fortune/crystal/midnight-room.jpg",revision:"6d209c5b4ad8766ab7e36503aaeb27ad"},{url:"/fortune/crystal/moonlit-garden.jpg",revision:"55d10662d6143c66b23f79b2a9c25163"},{url:"/fortune/crystal/silk-waves.jpg",revision:"2d74faeaf54e63d5c3a123ee63e7c4d0"},{url:"/fortune/crystal/twilight-forest.jpg",revision:"6cc4a8c4ab48715808d1fe11d01ef33a"},{url:"/fortune/places/beach-cafe.jpg",revision:"b3c60f9b30b1deeaaed09c02b92ed0d2"},{url:"/fortune/places/boardwalk.jpg",revision:"b12894b621e6910b57f98310b4f702e4"},{url:"/fortune/places/brunch.jpg",revision:"3f0b8729e4d222a7cfb0b1fbd0a60e0f"},{url:"/fortune/places/city-library.jpg",revision:"e400c443b20f4fcb097e1dd5d27e2bc9"},{url:"/fortune/places/flower-cafe.jpg",revision:"ffcb238a90c2ed25390da62f88912697"},{url:"/fortune/places/forest-cafe.jpg",revision:"b02e6b1d0d9b3df51d519bed26b0b03a"},{url:"/fortune/places/garden-cafe.jpg",revision:"46c7a12242d27d2374d1a903cad8823b"},{url:"/fortune/places/hanriver.jpg",revision:"2d5715e08068b9b8c40662e83b7a7630"},{url:"/fortune/places/indoor-garden.jpg",revision:"8f1362f75e6a49f7a3061d9c20525ecc"},{url:"/fortune/places/midnight-cafe.jpg",revision:"9d194c31b022d6152161fc6680740683"},{url:"/fortune/places/moonbar.jpg",revision:"e1adabebcce06b239d17470fefa461ff"},{url:"/fortune/places/night-view.jpg",revision:"bc24f582ee32334c5c717c9dfe4ffb36"},{url:"/fortune/places/ocean-library.jpg",revision:"dfa82edf9da1b34b1e79aa93fafd4698"},{url:"/fortune/places/old-library.jpg",revision:"19115e1b34cc2a5d71e064aca2c5c379"},{url:"/fortune/places/park-bench.jpg",revision:"076262edd9d7da45fbda48197c9df5c6"},{url:"/fortune/places/retro-pub.jpg",revision:"23f533cc071cae1d888a168f3059e67f"},{url:"/fortune/places/rooftop.jpg",revision:"ddcfe93a3d497244994cbfb033778804"},{url:"/fortune/places/secret-garden.jpg",revision:"0df3061518a9f090ed67861de5de7783"},{url:"/fortune/places/teahouse.jpg",revision:"5b7fcff5310096fca25b868f4ff5f160"},{url:"/fortune/places/temple.jpg",revision:"54be45e82d8a8fa555a47baaf36bb2df"},{url:"/fortune/places/urban-forest.jpg",revision:"bffb55ff563f8e053ca07e97b939446e"},{url:"/fortune/props/amethyst-bracelet.jpg",revision:"f0e91211f4ce47d98d1b47f863d98d43"},{url:"/fortune/props/aurora-necklace.jpg",revision:"512ca42e544bef186584d14bb26ec075"},{url:"/fortune/props/bell-bracelet.jpg",revision:"eaebc4eeb38cab6bc86e0cd5a534f25b"},{url:"/fortune/props/butterfly-brooch.jpg",revision:"292a0942549fecf4ea508d45df0fa383"},{url:"/fortune/props/clover-charm.jpg",revision:"c6a14672ad0f41a4c194f0d8bfa91cdb"},{url:"/fortune/props/crystal-drop.jpg",revision:"10cd16db1535692f453c0efa3191bd20"},{url:"/fortune/props/crystal-pendant.jpg",revision:"56ff9dd22c4941c6260b74291d90f103"},{url:"/fortune/props/dreamcatcher.jpg",revision:"c26c021f3d54e226abee040a520e79b6"},{url:"/fortune/props/howlite-brooch.jpg",revision:"525121e1e4ef3be639e6487426551565"},{url:"/fortune/props/jade-coin.jpg",revision:"d539ba59c565ae42b35b427a1d8ad0fd"},{url:"/fortune/props/mirror-charm.jpg",revision:"02f9bca94b2a783d5cc996dd1f688f34"},{url:"/fortune/props/moonstone-ring.jpg",revision:"48315e722eb2f8ca896017b5a0fcc172"},{url:"/fortune/props/obsidian-ring.jpg",revision:"e0b0262a60d3d4bc36de12c631f222f2"},{url:"/fortune/props/onyx-charm.jpg",revision:"20fb56242d6fc263973f1b2083661cf9"},{url:"/fortune/props/opal-ring.jpg",revision:"b1ab0d7515a761f87de8cf507dcc76ae"},{url:"/fortune/props/pearl-brooch.jpg",revision:"44dc640b5b328657a859dcc48a1bd2e2"},{url:"/fortune/props/rose-quartz.jpg",revision:"bf4ed474be9d38051a57e068f81386fe"},{url:"/fortune/props/sage-bundle.jpg",revision:"16d03ce5e514f8fafcd5ef66c0e792fe"},{url:"/fortune/props/star-necklace.jpg",revision:"8b22fb4346b4caca2c10ad18b583b840"},{url:"/fortune/props/stone-necklace.jpg",revision:"a4f29d130fcc1fc930b7178765aff3e5"},{url:"/fortune/props/zodiac-cards.jpg",revision:"dc48e20414cd4937cbc9da90727a717c"},{url:"/fortune/times/brunch.jpg",revision:"0a6b53ee66c6537fa2ad5dc7d56f365f"},{url:"/fortune/times/date.jpg",revision:"6b3a802cf88f5a9551cef63688e05fdb"},{url:"/fortune/times/dawn-walk.jpg",revision:"64a3b5e9ea16ecf6f99644ff3995a608"},{url:"/fortune/times/dawn.jpg",revision:"0dfb74761c48389262df1f0dc8a2c737"},{url:"/fortune/times/dusk.jpg",revision:"c2e52b670be58881095555f151cdcc6e"},{url:"/fortune/times/early-dawn.jpg",revision:"77f99b1d8cfe74033c41e25ccc302fc4"},{url:"/fortune/times/evening-meditation.jpg",revision:"1b04750705e8d3834b6ab1c2c49a739a"},{url:"/fortune/times/evening.jpg",revision:"541be7aa4e6fce8f89abe7a0134300c1"},{url:"/fortune/times/golden.jpg",revision:"c9b88fea828ce5f01546f81b614775e8"},{url:"/fortune/times/lunch-break.jpg",revision:"1f5d0128c1a4862a41d134883e8d0eac"},{url:"/fortune/times/lunch.jpg",revision:"55ff0bdf41de4be24d76636d7a6aef01"},{url:"/fortune/times/meditation.jpg",revision:"970a4ce6f13a2f5ae20c499e60560134"},{url:"/fortune/times/moonlight.jpg",revision:"b0e971131424d1e4ddafcb9c3819e185"},{url:"/fortune/times/morning-coffee.jpg",revision:"8aa53e99c889536d8b65688bfa6e90e3"},{url:"/fortune/times/nap.jpg",revision:"57ac7e135f1f36b7e5a89dc3212bc50d"},{url:"/fortune/times/night-reading.jpg",revision:"435ed0955d60f7ab96e4e76ac3dc16eb"},{url:"/fortune/times/starlight.jpg",revision:"e1074e261f709f67d9f33d52a78c9c9b"},{url:"/fortune/times/sun.jpg",revision:"590d8fda07e5d40ec1ef33496520f4ec"},{url:"/fortune/times/sunset.jpg",revision:"16655add914cfbc87774d3ccdef0e444"},{url:"/fortune/times/teatime.jpg",revision:"131a2fe9177f8aa29269f88576be0f17"},{url:"/fortune/times/twilight.jpg",revision:"6f53fb07b97515240c8b495b28fff8b6"},{url:"/fortune_character/negative/anna-negative.jpg",revision:"9fac808b545a3d72fcd75949e6725f95"},{url:"/fortune_character/negative/arabian-negative.jpg",revision:"f9d036c368c450431b596895e195e59e"},{url:"/fortune_character/negative/beauty-negative.jpg",revision:"af765e77a34f5c962467788d583003d2"},{url:"/fortune_character/negative/cinderella-negative.jpg",revision:"8838ff67e15e54e6667bc84a99547178"},{url:"/fortune_character/negative/icarus-negative.jpg",revision:"d5ac822f71e030cb45067247b42dd657"},{url:"/fortune_character/negative/madam-negative.jpg",revision:"604f243a415746954d60bf54f2b5c90f"},{url:"/fortune_character/negative/mermaid-negative.jpg",revision:"76ebe32bb84a9ff3c0be55634bee9200"},{url:"/fortune_character/negative/orpheus-negative.jpg",revision:"61ac2148d2676424e2a90f0cee4a0d98"},{url:"/fortune_character/negative/perseus-negative.jpg",revision:"235438588017eb032df3923d9c9fb5e1"},{url:"/fortune_character/negative/pride-negative.jpg",revision:"2e8e29c89242d949e24d063bcba339d3"},{url:"/fortune_character/negative/rapunzel-negative.jpg",revision:"059403279a9558a59ca7ea8bb6fb47f8"},{url:"/fortune_character/negative/romeo-negative.jpg",revision:"cf34e6900402918cd3aa88297351af5a"},{url:"/fortune_character/negative/sleeping-negative.jpg",revision:"1478c5b7b4fac7a27f2e3dc1a2315eed"},{url:"/fortune_character/negative/snowwhite-negative.jpg",revision:"272ab5cbbd655de5d8eafb1321631297"},{url:"/fortune_character/neutral/anna-neutral.jpg",revision:"b410fc53fbced5c90ddd763e87c83ff7"},{url:"/fortune_character/neutral/arabian-neutral.jpg",revision:"7543567200ee06b36c4f33ba20634a95"},{url:"/fortune_character/neutral/beauty-neutral.jpg",revision:"c16f00661c234f418f03ef8c30de7968"},{url:"/fortune_character/neutral/cinderella-neutral.jpg",revision:"fb725329c428b5520e93085a6a0e1216"},{url:"/fortune_character/neutral/icarus-neutral.jpg",revision:"c13d30447f94120e9e91773cbc80cbc3"},{url:"/fortune_character/neutral/madam-neutral.jpg",revision:"60e294bc008d7a3e21afb2834997b657"},{url:"/fortune_character/neutral/mermaid-neutral.jpg",revision:"3d6d936c2458dbb55e0f296936c9befe"},{url:"/fortune_character/neutral/orpheus-neutral.jpg",revision:"877b9defc4cb32432bfe1d9a56074d32"},{url:"/fortune_character/neutral/perseus-neutral.jpg",revision:"815d64c37b4d355f13c58f28bf71c506"},{url:"/fortune_character/neutral/pride-neutral.jpg",revision:"fe305adf99538d6558416106ecca8253"},{url:"/fortune_character/neutral/rapunzel-neutral.jpg",revision:"a25362196f907dddb181fdc53705a256"},{url:"/fortune_character/neutral/romeo-neutral.jpg",revision:"4ba6e5e43aaf401001af127dfa866b31"},{url:"/fortune_character/neutral/sleeping-neutral.jpg",revision:"812f8f2e8f20d9c88812488e0eae3f24"},{url:"/fortune_character/neutral/snowwhite-neutral.jpg",revision:"88d3a3a92fa77298712d55c6a5350c76"},{url:"/fortune_character/positive/anna-positive.jpg",revision:"851d99f7a3a4b1d2c518ad6895779b40"},{url:"/fortune_character/positive/arabian-positive.jpg",revision:"cb0e1b8035d3871220806af14d1a11c9"},{url:"/fortune_character/positive/beauty-positive.jpg",revision:"9f5e8aea6e0441ad39c6ef6ce8c1c5b5"},{url:"/fortune_character/positive/cinderella-positive.jpg",revision:"0cd5a32b2920ea6626aa5e13e3e262c7"},{url:"/fortune_character/positive/icarus-positive.jpg",revision:"fe7b003bcaefc5fb8393e4cc563102f0"},{url:"/fortune_character/positive/madam-positive.jpg",revision:"93b6ddc24994abf3ab074267f24254a3"},{url:"/fortune_character/positive/mermaid-positive.jpg",revision:"eed6459c4f25172ca8a0c7347669dd9b"},{url:"/fortune_character/positive/orpheus-positive.jpg",revision:"aefa0daeb41a9d678f8c06642d80935f"},{url:"/fortune_character/positive/perseus-positive.jpg",revision:"b86602687e234e414f0dd3458faaa2af"},{url:"/fortune_character/positive/pride-positive.jpg",revision:"05ab45fb07a4866d8fd3969c74bc93aa"},{url:"/fortune_character/positive/rapunzel-positive.jpg",revision:"dbb494a182a26cf2e6bfa0e2442657bc"},{url:"/fortune_character/positive/romeo-positive.jpg",revision:"b56b2ec3fddb14dfb9f5e203bf788b21"},{url:"/fortune_character/positive/sleeping-positive.jpg",revision:"9b35b3076efe678be22f4e77d41289fe"},{url:"/fortune_character/positive/snowwhite-positive.jpg",revision:"d651d995aabc4fde630699848859676a"},{url:"/icons/icon-192x192.png",revision:"37069052123c61ba4a637bc94eeba2c2"},{url:"/icons/icon-384x384.png",revision:"e1724bb37ee075fcee6d0bb752eab5e7"},{url:"/icons/icon-512x512.png",revision:"ef860dd8dd9a652ae22a284040b0fe13"},{url:"/landing/1-1.jpg",revision:"7d6f0969a7787da12a7959fd7efaceb4"},{url:"/landing/1-2.jpg",revision:"14911b4117c4d516eef663b4c0f21e46"},{url:"/landing/1-3.jpg",revision:"c4233d961a3cd23cba19d88e7063084e"},{url:"/landing/2-1.jpg",revision:"12b64ea9616bad80e31e653b9e309aef"},{url:"/landing/2-2.jpg",revision:"9a18c4647b00b21326e120248a7feaac"},{url:"/landing/3-1.jpg",revision:"805b7670f141aa5da37d6a344f6515ef"},{url:"/landing/3-2.jpg",revision:"e8dd8669a496a92a28b9a3f74fa6dd26"},{url:"/landing/3-3.jpg",revision:"58149f82385a1b06a70cf856eb84c58d"},{url:"/landing/4-1.jpg",revision:"97d214a11aac0aec9175f0312134964c"},{url:"/landing/4-2.jpg",revision:"dd91a5f3b4ccffb76a52a2e7293efc98"},{url:"/landing/4-3.jpg",revision:"c80a1ee2a011fb0a535c276366cdf912"},{url:"/landing/4-4.jpg",revision:"552b0a0a9a1d8caeefc4a5c76036fd84"},{url:"/landing/4-5.jpg",revision:"7d40855fe3445b46186ca04fd02610d3"},{url:"/landing/4-6.jpg",revision:"7f19018283b30496eeb1f0a0f87c9a61"},{url:"/landing/main.jpg",revision:"a29fbcf7dedff270273e9e8ad27a7081"},{url:"/logo-benefipic.png",revision:"963f4f869319bc1c3fa8f055c5c87e59"},{url:"/logo-benefipic.svg",revision:"115ecd881539ab23f793fb13b148e9d3"},{url:"/main/main-image-fortune.webp",revision:"1725a5efa1bd0083bf5caaf244e62985"},{url:"/main/main-image-main.webp",revision:"e254e4864f786aefaaab7067f6973220"},{url:"/main/main-image-mirror.webp",revision:"582817ed416757b454247bd8eb3e7571"},{url:"/main/main-image-tarot.webp",revision:"596eee0f60080f0ec12a8182c5a4939d"},{url:"/main/main-image-today.webp",revision:"96f91e5f610aabd7789ceb5579b430dc"},{url:"/manifest.json",revision:"ca773c2c64f410ccf6b1f116a8983bee"},{url:"/mirror/moon.jpg",revision:"73a2fa2c8bd7c015b883efb78bd8f26a"},{url:"/mirror/universe.jpg",revision:"11a5569e53ac56d5686c7909c0acab6c"},{url:"/screenshots/food-analysis.png",revision:"59d4e33820dd54aa413bb884b33d487b"},{url:"/screenshots/menu-recommendation.png",revision:"a3e1d9b8a6cdbc27934cf25b58a32a2d"},{url:"/start/start-1.webp",revision:"db648692231a241691b278e6c1eb2b04"},{url:"/start/start-2.webp",revision:"f37b80e1ea5c0f2535e40632cd645887"},{url:"/tarot/chariot.webp",revision:"60ad763bd7fc2d43261d6527dc477e0e"},{url:"/tarot/death.webp",revision:"3c9738c671b2a88d62378c4063049143"},{url:"/tarot/devil.webp",revision:"e88a8f918284114dd5e07a6abdc1bfc8"},{url:"/tarot/emperor.webp",revision:"6750d8b73aca86687b922a562ce62a8e"},{url:"/tarot/empress.webp",revision:"6242e461bae5770430504195ca2d2611"},{url:"/tarot/fool.webp",revision:"076d189cc2baf83774ee9c05ec264090"},{url:"/tarot/hanged-man.webp",revision:"056c9c87f04f6fed25087a899f9deac9"},{url:"/tarot/hermit.webp",revision:"86d7c337723164749df3307440eaddbe"},{url:"/tarot/hierophant.webp",revision:"a9be979b203bec8de4e978b061f2f1ff"},{url:"/tarot/highpriestess.webp",revision:"4eb51497740d9a126421d667e0f65062"},{url:"/tarot/judgement.webp",revision:"091fb7d5c45bb4c13a20e2c4e930018e"},{url:"/tarot/justice.webp",revision:"1074f586c53695833ff8623d72a94302"},{url:"/tarot/lovers.webp",revision:"6361276de4be3b32e2010c6db946a205"},{url:"/tarot/magician.webp",revision:"bdcd5adc6a2645134d0621ac5872e53a"},{url:"/tarot/moon.webp",revision:"266bd6e9bcaa619c5a9e55904834fe6e"},{url:"/tarot/star.webp",revision:"4223383504c5acf3dfd11c414a0ede63"},{url:"/tarot/strength.webp",revision:"26d51ac853b713d0bfbdc6201e5eedc8"},{url:"/tarot/sun.webp",revision:"22c2f090a51c16462486ccbf7b64cc6d"},{url:"/tarot/temperance.webp",revision:"3b4ba5acbd211366a46bbe9763f05027"},{url:"/tarot/tower.webp",revision:"082307ce2acc2625265750cc7f02b471"},{url:"/tarot/wheel-of-fortune.webp",revision:"97174ce173b906fbdcb4012524d9ed25"},{url:"/tarot/world.webp",revision:"b661c94e34ef0f6065640ceaf1ba03cf"},{url:"/tutorial/step1-0.webp",revision:"6cdfc09117ba15f458a512d391774b7c"},{url:"/tutorial/step1-1.webp",revision:"a87e66652dc330420a966193ddab99f3"},{url:"/tutorial/step1-2.webp",revision:"ebef6988d9dce60ab5f09aa45d9dcbab"},{url:"/tutorial/step1-3.webp",revision:"dc43126d612944278ac1608be877e8f3"},{url:"/tutorial/step1-4.webp",revision:"7a146cb70dcba48945c04f7b83c130a1"},{url:"/tutorial/step1-5.webp",revision:"436d1d3ba3a03887d2110bf16d891eae"},{url:"/tutorial/step1-end.webp",revision:"cda11016912e0018a5923c05f543e7c5"},{url:"/tutorial/step1-start.webp",revision:"8264d13f9d7085c1a04dad829c1d3132"},{url:"/tutorial/step2-0.webp",revision:"13fa4bb4dbd6cc7ef80f7f9d16b07a86"},{url:"/tutorial/step3-0.webp",revision:"edb1e3491bead10de63911e7d30f9933"},{url:"/worker-0fab7f09461e9d0d.js",revision:"409729e9b7c08972b329ac3ce93c732b"},{url:"/~offline",revision:"0tmv5kPkVjUCUabDxAl7n"}],{ignoreURLParametersMatching:[/^utm_/,/^fbclid$/]}),e.cleanupOutdatedCaches(),e.registerRoute("/",new e.NetworkFirst({cacheName:"start-url",plugins:[{cacheWillUpdate:async({response:e})=>e&&"opaqueredirect"===e.type?new Response(e.body,{status:200,statusText:"OK",headers:e.headers}):e},{handlerDidError:async({request:e})=>"undefined"!=typeof self?self.fallback(e):Response.error()}]}),"GET"),e.registerRoute(/^https:\/\/link\.coupang\.com/,new e.NetworkOnly({plugins:[new e.BackgroundSyncPlugin("external-links",{maxRetentionTime:86400}),{handlerDidError:async({request:e})=>"undefined"!=typeof self?self.fallback(e):Response.error()}]}),"GET")}));
