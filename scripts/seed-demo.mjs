/**
 * Наполняет сайт демонстрационным контентом через административное API.
 * Запуск: node scripts/seed-demo.mjs
 *
 * Логин и пароль запрашиваются интерактивно, чтобы не зависеть от кавычек
 * и раскрытия спецсимволов в шелле. Можно задать и через окружение:
 * AXROCK_ADMIN_USERNAME / AXROCK_ADMIN_PASSWORD.
 *
 * Скрипт идемпотентен по slug: уже существующие записи пропускаются.
 */

import readline from "node:readline";

const API = (process.env.VITE_API_BASE_URL ?? "https://api.monoroh.com/api/axrock").replace(/\/$/, "");

console.log(`API: ${API}`);

function ask(query, hidden = false) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: true,
    });

    if (hidden) {
      rl._writeToOutput = (chunk) => {
        if (chunk.includes(query)) rl.output.write(chunk);
      };
    }

    rl.question(query, (answer) => {
      rl.close();
      if (hidden) process.stdout.write("\n");
      resolve(answer.trim());
    });
  });
}

const username = process.env.AXROCK_ADMIN_USERNAME || (await ask("Логин администратора: "));
const password = process.env.AXROCK_ADMIN_PASSWORD || (await ask("Пароль: ", true));

if (!username || !password) {
  console.error("Логин и пароль обязательны.");
  process.exit(1);
}

const doc = (...paragraphs) => ({
  type: "doc",
  content: paragraphs.map((text) => ({
    type: "paragraph",
    content: [{ type: "text", text }],
  })),
});

