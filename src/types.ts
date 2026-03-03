export interface GroundingSource {
  uri: string;
  title: string;
}

export interface AnalysisEntry {
  id: string;
  event: string;
  analysis: string;
  sources: GroundingSource[];
  feedbackLoopType: 'reinforcing' | 'balancing' | null;
}
