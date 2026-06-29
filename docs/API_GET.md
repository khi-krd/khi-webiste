# KHI New APIs and New Fields

## 1. New fields on existing APIs

### 1.1 About

| Method | Endpoint | Parameters |
| --- | --- | --- |
| `GET` | `/api/v1/about/{identifier}` | `identifier`: ID or localized slug |
| `GET` | `/api/v1/about/slug/{slug}` | `slug`: CKB or KMR slug |
| `POST` | `/api/v1/about` | JSON body |
| `PUT` | `/api/v1/about/{id}` | `id`: About ID; JSON body |

Request — new fields:

```json
{
  "founderNameCkb": "ناوی دامەزرێنەر",
  "founderNameKmr": "Navê damezrîner",
  "founderBioCkb": "ژیاننامەی دامەزرێنەر",
  "founderBioKmr": "Jînenîgariya damezrîner",
  "founderImageUrl": "https://cdn.example.com/about/founder.jpg",
  "heroVideoUrl": "https://cdn.example.com/about/hero.mp4",
  "heroPosterUrl": "https://cdn.example.com/about/hero-poster.jpg"
}
```

Response — new fields:

```json
{
  "data": {
    "founderNameCkb": "ناوی دامەزرێنەر",
    "founderNameKmr": "Navê damezrîner",
    "founderBioCkb": "ژیاننامەی دامەزرێنەر",
    "founderBioKmr": "Jînenîgariya damezrîner",
    "founderImageUrl": "https://cdn.example.com/about/founder.jpg",
    "heroVideoUrl": "https://cdn.example.com/about/hero.mp4",
    "heroPosterUrl": "https://cdn.example.com/about/hero-poster.jpg"
  }
}
```

### 1.2 Contact

| Method | Endpoint | Parameters |
| --- | --- | --- |
| `GET` | `/api/v1/contact/{id}` | `id`: Contact ID |
| `GET` | `/api/v1/contact/slug/{slug}` | `slug`: CKB or KMR slug |
| `POST` | `/api/v1/contact` | JSON body |
| `PUT` | `/api/v1/contact/{id}` | `id`: Contact ID; JSON body |

Request — new fields:

```json
{
  "secondaryPhone": "+9647510000000",
  "mapEmbedUrl": "https://maps.example.com/embed/erbil",
  "latitude": 36.1911,
  "longitude": 44.0092,
  "heroImageUrl": "https://cdn.example.com/contact/erbil.jpg",
  "officeType": "HEADQUARTERS",
  "badgeCkb": "بارەگای سەرەکی",
  "badgeKmr": "Navenda sereke"
}
```

Response — new fields:

```json
{
  "data": {
    "secondaryPhone": "+9647510000000",
    "mapEmbedUrl": "https://maps.example.com/embed/erbil",
    "latitude": 36.1911,
    "longitude": 44.0092,
    "heroImageUrl": "https://cdn.example.com/contact/erbil.jpg",
    "officeType": "HEADQUARTERS",
    "badgeCkb": "بارەگای سەرەکی",
    "badgeKmr": "Navenda sereke"
  }
}
```

### 1.3 News

| Method | Endpoint | Parameters |
| --- | --- | --- |
| `GET` | `/api/v1/news/search` | `keyword` or `q`; `page=0`; `size=20` |
| `POST` | `/api/v1/news` | JSON body |
| `PUT` | `/api/v1/news/{id}` | `id`: News ID; JSON body |

Request — new fields:

```json
{
  "coverMediaType": "IMAGE",
  "coverThumbnailUrl": "https://cdn.example.com/news/cover-thumb.jpg",
  "mediaGallery": [
    {
      "url": "https://cdn.example.com/news/gallery-1.jpg",
      "kind": "IMAGE",
      "thumbnailUrl": "https://cdn.example.com/news/gallery-1-thumb.jpg",
      "captionCkb": "وێنەی یەکەم",
      "captionKmr": "Wêneya yekem",
      "sortOrder": 0
    }
  ]
}
```

Response — new fields:

