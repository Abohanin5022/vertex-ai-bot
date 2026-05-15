import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const output = execFileSync(
  "git",
  ["ls-files", "-z", "--cached", "--others", "--exclude-standard"],
  { encoding: "buffer" },
);

const files = output.toString("utf8").split("\0").filter(Boolean);
const markerPattern = /^(<{7} .+|={7}|>{7} .+)$/;
const matches = [];

for (const file of files) {
  const content = readFileSync(file);

  if (content.includes(0)) {
    continue;
  }

  content.toString("utf8").split(/\r?\n/).forEach((line, index) => {
    if (markerPattern.test(line)) {
      matches.push(`${file}:${index + 1}: ${line}`);
    }
  });
}

if (matches.length > 0) {
  console.error("Merge conflict markers found:");
  console.error(matches.join("\n"));
  process.exit(1);
}

console.log("No merge conflict markers found.");
