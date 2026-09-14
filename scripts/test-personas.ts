import path from "node:path";
import dotenv from "dotenv";

type PersonaTestCliOptions = {
  persona: "anna" | "thomas" | "michael" | "sabine" | "all";
  level?: number;
  runs?: number;
  confirmCost: boolean;
};

dotenv.config({ path: path.join(process.cwd(), ".env.local"), quiet: true });

console.log("Environment loaded");
console.log(`OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? "set" : "missing"}`);
console.log(`OPENAI_MODEL: ${process.env.OPENAI_MODEL ?? "not set"}`);

function readArg(name: string) {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function hasFlag(name: string) {
  return process.argv.includes(`--${name}`);
}

function parsePersona(value: string | undefined): PersonaTestCliOptions["persona"] {
  if (!value) {
    return "all";
  }

  if (["anna", "thomas", "michael", "sabine", "all"].includes(value)) {
    return value as PersonaTestCliOptions["persona"];
  }

  throw new Error(`Ungueltige Persona "${value}". Erlaubt: anna, thomas, michael, sabine, all.`);
}

function parsePositiveInteger(value: string | undefined) {
  if (!value) {
    return undefined;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    throw new Error(`Ungueltige Zahl: ${value}`);
  }

  return parsed;
}

const options: PersonaTestCliOptions = {
  persona: parsePersona(readArg("persona")),
  level: parsePositiveInteger(readArg("level")),
  runs: parsePositiveInteger(readArg("runs")),
  confirmCost: hasFlag("confirm-cost")
};

const { runPersonaTests } = await import("../src/lib/testing/persona-test-runner.ts");

runPersonaTests(options).catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
