import { SwaraStructure } from '../types';

export const SAMPLE_RAGAS: SwaraStructure[] = [
  {
    id: 'gambhira-natta',
    ragaName: 'Gambhira natta',
    parentRaga: 'Chala natta No 36',
    remarks: 'Janya Raga derived from 36th Melakarta Chalanatta. Pentatonic scale.',
    arohanam: ['s', 'g3', 'm1', 'p', 'n3', 'S'],
    avarohanam: ['S', 'n3', 'p', 'm1', 'g3', 's'],
    shortPhrases: [
      { cell1: 'm g m p', cell2: 'p n p m g', cell3: "g m p n S", cell4: 'n S G S' },
      { cell1: 'S n p', cell2: 'p n S G', cell3: 'S G M G S', cell4: 'S G M P M G S' },
      { cell1: 'n G S n p', cell2: 'n S p n m p', cell3: 'm g p m g x', cell4: 'p m g s' }
    ],
    adiThalaRows: [
      {
        id: 'gn-row-1',
        header: ['U', '1', '2', '3'],
        phrases: [
          'm p n p x - n p m',
          'g m p - p m g s x',
          'n s p x x - n s n',
          's g - s g x m p x'
        ]
      },
      {
        id: 'gn-row-2',
        header: ['U', 'V', 'U', 'V'],
        phrases: [
          'p m m p - s s g s',
          'm g - p m - n p - m p',
          'p n S - p S n p m',
          'g m p n - S x x x'
        ]
      },
      {
        id: 'gn-row-3',
        header: ['U', '1', '2', '3'],
        phrases: [
          'p n S - G x - G x G',
          'S G M P - M G S x',
          'n S G M - P M G S',
          'n S - p n - m p - n S'
        ]
      },
      {
        id: 'gn-row-4',
        header: ['U', 'V', 'U', 'V'],
        phrases: [
          'S G S - n S n - p n',
          'p m p m - g m p n',
          'p S n - p n p x m',
          'g m p m - g m g s'
        ]
      }
    ]
  },
  {
    id: 'mohanam',
    ragaName: 'Mohanam',
    parentRaga: 'Harikambhoji No 28',
    remarks: 'A popular pentatonic scale. S R2 G3 P D2 S.',
    arohanam: ['s', 'r2', 'g3', 'p', 'd2', 'S'],
    avarohanam: ['S', 'd2', 'p', 'g3', 'r2', 's'],
    shortPhrases: [
      { cell1: 's r g', cell2: 'r g p', cell3: 'g p d S', cell4: 'p d S R' },
      { cell1: 'd S R G', cell2: 'S R G P', cell3: 'P G R S', cell4: 'R S R d S p d' },
      { cell1: 'S d S p d g p', cell2: 'G R S d p', cell3: 'S d p g r', cell4: 'g r s d, s' }
    ],
    adiThalaRows: [
      {
        id: 'moh-row-1',
        header: ['U', '1', '2', '3'],
        phrases: [
          'd d S - d x p g p',
          'd R S - S d p g r',
          'g d - p d - g p r g',
          's r g p g r s x'
        ]
      },
      {
        id: 'moh-row-2',
        header: ['U', 'V', 'U', 'V'],
        phrases: [
          'r r s - d, x p, - d, s',
          'r r s - g g r p p',
          'g d d p - S d p g',
          'r s r g - p d S x'
        ]
      },
      {
        id: 'moh-row-3',
        header: ['U', '1', '2', '3'],
        phrases: [
          'R S R x R G R',
          'S R G P - G R S x',
          'd G R G - S R d S',
          'R R S S - d p d x'
        ]
      },
      {
        id: 'moh-row-4',
        header: ['U', 'V', 'U', 'V'],
        phrases: [
          'p d S R G - d S R',
          'p d S - g p d - r g',
          'p - s r g - p d S R',
          'G R S - d p g r s'
        ]
      }
    ]
  },
  {
    id: 'hamsadhwani',
    ragaName: 'Hamsadhwani',
    parentRaga: 'Sankarabharanam No 29',
    remarks: 'A common pentatonic raga.',
    arohanam: ['s', 'r2', 'g3', 'p', 'n3', 'S'],
    avarohanam: ['S', 'n3', 'p', 'g3', 'r2', 's'],
    shortPhrases: [
      { cell1: 's s r g x', cell2: 'g r g p x', cell3: 'g p n S n x', cell4: 'p n G R S' },
      { cell1: 'R S n p', cell2: 'p n S R G', cell3: 'G R n R', cell4: 'G P G R S' },
      { cell1: 'n G R S n', cell2: 'S n R S n p', cell3: 'g p G R S x', cell4: 'n p g r s x' }
    ],
    adiThalaRows: [
      {
        id: 'ham-row-1',
        header: ['U', '1', '2', '3'],
        phrases: [
          'g g p - g x r s n,',
          's r s - s n, p, n, s',
          'r g r - g p n - g p',
          'p g r s r x x x'
        ]
      },
      {
        id: 'ham-row-2',
        header: ['U', 'V', 'U', 'V'],
        phrases: [
          'g p n - g p - S n p',
          'n, R - S S - n n - p g',
          'r g p n - S G R S',
          'n p n - S R G R x'
        ]
      },
      {
        id: 'ham-row-3',
        header: ['U', '1', '2', '3'],
        phrases: [
          'R S R - n S n G R',
          'G R G - R S n p n',
          'S R G - R G - R S n',
          'p n S R - G x x x'
        ]
      },
      {
        id: 'ham-row-4',
        header: ['U', 'V', 'U', 'V'],
        phrases: [
          'R G P - G R S n S',
          'R S n p - g p n S',
          'G R x S - n p g r',
          's r g p - g r s x'
        ]
      }
    ]
  },
  {
    id: 'hindolam',
    ragaName: 'Hindolam',
    parentRaga: 'Natabhairavi No 20',
    remarks: 'Pentatonic raga. S G2 M1 D1 N2 S.',
    arohanam: ['s', 'g2', 'm1', 'd1', 'n2', 'S'],
    avarohanam: ['S', 'n2', 'd1', 'm1', 'g2', 's'],
    shortPhrases: [
      { cell1: 'm g s', cell2: 'n, s d, n, s', cell3: 'n, s m g m', cell4: 'g m n d x' },
      { cell1: 'S n d m x', cell2: 'g m d n S', cell3: 'n d n S', cell4: 'n S m g S' },
      { cell1: 'n G S n S d x', cell2: 'S n d n d', cell3: 'm d n d m', cell4: 'g m d g m g s' }
    ],
    adiThalaRows: [
      {
        id: 'hin-row-1',
        header: ['U', '1', '2', '3'],
        phrases: [
          'm x m - m x m g m',
          'g m d n - d m g s',
          'n, s m g - d m g s',
          'n, g s - n, s - d, x n,'
        ]
      },
      {
        id: 'hin-row-2',
        header: ['U', 'V', 'U', 'V'],
        phrases: [
          'd, n, s - g m - g m x',
          'g m d n - S n d x',
          'd n S - S n - n d m',
          'g x m - d x n - S x'
        ]
      },
      {
        id: 'hin-row-3',
        header: ['U', '1', '2', '3'],
        phrases: [
          'n n S - n n S - G S',
          'n S G S - N S d x',
          'd x n - S x - G M x',
          'G M D - G M G S x'
        ]
      },
      {
        id: 'hin-row-4',
        header: ['U', 'V', 'U', 'V'],
        phrases: [
          'n S M G M - S G S',
          'n G - S S - n n - d d',
          'm d n S x - n d n',
          'S n d - m g m - g s'
        ]
      }
    ]
  },
  {
    id: 'des',
    ragaName: 'Des',
    parentRaga: 'Harikambhoji No 28',
    remarks: 'A bhashanga raga in which the Anya Swara is Kakali Nishadam (n3)',
    arohanam: ['s', 'r2', 'm1', 'p', 'n2', 'S'],
    avarohanam: ['S', 'n2', 'd2', 'p', 'm1', 'g3', 'r2', 's'],
    shortPhrases: [
      { cell1: 's r m p', cell2: 'm p n2 S x', cell3: 'p n2 S R', cell4: 'n2 S R M G R' },
      { cell1: 'R G n2 x S', cell2: 'n2 S R n2 d p', cell3: 'p n2 G R n2 x d p', cell4: 'm p n2 R S n2 d p' },
      { cell1: 'r m p d2 x', cell2: 'm d2 p m g r', cell3: 'r p m g r', cell4: 'r m g r g n2, x s' }
    ],
    adiThalaRows: [
      {
        id: 'des-row-1',
        header: ['U', '1', '2', '3'],
        phrases: [
          'r x r - r x r - r x',
          'r m g - r g - n, x s',
          's x s - r x r - m p',
          's r m p - n2 d p x'
        ]
      },
      {
        id: 'des-row-2',
        header: ['U', 'V', 'U', 'V'],
        phrases: [
          'n2, m p - n2, x n, - n2, x',
          'n, S x S - R N2 S x',
          'n2 S R M - G R S x',
          'n2 S R P - M G R S'
        ]
      },
      {
        id: 'des-row-3',
        header: ['U', '1', '2', '3'],
        phrases: [
          'n2 R - S S - n2 d p x',
          'm g r - p m g r m',
          'p n2 d p - m g r s',
          'n, s r - n2, x d, p, x'
        ]
      },
      {
        id: 'des-row-4',
        header: ['U', 'V', 'U', 'V'],
        phrases: [
          'm p n2 n2 - r n2 s x',
          'm g r - p m - n2 d p',
          'p n2 S R - S n2 d p',
          'n2 d p - m g r - n, s'
        ]
      }
    ]
  }
];
