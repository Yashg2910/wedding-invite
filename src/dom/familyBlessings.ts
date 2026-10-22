// Family details shown on the "With the blessings of" screen that sits between
// the gate opening and the first event (Haldi).
//
// Sequence on screen (top → bottom):
//   ॥ श्री गणेशाय नमः ॥ → Ganesha emblem →
//   "...bless the wedding ceremony of their beloved grand son/daughter" →
//   YASH (groom) → grandparents → parents
//   then & → ISHA (bride) → grandparents → parents
//
// Default / groom-side invites (td, od) lead with the groom.
// Bride-side invites (btd, bod) lead with the bride — see src/category.ts for
// how the category is derived.

export interface Person {
  name: string
  /** Shown above the parents line, e.g. grandparents' blessing line. */
  grandparents: string
  mother: string
  father: string
}

export const GROOM: Person = {
  name: 'Yash',
  grandparents: 'Smt. Urmila Devi w/o Late Shri Ramkishor Ji Gupta',
  mother: 'Sandhya Gupta',
  father: 'Sanjeev Gupta',
}

export const BRIDE: Person = {
  name: 'Isha',
  grandparents: 'Late Smt. Madhubala Agrawal w/o Shri Premsundar Agrawal',
  mother: 'Vinam Agrawal',
  father: 'Nitinkumar Agrawal',
}
