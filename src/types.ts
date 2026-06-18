export type OwnedStatus = 'needed' | 'owned';

export interface Sticker {
  id: string;        // e.g. "BRA 7" or "ARG 10" or "FWC 3"
  team: string;      // e.g. "Brazil" or "Argentina" or "Special"
  code: string;      // e.g. "BRA" or "ARG" or "FWC"
  number: number;    // e.g. 7 or 10
  name: string;      // player name or special description
  ownedStatus: OwnedStatus;
  doublesCount: number;
  fact?: string;     // fun fact for sticker
}

export interface Team {
  name: string;
  code: string;
  flag: string;
  stickers: Sticker[];
}

export interface RecognitionResponse {
  detected: string[];
  message?: string;
}
