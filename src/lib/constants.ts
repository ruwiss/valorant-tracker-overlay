export const AGENTS = [
  "jett", "reyna", "raze", "phoenix", "breach", "sova", "sage", "cypher",
  "brimstone", "killjoy", "viper", "omen", "skye", "yoru", "astra", "kayo",
  "chamber", "neon", "fade", "harbor", "gekko", "deadlock", "iso", "clove", "vyse"
] as const;

export const AGENT_COLORS: Record<string, string> = {
  jett: "#00d4aa", reyna: "#bd3fff", raze: "#ecb22e", phoenix: "#ff9f43",
  breach: "#ff6b35", sova: "#4a90d9", sage: "#00d4aa", cypher: "#ece8e1",
  brimstone: "#ff4655", killjoy: "#ecb22e", viper: "#00d4aa", omen: "#bd3fff",
  skye: "#00d4aa", yoru: "#4a90d9", astra: "#bd3fff", kayo: "#4a90d9",
  chamber: "#ecb22e", neon: "#4a90d9", fade: "#bd3fff", harbor: "#00d4aa",
  gekko: "#00d4aa", deadlock: "#768079", iso: "#bd3fff", clove: "#bd3fff",
  vyse: "#ff4655",
};

export const RANK_TIERS: Record<number, [string, string]> = {
  0: ["—", "#768079"],
  3: ["Iron 1", "#4a5568"], 4: ["Iron 2", "#4a5568"], 5: ["Iron 3", "#4a5568"],
  6: ["Bronze 1", "#a17419"], 7: ["Bronze 2", "#a17419"], 8: ["Bronze 3", "#a17419"],
  9: ["Silver 1", "#adb5bd"], 10: ["Silver 2", "#adb5bd"], 11: ["Silver 3", "#adb5bd"],
  12: ["Gold 1", "#ecb22e"], 13: ["Gold 2", "#ecb22e"], 14: ["Gold 3", "#ecb22e"],
  15: ["Platinum 1", "#59a5ac"], 16: ["Platinum 2", "#59a5ac"], 17: ["Platinum 3", "#59a5ac"],
  18: ["Diamond 1", "#b489c4"], 19: ["Diamond 2", "#b489c4"], 20: ["Diamond 3", "#b489c4"],
  21: ["Ascendant 1", "#00d4aa"], 22: ["Ascendant 2", "#00d4aa"], 23: ["Ascendant 3", "#00d4aa"],
  24: ["Immortal 1", "#ff4655"], 25: ["Immortal 2", "#ff4655"], 26: ["Immortal 3", "#ff4655"],
  27: ["Radiant", "#fffaa8"],
};

export const PARTY_COLORS = ["#ff4655", "#00d4aa", "#ecb22e", "#bd3fff"];


export const WEAPON_NAMES: Record<string, string> = {
  "63e6c2b6-4a8e-869c-3d4c-e38355226584": "Odin",
  "55d8a0f4-4274-ca67-fe2c-06ab45efdf58": "Ares",
  "9c82e19d-4575-0200-1a81-3eacf00cf872": "Vandal",
  "ae3de142-4d85-2547-dd26-4e90bed35cf7": "Bulldog",
  "ee8e8d15-496b-07ac-e5f6-8fae5d4c7b1a": "Phantom",
  "ec845bf4-4f79-ddda-a3da-0db3774b2794": "Judge",
  "910be174-449b-c412-ab22-d0873436b21b": "Bucky",
  "44d4e95c-4157-0037-81b2-17841bf2e8e3": "Frenzy",
  "29a0cfab-485b-f5d5-779a-b59f85e204a8": "Classic",
  "1baa85b4-4c70-1284-64bb-6481dfc3bb4e": "Ghost",
  "e336c6b8-418d-9340-d77f-7a9e4cfe0702": "Sheriff",
  "42da8ccc-40d5-affc-beec-15aa47b42eda": "Shorty",
  "a03b24d3-4319-996d-0f8c-94bbfba1dfc7": "Operator",
  "4ade7faa-4cf1-8376-95ef-39884480959b": "Guardian",
  "c4883e50-4494-202c-3ec3-6b8a9284f00b": "Marshal",
  "462080d1-4035-2937-7c09-27aa2a5c27a7": "Spectre",
  "f7e1b454-4ad4-1063-ec0a-159e56b58571": "Stinger",
  "2f59173c-4bed-b6c3-2191-dea9b58be9c7": "Melee",
  "5f0aaf7a-4289-3998-d5ff-eb9a5cf7f5c9": "Outlaw",
};
