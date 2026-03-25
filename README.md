# Task Submission Techkraft

A full-stack property listing app with:
- Next.js client (`/client`)
- Express + Prisma + Postgres (`/server`)

## 1) How to run the app

### Prerequisites
- Node.js 20+
- PostgreSQL
- npm

### Server
```bash
cd server
npm install
copy .env.example .env
# update DATABASE_URL in .env
npm run prisma:generate
npm run db:push
npm run dev
```

Server:
- Health: `http://<HOST>:<SERVER_PORT>/health`
- API base: `http://<HOST>:<SERVER_PORT>/api/v1`

### Client
```bash
cd client
npm install
copy .env.example .env
# set NEXT_PUBLIC_API_BASE_URL=http://<HOST>:<SERVER_PORT>/api/v1
npm run dev
```

Client:
- `http://<HOST>:<CLIENT_PORT>`

## 2) How to seed the DB

From `server/`:

```bash
npm run seed <agentCount> <propertyCount>
```

Example:

```bash
npm run seed 10 50
```

Creates:
- 10 agents
- 50 properties

## 3) Example API calls

Base URL:
`http://<HOST>:<SERVER_PORT>/api/v1`

### Public: list properties (paginated + filters)
```bash
curl "http://<HOST>:<SERVER_PORT>/api/v1/properties?page=1&limit=20&city=Kathmandu&sort=price_desc"
```

### Public: property detail
```bash
curl "http://<HOST>:<SERVER_PORT>/api/v1/properties/<PROPERTY_ID>"
```

### Admin: list properties (includes internal notes)
```bash
curl -H "x-header-isadmin: true" "http://<HOST>:<SERVER_PORT>/api/v1/admin/properties?page=1&limit=20"
```

### Admin: property detail (includes internal notes)
```bash
curl -H "x-header-isadmin: true" "http://<HOST>:<SERVER_PORT>/api/v1/admin/properties/<PROPERTY_ID>"
```

### Public: create property (example body)
```bash
curl -X POST "http://<HOST>:<SERVER_PORT>/api/v1/properties" \
  -H "Content-Type: application/json" \
  -d '{
    "title":"Modern House in Kathmandu",
    "description":"Close to schools and market",
    "price":25000000,
    "propertyType":"HOUSE",
    "suburb":"Kapan",
    "city":"Kathmandu",
    "rooms":4,
    "floorArea":1800,
    "agentId":"<AGENT_ID>"
  }'
```