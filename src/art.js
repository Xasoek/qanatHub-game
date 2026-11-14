// Role 2 replaces this static fixture with scenes that read STATE.
export function renderBase() {
  return `<svg viewBox="0 0 600 220" aria-hidden="true" focusable="false">
    <rect width="600" height="220" fill="#793747"/>
    <circle cx="470" cy="70" r="40" fill="#f7b586"/>
    <path d="M0 163 100 120l75 35 106-48 118 53 105-18 96 34v44H0Z" fill="#c36750"/>
    <path d="M0 184q200-38 350-5t250-4v45H0Z" fill="#e39465"/>
    <path d="M182 180v-22a54 54 0 0 1 108 0v22Z" fill="#dee7ee"/>
    <path d="M204 150h64l-9 17h-46Z" fill="#426a94"/>
    <path d="M288 180v-13h28v-15a35 35 0 0 1 70 0v28Z" fill="#82b6a7"/>
    <path d="M430 178v-28m54 28v-28m54 28v-28" stroke="#273c55" stroke-width="5"/>
    <path d="M405 153l13-23h40l-13 23zm54 0 13-23h40l-13 23zm54 0 13-23h40l-13 23z" fill="#203653" stroke="#97b7d6" stroke-width="2"/>
  </svg>`;
}
