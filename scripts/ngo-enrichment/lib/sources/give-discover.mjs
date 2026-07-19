/**
 * scripts/ngo-enrichment/lib/sources/give-discover.mjs
 *
 * Parser for Give Discover (give.do/discover) NGO profiles.
 * Extracts financial data, project info, impact stats, and sector info.
 *
 * Returns EnrichmentResult | null
 */

import { rateLimitedFetch, assertRobotsAllowed } from "../../lib/fetcher.mjs";

const SOURCE_TYPE = "give_discover";
const CONFIDENCE = 0.82;
const BASE_URL = "https://give.do/discover";

/**
 * @param {object} ngo — row from public.ngos (needs ngo_name, registration_data)
 * @returns {Promise<EnrichmentResult|null>}
 */
export async function scrapeGiveDiscover(ngo) {
  // Try to build a candidate URL from the NGO name slug
  const slug = buildSlug(ngo.ngo_name);
  const profileUrl = `${BASE_URL}/${slug}`;

  try {
    await assertRobotsAllowed(BASE_URL);
  } catch (err) {
    return {
      sourceType: SOURCE_TYPE,
      sourceUrl: profileUrl,
      fetchSuccess: false,
      fetchError: `robots.txt: ${err.message}`,
      fields: {},
      rawData: {},
      confidence: 0,
    };
  }

  let html;
  try {
    const res = await rateLimitedFetch(profileUrl, { timeout: 15000 });
    if (res.status === 404) return null; // NGO not listed on Give Discover
    if (!res.ok) {
      return { sourceType: SOURCE_TYPE, sourceUrl: profileUrl, fetchSuccess: false, fetchError: `HTTP ${res.status}`, fields: {}, rawData: {}, confidence: 0 };
    }
    html = await res.text();
  } catch (err) {
    return { sourceType: SOURCE_TYPE, sourceUrl: profileUrl, fetchSuccess: false, fetchError: err.message, fields: {}, rawData: {}, confidence: 0 };
  }

  // Verify we actually landed on the NGO's page (not a search redirect)
  const title = (html.match(/<title>([^<]+)<\/title>/i) || [])[1] || "";
  if (title.toLowerCase().includes("page not found") || title.toLowerCase().includes("search results")) {
    return null;
  }

  const rawData = {};
  const fields = extractGiveDiscoverFields(html, rawData);

  return {
    sourceType: SOURCE_TYPE,
    sourceUrl: profileUrl,
    fetchSuccess: true,
    fields,
    rawData,
    confidence: CONFIDENCE,
  };
}

function extractGiveDiscoverFields(html, rawData) {
  const fields = {};

  // Strip scripts/styles
  const cleanText = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // ── Description / About ───────────────────────────────────────────────
  const aboutMatch = html.match(/class=["'][^"']*(?:about|description|mission-text)[^"']*["'][^>]*>([\s\S]{50,1000}?)<\//i);
  if (aboutMatch) {
    const text = aboutMatch[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    if (text.length > 30) {
      fields.description = text.substring(0, 800);
      rawData.description = fields.description;
    }
  }

  // ── Registration Number ───────────────────────────────────────────────
  const regMatch = cleanText.match(/registration\s*(?:number|no)[.:]\s*([A-Z0-9\/\-]{5,30})/i);
  if (regMatch) {
    fields.registration_number = regMatch[1].trim();
    rawData.registration_number = fields.registration_number;
  }

  // ── 12A / 80G / FCRA ─────────────────────────────────────────────────
  if (/12A/i.test(cleanText) && /registered/i.test(cleanText)) {
    fields.cert_12a = "Registered";
    rawData.cert_12a = true;
  }
  if (/80G/i.test(cleanText) && /registered|certified/i.test(cleanText)) {
    fields.cert_80g = "Registered";
    rawData.cert_80g = true;
  }
  if (/FCRA/i.test(cleanText) && /registered|valid/i.test(cleanText)) {
    rawData.fcra_mentioned = true;
  }

  // ── PAN ───────────────────────────────────────────────────────────────
  const panMatch = cleanText.match(/\bPAN[:\s]+([A-Z]{5}[0-9]{4}[A-Z])\b/);
  if (panMatch) {
    fields.pan_number = panMatch[1];
    rawData.pan_number = fields.pan_number;
  }

  // ── Founded Year ─────────────────────────────────────────────────────
  const yearMatch = cleanText.match(/(?:founded|established|since|incorporated)\s*(?:in\s*)?(\b(19|20)\d{2}\b)/i);
  if (yearMatch) {
    const year = parseInt(yearMatch[1], 10);
    if (year >= 1900 && year <= new Date().getFullYear()) {
      fields.founded_year = year;
      rawData.founded_year = year;
    }
  }

  // ── Sectors ───────────────────────────────────────────────────────────
  const sectorKeywords = extractSectorKeywords(cleanText);
  if (sectorKeywords.length > 0) {
    fields.sectors_secondary = sectorKeywords;
    if (!fields.sector_primary) fields.sector_primary = sectorKeywords[0];
    rawData.sectors = sectorKeywords;
  }

  // ── Beneficiary count ─────────────────────────────────────────────────
  const benefMatch = cleanText.match(/(\d[\d,]+)\s*(?:\+\s*)?(?:beneficiar(?:y|ies)|people\s+(?:served|reached|helped|impacted))/i);
  if (benefMatch) {
    const count = parseInt(benefMatch[1].replace(/,/g, ""), 10);
    if (!isNaN(count) && count > 0) {
      rawData.beneficiary_count = count;
    }
  }

  // ── States served ─────────────────────────────────────────────────────
  const statesMatch = cleanText.match(/(?:operates?\s+in|serving|active\s+in)\s+((?:[A-Z][a-z]+(?:\s+Pradesh|uru|arakhand|arashtra|harkhand)?,?\s*){1,10})/);
  if (statesMatch) {
    const statesList = statesMatch[1].split(/,\s*/).map(s => s.trim()).filter(s => s.length > 3);
    if (statesList.length) {
      fields.states_served = statesList;
      rawData.states_served = statesList;
    }
  }

  // ── Website ───────────────────────────────────────────────────────────
  const websiteMatch = html.match(/href=["'](https?:\/\/(?!give\.do)[^"']+)["'][^>]*>[^<]*(?:website|visit|official)/i);
  if (websiteMatch) {
    fields.website = websiteMatch[1];
    rawData.website = fields.website;
  }

  return fields;
}

function extractSectorKeywords(text) {
  const SECTOR_MAP = [
    "Education", "Health", "Healthcare", "Women Empowerment", "Child Welfare",
    "Environment", "Livelihood", "Rural Development", "Disability", "Elderly Care",
    "Water Sanitation", "Agriculture", "Nutrition", "Mental Health", "Skill Development",
    "Animal Welfare", "Arts Culture", "Sports", "Disaster Relief", "Human Rights",
    "Tribal Welfare", "Urban Poor",
  ];
  return SECTOR_MAP.filter(sector => new RegExp(`\\b${sector.replace(/\s+/g, "\\s+")}\\b`, "i").test(text));
}

function buildSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}
