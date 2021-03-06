export enum EggKeys {
  BRING_ON_THE_BUGS = "BRING_ON_THE_BUGS",
  BUGS_ARE_STILL_ALIVE = "BUGS_ARE_STILL_ALIVE",
}

export function getEggStatus(key: EggKeys): string {
  return localStorage.getItem(key) || "";
}

export function setEggStatus(key: EggKeys, value: string): void {
  localStorage.setItem(key, value);
}