```json
{
  "data": {
    "coverMediaType": "IMAGE",
    "coverThumbnailUrl": "https://cdn.example.com/news/cover-thumb.jpg",
    "mediaGallery": [
      {
        "url": "https://cdn.example.com/news/gallery-1.jpg",
        "kind": "IMAGE",
        "thumbnailUrl": "https://cdn.example.com/news/gallery-1-thumb.jpg",
        "captionCkb": "وێنەی یەکەم",
        "captionKmr": "Wêneya yekem",
        "sortOrder": 0
      }
    ]
  }
}
```

### 1.4 Projects

| Method | Endpoint | Parameters |
| --- | --- | --- |
| `POST` | `/api/v1/projects/create` | JSON body |
| `PUT` | `/api/v1/projects/update/{id}` | `id`: Project ID; JSON body |
| `GET` | `/api/v1/projects/{id}` | `id`: Project ID |

Request — new fields:

```json
{
  "coverMediaType": "IMAGE",
  "coverThumbnailUrl": "https://cdn.example.com/projects/cover-thumb.jpg",
  "mediaGallery": [
    {
      "url": "https://cdn.example.com/projects/gallery.jpg",
      "kind": "IMAGE",
      "thumbnailUrl": "https://cdn.example.com/projects/gallery-thumb.jpg",
      "captionCkb": "وێنەی پڕۆژە",
      "captionKmr": "Wêneya projeyê",
      "sortOrder": 0
    }
  ],
  "projectTypeCkb": "توێژینەوە",
  "projectTypeKmr": "Lêkolîn",
  "status": "ACTIVE"
}
```

Response — new fields:

```json
{
  "data": {
    "coverMediaType": "IMAGE",
    "coverThumbnailUrl": "https://cdn.example.com/projects/cover-thumb.jpg",
    "mediaGallery": [
      {
        "url": "https://cdn.example.com/projects/gallery.jpg",
        "kind": "IMAGE",
        "thumbnailUrl": "https://cdn.example.com/projects/gallery-thumb.jpg",
        "captionCkb": "وێنەی پڕۆژە",
        "captionKmr": "Wêneya projeyê",
        "sortOrder": 0
      }
    ],
    "projectTypeCkb": "توێژینەوە",
    "projectTypeKmr": "Lêkolîn",
    "status": "ACTIVE"
  }
}
```

`status`: `ACTIVE`, `ONGOING`, `COMPLETED`, `ARCHIVED`.

### 1.5 Writings

| Method | Endpoint | Parameters |
| --- | --- | --- |
| `GET` | `/api/v1/writings/{id}` | `id`: Writing ID |
| `GET` | `/api/v1/writings` | `page=0`; `size=20` |
| `POST` | `/api/v1/writings/series/link` | JSON body |

Response — new compatibility fields:

```json
{
  "data": {
    "topic": {
      "id": 5,
      "nameCkb": "مێژوو",
      "nameKmr": "Dîrok"
    },
    "topicId": 5,
    "topicNameCkb": "مێژوو",
    "topicNameKmr": "Dîrok",
    "seriesInfo": {
      "seriesId": "heritage-series",
      "seriesName": "Kurdish Heritage Series",
      "seriesOrder": 1.0,
      "parentBookId": null,
      "totalBooks": 3,
      "parent": true
    },
    "series": {
      "seriesId": "heritage-series",
      "seriesName": "Kurdish Heritage Series",
      "seriesOrder": 1.0,
      "parentBookId": null,
      "totalBooks": 3,
      "parent": true
    },
    "publishedByInstitute": true,
    "bookGenres": ["HISTORY", "CULTURAL"]
  }
}
```

Series-link request:

```json
{
  "bookId": 9,
  "parentBookId": 8,
  "seriesOrder": 2.0,
  "seriesName": "Kurdish Heritage Series"
}
```

Series-link response:

```json
{
  "success": true,
  "message": "Book linked to series",
  "data": {
    "id": 9,
    "series": {
      "seriesId": "heritage-series",
      "seriesName": "Kurdish Heritage Series",
      "seriesOrder": 2.0,
      "parentBookId": 8
    }
  }
}
```

### 1.6 Sound tracks

| Method | Endpoint | Parameters |
| --- | --- | --- |
| `GET` | `/api/v1/sound-tracks/by-sound-type` | Required: `type` or `soundType`; `page=0`; `size=20` |
| `GET` | `/api/v1/sound-tracks/search/tag` | Required: `value` or `tag`; `page=0`; `size=20` |
| `GET` | `/api/v1/sound-tracks/search/keyword` | Required: `value` or `keyword`; `page=0`; `size=20` |
| `POST` | `/api/v1/sound-tracks` | Multipart `data`; optional files |
| `PUT` | `/api/v1/sound-tracks/{id}` | `id`: Sound-track ID; multipart `data`; optional files |

