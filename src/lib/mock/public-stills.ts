/** Every raster still under /public used by demo catalogue data. */

export const MENU_STILLS = [
	"/menu/1.jpg",
	"/menu/2.jpg",
	"/menu/3.jpg",
	"/menu/4.jpg",
	"/menu/5.jpg",
	"/menu/6.jpg",
	"/menu/7.jpg",
	"/menu/chloe-Pai-B9eIomI-unsplash.jpg",
	"/menu/felix-ngo-tw9qM705ERY-unsplash.jpg",
	"/menu/irakli-shubitidze-YGj_mpiJg6U-unsplash.jpg",
	"/menu/zheng-xue-8QiCDuR0yKE-unsplash.jpg",
] as const;

export const GALLERY_STILLS = [
	"/gallery/1.jpg",
	"/gallery/2.jpg",
	"/gallery/3.jpg",
	"/gallery/4.jpg",
	"/gallery/5.jpg",
	"/gallery/6.jpg",
	"/gallery/7.jpg",
	"/gallery/8.jpg",
] as const;

export const NEWS_STILLS = [
	"/news/1.jpg",
	"/news/2.jpg",
	"/news/3.jpg",
	"/news/4.jpg",
	"/news/5.jpg",
	"/news/6.jpg",
	"/news/7.jpg",
	"/news/8.jpg",
	"/news/9.jpg",
	"/news/10.jpg",
] as const;

export const ABOUT_STILLS = [
	"/about/m2.jpg",
	"/about/services-bg.jpg",
	"/about/image_9310b7.PNG",
	"/about/artworks-000171267883-evk1m7-t500x500.jpg",
	"/about/475203467_1007002848126180_7383496220452921499_n.jpg",
] as const;

export const WRITINGS_STILLS = [
	"/writings/images/1.jpeg",
	"/writings/images/2.jpeg",
	"/writings/images/3.jpeg",
	"/writings/images/4.jpeg",
	"/writings/images/5.jpeg",
	"/writings/images/6.jpeg",
] as const;

export const WRITINGS_STILL = WRITINGS_STILLS[0];

export const ALL_PUBLIC_STILLS = [
	...MENU_STILLS,
	...GALLERY_STILLS,
	...NEWS_STILLS,
	...ABOUT_STILLS,
	...WRITINGS_STILLS,
] as const;
