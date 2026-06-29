# Global Search API

## Endpoint

| Method | Path | Authentication | Content type |
| --- | --- | --- | --- |
| `GET` | `/api/v1/search` | Public | `application/json` |

## Parameters

| Parameter | Type | Required | Default | Values | Description |
| --- | --- | --- | --- | --- | --- |
| `q` | String | Yes | — | Any text | Search term. It is trimmed before searching. Send `q=` to return all matching records according to each repository. |
| `locale` | String | No | `null` | Any string; clients use `ckb`, `kmr`, or `ku` | Compatibility parameter accepted by the endpoint. It currently does not filter the search or change the response fields. |
| `type` | String | No | `ALL` | `ALL`, `PROJECT`, `NEWS`, `VIDEO`, `WRITING`, `SOUNDTRACK`, `IMAGE` | Limits the search to one content type. Case-insensitive. An unsupported value produces no populated search section. |
| `page` | Integer | No | `0` | `0` or greater | Zero-based page number. |
| `size` | Integer | No | `10` | Positive integer | Number of results per section. With `type=ALL`, each of the six sections can contain up to this number of items. |

### Type values

| `type` | Response section |
| --- | --- |
| `ALL` | `projects`, `news`, `videos`, `writings`, `soundTracks`, `imageCollections` |
| `PROJECT` | `projects` |
| `NEWS` | `news` |
| `VIDEO` | `videos` |
| `WRITING` | `writings` |
| `SOUNDTRACK` | `soundTracks` |
| `IMAGE` | `imageCollections` |

## Request

There is no JSON request body because this is a `GET` endpoint.

```
GET /api/v1/search?q=heritage&locale=ckb&type=ALL&page=0&size=10
Accept: application/json
```

Client query-parameter object (this is not an HTTP request body):

```json
{
  "q": "heritage",
  "locale": "ckb",
  "type": "ALL",
  "page": 0,
  "size": 10
}
```

Single-type request:

```
GET /api/v1/search?q=heritage&type=NEWS&page=0&size=10
Accept: application/json
```

## Fields searched by `q`

| Content type | Fields |
| --- | --- |
| Project | CKB/KMR title, description, tags, keywords |
| News | CKB/KMR title, description, tags, keywords |
| Video | CKB/KMR title, description, director, tags, keywords |
| Writing | CKB/KMR title, description, writer, tags, keywords |
| Sound track | CKB/KMR title, description, tags, keywords, album name, terms, CKB/KMR topic name |
| Image collection | CKB/KMR title, description, collected-by name, location, tags, keywords, CKB/KMR topic name |

Matching is case-insensitive and uses partial text matching.

## Response JSON