Request — new fields:

```json
{
  "files": [
    {
      "fileUrl": "https://cdn.example.com/audio/track.mp3",
      "externalUrl": "https://audio.example.com/track",
      "embedUrl": "https://audio.example.com/embed/track",
      "fileType": "AUDIO",
      "brochures": [
        {
          "imageUrl": "https://cdn.example.com/audio/brochure.jpg",
          "caption": "Album booklet"
        }
      ]
    }
  ],
  "attachments": [
    {
      "fileUrl": "https://cdn.example.com/audio/booklet.pdf",
      "title": "Booklet",
      "attachmentType": "PDF",
      "sizeBytes": 1200000,
      "mimeType": "application/pdf"
    }
  ]
}
```

Response — new fields:

```json
{
  "data": {
    "files": [
      {
        "id": 30,
        "fileUrl": "https://cdn.example.com/audio/track.mp3",
        "externalUrl": "https://audio.example.com/track",
        "embedUrl": "https://audio.example.com/embed/track",
        "fileType": "AUDIO",
        "durationSeconds": 240,
        "durationMinutes": 4.0,
        "brochures": [
          {
            "id": 50,
            "imageUrl": "https://cdn.example.com/audio/brochure.jpg",
            "caption": "Album booklet",
            "brochureOrder": 0
          }
        ]
      }
    ],
    "totalDurationSeconds": 240,
    "totalSizeBytes": 5000000,
    "attachments": [
      {
        "id": 70,
        "fileUrl": "https://cdn.example.com/audio/booklet.pdf",
        "title": "Booklet",
        "attachmentType": "PDF",
        "sizeBytes": 1200000,
        "mimeType": "application/pdf",
        "attachmentOrder": 0
      }
    ]
  }
}
```

`fileType`: `AUDIO`, `VIDEO`, `MP3`, `WAV`, `OGG`, `AAC`, `FLAC`, `OTHER`.

### 1.7 Videos

| Method | Endpoint | Parameters |
| --- | --- | --- |
| `GET` | `/api/v1/videos` | `videoType`; `memories`; `topicId`; `page=0`; `size=10` |
| `POST` | `/api/v1/videos` | Multipart `data`; optional files |
| `PUT` | `/api/v1/videos/{id}` | `id`: Video ID; multipart `data`; optional files |

Request — new fields:

```json
{
  "albumOfMemories": true,
  "topicId": 5,
  "newTopic": null,
  "castMembers": [
    {
      "nameCkb": "ناوی ئەکتەر",
      "nameKmr": "Navê lîstikvan",
      "roleCkb": "ڕۆڵ",
      "roleKmr": "Rol",
      "imageUrl": "https://cdn.example.com/videos/cast.jpg"
    }
  ],
  "highlightClips": [
    {
      "titleCkb": "کلیپی دیار",
      "titleKmr": "Klîpa berçav",
      "url": "https://cdn.example.com/videos/highlight.mp4",
      "embedUrl": null,
      "durationSeconds": 45
    }
  ],
  "videoClipItems": [
    {
      "url": "https://cdn.example.com/videos/clip.mp4",
      "externalUrl": null,
      "embedUrl": null,
      "clipNumber": 1
    }
  ]
}
```

Response — new fields:

```json
{
  "albumOfMemories": true,
  "topicId": 5,
  "topicNameCkb": "مێژوو",
  "topicNameKmr": "Dîrok",
  "castMembers": [
    {
      "nameCkb": "ناوی ئەکتەر",
      "nameKmr": "Navê lîstikvan",
      "roleCkb": "ڕۆڵ",
      "roleKmr": "Rol",
      "imageUrl": "https://cdn.example.com/videos/cast.jpg"
    }
  ],
  "highlightClips": [
    {
      "titleCkb": "کلیپی دیار",
      "titleKmr": "Klîpa berçav",
      "url": "https://cdn.example.com/videos/highlight.mp4",
      "embedUrl": null,
      "durationSeconds": 45
    }
  ]
}
```

