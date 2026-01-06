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