async function request(path, { method = "GET", body, token } = {}) {
  const response = await fetch(`${API}${path}`, {
    method,
    headers: {
      Accept: "application/json",
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const detail = data?.description ?? data?.code ?? response.statusText;
    throw new Error(`${method} ${path} → ${response.status}: ${detail}`);
  }
  return data;
}

function isoIn(days, hour) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  date.setUTCHours(hour, 0, 0, 0);
  return date.toISOString();
}

const NEWS = [
  {
    title: "Работа над новым альбомом вышла на финальную стадию",
    slug: "rabota-nad-novym-albomom",
    excerpt:
      "Записаны все инструментальные партии, впереди сведение и мастеринг. Рассказываем, чего ждать от пластинки.",
    status: "PUBLISHED",
    featured: true,
    content: doc(
      "Мы закончили запись инструментальных партий и приступили к сведению. Материал собирался почти год: часть песен родилась на репетициях, часть — прямо во время тура.",
      "Точную дату релиза объявим отдельно. Следите за анонсами в соцсетях и здесь, в разделе новостей.",
    ),
  },
  {
    title: "Осенний тур: города и площадки",
    slug: "osenniy-tur-goroda-i-ploshchadki",
    excerpt: "Публикуем полный список дат осеннего тура. Билеты — на сайтах организаторов.",
    status: "PUBLISHED",
    featured: false,
    content: doc(
      "Осенью мы сыграем в нескольких городах с новой программой. Часть песен прозвучит вживую впервые.",
      "Билеты продаются на сайтах организаторов — ссылки есть на странице каждого концерта.",
    ),
  },
  {
    title: "Черновик: закулисье съёмок клипа",
    slug: "chernovik-zakulise-semok",
    excerpt: "Эта запись не опубликована и не должна отображаться на сайте.",
    status: "DRAFT",
    featured: false,
    content: doc("Черновик для проверки того, что неопубликованные материалы не попадают в публичное API."),
  },
];

const CONCERTS = [
  {
    title: "Большой сольный концерт",
    slug: "bolshoy-solnyy-koncert-moskva",
    city: "Москва",
    venueName: "Клуб «Пример»",
    venueAddress: "Москва, улица Примерная, 1",
    shortDescription: "Презентация новой программы и песни, которых ещё не было на концертах.",
    startsAt: isoIn(102, 16),
    doorsOpenAt: isoIn(102, 15),
    ageRestriction: "16+",
    ticketUrl: "https://example.com/tickets/moscow",
    ticketProvider: "Пример Афиша",
    organizerName: "Концертное агентство «Пример»",
    organizerUrl: "https://example.com",
    eventStatus: "ANNOUNCED",
    publicationStatus: "PUBLISHED",
    featured: true,
    description: doc(
      "Большой сольный концерт с новой программой. Полтора часа живого звука, старые песни в новых аранжировках и премьеры с готовящегося альбома.",
    ),
  },
  {
    title: "Клубный концерт",
    slug: "klubnyy-koncert-spb",
    city: "Санкт-Петербург",
    venueName: "Клуб «Образец»",
    venueAddress: "Санкт-Петербург, набережная Примерная, 12",
    shortDescription: "Камерный вечер в клубе — акустика и разговор со зрителем.",
    startsAt: isoIn(140, 17),
    ageRestriction: "18+",
    ticketUrl: null,
    eventStatus: "ANNOUNCED",
    publicationStatus: "PUBLISHED",
    featured: false,
    description: doc("Акустический состав, небольшой зал и живое общение с залом между песнями."),
  },
  {
    title: "Весенний концерт",
    slug: "vesenniy-koncert-ekaterinburg",
    city: "Екатеринбург",
    venueName: "Концертный зал «Пример»",
    shortDescription: "Концерт прошёл весной — запись выступления скоро появится в разделе медиа.",
    startsAt: isoIn(-135, 16),
    ageRestriction: "12+",
    ticketUrl: null,
    eventStatus: "COMPLETED",
    publicationStatus: "PUBLISHED",
    featured: false,
    description: doc("Спасибо всем, кто пришёл. Видео и фотографии с концерта опубликуем отдельно."),
  },
];

const RELEASES = [
  {
    title: "Свет в окне",
    slug: "svet-v-okne",
    type: "ALBUM",
    description: "Полноформатный альбом, записанный за год между турами.",
    releaseDate: isoIn(-420, 0),
    published: true,
    sortOrder: 0,
    tracks: [
      { title: "Первый снег", duration: "4:12", trackNumber: 1 },
      { title: "Дорога домой", duration: "3:48", trackNumber: 2 },
      { title: "Свет в окне", duration: "5:21", trackNumber: 3 },
      { title: "Тишина", duration: "4:03", trackNumber: 4 },
      { title: "Позывные", duration: "3:35", trackNumber: 5 },
    ],
    links: [
      { platform: "Яндекс Музыка", url: "https://music.yandex.ru/album/example", sortOrder: 0 },
      { platform: "VK Музыка", url: "https://vk.com/music/album/example", sortOrder: 1 },
    ],
  },
  {
    title: "Между этажами",
    slug: "mezhdu-etazhami",
    type: "EP",
    description: "Мини-альбом из четырёх песен, записанный живьём в студии.",
    releaseDate: isoIn(-180, 0),
    published: true,
    sortOrder: 1,
    tracks: [
      { title: "Между этажами", duration: "3:55", trackNumber: 1 },
      { title: "Лестница", duration: "4:20", trackNumber: 2 },
      { title: "Ещё один этаж", duration: "3:12", trackNumber: 3 },
    ],
    links: [
      { platform: "Яндекс Музыка", url: "https://music.yandex.ru/album/example-ep", sortOrder: 0 },
    ],
  },
  {
    title: "Не оборачивайся",
    slug: "ne-oborachivaysya",
    type: "SINGLE",
    description: "Сингл с готовящегося альбома.",
    releaseDate: isoIn(-30, 0),
    published: true,
    sortOrder: 2,
    tracks: [{ title: "Не оборачивайся", duration: "3:44", trackNumber: 1 }],
    links: [
      { platform: "Яндекс Музыка", url: "https://music.yandex.ru/album/example-single", sortOrder: 0 },
      { platform: "VK Музыка", url: "https://vk.com/music/album/example-single", sortOrder: 1 },
    ],
  },
];

const MEDIA = [
  { type: "PHOTO", title: "С концерта в Москве", status: "PUBLISHED", sortOrder: 0 },
  { type: "PHOTO", title: "Саундчек перед выходом", status: "PUBLISHED", sortOrder: 1 },
  { type: "BACKSTAGE", title: "За кулисами", status: "PUBLISHED", sortOrder: 2 },
  {
    type: "VIDEO",
    title: "Не оборачивайся — живое исполнение",
    status: "PUBLISHED",
    sortOrder: 3,
    externalUrl: "https://rutube.ru/video/example/",
  },
  { type: "POSTER", title: "Афиша осеннего тура", status: "PUBLISHED", sortOrder: 4 },
];

const login = await request("/admin/auth/login", {
  method: "POST",
  body: { username, password },
});
const token = login.token;
console.log(`Вход выполнен: ${login.user.username}`);

const existingNews = await request("/admin/news?pageSize=100", { token });
const existingNewsSlugs = new Set((existingNews.items ?? []).map((item) => item.slug));

for (const item of NEWS) {
  if (existingNewsSlugs.has(item.slug)) {
    console.log(`Новость «${item.title}» уже есть — пропускаю`);
    continue;
  }
  await request("/admin/news", {
    method: "POST",
    token,
    body: {
      ...item,
      coverImage: null,
      categoryId: null,
      publishedAt: item.status === "PUBLISHED" ? new Date().toISOString() : null,
      seoTitle: null,
      seoDescription: null,
    },
  });
  console.log(`Создана новость: ${item.title} (${item.status})`);
}

const existingConcerts = await request("/admin/concerts?pageSize=100", { token });
const existingConcertSlugs = new Set((existingConcerts.items ?? []).map((item) => item.slug));

for (const item of CONCERTS) {
  if (existingConcertSlugs.has(item.slug)) {
    console.log(`Концерт «${item.title}» уже есть — пропускаю`);
    continue;
  }
  await request("/admin/concerts", {
    method: "POST",
    token,
    body: {
      posterImage: null,
      country: "Россия",
      timezone: "Europe/Moscow",
      mapUrl: null,
      newStartsAt: null,
      cancellationReason: null,
      seoTitle: null,
      seoDescription: null,
      participants: [],
      doorsOpenAt: null,
      ticketProvider: null,
      organizerName: null,
      organizerUrl: null,
      ...item,
    },
  });
  console.log(`Создан концерт: ${item.title} — ${item.city}`);
}

const existingReleases = await request("/admin/releases", { token });
const existingReleaseSlugs = new Set((existingReleases ?? []).map((item) => item.slug));

for (const item of RELEASES) {
  if (existingReleaseSlugs.has(item.slug)) {
    console.log(`Релиз «${item.title}» уже есть — пропускаю`);
    continue;
  }
  await request("/admin/releases", {
    method: "POST",
    token,
    body: { coverImage: null, seoTitle: null, seoDescription: null, ...item },
  });
  console.log(`Создан релиз: ${item.title} (${item.type})`);
}

const existingMedia = await request("/admin/media", { token });
const existingMediaTitles = new Set((existingMedia ?? []).map((item) => item.title));

for (const item of MEDIA) {
  if (existingMediaTitles.has(item.title)) {
    console.log(`Медиа «${item.title}» уже есть — пропускаю`);
    continue;
  }
  await request("/admin/media", {
    method: "POST",
    token,
    body: {
      description: null,
      fileUrl: null,
      previewImageUrl: null,
      externalUrl: null,
      concertId: null,
      ...item,
    },
  });
  console.log(`Создано медиа: ${item.title} (${item.type})`);
}

console.log("\nГотово. Обновите http://localhost:5173/");