### 1.8 Image collections

| Method | Endpoint | Parameters |
| --- | --- | --- |
| `GET` | `/api/v1/image-collections/slug/{slug}` | `slug`: CKB or KMR slug |
| `GET` | `/api/v1/image-collections` | `type`; `topicId`; `page=0`; `size=20` |
| `POST` | `/api/v1/image-collections/json` | JSON body |
| `POST` | `/api/v1/image-collections` | Multipart `data`; optional files |
| `PUT` | `/api/v1/image-collections/{id}` | `id`: Collection ID; multipart `data`; optional files |

Request — new fields:

```json
{
  "slugCkb": "wena-konekan",
  "slugKmr": "wêneyên-kevn",
  "topicId": 5,
  "imageAlbum": [
    {
      "imageUrl": "https://cdn.example.com/gallery/image.jpg",
      "externalUrl": "https://images.example.com/image",
      "embedUrl": "https://images.example.com/embed/image",
      "captionCkb": "وێنەی یەکەم",
      "captionKmr": "Wêneya yekem",
      "sortOrder": 0
    }
  ]
}
```

Response — new fields:

```json
{
  "data": {
    "slugCkb": "wena-konekan",
    "slugKmr": "wêneyên-kevn",
    "topicId": 5,
    "topicNameCkb": "مێژوو",
    "topicNameKmr": "Dîrok",
    "imageAlbum": [
      {
        "id": 31,
        "imageUrl": "https://cdn.example.com/gallery/image.jpg",
        "externalUrl": "https://images.example.com/image",
        "embedUrl": "https://images.example.com/embed/image",
        "fileSizeBytes": 1500000,
        "widthPx": 1920,
        "heightPx": 1080,
        "mimeType": "image/jpeg",
        "aspectRatio": 1.7778,
        "humanReadableSize": "1.4 MB"
      }
    ]
  }
}
```

### 1.9 Services

| Method | Endpoint | Parameters |
| --- | --- | --- |
| `GET` | `/api/v1/services` | `type`; `page=0`; `size=20` |
| `POST` | `/api/v1/services` | JSON body |
| `PUT` | `/api/v1/services/{id}` | `id`: Service ID; JSON body |

Request — new fields:

```json
{
  "layoutType": "FEATURE_GRID",
  "heroVideoUrl": "https://cdn.example.com/services/training.mp4",
  "heroPosterUrl": "https://cdn.example.com/services/training-poster.jpg",
  "navAnchorId": "training",
  "featureImageUrls": [
    "https://cdn.example.com/services/feature-1.jpg"
  ],
  "thumbnailUrls": [
    "https://cdn.example.com/services/thumb-1.jpg"
  ],
  "partnerIds": [1, 2]
}
```

Response — new fields:

```json
{
  "data": {
    "layoutType": "FEATURE_GRID",
    "heroVideoUrl": "https://cdn.example.com/services/training.mp4",
    "heroPosterUrl": "https://cdn.example.com/services/training-poster.jpg",
    "navAnchorId": "training",
    "featureImageUrls": [
      "https://cdn.example.com/services/feature-1.jpg"
    ],
    "thumbnailUrls": [
      "https://cdn.example.com/services/thumb-1.jpg"
    ],
    "partnerIds": [1, 2]
  }
}
```

## 2. New APIs

### 2.1 Featured homepage

| Method | Endpoint | Parameters/body |
| --- | --- | --- |
| `GET` | `/api/v1/featured` | Optional query: `locale` |
| `GET` | `/featured` | Optional query: `locale` |
| `POST` | `/api/v1/featured` | JSON body |
| `PUT` | `/api/v1/featured/{id}` | `id`: Featured ID; JSON body |
| `DELETE` | `/api/v1/featured/{id}` | `id`: Featured ID |

Request:

```json
{
  "type": "article",
  "slug": "heritage-story",
  "title": "Heritage Story",
  "description": "<p>Featured homepage description...</p>",
  "imageUrl": "https://cdn.example.com/featured/story.jpg",
  "imageAlt": "Historic Kurdish archive",
  "locale": "ckb",
  "displayOrder": 1,
  "active": true
}
```

Response:

