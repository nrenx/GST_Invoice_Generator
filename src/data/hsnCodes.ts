import goodsRatesRaw from "./gst-goods-rates.json";
import { HSNCode } from "@/types/invoice";

type GoodsRateRecord = {
  chapterHeading: string;
  description: string;
  cgstRate: string;
  sgstRate: string;
  igstRate: string;
};

const normalizeHsnCode = (value: string): string => value.replace(/[^0-9A-Za-z]/g, "").toUpperCase();

const parseRate = (value: string): number => {
  if (!value) {
    return 0;
  }

  const trimmed = value.trim();
  if (!trimmed || /^nil$/i.test(trimmed)) {
    return 0;
  }

  const numeric = Number.parseFloat(trimmed.replace(/[^0-9.]/g, ""));
  return Number.isFinite(numeric) ? numeric : 0;
};

const asGoodsRates = goodsRatesRaw as GoodsRateRecord[];

const hsnCodeEntries = new Map<string, HSNCode>();

for (const record of asGoodsRates) {
  const rawCodes = record?.chapterHeading;
  const rawDescription = record?.description?.trim();

  if (!rawCodes || !rawDescription || /^\[?omitted/i.test(rawDescription)) {
    continue;
  }

  const codes = rawCodes
    .split(",")
    .map((segment) => normalizeHsnCode(segment))
    .filter((code) => code.length >= 4);

  if (!codes.length) {
    continue;
  }

  const cgst = parseRate(record.cgstRate);
  const sgst = parseRate(record.sgstRate);
  const igst = parseRate(record.igstRate);

  for (const code of codes) {
    if (!code) {
      continue;
    }

    const entry: HSNCode = {
      code,
      description: rawDescription,
      cgst,
      sgst,
      igst,
      cess: 0,
    };

    const existing = hsnCodeEntries.get(code);
    if (!existing) {
      hsnCodeEntries.set(code, entry);
      continue;
    }

    const existingScore = (existing.cgst + existing.sgst + existing.igst) * existing.description.length;
    const nextScore = (cgst + sgst + igst) * rawDescription.length;
    if (nextScore > existingScore) {
      hsnCodeEntries.set(code, entry);
    }
  }
}

export const hsnCodes: HSNCode[] = Array.from(hsnCodeEntries.values()).sort((a, b) => a.code.localeCompare(b.code));

export const hsnCodeMap = new Map(hsnCodes.map((entry) => [entry.code, entry]));

export { normalizeHsnCode };

export const uomOptions = ["MTS", "KGS", "NOS", "PCS", "TONS", "QTLS", "BOXES", "BAGS"];

export const transportModes = ["By Lorry", "By Road", "By Rail", "By Air", "By Ship"];

export const indianStates = [
  { name: "Andhra Pradesh", code: "37" },
  { name: "Arunachal Pradesh", code: "12" },
  { name: "Assam", code: "18" },
  { name: "Bihar", code: "10" },
  { name: "Chhattisgarh", code: "22" },
  { name: "Goa", code: "30" },
  { name: "Gujarat", code: "24" },
  { name: "Haryana", code: "06" },
  { name: "Himachal Pradesh", code: "02" },
  { name: "Jharkhand", code: "20" },
  { name: "Karnataka", code: "29" },
  { name: "Kerala", code: "32" },
  { name: "Madhya Pradesh", code: "23" },
  { name: "Maharashtra", code: "27" },
  { name: "Manipur", code: "14" },
  { name: "Meghalaya", code: "17" },
  { name: "Mizoram", code: "15" },
  { name: "Nagaland", code: "13" },
  { name: "Odisha", code: "21" },
  { name: "Punjab", code: "03" },
  { name: "Rajasthan", code: "08" },
  { name: "Sikkim", code: "11" },
  { name: "Tamil Nadu", code: "33" },
  { name: "Telangana", code: "36" },
  { name: "Tripura", code: "16" },
  { name: "Uttar Pradesh", code: "09" },
  { name: "Uttarakhand", code: "05" },
  { name: "West Bengal", code: "19" },
];
