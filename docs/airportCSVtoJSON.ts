// NOTE: You most likely do not need to call or run this file
// This is just a preprocessing script to convert data at (https://raw.githubusercontent.com/jpatokal/openflights/master/data/airports.dat) to JSON
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

const INPUT_FILE = path.resolve(__dirname, 'airports.dat');
const OUTPUT_FILE = path.resolve(__dirname, 'airports.json');

// Read CSV data
const csvData = fs.readFileSync(INPUT_FILE, 'utf8');

// Parse with csv-parse
// OpenFlights uses commas and quotes, no headers
const records: string[][] = parse(csvData, {
  skip_empty_lines: true,
});

// Transform records
const airports = records
  // Filter only valid IATA codes (3-letter)
  .filter((r) => r[4] && r[4] !== '\\N' && r[4].length === 3)
  // Map into simplified structure
  .map((r) => ({
    iata: r[4],
    city: r[2],
    name: r[1],
    country: r[3],
  }));

// Deduplicate by IATA code
const uniqueAirports = Object.values(
  airports.reduce((acc: Record<string, any>, curr) => {
    acc[curr.iata] = curr;
    return acc;
  }, {})
);

// Sort alphabetically by city (for UX consistency)
uniqueAirports.sort((a, b) => a.city.localeCompare(b.city));

// Write JSON file
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(uniqueAirports, null, 2));

console.log(`✅ Processed ${uniqueAirports.length} airports → ${OUTPUT_FILE}`);