```json
{
  "success": true,
  "message": "Featured items fetched",
  "data": [
    {
      "id": "1",
      "type": "article",
      "slug": "heritage-story",
      "title": "Heritage Story",
      "description": "<p>Featured homepage description...</p>",
      "image": {
        "url": "https://cdn.example.com/featured/story.jpg",
        "alt": "Historic Kurdish archive"
      },
      "locale": "ckb",
      "displayOrder": 1,
      "active": true
    }
  ]
}
```

### 2.2 Team members

| Method | Endpoint | Parameters/body |
| --- | --- | --- |
| `GET` | `/api/v1/about/team` | None |
| `POST` | `/api/v1/about/team` | JSON body |
| `PUT` | `/api/v1/about/team/{id}` | `id`: Team-member ID; JSON body |
| `DELETE` | `/api/v1/about/team/{id}` | `id`: Team-member ID |

Request:

```json
{
  "nameCkb": "ناوی ئەندام",
  "nameKmr": "Navê endam",
  "roleCkb": "بەڕێوەبەر",
  "roleKmr": "Rêveber",
  "bioCkb": "ژیاننامەی کورت",
  "bioKmr": "Jînenîgariya kurt",
  "office": "ERBIL",
  "imageUrl": "https://cdn.example.com/team/member.jpg",
  "displayOrder": 1,
  "active": true
}
```

Response:

```json
{
  "success": true,
  "message": "Team members fetched",
  "data": [
    {
      "id": 1,
      "nameCkb": "ناوی ئەندام",
      "nameKmr": "Navê endam",
      "roleCkb": "بەڕێوەبەر",
      "roleKmr": "Rêveber",
      "bioCkb": "ژیاننامەی کورت",
      "bioKmr": "Jînenîgariya kurt",
      "office": "ERBIL",
      "imageUrl": "https://cdn.example.com/team/member.jpg",
      "displayOrder": 1,
      "active": true
    }
  ]
}
```

### 2.3 Partners

| Method | Endpoint | Parameters/body |
| --- | --- | --- |
| `GET` | `/api/v1/about/partners` | None |
| `POST` | `/api/v1/about/partners` | JSON body |
| `PUT` | `/api/v1/about/partners/{id}` | `id`: Partner ID; JSON body |
| `DELETE` | `/api/v1/about/partners/{id}` | `id`: Partner ID |

Request:

```json
{
  "nameCkb": "ناوی هاوبەش",
  "nameKmr": "Navê hevkar",
  "descriptionCkb": "وەسفی هاوبەش",
  "descriptionKmr": "Danasîna hevkar",
  "logoUrl": "https://cdn.example.com/partners/logo.png",
  "websiteUrl": "https://partner.example.com",
  "displayOrder": 1,
  "active": true
}
```

Response:

```json
{
  "success": true,
  "message": "Partners fetched",
  "data": [
    {
      "id": 1,
      "nameCkb": "ناوی هاوبەش",
      "nameKmr": "Navê hevkar",
      "descriptionCkb": "وەسفی هاوبەش",
      "descriptionKmr": "Danasîna hevkar",
      "logoUrl": "https://cdn.example.com/partners/logo.png",
      "websiteUrl": "https://partner.example.com",
      "displayOrder": 1,
      "active": true
    }
  ]
}
```

### 2.4 Contact messages

| Method | Endpoint | Parameters/body |
| --- | --- | --- |
| `POST` | `/api/v1/contact/messages` | JSON body |
| `GET` | `/api/v1/contact/messages` | `page=0`; `size=20` |
| `PATCH` | `/api/v1/contact/messages/{id}/status` | `id`: Message ID; status JSON |

Submission request:

```json
{
  "name": "Visitor Name",
  "email": "visitor@example.com",
  "phone": "+9647500000000",
  "subject": "Archive question",
  "message": "Please send more information about the archive.",
  "locale": "ckb"
}
```

Submission response:

```json
{
  "success": true,
  "message": "Contact message received",
  "data": {
    "id": 100,
    "name": "Visitor Name",
    "email": "visitor@example.com",
    "phone": "+9647500000000",
    "subject": "Archive question",
    "message": "Please send more information about the archive.",
    "locale": "ckb",
    "status": "NEW",
    "createdAt": "2026-06-29T12:00:00"
  }
}
```

Status request:

```json
{
  "status": "RESOLVED"
}
```

Status response:

