// Family details shown on the "With the blessings of" screen that sits between
// the gate opening and the first event (Haldi).
//
// Sequence on screen (top → bottom):
//   Grandparents → YASH (groom) → mother, father
//   then Isha (bride) → mother, father
//
// Default / groom-side invites (td, od) show the GROOM's grandparents.
// Bride-side invites (btd, bod) show the BRIDE's grandparents in that same
// top slot instead — see src/category.ts for how the category is derived.
import { isBride } from '../category'

export interface Person {
  name: string
  mother: string
  father: string
}

export const GROOM: Person = {
  name: 'Yash',
  mother: 'Sandhya Gupta',
  father: 'Sanjeev Gupta',
}

export const BRIDE: Person = {
  name: 'Isha',
  mother: 'Vinam Agrawal',
  father: 'Nitinkumar Agrawal',
}

// Grandparent blessing lines.
const GROOM_GRANDPARENTS = 'Smt. Urmila Devi w/o Late Shri Ramkishor Ji Gupta'
const BRIDE_GRANDPARENTS = 'Late Smt. Madhubala Agrawal w/o Shri Premsundar Agrawal'

/**
 * Grandparents shown in the top "With the blessings of" slot.
 * Groom-side invites show the groom's grandparents; bride-side invites
 * (btd / bod) show the bride's grandparents instead.
 */
export const grandparents = isBride ? BRIDE_GRANDPARENTS : GROOM_GRANDPARENTS