### `200 OK` — `type=ALL`

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
          "descriptionCkb": "پوختەی پڕۆژە...",
          "descriptionKmr": "Kurteya projeyê...",
          "coverUrl": "https://cdn.example.com/projects/10/cover.jpg",
          "createdAt": "2026-06-29T12:00:00"
        }
      ],
      "totalElements": 1,
      "totalPages": 1,
      "currentPage": 0,
      "size": 10
    },
    "news": {
      "items": [
        {
          "id": 25,
          "type": "NEWS",
          "titleCkb": "هەواڵی کەلەپوور",
          "titleKmr": "Nûçeya mîratê",
          "descriptionCkb": "پوختەی هەواڵ...",
          "descriptionKmr": "Kurteya nûçeyê...",
          "coverUrl": "https://cdn.example.com/news/25/cover.jpg",
          "createdAt": "2026-06-29T11:00:00"
        }
      ],
      "totalElements": 1,
      "totalPages": 1,
      "currentPage": 0,
      "size": 10
    },
    "videos": {
      "items": [
        {
          "id": 4,
          "type": "VIDEO",
          "titleCkb": "ڤیدیۆی کەلەپوور",
          "titleKmr": "Vîdyoya mîratê",
          "descriptionCkb": "پوختەی ڤیدیۆ...",
          "descriptionKmr": "Kurteya vîdyoyê...",
          "coverUrl": "https://cdn.example.com/videos/4/cover-ckb.jpg",
          "createdAt": "2026-06-29T10:00:00"
        }
      ],
      "totalElements": 1,
      "totalPages": 1,
      "currentPage": 0,
      "size": 10
    },
    "writings": {
      "items": [
        {
          "id": 8,
          "type": "WRITING",
          "titleCkb": "نووسینی کەلەپوور",
          "titleKmr": "Nivîsa mîratê",
          "descriptionCkb": "پوختەی نووسین...",
          "descriptionKmr": "Kurteya nivîsê...",
          "coverUrl": "https://cdn.example.com/writings/8/cover-ckb.jpg",
          "createdAt": "2026-06-29T09:00:00"
        }
      ],
      "totalElements": 1,
      "totalPages": 1,
      "currentPage": 0,
      "size": 10
    },
    "soundTracks": {
      "items": [
        {
          "id": 12,
          "type": "SOUNDTRACK",
          "titleCkb": "دەنگی کەلەپوور",
          "titleKmr": "Dengê mîratê",
          "descriptionCkb": "پوختەی دەنگ...",
          "descriptionKmr": "Kurteya dengê...",
          "coverUrl": "https://cdn.example.com/sound-tracks/12/cover-ckb.jpg",
          "createdAt": "2026-06-29T08:00:00"
        }
      ],
      "totalElements": 1,
      "totalPages": 1,
      "currentPage": 0,
      "size": 10
    },
    "imageCollections": {
      "items": [
        {
          "id": 20,
          "type": "IMAGE",
          "titleCkb": "وێنەکانی کەلەپوور",
          "titleKmr": "Wêneyên mîratê",
          "descriptionCkb": "پوختەی کۆمەڵە وێنە...",
          "descriptionKmr": "Kurteya koleksiyona wêneyan...",
          "coverUrl": "https://cdn.example.com/image-collections/20/cover-ckb.jpg",
          "createdAt": "2026-06-29T07:00:00"
        }
      ],
      "totalElements": 1,
      "totalPages": 1,
      "currentPage": 0,
      "size": 10
    }
  }
}
```

### `200 OK` — single type

Request:

```
GET /api/v1/search?q=heritage&type=NEWS&page=0&size=10
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
    "type": "NEWS",
    "projects": null,
    "news": {
      "items": [
        {
          "id": 25,
          "type": "NEWS",
          "titleCkb": "هەواڵی کەلەپوور",
          "titleKmr": "Nûçeya mîratê",
          "descriptionCkb": "پوختەی هەواڵ...",
          "descriptionKmr": "Kurteya nûçeyê...",
          "coverUrl": "https://cdn.example.com/news/25/cover.jpg",
          "createdAt": "2026-06-29T11:00:00"
        }
      ],
      "totalElements": 1,
      "totalPages": 1,
      "currentPage": 0,
      "size": 10
    },
    "videos": null,
    "writings": null,
    "soundTracks": null,
    "imageCollections": null
  }
}
```

### `200 OK` — empty section

```json
{
  "success": true,
  "message": "Search completed",
  "data": {
    "query": "no-match",
    "page": 0,
    "size": 10,
    "type": "NEWS",
    "news": {
      "items": [],
      "totalElements": 0,
      "totalPages": 0,
      "currentPage": 0,
      "size": 10
    }
  }
}
```

## Response fields

### Envelope

| Field | Type | Nullable | Description |
| --- | --- | --- | --- |
| `success` | Boolean | No | `true` when the request succeeds. |
| `message` | String | No | Success message: `Search completed`. |
| `data` | Object | No | Global-search response data. |

### `data`

| Field | Type | Nullable | Description |
| --- | --- | --- | --- |
| `query` | String | No | Trimmed value received in `q`. |
| `page` | Integer | No | Requested zero-based page. |
| `size` | Integer | No | Requested number of items per section. |
| `type` | String | No | Normalized uppercase search type. |
| `projects` | Search section | Yes | Project results. Present for `ALL` or `PROJECT`. |
| `news` | Search section | Yes | News results. Present for `ALL` or `NEWS`. |
| `videos` | Search section | Yes | Video results. Present for `ALL` or `VIDEO`. |
| `writings` | Search section | Yes | Writing results. Present for `ALL` or `WRITING`. |
| `soundTracks` | Search section | Yes | Sound-track results. Present for `ALL` or `SOUNDTRACK`. |
| `imageCollections` | Search section | Yes | Image-collection results. Present for `ALL` or `IMAGE`. |

Sections outside the selected `type` are returned as `null`.

### Search section

| Field | Type | Nullable | Description |
| --- | --- | --- | --- |
| `items` | Array of search items | No | Results on the requested page. Empty array when there are no matches. |
| `totalElements` | Long | No | Total matching records for this content type. |
| `totalPages` | Integer | No | Total pages for this content type. |
| `currentPage` | Integer | No | Zero-based current page. |
| `size` | Integer | No | Requested page size for this section. |

### Search item

| Field | Type | Nullable | Description |
| --- | --- | --- | --- |
| `id` | Long | No | ID of the original project, news item, video, writing, sound track, or image collection. |
| `type` | String | No | `PROJECT`, `NEWS`, `VIDEO`, `WRITING`, `SOUNDTRACK`, or `IMAGE`. |
| `titleCkb` | String | No | Sorani/CKB title. Empty string when unavailable. |
| `titleKmr` | String | Yes | Kurmanji/KMR title. Usually an empty string when unavailable; an image-collection result can return `null`. |
| `descriptionCkb` | String | No | Sorani/CKB description snippet. |
| `descriptionKmr` | String | No | Kurmanji/KMR description snippet. |
| `coverUrl` | String | Yes | Cover URL. CKB cover is preferred for split-cover entities; KMR is the fallback. |
| `createdAt` | String | Yes | ISO-8601 creation timestamp. |

Descriptions have HTML removed, whitespace collapsed, and are limited to 200
characters. A longer description ends with `…`.