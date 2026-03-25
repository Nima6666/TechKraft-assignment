import { PrismaClient, PropertyType, AreaUnit } from "../generated/prisma/client";
import { readFile } from "fs/promises";
import path from "path";
import { createPropertySchema } from "../src/features/property/property.validation";
import { buildPropertyUncheckedCreateInput } from "../src/features/property/property.create-data";
import { normalizeAreaToSqft } from "../src/features/property/utils/area";
import { SUBURBS_BY_CITY } from "../src/shared/suburbs-by-city";

const prisma = new PrismaClient();

type DummyData = {
  agents: {
    firstNames: string[];
    lastNames: string[];
    emailDomains: string[];
    phonePrefixes: string[];
  };
  properties: {
    titlePrefixes: string[];
    descriptionSnippets: string[];
    internalNotes: string[];
    cities: string[];
    /** Legacy / doc only — seed uses `SUBURBS_BY_CITY` from shared module. */
    suburbsByCity?: Record<string, string[]>;
    titleTypesByPropertyType: Record<keyof typeof PropertyType, string[]>;
    propertyTypes: Array<keyof typeof PropertyType>;
    areaUnits: Array<keyof typeof AreaUnit>;
  };
};

const AGENT_COUNT = process.argv[2] ? parseInt(process.argv[2]) : 10;
const PROPERTY_COUNT = process.argv[3] ? parseInt(process.argv[3]) : 50;

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickOne<T>(arr: T[]): T {
  return arr[randomInt(0, arr.length - 1)];
}

function randomArea(unit: AreaUnit): number {
  switch (unit) {
    case AreaUnit.SQFT:
      return randomInt(500, 6000);
    case AreaUnit.SQM:
      return randomInt(45, 560);
    case AreaUnit.ROPANI:
      return Number((Math.random() * 2.5 + 0.2).toFixed(2));
    case AreaUnit.AANA:
      return Number((Math.random() * 25 + 1).toFixed(2));
    case AreaUnit.BIGHA:
      return Number((Math.random() * 1.5 + 0.1).toFixed(2));
    default:
      return randomInt(500, 6000);
  }
}

function buildPropertySeedPayload(
  data: DummyData["properties"],
  agents: { id: string }[],
  propertyType: PropertyType
) {
  const metroKeys = Object.keys(SUBURBS_BY_CITY);
  const city = pickOne(metroKeys);
  const citySuburbs = [...SUBURBS_BY_CITY[city]!];
  const suburb = citySuburbs.length > 0 ? pickOne(citySuburbs) : undefined;

  const titleTypesForKind = data.titleTypesByPropertyType[propertyType];
  const title = `${pickOne(data.titlePrefixes)} ${pickOne(titleTypesForKind)} in ${city}`;
  const description = `A ${propertyType.toLowerCase()} listing with ${pickOne(data.descriptionSnippets)}.`;
  const price = Number((Math.random() * 900000 + 100000).toFixed(2));
  const internalNotes = pickOne(data.internalNotes);
  const agentId = pickOne(agents).id;

  switch (propertyType) {
    case PropertyType.HOUSE:
      return {
        title,
        description,
        price,
        propertyType,
        suburb,
        city,
        rooms: randomInt(1, 10),
        floorArea: Number((Math.random() * 3500 + 300).toFixed(2)),
        internalNotes,
        agentId,
      };
    case PropertyType.LAND: {
      const areaUnitKey = pickOne(data.areaUnits);
      const areaUnit = AreaUnit[areaUnitKey];
      const areaValue = randomArea(areaUnit);
      return {
        title,
        description,
        price,
        propertyType,
        suburb,
        city,
        areaValue,
        areaUnit,
        internalNotes,
        agentId,
      };
    }
    default: {
      const _exhaustive: never = propertyType;
      return _exhaustive;
    }
  }
}

async function seedAgents() {
  const data = await loadDummyData();
  const usedEmails = new Set<string>();

  for (let i = 0; i < AGENT_COUNT; i += 1) {
    const firstName = pickOne(data.agents.firstNames);
    const lastName = pickOne(data.agents.lastNames);
    const name = `${firstName} ${lastName}`;
    const domain = pickOne(data.agents.emailDomains);

    let email = `${firstName}.${lastName}${randomInt(100, 999)}@${domain}`.toLowerCase();
    while (usedEmails.has(email)) {
      email = `${firstName}.${lastName}${randomInt(100, 999)}@${domain}`.toLowerCase();
    }
    usedEmails.add(email);

    const phone = `${pickOne(data.agents.phonePrefixes)}${randomInt(1000000, 9999999)}`;

    await prisma.agent.create({
      data: {
        name,
        email,
        phone,
      },
    });
  }
}

async function seedProperties() {
  const data = await loadDummyData();
  const agents = await prisma.agent.findMany({ select: { id: true } });
  if (agents.length === 0) {
    throw new Error("No agents found. Seed agents first.");
  }

  let createdCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < PROPERTY_COUNT; i += 1) {
    const propertyTypeKey = pickOne(data.properties.propertyTypes);
    const propertyType = PropertyType[propertyTypeKey];

    const payload = buildPropertySeedPayload(data.properties, agents, propertyType);

    const parsed = createPropertySchema.safeParse(payload);
    if (!parsed.success) {
      skippedCount += 1;
      console.error(`Property ${i + 1} skipped due to validation errors:`, parsed.error.issues);
      continue;
    }

    const areaSqft = normalizeAreaToSqft(parsed.data.areaValue, parsed.data.areaUnit);

    try {
      await prisma.property.create({
        data: buildPropertyUncheckedCreateInput(parsed.data, areaSqft),
      });
      createdCount += 1;
    } catch (error) {
      skippedCount += 1;
      console.error(`Property ${i + 1} skipped due to database error:`, error);
    }
  }

  console.log(
    `Property seeding done. Requested: ${PROPERTY_COUNT}, Created: ${createdCount}, Skipped: ${skippedCount}`
  );
}

async function main() {
  console.log("Clearing existing data...");
  await prisma.property.deleteMany();
  await prisma.agent.deleteMany();

  console.log(`Creating ${AGENT_COUNT} agents...`);
  await seedAgents();

  console.log(`Creating ${PROPERTY_COUNT} properties...`);
  await seedProperties();

  const totalAgents = await prisma.agent.count();
  const totalProperties = await prisma.property.count();

  console.log(`Seed complete. Agents: ${totalAgents}, Properties: ${totalProperties}`);
}

let cache: DummyData | null = null;

async function loadDummyData(): Promise<DummyData> {
  if (cache) {
    return cache;
  }
  const raw = await readFile(path.join(__dirname, "dummy-data.json"), "utf8");
  cache = JSON.parse(raw) as DummyData;
  return cache;
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
