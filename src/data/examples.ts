import { AnalysisEntry } from '@/types';

export const EXAMPLE_ANALYSES: AnalysisEntry[] = [
  {
    id: '2007-01-09T00:00:00.000Z',
    event: 'The launch of the first iPhone in 2007',
    analysis: `**Event Summary:** Apple Inc. launched a revolutionary touchscreen smartphone that combined a mobile phone, an iPod, and an internet communication device.\n\n**Primary Category:** T (Technological)\n\n**2nd Order Ripple:** The creation of the App Store, which fostered a massive new economy for software developers and changed how people use mobile devices (Economic).\n\n**3rd Order Ripple:** The rise of the gig economy, as platforms like Uber and Airbnb became viable on ubiquitous, GPS-enabled smartphones, fundamentally altering urban transport and hospitality sectors (Social).\n\n**Feedback Loop:** Reinforcing\n\n**Risk/Opportunity Alert:** Manufacturers of single-function devices (cameras, GPS units, MP3 players) faced sudden, massive disruption as their core functions were absorbed into the smartphone.`,
    sources: [],
    feedbackLoopType: 'reinforcing',
  },
  {
    id: '2020-03-11T00:00:00.000Z',
    event: 'The global shift to remote work during the 2020 pandemic',
    analysis: `**Event Summary:** In response to the COVID-19 pandemic, companies across the globe rapidly transitioned to remote work models.\n\n**Primary Category:** S (Social)\n\n**2nd Order Ripple:** A significant migration from dense urban centers to suburban and rural areas, causing a sharp increase in suburban housing prices and a decline in commercial real estate values in cities (Economic).\n\n**3rd Order Ripple:** Increased political pressure on governments to fund and expand broadband internet infrastructure to underserved areas, highlighting the digital divide as a critical equity issue (Political).\n\n**Feedback Loop:** Reinforcing\n\n**Risk/Opportunity Alert:** Businesses centered around the traditional office environment (e.g., corporate catering, downtown restaurants, public transit) faced an existential crisis, while collaboration software companies saw explosive growth.`,
    sources: [],
    feedbackLoopType: 'reinforcing',
  },
];
