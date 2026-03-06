import { execSync } from "child_process";
import fs from "fs";

const owner = process.env.GITHUB_REPO_OWNER || "JaimELegor";
const repo = process.env.GITHUB_REPO_NAME || "gargoyles-filters-test";
const branch = "main";

const RAW = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}`;

let files = [];

try {
  files = execSync("git ls-files filters/**/*.json")
    .toString()
    .trim()
    .split("\n")
    .filter(Boolean);
} catch {
  console.log("No filter JSON files found.");
}

const seen = new Set();
const filters = [];

for (const file of files) {
  const id = file.replace(/^filters\//, "").replace(".json", "");

  if (seen.has(id)) {
    console.log(`Skipping duplicate filter id: ${id}`);
    continue;
  }

  seen.add(id);

  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  const base = file.replace(".json", "");

  filters.push({
    id, // unique id derived from file path
    name: data.name,
    author: data.author,
    version: data.version,
    description: data.description,
    thumbnail: `${RAW}/${base}-thumbnail.webp`,
    json: `${RAW}/${file}`,
  });
}

// Sort alphabetically for stable commits
filters.sort((a, b) => a.id.localeCompare(b.id));

fs.writeFileSync(
  "filters/index.json",
  JSON.stringify({ filters }, null, 2)
);

console.log(`Indexed ${filters.length} filters`);