```json
{
  "success": true,
  "message": "Contact message status updated",
  "data": {
    "id": 100,
    "status": "RESOLVED"
  }
}
```

### 2.5 Social links

| Method | Endpoint | Parameters/body |
| --- | --- | --- |
| `GET` | `/api/v1/settings/social` | None |
| `POST` | `/api/v1/settings/social` | JSON body |
| `PUT` | `/api/v1/settings/social/{id}` | `id`: Social-link ID; JSON body |
| `DELETE` | `/api/v1/settings/social/{id}` | `id`: Social-link ID |

Request:

```json
{
  "platform": "FACEBOOK",
  "url": "https://facebook.com/example",
  "labelCkb": "فەیسبووک",
  "labelKmr": "Facebook",
  "displayOrder": 1,
  "active": true
}
```

Response:

```json
{
  "success": true,
  "message": "Social links fetched",
  "data": [
    {
      "id": 1,
      "platform": "FACEBOOK",
      "url": "https://facebook.com/example",
      "labelCkb": "فەیسبووک",
      "labelKmr": "Facebook",
      "displayOrder": 1,
      "active": true
    }
  ]
}
```

### 2.6 Donation settings and types

| Method | Endpoint | Parameters/body |
| --- | --- | --- |
| `GET` | `/api/v1/donations/settings` | None |
| `PUT` | `/api/v1/donations/settings` | JSON body |
| `GET` | `/api/v1/donations/types` | None |

Settings request:

```json
{
  "titleCkb": "بەخشین",
  "titleKmr": "Bexş",
  "descriptionCkb": "پشتیوانی لە کارەکانمان بکە.",
  "descriptionKmr": "Piştgiriya xebata me bikin.",
  "heroImageUrl": "https://cdn.example.com/donations/hero.jpg",
  "bankName": "Example Bank",
  "accountName": "Kurdish Heritage Institute",
  "accountNumber": "1234567890",
  "iban": "IQ00EXAMPLE000000000000",
  "swiftCode": "EXAMPLEIQ",
  "paymentInstructionsCkb": "تکایە ژمارەی مامەڵە بنێرە.",
  "paymentInstructionsKmr": "Ji kerema xwe referansa danûstandinê bişînin.",
  "financialDonationsEnabled": true,
  "archiveDonationsEnabled": true
}
```

Settings response:

```json
{
  "success": true,
  "message": "Donation settings fetched",
  "data": {
    "id": 1,
    "titleCkb": "بەخشین",
    "titleKmr": "Bexş",
    "heroImageUrl": "https://cdn.example.com/donations/hero.jpg",
    "financialDonationsEnabled": true,
    "archiveDonationsEnabled": true
  }
}
```

Types response:

```json
{
  "success": true,
  "message": "Donation types fetched",
  "data": [
    {
      "code": "FINANCIAL",
      "titleCkb": "بەخشینی دارایی",
      "titleKmr": "Bexşa darayî",
      "enabled": true
    },
    {
      "code": "ARCHIVE",
      "titleCkb": "بەخشینی ئەرشیفی",
      "titleKmr": "Bexşa arşîvê",
      "enabled": true
    }
  ]
}
```

### 2.7 Financial donations

| Method | Endpoint | Parameters/body |
| --- | --- | --- |
| `POST` | `/api/v1/donations/financial` | JSON body |
| `GET` | `/api/v1/donations/financial` | `page=0`; `size=20` |
| `PATCH` | `/api/v1/donations/financial/{id}/status` | `id`: Donation ID; status JSON |

Request:

```json
{
  "donorName": "Donor Name",
  "email": "donor@example.com",
  "phone": "+9647500000000",
  "amount": 100.0,
  "currency": "USD",
  "paymentMethod": "BANK_TRANSFER",
  "transactionReference": "TX-2026-0001",
  "message": "For archive preservation."
}
```

Response:

```json
{
  "success": true,
  "message": "Financial donation received",
  "data": {
    "id": 200,
    "donorName": "Donor Name",
    "email": "donor@example.com",
    "phone": "+9647500000000",
    "amount": 100.0,
    "currency": "USD",
    "paymentMethod": "BANK_TRANSFER",
    "transactionReference": "TX-2026-0001",
    "message": "For archive preservation.",
    "status": "PENDING",
    "createdAt": "2026-06-29T12:00:00"
  }
}
```

