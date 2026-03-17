import type { AgentResponse } from '../types';
import { organizations } from '../data/organizations';

const ALL_ORG_IDS = organizations.map(o => o.id);

type Rule = {
  keywords: string[];
  orgIds: string[];
  text: string;
};

const RULES: Rule[] = [
  {
    keywords: ['food', 'meal', 'hunger', 'eat', 'feed', 'nutrition', 'restaurant', 'grocery'],
    orgIds: ['community-servings'],
    text: "For food rescue and nutrition programs, **Community Servings** in Jamaica Plain provides medically tailored meals and rescues surplus food from going to waste. Here's what I found:",
  },
  {
    keywords: ['bike', 'bicycle', 'cycling', 'cycle'],
    orgIds: ['bnb'],
    text: "**Bikes Not Bombs** in Jamaica Plain is Boston's go-to for bicycle repair, reuse, and youth mechanics training — keeping bikes out of landfills:",
  },
  {
    keywords: ['repair', 'fix', 'broken', 'mend', 'refurbish', 'restore'],
    orgIds: ['bnb', 'repair-cafe'],
    text: "Boston has great repair resources! **Repair Café Boston** hosts free community events, and **Bikes Not Bombs** specializes in bicycle repair:",
  },
  {
    keywords: ['tool', 'borrow', 'lend', 'drill', 'saw', 'diy', 'hardware'],
    orgIds: ['tool-library'],
    text: "The **Boston Tool Library** in Somerville lets you borrow tools instead of buying them — a great way to reduce consumption and save money:",
  },
  {
    keywords: ['build', 'construction', 'lumber', 'material', 'deconstruct', 'demolition', 'contractor', 'renovate', 'renovation', 'habitat'],
    orgIds: ['bmrc', 'habitat-restore'],
    text: "These two organizations specialize in salvaged and surplus building materials — great for renovators and builders on a budget:",
  },
  {
    keywords: ['cloth', 'thrift', 'fashion', 'shirt', 'pants', 'dress', 'apparel', 'wear', 'wardrobe', 'secondhand', 'second hand'],
    orgIds: ['goodwill', 'second-life', 'c2c'],
    text: "Boston has several great thrift and clothing reuse options to keep textiles out of landfills:",
  },
  {
    keywords: ['child', 'kid', 'baby', 'cradle', 'toy', 'school', 'youth', 'family', 'stroller'],
    orgIds: ['c2c', 'bnb'],
    text: "For children's items and youth programs, these organizations stand out:",
  },
  {
    keywords: ['compost', 'waste', 'zero', 'recycle', 'recycling', 'green', 'sustainability', 'sustainable', 'environment', 'landfill'],
    orgIds: ['zero-waste'],
    text: "**Zero Waste Boston** leads the city's composting and waste reduction efforts with free resources and programs for residents:",
  },
  {
    keywords: ['furniture', 'couch', 'sofa', 'table', 'chair', 'desk', 'appliance', 'fridge', 'mattress'],
    orgIds: ['goodwill', 'second-life', 'habitat-restore'],
    text: "Looking for secondhand furniture or appliances? These organizations in Boston accept and resell gently used items:",
  },
  {
    keywords: ['donate', 'donation', 'give', 'drop off', 'drop-off'],
    orgIds: ['bmrc', 'c2c', 'goodwill', 'second-life', 'habitat-restore', 'bnb'],
    text: "There are several places in Boston to donate items and keep them out of the waste stream:",
  },
  {
    keywords: ['reuse', 'used', 'pre-owned', 'preloved', 'pre loved', 'salvage', 'upcycle'],
    orgIds: ['bmrc', 'c2c', 'goodwill', 'second-life', 'habitat-restore'],
    text: "Boston has a strong reuse ecosystem! Here are organizations that redistribute secondhand goods:",
  },
];

export const SCRIPTED_MESSAGES: AgentResponse[] = [
  {
    text: "Hi, I'm Zephyr: Boston's waterfall powered chatbot focused on reducing your carbon impact! How can I help you today?",
    highlightedOrgIds: [],
  },
  {
    text: "Some common items include bicycles, electronics, clothing, furniture, and building materials.",
    highlightedOrgIds: [],
  },
  {
    text: "Great! There are organizations near you that offer bike repair services.",
    highlightedOrgIds: ['bnb'],
  },
  {
    text: "Plenty of items can be borrowed depending on the local, including tools, vehicles, and more! Anything specific in mind?",
    highlightedOrgIds: [],
  },
];

export function getAgentResponse(input: string): AgentResponse {
  const lower = input.toLowerCase().trim();

  if (lower.length === 0) {
    return {
      text: "Please type a question — for example, try asking about 'repair', 'food', 'clothing', or 'building materials'.",
      highlightedOrgIds: ALL_ORG_IDS,
    };
  }

  if (['all', 'show all', 'everything', 'list', 'list all', 'what', 'help', 'options', 'overview'].some(k => lower.includes(k))) {
    return {
      text: "Here are all 10 circular economy organizations in the Boston metro area:",
      highlightedOrgIds: ALL_ORG_IDS,
    };
  }

  const matchedOrgIds = new Set<string>();
  const matchedTexts: string[] = [];

  for (const rule of RULES) {
    if (rule.keywords.some(kw => lower.includes(kw))) {
      rule.orgIds.forEach(id => matchedOrgIds.add(id));
      matchedTexts.push(rule.text);
    }
  }

  if (matchedOrgIds.size === 0) {
    return {
      text: "I'm not sure exactly what you're looking for, but here are all the circular economy organizations in Boston — maybe one of them fits!",
      highlightedOrgIds: ALL_ORG_IDS,
    };
  }

  return {
    text: matchedTexts[0],
    highlightedOrgIds: Array.from(matchedOrgIds),
  };
}
