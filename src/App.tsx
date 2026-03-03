import { useState, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import FeedbackLoop from '@/components/FeedbackLoop';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { SYSTEM_PROMPT } from '@/constants';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error('GEMINI_API_KEY is not set');
}

const ai = new GoogleGenAI({ apiKey });

import { AnalysisEntry, GroundingSource } from '@/types';
import { EXAMPLE_ANALYSES } from '@/data/examples';

function App() {
  const [event, setEvent] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [sources, setSources] = useState<GroundingSource[]>([]);
  const [history, setHistory] = useState<AnalysisEntry[]>(() => {
    try {
      const storedHistory = localStorage.getItem('analysisHistory');
      if (storedHistory) {
        return JSON.parse(storedHistory);
      }
      return EXAMPLE_ANALYSES;
    } catch (error) {
      console.error("Failed to load history from localStorage", error);
      return EXAMPLE_ANALYSES;
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [analysisMode, setAnalysisMode] = useState('quick');
  const [context, setContext] = useState('');
  const [feedbackLoopType, setFeedbackLoopType] = useState<'reinforcing' | 'balancing' | null>(null);
  const [backendStatus, setBackendStatus] = useState('checking...');

  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => setBackendStatus(data.status))
      .catch(() => setBackendStatus('error'));
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('analysisHistory', JSON.stringify(history));
    } catch (error) {
      console.error("Failed to save history to localStorage", error);
    }
  }, [history]);

  const handleSelectHistory = (entry: AnalysisEntry) => {
    setEvent(entry.event);
    setAnalysis(entry.analysis);
    setSources(entry.sources);
    setFeedbackLoopType(entry.feedbackLoopType);
  };

  const handleAnalyze = async () => {
    if (!event) return;
    setLoading(true);
    setError('');
    setAnalysis('');
    setSources([]);
    setFeedbackLoopType(null);

    try {
      const model = analysisMode === 'quick' ? 'gemini-3-flash-preview' : 'gemini-3-pro-preview';
      const config: any = {
        systemInstruction: SYSTEM_PROMPT,
      };

      const fullPrompt = context ? `${event}\n\nAdditional Context:\n${context}` : event;
      const isUrl = context.startsWith('http://') || context.startsWith('https://');

      if (analysisMode === 'quick') {
        config.tools = [{ googleSearch: {} }];
        if (isUrl) {
          config.tools.push({ urlContext: {} });
        }
      } else { // Deep analysis
        config.thinkingConfig = { thinkingBudget: 32768 };
        if (isUrl) {
          config.tools = [{ urlContext: {} }];
        }
      }

      const response = await ai.models.generateContent({
        model,
        contents: fullPrompt,
        config,
      });

      if (response.text) {
        setAnalysis(response.text);

        // Parse feedback loop
        const loopMatch = response.text.match(/\*\*Feedback Loop:\*\*\s*(Reinforcing|Balancing)/i);
        if (loopMatch && loopMatch[1]) {
          setFeedbackLoopType(loopMatch[1].toLowerCase() as 'reinforcing' | 'balancing');
        }

      } else {
        setError('Failed to get a valid response from the AI.');
      }

      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      const finalSources = groundingChunks
        ? groundingChunks.map((chunk: any) => chunk.web).filter(Boolean)
        : [];

      setSources(finalSources);

      // Save to history
      if (response.text) {
        const loopMatch = response.text.match(/\*\*Feedback Loop:\*\*\s*(Reinforcing|Balancing)/i);
        let parsedLoopType: 'reinforcing' | 'balancing' | null = null;
        if (loopMatch && loopMatch[1]) {
          parsedLoopType = loopMatch[1].toLowerCase() as 'reinforcing' | 'balancing';
        }

        const newEntry: AnalysisEntry = {
          id: new Date().toISOString(),
          event,
          analysis: response.text,
          sources: finalSources,
          feedbackLoopType: parsedLoopType,
        };
        setHistory([newEntry, ...history]);
      }

    } catch (err) {
      console.error(err);
      setError('An error occurred while analyzing the event.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <div className="container mx-auto flex max-w-3xl flex-col p-4 pt-12">
        <header className="mb-8">
          <h1 className="text-4xl font-bold tracking-tighter text-gray-900">
            Strategic Forecaster
          </h1>
          <div className="flex items-center gap-4">
            <p className="text-lg text-gray-600">
            Analyze news events for non-obvious second and third-order effects.
          </p>
          <div className="flex items-center gap-2">
              <span className={`h-3 w-3 rounded-full ${backendStatus === 'ok' ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span className="text-sm text-gray-500">Backend: {backendStatus}</span>
            </div>
          </div>
        </header>

        <main>
          <div className="flex flex-col gap-4">
            <Textarea
              value={event}
              onChange={(e) => setEvent(e.target.value)}
              placeholder="Enter a news event, policy change, or technological breakthrough..."
              className="min-h-[120px] rounded-lg border-gray-300 p-4 text-base shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              disabled={loading}
            />
            <Input
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Optional: Paste a URL or additional text context..."
              className="rounded-lg border-gray-300 p-4 text-base shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              disabled={loading}
            />
            <div className="flex items-center justify-between">
              <RadioGroup defaultValue="quick" onValueChange={setAnalysisMode} className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="quick" id="r1" />
                  <Label htmlFor="r1">Quick Analysis</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="deep" id="r2" />
                  <Label htmlFor="r2">Deep Analysis</Label>
                </div>
              </RadioGroup>
              <Button onClick={handleAnalyze} disabled={loading} className="self-start">
                {loading ? (
                  <div className="flex items-center">
                    <svg
                      className="mr-2 h-5 w-5 animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Analyzing...
                  </div>
                ) : (
                  'Analyze Event'
                )}
              </Button>
            </div>
          </div>

          {error && <p className="mt-4 text-red-500">{error}</p>}

          {analysis && (
            <div className="prose prose-lg mt-8 max-w-none rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <ReactMarkdown>{analysis}</ReactMarkdown>
              <FeedbackLoop type={feedbackLoopType} />
              {sources.length > 0 && (
                <div className="mt-6 border-t pt-4">
                  <h3 className="text-sm font-semibold text-gray-600">Sources:</h3>
                  <ul className="text-sm">
                    {sources.map((source, index) => (
                      <li key={index}>
                        <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                          {source.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {history.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold tracking-tight text-gray-800">Analysis History</h2>
              <div className="mt-4 space-y-4">
                {history.map((entry) => (
                  <button
                    key={entry.id}
                    onClick={() => handleSelectHistory(entry)}
                    className="block w-full rounded-lg border border-gray-200 bg-white p-4 text-left shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    <p className="truncate font-medium text-gray-800">{entry.event}</p>
                    <p className="mt-1 truncate text-sm text-gray-500">Analyzed on {new Date(entry.id).toLocaleString()}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
