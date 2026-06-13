import type { Video, VideoContent } from "@/types/video";

type VideoEnOverlay = {
	enContent: VideoContent;
	tagsEn?: string[];
	keywordsEn?: string[];
	topicNameEn?: string;
};

/** English demo copy — merged onto raw API-shaped videos when locale is `en`. */
export const VIDEO_EN_OVERLAY: Record<number, VideoEnOverlay> = {
	1: {
		enContent: {
			title: "A Short Film from Hewraman",
			description:
				"A short film portraying daily life and culture in the Hewraman region, set among mountains and terraced fields.",
			location: "Hewraman",
			director: "Ako Mahmud",
			producer: "Kurdish Heritage Institute",
		},
		tagsEn: ["Hewraman", "Short film"],
		keywordsEn: ["Culture"],
	},
	2: {
		enContent: {
			title: "Voice of the Mountain",
			description:
				"An artistic short film about the relationship between people and the natural landscape of Kurdistan's mountains.",
			location: "Ranya",
			director: "Shilan Ali",
			producer: "Kurdish Heritage Institute",
		},
		tagsEn: ["Nature", "Short film"],
		keywordsEn: ["Landscape"],
	},
	3: {
		enContent: {
			title: "The Path of Water",
			description:
				"A short film tracing water's journey from mountain springs down to the fields below.",
			location: "Halabja",
			director: "Diyar Rasul",
			producer: "Kurdish Heritage Institute",
		},
		tagsEn: ["Water", "Short film"],
		keywordsEn: ["Environment"],
	},
	4: {
		enContent: {
			title: "Documentary on the City of Sulaymaniyah",
			description:
				"A historical documentary on the development of Sulaymaniyah in the twentieth century, told through photographs and archival footage.",
			location: "Sulaymaniyah",
			director: "Ahmed Karim",
			producer: "Kurdish Heritage Institute",
		},
		tagsEn: ["Sulaymaniyah", "History"],
		keywordsEn: ["Urban history"],
	},
	5: {
		enContent: {
			title: "Dengbêj Performance",
			description:
				"A sequence of clips from Kurdish dengbêj performers, each clip a traditional song.",
			location: "Erbil",
			director: "Niyan Ibrahim",
			producer: "Kurdish Heritage Institute",
		},
		tagsEn: ["Dengbêj", "Song"],
		keywordsEn: ["Oral tradition"],
	},
	6: {
		enContent: {
			title: "A Lesson in Kurdish History",
			description:
				"A scholarly lecture on the sources of Kurdish history and the importance of preserving them for future generations.",
			location: "Erbil",
			director: "Dr. Rebar Ahmed",
			producer: "Kurdish Heritage Institute",
		},
		tagsEn: ["History", "Lecture"],
		keywordsEn: ["Education"],
	},
	7: {
		enContent: {
			title: "Sulaymaniyah Newsreels 1960",
			description:
				"Restored newsreel footage from the city archive showing life in Sulaymaniyah during the 1960s.",
			location: "Sulaymaniyah",
			director: "City Archive",
			producer: "Kurdish Heritage Institute",
		},
		tagsEn: ["Archive", "News"],
		keywordsEn: ["Newsreel"],
	},
	8: {
		enContent: {
			title: "Short Films for Children",
			description:
				"A series of brief films for children — traditional Kurdish stories retold in a fresh visual style.",
			location: "Duhok",
			director: "Viyan Said",
			producer: "Kurdish Heritage Institute",
		},
		tagsEn: ["Children", "Short film"],
		keywordsEn: ["Storytelling"],
	},
	9: {
		enContent: {
			title: "Unknown Documentary",
			description:
				"A documentary without a poster, known only by its content — a test of the fallback title display.",
			location: "Kirkuk",
			director: "Hemin Qadir",
			producer: "Kurdish Heritage Institute",
		},
		tagsEn: ["Kirkuk"],
		keywordsEn: ["Documentary"],
	},
	10: {
		enContent: {
			title: "Musical Performance",
			description:
				"A live recording of a regional musical performance with traditional instruments.",
			location: "Erbil",
			director: "Rojin Mustafa",
			producer: "Kurdish Heritage Institute",
		},
		tagsEn: ["Music", "Performance"],
		keywordsEn: ["Live recording"],
	},
	11: {
		enContent: {
			title: "Short Film Without a Source",
			description:
				"A record whose video source has not yet been attached — a test of the no-source state.",
			location: "Zakho",
			director: "Aras Omer",
			producer: "Kurdish Heritage Institute",
		},
		tagsEn: ["Short film"],
		keywordsEn: ["Placeholder"],
	},
	12: {
		enContent: {
			title: "Childhood Years",
			description:
				"A short film recounting childhood memories in a Kurdish village, seen through a child's eyes.",
			location: "Halabja",
			director: "Lane Said",
			producer: "Kurdish Heritage Institute",
		},
		tagsEn: ["Children", "Society"],
		keywordsEn: ["Memory"],
	},
	13: {
		enContent: {
			title: "Colours of the City",
			description:
				"An artistic walk through the lanes of an old city, between light and shadow.",
			location: "Sulaymaniyah",
			director: "Hawar Jalal",
			producer: "Kurdish Heritage Institute",
		},
		tagsEn: ["Art", "City"],
		keywordsEn: ["Urban life"],
	},
	14: {
		enContent: {
			title: "Journey of Migration",
			description:
				"A documentary short about migration and the memory of a home left behind.",
			location: "Duhok",
			director: "Awaz Majid",
			producer: "Kurdish Heritage Institute",
		},
		tagsEn: ["History", "Society"],
		keywordsEn: ["Displacement"],
	},
	15: {
		enContent: {
			title: "Sound of Water",
			description:
				"A nature short film telling the story of a stream from its spring to the sea.",
			location: "Ranya",
			director: "Shene Kamal",
			producer: "Kurdish Heritage Institute",
		},
		tagsEn: ["Nature"],
		keywordsEn: ["Water"],
	},
	16: {
		enContent: {
			title: "Hand Engraving",
			description:
				"A brief documentary on the art of engraving and Kurdish handcraft.",
			location: "Erbil",
			director: "Behar Ahmed",
			producer: "Kurdish Heritage Institute",
		},
		tagsEn: ["Art", "Culture"],
		keywordsEn: ["Craft"],
	},
	17: {
		enContent: {
			title: "A Hewraman Night",
			description:
				"A short film depicting a summer night in the villages of Hewraman.",
			location: "Hewraman",
			director: "Ako Mahmud",
			producer: "Kurdish Heritage Institute",
		},
		tagsEn: ["Hewraman", "Nature"],
		keywordsEn: ["Night"],
	},
};

export const DEMO_VIDEO_TOPICS_EN: Record<number, string> = {
	1: "Short films",
	2: "Documentaries",
	3: "Performances",
	4: "Lectures",
	5: "Newsreels",
};

export function withEnglishVideoOverlay(video: Video): Video {
	const overlay = VIDEO_EN_OVERLAY[video.id];
	if (!overlay) {
		return video;
	}

	const topicNameEn =
		overlay.topicNameEn ??
		(video.topicId != null ? DEMO_VIDEO_TOPICS_EN[video.topicId] : undefined);

	return {
		...video,
		enContent: overlay.enContent,
		tagsEn: overlay.tagsEn,
		keywordsEn: overlay.keywordsEn,
		topicNameEn: topicNameEn ?? video.topicNameEn,
	};
}
