// WARNING: This code is retired (for now). We can update it later if we would like to have an option to web scrape for flight data

import { Flight, FlightLeg } from "@skyboundTypes/SkyboundAPI";
import puppeteer, { Browser, Page } from 'puppeteer';
export type FlightQueryType = "roundTrip" | "oneWay" | "multiCity";

// Displays the browser window if true
const DEV_MODE = false;

// URL of website
const URL: string = "https://matrix.itasoftware.com/search";

// Time to wait for service to return search results
const SEARCH_TIMEOUT = 60000;

// Types of UI components that field can be
export type FieldType = "text" | "autocomplete" | "date" | "dropdown" | "number" | "checkbox";

// Types of data that can input to fields
export type FieldDataType = string | number | boolean | Date;

// Represents a field UI component
export interface FieldComponent {
  selector: string;
  type: FieldType;
};

// Maps names to those field UI components
export type FieldComponents = { [fieldIdentifer: string]: FieldComponent };

// Maps names to user-provided inputs to fields
export type FieldInputs = { [fieldIdentifer: string]: FieldDataType };

// Define a type for the handler functions
export type FieldHandler = (page: Page, selector: string, value: any) => Promise<void>;

// Input field settings for 1 page (tab)
export interface PageConfig {
  tabButtonSelector: string;
  fieldComponents: FieldComponents;
};

// Maps query types to page field settings
export type PageConfigs = {
  [queryType in FlightQueryType]: PageConfig;
};

// Maps types of queries to their relevant UI fields on the page
const pageConfigs: PageConfigs = {
  roundTrip: {
    tabButtonSelector: "#mat-tab-group-0-label-0",
    fieldComponents: {
      originAirport: { selector: "#mat-input-0", type: "autocomplete" },
      destinationAirport: { selector: "#mat-input-1", type: "autocomplete" },
      startDate: { selector: ".mat-start-date", type: "date" },
      endDate: { selector: ".mat-end-date", type: "date" },
      numAdults: { selector: "#mat-input-4", type: "number" },
      numSeniors: { selector: "#mat-input-5", type: "number" },
      numYouths: { selector: "#mat-input-6", type: "number" },
      numChildren: { selector: "#mat-input-7", type: "number" },
      numInfantsInSeat: { selector: "#mat-input-8", type: "number" },
      numInfantsInLap: { selector: "#mat-input-9", type: "number" },
      stops: { selector: "#mat-select-value-0", type: "dropdown" },
      extraStops: { selector: "#mat-select-value-1", type: "dropdown" },
      currency: { selector: "#mat-input-10", type: "autocomplete" },
      salesCity: { selector: "#mat-input-11", type: "autocomplete" },
      cabin: { selector: "#mat-select-value-2", type: "dropdown" },
      allowAirportChanges: { selector: "#mat-mdc-checkbox-0-input", type: "checkbox" },
      onlyShowAvailableFlights: { selector: "#mat-mdc-checkbox-1-input", type: "checkbox" },
    },
  },
  oneWay: {
    tabButtonSelector: "#mat-tab-group-0-label-1",
    fieldComponents: {
      originAirport: { selector: "#mat-input-2", type: "autocomplete" },
      destinationAirport: { selector: "#mat-input-3", type: "autocomplete" },
      date: { selector: "#mat-input-19", type: "date" },
      dateOptions: { selector: "#mat-select-value-17", type: "dropdown" }, // Search for arrival or departure
      numAdults: { selector: "#mat-input-4", type: "number" },
      numSeniors: { selector: "#mat-input-5", type: "number" },
      numYouths: { selector: "#mat-input-6", type: "number" },
      numChildren: { selector: "#mat-input-7", type: "number" },
      numInfantsInSeat: { selector: "#mat-input-8", type: "number" },
      numInfantsInLap: { selector: "#mat-input-9", type: "number" },
      stops: { selector: "#mat-select-value-0", type: "dropdown" },
      extraStops: { selector: "#mat-select-value-1", type: "dropdown" },
      cabin: { selector: "#mat-select-value-2", type: "dropdown" },
      currency: { selector: "#mat-input-10", type: "autocomplete" },
      salesCity: { selector: "#mat-input-11", type: "autocomplete" },
      allowAirportChanges: { selector: "#mat-mdc-checkbox-0-input", type: "checkbox" },
      onlyShowAvailableFlights: { selector: "#mat-mdc-checkbox-1-input", type: "checkbox" },
    },
  },
  // TODO: Implement multicity scraping (nontrivial: there are multiple flights with dynamic IDs)
  multiCity: {
    tabButtonSelector: "#mat-tab-group-0-label-2",
    fieldComponents: { },
  },
};

