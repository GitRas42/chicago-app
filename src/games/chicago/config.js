export const GAME_TYPE = 'chicago';
export const WIN_THRESHOLD = 50;
export const CHICAGO_POINTS = 15;
export const KOPSTOPP_THRESHOLD = 46;
export const TRICK_POINTS = 5;
export const TRICK_TWO_POINTS = 10;

export const HANDS = [
  { id: "pair", points: 1 },
  { id: "twoPair", points: 2 },
  { id: "threeOfKind", points: 3 },
  { id: "straight", points: 4 },
  { id: "flush", points: 5 },
  { id: "fullHouse", points: 6 },
  { id: "fourOfKind", points: 7 },
  { id: "straightFlush", points: 8 },
];

export function mkSteps(er, t) {
  const s = [];
  if (er === 3) {
    s.push({ type: "hand", label: `${t("exchange")} 1`, key: "h1" });
    s.push({ type: "hand", label: `${t("exchange")} 2`, key: "h2" });
    s.push({ type: "trick", label: t("lastTrick"), key: "tr" });
    s.push({ type: "hand", label: t("finalHand"), key: "h3" });
  } else {
    s.push({ type: "hand", label: `${t("exchange")} 1`, key: "h1" });
    s.push({ type: "trick", label: t("lastTrick"), key: "tr" });
    s.push({ type: "hand", label: t("finalHand"), key: "h2" });
  }
  return s;
}