Status request:

```json
{
  "status": "APPROVED"
}
```

### 2.8 Archive donations

| Method | Endpoint | Parameters/body |
| --- | --- | --- |
| `POST` | `/api/v1/donations/archive` | JSON body |
| `GET` | `/api/v1/donations/archive` | `page=0`; `size=20` |
| `PATCH` | `/api/v1/donations/archive/{id}/status` | `id`: Donation ID; status JSON |

Request:

```json
{
  "donorName": "Archive Donor",
  "email": "archive@example.com",
  "phone": "+9647500000000",
  "materialType": "PHOTOGRAPH",
  "title": "Historic Erbil photograph",
  "description": "An original photograph offered to the institute archive.",
  "estimatedDate": "1950",
  "attachmentUrl": "https://cdn.example.com/donations/preview.jpg"
}
```

Response:

```json
{
  "success": true,
  "message": "Archive donation offer received",
  "data": {
    "id": 201,
    "donorName": "Archive Donor",
    "email": "archive@example.com",
    "phone": "+9647500000000",
    "materialType": "PHOTOGRAPH",
    "title": "Historic Erbil photograph",
    "description": "An original photograph offered to the institute archive.",
    "estimatedDate": "1950",
    "attachmentUrl": "https://cdn.example.com/donations/preview.jpg",
    "status": "PENDING",
    "createdAt": "2026-06-29T12:00:00"
  }
}
```

Status request:

```json
{
  "status": "APPROVED"
}
```

### 2.9 Global search

| Method | Endpoint | Parameters |
| --- | --- | --- |
| `GET` | `/api/v1/search` | `q` required; `locale` optional; `type=ALL`; `page=0`; `size=10` |

`type`: `ALL`, `PROJECT`, `NEWS`, `VIDEO`, `WRITING`, `SOUNDTRACK`, `IMAGE`.

Request:

```
GET /api/v1/search?q=heritage&locale=ckb&type=ALL&page=0&size=10
```

Response:

```json
{
  "success": true,
  "message": "Search completed",
  "data": {
    "query": "heritage",
    "page": 0,
    "size": 10,
    "type": "ALL",
    "projects": {
      "items": [
        {
          "id": 10,
          "type": "PROJECT",
          "titleCkb": "پڕۆژەی کەلەپوور",
          "titleKmr": "Projeya mîratê",
          "descriptionCkb": "پوختەی ئەنجام...",
          "descriptionKmr": "Kurteya encamê...",
          "coverUrl": "https://cdn.example.com/projects/project.jpg",
          "createdAt": "2026-06-29T12:00:00"
        }
      ],
      "totalElements": 1,
      "totalPages": 1,
      "currentPage": 0,
      "size": 10
    },
    "news": {
      "items": [],
      "totalElements": 0,
      "totalPages": 0,
      "currentPage": 0,
      "size": 10
    },
    "videos": {
      "items": [],
      "totalElements": 0,
      "totalPages": 0,
      "currentPage": 0,
      "size": 10
    },
    "writings": {
      "items": [],
      "totalElements": 0,
      "totalPages": 0,
      "currentPage": 0,
      "size": 10
    },
    "soundTracks": {
      "items": [],
      "totalElements": 0,
      "totalPages": 0,
      "currentPage": 0,
      "size": 10
    },
    "imageCollections": {
      "items": [],
      "totalElements": 0,
      "totalPages": 0,
      "currentPage": 0,
      "size": 10
    }
  }
}
```

### 2.10 Sitemap

| Method | Endpoint | Parameters |
| --- | --- | --- |
| `GET` | `/api/v1/sitemap` | `locale=ckb`; accepts `ckb`, `kmr`, or `ku` |

Request:

```
GET /api/v1/sitemap?locale=ku
```

Response:

```json
{
  "success": true,
  "message": "Sitemap generated",
  "data": {
    "locale": "ku",
    "paths": [
      "/ku",
      "/ku/about",
      "/ku/contact",
      "/ku/services",
      "/ku/donate",
      "/ku/news",
      "/ku/projects",
      "/ku/writings",
      "/ku/audio",
      "/ku/videos",
      "/ku/gallery",
      "/ku/news/25",
      "/ku/projects/10"
    ]
  }
}
```