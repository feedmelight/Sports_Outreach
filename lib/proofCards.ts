export interface ProofCard {
  id: string
  client: string
  title: string
  description: string
  image: string | null
  imageFallbackGradient: string
  tags: string[]
  year: string
}

export const PROOF_CARDS: ProofCard[] = [
  {
    id: 'wc2022',
    client: 'FIFA',
    title: 'FIFA World Cup 2022',
    description: 'Full content portfolio for the biggest sporting event on earth. Stadium screens, broadcast graphics, social content and experiential across all venues in Qatar.',
    image: '/images/proof-wc2022.avif',
    imageFallbackGradient: 'linear-gradient(135deg, #6B21A8 0%, #1E3A5F 100%)',
    tags: ['Global Event', 'Stadium Content', 'Broadcast'],
    year: '2022',
  },
  {
    id: 'u17wc',
    client: 'FIFA',
    title: 'FIFA U-17 World Cup',
    description: 'End-to-end creative production for the next generation of global football. Full tournament content suite across Indonesia.',
    image: null,
    imageFallbackGradient: 'linear-gradient(135deg, #1B4332 0%, #40916C 100%)',
    tags: ['Global Event', 'Tournament', 'Youth Football'],
    year: '2023',
  },
  {
    id: 'asiancup',
    client: 'AFC',
    title: 'AFC Asian Cup',
    description: 'Creative content production for the AFC Asian Cup in Qatar. Opening ceremony content, in-stadium experience and digital campaign assets.',
    image: '/images/proof-asian-cup.avif',
    imageFallbackGradient: 'linear-gradient(135deg, #1E3A5F 0%, #B45309 100%)',
    tags: ['Asian Football', 'Ceremony', 'Stadium'],
    year: '2023',
  },
  {
    id: 'espn',
    client: 'ESPN',
    title: 'ESPN',
    description: 'Motion content and broadcast graphics for one of the world\'s leading sports broadcasters. Delivering at the intersection of sport, culture and storytelling.',
    image: null,
    imageFallbackGradient: 'linear-gradient(135deg, #991B1B 0%, #111827 100%)',
    tags: ['Broadcast', 'Motion Graphics', 'US Sports'],
    year: '2023',
  },
]
