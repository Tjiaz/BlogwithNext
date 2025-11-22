import adverts from "@/Data3";

const hoursPerAdvert = 3;

export function getCurrentAdvert() {
  const now = new Date();
  const totalHours = now.getTime() / (1000 * 60 * 60); // hours since epoch
  const index = Math.floor(totalHours / hoursPerAdvert) % adverts.length;
  return adverts[index];
}

// import adverts from "@/Data3";

// const secondsPerAdvert = 5;

// export function getCurrentAdvert() {
//   const now = new Date();
//   const totalSeconds = Math.floor(now.getTime() / 1000);
//   const index = Math.floor(totalSeconds / secondsPerAdvert) % adverts.length;
//   return adverts[index];
// }