// Implement handlers for each field type
const handlers: Record<FieldType, FieldHandler> = {
  // Input text to a text input field
  text: async (page, selector, value: string) => {
    await page.waitForSelector(selector);

    const currentValue = await page.$eval(selector, el => (el as HTMLInputElement).value);
    if (currentValue === value) return; // Skip if already correct

    await page.click(selector, { clickCount: 3 }); // select all existing text
    await page.keyboard.press("Backspace");        // clear it
    await page.type(selector, value);
  },

  // Input text to a text input field (+ accept autocomplete suggestion)
  autocomplete: async (page, selector, value: string) => {
    await page.waitForSelector(selector);

    const currentValue = await page.$eval(selector, el => (el as HTMLInputElement).value);
    if (currentValue === value) return; // Skip if already correct

    await page.click(selector, { clickCount: 3 });
    await page.keyboard.press("Backspace");
    await page.type(selector, value);
    await page.waitForSelector('[id^="mat-autocomplete"]');

    // Wait for the autocomplete panel and options to appear
    await page.waitForFunction(() => {
      const options = document.querySelectorAll('mat-option');
      return Array.from(options).some(opt => opt.textContent?.trim());
    }, { timeout: 3000 });

    await page.evaluate((optionText) => {
      const options = Array.from(document.querySelectorAll('mat-option'));
      const match = options.find(opt => {
        const label = opt.querySelector('.mdc-list-item__primary-text');
        return label?.textContent?.trim() === optionText;
      });
      if (match) {
        (match as HTMLElement).click();
        return;
      }
      // HACK: try falling back to first element of options
      if (options.length > 0) {
        (options[0] as HTMLElement).click();
        return;
      }
      throw new Error(`Option '${optionText}' not found in mat-autocomplete`);
    }, value);
  },

  // Input a date to a date input field
  date: async (page, selector, value: Date) => {
    const formatDate = (date: Date): string => {
      const mm = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
      const dd = String(date.getDate()).padStart(2, "0");
      const yyyy = date.getFullYear();
      return `${mm}/${dd}/${yyyy}`;
    }

    const formatted = formatDate(value);
    const currentValue = await page.$eval(selector, el => (el as HTMLInputElement).value);
    if (currentValue === formatted) return;

    await page.evaluate((selector, value) => {
      const el = document.querySelector(selector) as HTMLInputElement | null;
      if (!el) throw new Error(`No element for ${selector}`);

      // set the value directly
      el.value = value;

      // Some libraries listen for InputEvent specifically
      const inputEvent = new InputEvent('input', { bubbles: true });
      el.dispatchEvent(inputEvent);

      // also dispatch a change event (some code listens for this)
      const changeEvent = new Event('change', { bubbles: true });
      el.dispatchEvent(changeEvent);

      // blur to trigger validation / touched state
      el.blur();
    }, selector, formatted);
  },

  // Select a given dropdown option
  dropdown: async (page, selector, value: string) => {
    await page.waitForSelector(selector);

    const currentValue = await page.$eval(selector, el => el.textContent?.trim());
    if (currentValue === value) return;

    await page.click(selector);
    await page.waitForSelector("mat-option", { visible: true });
    await page.evaluate((text) => {
      const options = Array.from(document.querySelectorAll("mat-option"));
      const target = options.find(o => o.textContent?.trim() === text);
      if (target) (target as HTMLElement).click();
    }, value);
  },

  // Input a number to a numeric input field
  number: async (page, selector, value: number) => {
    await page.waitForSelector(selector);

    const currentValue = await page.$eval(selector, el => parseFloat((el as HTMLInputElement).value));
    if (currentValue === value) return;

    await page.click(selector, { clickCount: 3 });
    await page.keyboard.press("Backspace");
    await page.type(selector, value.toString());
  },

  // Set the state of a checkbox
  checkbox: async (page, selector, value: boolean) => {
    await page.waitForSelector(selector);

    // Get the current checked state of the input
    const isChecked = await page.$eval(selector, (el: Element) => {
      // Narrow the element type to HTMLInputElement safely
      const input = el as HTMLInputElement;
      if (input.tagName.toLowerCase() !== 'input' || input.type !== 'checkbox') {
        throw new Error('The selected element is not a checkbox input');
      }
      return input.checked;  // Return the checked state of the checkbox
    });

    // If the checkbox is not in the desired state, click on the actual input element to toggle it
    if (isChecked !== value) {
      await page.evaluate((sel) => {
        const input = document.querySelector(sel);
        if (!input) throw new Error(`Checkbox input not found for selector: ${sel}`);

        // Click the checkbox input directly
        (input as HTMLInputElement).click();
      }, selector);
    }
  },
};

// Dispatcher function without switch, just map lookup
async function inputField(page: Page, field: FieldComponent, data: FieldDataType) {
  const handler = handlers[field.type];
  if (!handler) throw new Error(`No handler for field type: ${field.type}`);

  await handler(page, field.selector, data);
}

// Directly dispatch a click event to a given button selector
async function dispatchClick(page: Page, buttonSelector: string) {
  await page.evaluate((buttonSelector) => {
    const button = document.querySelector(buttonSelector);
    if (button) {
      // Manually dispatch the click event
      const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
      });
      button.dispatchEvent(clickEvent);
    }
  }, buttonSelector);
}

