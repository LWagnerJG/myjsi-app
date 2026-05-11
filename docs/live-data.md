# MyJSI Live Data API

MyJSI now has a server-side API boundary for company knowledge data:

```txt
GET /api/company-data?resource=lead-times
GET /api/company-data?resource=weight-ratings
GET /api/company-data?resource=dealer-directory
GET /api/company-data?resource=contracts
GET /api/company-data?resource=presentations
GET /api/company-data?resource=orders
GET /api/company-data?resource=community-feed
GET /api/company-data?resource=knowledge-index
```

The React app keeps using its static seed data when no live source is configured or a source is temporarily unavailable. When a live source is configured, the same screens hydrate from the API without exposing service credentials in the browser.

## Simple URL Sources

For JSON or CSV endpoints, set one URL per resource:

```bash
MYJSI_LEAD_TIMES_URL=https://example.com/lead-times.csv
MYJSI_WEIGHT_RATINGS_URL=https://example.com/weight-ratings.csv
MYJSI_DEALER_DIRECTORY_URL=https://example.com/dealers.json
MYJSI_CONTRACTS_URL=https://example.com/contracts.json
MYJSI_PRESENTATIONS_URL=https://example.com/presentations.json
MYJSI_ORDERS_URL=https://example.com/orders.csv
```

The API accepts arrays directly, or common wrappers such as `{ "data": [...] }`, `{ "items": [...] }`, `{ "value": [...] }`, and `{ "results": [...] }`.

## Source Map

For authenticated or advanced sources, use `MYJSI_DATA_SOURCES` as JSON:

```json
{
  "lead-times": {
    "type": "sharepoint-file",
    "siteId": "contoso.sharepoint.com,site-id,web-id",
    "driveId": "drive-id",
    "itemPath": "Shared Documents/MyJSI/lead-times.csv",
    "format": "csv",
    "cacheSeconds": 300
  },
  "dealer-directory": {
    "type": "hubspot",
    "objectType": "companies",
    "properties": ["name", "phone", "address", "city", "state", "zip", "annualrevenue"],
    "mapper": "dealer-directory",
    "limit": 200
  }
}
```

## Required Secrets

SharePoint Graph file sources need:

```bash
MYJSI_MICROSOFT_TENANT_ID=
MYJSI_MICROSOFT_CLIENT_ID=
MYJSI_MICROSOFT_CLIENT_SECRET=
```

HubSpot sources need:

```bash
MYJSI_HUBSPOT_PRIVATE_APP_TOKEN=
```

Do not prefix these with `VITE_`; they must stay server-side only.

## Data Shapes

Best results come from matching the app's existing seed shapes in `src/screens/**/data.js`. CSV imports are normalized for the main fields on lead times, dealers, presentations, and orders. Complex contract pricing should be supplied as JSON matching `CONTRACTS_DATA`.

Lead-time rows can provide either `image` / `Image URL` or `cloudinaryPublicId` / `Cloudinary Public ID`. The lead-time screen resolves local `/series-images/...` placeholders and public IDs through the Jasper Cloudinary delivery API, using optimized `c_fit,h_160,w_160/f_auto/q_auto` images without exposing Cloudinary admin credentials in the browser.

Weight-rating rows support `series`, `weightLimit`, `failureTestLbs`, `supportedTypes`, `certificationNote`, `image`, and `cloudinaryPublicId`. If no weight-rating source is configured, the screen derives its series list from the live lead-time data and still resolves imagery through Cloudinary.