function parseOutputRow(raw: string[], roundTrip: boolean): Flight {
  const [rawPrice, airline, outboundTimes, returnTimes, durations, routes] = raw;

  const price = parseInt(rawPrice.replace('$', ''), 10);

  // Match time strings like "7:34 PM" or "10:49 PM"
  const outboundTimeMatches = outboundTimes.match(/(\d{1,2}:\d{2}\s*[APMapm]{2})/g) || [];
  const returnTimeMatches = returnTimes.match(/(\d{1,2}:\d{2}\s*[APMapm]{2})/g) || [];

  const durationParts = durations.split('  ').map(d => d.trim()).filter(Boolean);
  const routeParts = routes.split('  ').map(r => r.trim()).filter(Boolean);

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const day = today.getDate();

  function makeDate(timeStr: string, baseDate?: Date): Date {
    const base = baseDate ? new Date(baseDate) : new Date(year, month, day);
    const [timePart, ampm] = timeStr.trim().split(/\s*(?=AM|PM)/i);
    const [hoursStr, minutesStr] = timePart.split(':');
    let hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);

    const isPM = /PM/i.test(ampm);
    const isAM = /AM/i.test(ampm);

    if (isPM && hours !== 12) hours += 12;
    if (isAM && hours === 12) hours = 0;

    base.setHours(hours);
    base.setMinutes(minutes);
    base.setSeconds(0);
    base.setMilliseconds(0);

    return base;
  }

  function parseDuration(str: string): number {
    const match = str.match(/(\d+)h\s*(\d+)m/);
    if (!match) return 0;
    const [, h, m] = match;
    return parseInt(h, 10) * 60 + parseInt(m, 10);
  }

  function parseRoute(str: string): [string, string] {
    const [from, to] = str.split(' to ').map(s => s.trim());
    return [from, to];
  }

  // --- Outbound Section ---
  const [from1, to1] = parseRoute(routeParts[0]);
  const [dep1] = outboundTimeMatches;
  if (!dep1) throw new Error("Missing outbound departure time");

  const duration1 = parseDuration(durationParts[0]);

  const outbound: FlightLeg = {
    from: from1,
    to: to1,
    date: makeDate(dep1),
    fromAirportIATA: duration1
  };

  let returnSection: FlightLeg | undefined = undefined;

  if (roundTrip) {
    const [from2, to2] = routeParts[1] ? parseRoute(routeParts[1]) : ["", ""];
    const dep2 = returnTimeMatches[0];
    if (!dep2) throw new Error("Missing inbound departure time");
    const duration2 = parseDuration(durationParts[1]);

    // Try to extract return date from e.g. "(12-31)"
    const returnDateMatch = returnTimes.match(/\((\d{2})-(\d{2})\)/);
    const returnDate = returnDateMatch
      ? new Date(year, parseInt(returnDateMatch[1], 10) - 1, parseInt(returnDateMatch[2], 10))
      : new Date(year, month, day + 1); // fallback: next day

    returnSection = {
      from: from2,
      to: to2,
      date: makeDate(dep2, returnDate),
      fromAirportIATA: duration2
    };
  }

  return {
    price,
    airline: airline,
    outbound,
    ...(returnSection && { return: returnSection })
  };
}

export async function runQuery(queryType: FlightQueryType, fieldInputs: FieldInputs): Promise<Flight[]> {
  // TODO: Implement multi city search
  if (queryType === "multiCity") {
    throw new Error("Multi city search is not yet implemented");
  }

  const browserExecPath = process.env.PUPPETEER_BROWSER_EXEC_PATH;
  const browser: Browser = await puppeteer.launch({
    ...(browserExecPath ? { executablePath: browserExecPath } : {}),
    headless: !DEV_MODE,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page: Page = await browser.newPage();

  // Data to return
  let outputFlights: Flight[] = [];

  try {
    // Request the page
    await page.goto(URL, {
      timeout: 5000,
      waitUntil: "domcontentloaded",
    });

    // Switch to tab based on query type (round trip, one way, or multi city)
    dispatchClick(page, pageConfigs[queryType].tabButtonSelector);

    // Fill in input fields
    for (const [fieldIdentifer, data] of Object.entries(fieldInputs)) {
      const fieldComponent = pageConfigs[queryType].fieldComponents[fieldIdentifer];
      if (!fieldComponent) throw new Error(`No field for field identifier: ${fieldIdentifer}`);
      await inputField(page, fieldComponent, data);
    }

    // Send the search query
    dispatchClick(page, ".search-button");

    // Wait for search results
    await page.waitForNavigation({
      timeout: SEARCH_TIMEOUT,
      waitUntil: "networkidle0",
    });

    // Scrape data
    outputFlights = (await page.$$eval('.mat-mdc-table tr', rows => {
      return rows.map(row => {
        const cells = Array.from(row.querySelectorAll('td')); // Extract all cells (<td>) in each row
        return cells.map(cell => cell.textContent?.trim()); // Return cell content as an array
      }).filter(row => row.some(Boolean)); // Return only rows containing at least 1 non-falsy value
    })).map(row => parseOutputRow(row, (queryType === "roundTrip"))); // Parse output (string[]) to structured JSON object
    
  } catch (err: any) {
    throw new Error(`Failed to evaluate query with error: ${err.message}`)
  } finally {
    if (!DEV_MODE) await browser.close();
  }

  return outputFlights;
}