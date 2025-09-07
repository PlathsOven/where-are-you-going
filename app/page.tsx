'use client';

import { useState, useEffect, useCallback } from 'react';
import ChatFrame from '@/components/ChatFrame';
import ChatFeed from '@/components/ChatFeed';
import ChatInput from '@/components/ChatInput';
import AudioPlayer from '@/components/AudioPlayer';
import ArtworkLabel from '@/components/ArtworkLabel';
import { loadScript, Script, Step, Message } from '@/lib/script';

export default function Home() {
  const [script, setScript] = useState<Script | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [cursor, setCursor] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [draft, setDraft] = useState('');
  const [placeholder, setPlaceholder] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userResume, setUserResume] = useState<string>('');
  const [generatedResumes, setGeneratedResumes] = useState<{resume1?: string, resume2?: string, 'user-future'?: string, 'user-aligned'?: string}>({});
  const [userResponses, setUserResponses] = useState<{goal?: string, deathbed?: string, fulfillment?: string}>({});
  const [generatedTraits, setGeneratedTraits] = useState<{trait1?: string, trait2?: string, trait3?: string}>({});
  const [isGeneratingTraits, setIsGeneratingTraits] = useState(false);
  const [isGeneratingFuture, setIsGeneratingFuture] = useState(false);
  const [isGeneratingAligned, setIsGeneratingAligned] = useState(false);
  const [traitGenerationAttempted, setTraitGenerationAttempted] = useState(false);
  const [alignedGenerationAttempted, setAlignedGenerationAttempted] = useState(false);
  const [showArtworkLabel, setShowArtworkLabel] = useState(false);

  // Load script on mount
  useEffect(() => {
    loadScript('/scripts/demo.json')
      .then((scriptData) => {
        setScript(scriptData);
        const firstUserStep = scriptData.steps.find(step => step.speaker === 'user');
        setPlaceholder(firstUserStep?.text || '');
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load script');
        setIsLoading(false);
      });
  }, []);

  // Get current step
  const currentStep = script && cursor < script.steps.length ? script.steps[cursor] : null;

  // Generate resumes using LLM
  const generateResumes = useCallback(async (resume: string, source?: string) => {
    try {
      const response = await fetch('/api/generate-resumes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userResume: resume, source })
      });
      
      if (response.ok) {
        const data = await response.json();
        setGeneratedResumes(prev => ({ ...prev, ...data }));
      }
    } catch (error) {
      console.error('Failed to generate resumes:', error);
    }
  }, []);

  // Generate user's extrapolated resume 10 years in the future
  const generateUserFutureResume = useCallback(async () => {
    if (!userResume || isGeneratingFuture) return;
    
    setIsGeneratingFuture(true);
    
    try {
      const response = await fetch('/api/generate-resumes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userResume, source: 'user-future' })
      });
      
      if (response.ok) {
        const data = await response.json();
        setGeneratedResumes(prev => ({ ...prev, ...data }));
      } else {
        console.error('Future resume generation failed with status:', response.status);
        // Set fallback content to prevent infinite retry
        setGeneratedResumes(prev => ({ 
          ...prev, 
          'user-future': 'Your future path continues to develop, building on your current foundation with steady growth and new opportunities.' 
        }));
      }
    } catch (error) {
      console.error('Failed to generate user future resume:', error);
      // Set fallback content to prevent infinite retry
      setGeneratedResumes(prev => ({ 
        ...prev, 
        'user-future': 'Your future path continues to develop, building on your current foundation with steady growth and new opportunities.' 
      }));
    } finally {
      setIsGeneratingFuture(false);
    }
  }, [userResume, isGeneratingFuture]);

  // Generate values-aligned resume based on user traits
  const generateUserAlignedResume = useCallback(async () => {
    if (!userResume || !generatedTraits.trait1 || !generatedTraits.trait2 || !generatedTraits.trait3 || isGeneratingAligned || alignedGenerationAttempted) return;
    
    setIsGeneratingAligned(true);
    setAlignedGenerationAttempted(true);
    
    try {
      const response = await fetch('/api/generate-resumes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userResume,
          source: 'user-aligned',
          userResponses: {
            userTraits: generatedTraits
          }
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setGeneratedResumes(prev => ({ ...prev, ...data }));
      } else {
        console.error('Aligned resume generation failed with status:', response.status);
        // Set fallback content to prevent infinite retry
        setGeneratedResumes(prev => ({ 
          ...prev, 
          'user-aligned': 'Your values-aligned future path focuses on meaningful impact, authentic growth, and work that truly fulfills your deepest motivations and aspirations.' 
        }));
      }
    } catch (error) {
      console.error('Failed to generate user aligned resume:', error);
      // Set fallback content to prevent infinite retry
      setGeneratedResumes(prev => ({ 
        ...prev, 
        'user-aligned': 'Your values-aligned future path focuses on meaningful impact, authentic growth, and work that truly fulfills your deepest motivations and aspirations.' 
      }));
    } finally {
      setIsGeneratingAligned(false);
    }
  }, [userResume, generatedTraits, isGeneratingAligned, alignedGenerationAttempted]);

  // Generate user traits based on their responses
  const generateUserTraits = useCallback(async () => {
    if (!userResponses.goal || !userResponses.deathbed || !userResponses.fulfillment) return;
    if (isGeneratingTraits || traitGenerationAttempted) return; // Prevent duplicate requests
    
    setIsGeneratingTraits(true);
    setTraitGenerationAttempted(true);
    
    try {
      const response = await fetch('/api/generate-resumes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          source: 'traits',
          userResponses: {
            goal: userResponses.goal,
            deathbed: userResponses.deathbed,
            fulfillment: userResponses.fulfillment
          }
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setGeneratedTraits(data);
      } else {
        console.error('Trait generation failed with status:', response.status);
        // Set fallback traits to prevent infinite retry
        setGeneratedTraits({
          trait1: "- Driven by meaningful impact and purpose",
          trait2: "- Values authentic connection and growth", 
          trait3: "- Seeks balance between achievement and fulfillment"
        });
      }
    } catch (error) {
      console.error('Failed to generate user traits:', error);
      // Set fallback traits to prevent infinite retry
      setGeneratedTraits({
        trait1: "- Driven by meaningful impact and purpose",
        trait2: "- Values authentic connection and growth", 
        trait3: "- Seeks balance between achievement and fulfillment"
      });
    } finally {
      setIsGeneratingTraits(false);
    }
  }, [userResponses, isGeneratingTraits, traitGenerationAttempted]);

  // Autoplay logic
  useEffect(() => {
    if (!script || !currentStep || !isPlaying) return;

    if (currentStep.speaker === 'bot') {
      // Check if this step has dynamic content that needs to be generated
      const hasResumeContent = currentStep.dynamicContent?.type === 'generated-resume';
      const hasTraitContent = currentStep.dynamicContent?.type === 'generated-trait';
      
      const needsResumeContent = hasResumeContent && !generatedResumes[currentStep.dynamicContent?.source as keyof typeof generatedResumes];
      const needsTraitContent = hasTraitContent && !generatedTraits[currentStep.dynamicContent?.source as keyof typeof generatedTraits];
      
      // If it needs dynamic content but isn't ready, generate it or wait and check again
      if (needsResumeContent) {
        // Check if this is a user-future resume that needs generation
        if (currentStep.dynamicContent?.source === 'user-future' && userResume && !generatedResumes['user-future'] && !isGeneratingFuture) {
          generateUserFutureResume();
        }
        
        // Check if this is a user-aligned resume that needs generation
        if (currentStep.dynamicContent?.source === 'user-aligned' && userResume && generatedTraits.trait1 && generatedTraits.trait2 && generatedTraits.trait3 && !generatedResumes['user-aligned'] && !isGeneratingAligned) {
          generateUserAlignedResume();
        }
        
        // Only retry if we're actively generating
        if (isGeneratingFuture || isGeneratingAligned || 
            (currentStep.dynamicContent?.source === 'user-future' && !generatedResumes['user-future']) ||
            (currentStep.dynamicContent?.source === 'user-aligned' && !generatedResumes['user-aligned'] && generatedTraits.trait1)) {
          const retryTimer = setTimeout(() => {
            // Trigger a re-render to check again
            setIsPlaying(false);
            setTimeout(() => setIsPlaying(true), 100);
          }, 1000); // Increased delay to reduce API pressure
          return () => clearTimeout(retryTimer);
        }
      }
      
      if (needsTraitContent) {
        // Check if we have all required responses and haven't generated traits yet
        if (userResponses.goal && userResponses.deathbed && userResponses.fulfillment && !generatedTraits[currentStep.dynamicContent?.source as keyof typeof generatedTraits] && !isGeneratingTraits) {
          generateUserTraits();
        }
        
        // Only retry if we're actively generating or haven't attempted yet
        if (isGeneratingTraits || (!traitGenerationAttempted && userResponses.goal && userResponses.deathbed && userResponses.fulfillment)) {
          const retryTimer = setTimeout(() => {
            // Trigger a re-render to check again
            setIsPlaying(false);
            setTimeout(() => setIsPlaying(true), 100);
          }, 500);
          return () => clearTimeout(retryTimer);
        }
      }
      
      // Wait for delay then add bot message to feed
      const delay = currentStep.delayMs ?? script.meta?.defaultDelayMs ?? 700;
      const timer = setTimeout(() => {
        let messageText = currentStep.text;
        
        // Handle dynamic content replacement
        if (currentStep.dynamicContent?.type === 'generated-resume' && currentStep.dynamicContent.source) {
          const dynamicText = generatedResumes[currentStep.dynamicContent.source as keyof typeof generatedResumes];
          if (dynamicText) {
            messageText = dynamicText;
          }
        } else if (currentStep.dynamicContent?.type === 'generated-trait' && currentStep.dynamicContent.source) {
          const dynamicText = generatedTraits[currentStep.dynamicContent.source as keyof typeof generatedTraits];
          if (dynamicText) {
            messageText = dynamicText;
          }
        }
        
        const newMessage: Message = {
          id: currentStep.id,
          role: 'bot',
          text: messageText,
          animationDuration: currentStep.animationDuration,
          displayType: currentStep.displayType,
          groupId: currentStep.groupId,
          videoFile: currentStep.videoFile
        };
        
        setMessages(prev => [...prev, newMessage]);
        setCursor(prev => prev + 1);
      }, delay);
      
      return () => clearTimeout(timer);
    } else if (currentStep.speaker === 'user') {
      // Pause autoplay and set placeholder (for regular text input steps)
      setIsPlaying(false);
      if (!(currentStep.speaker === 'user' && Array.isArray(currentStep.choices) && currentStep.choices.length > 0)) {
        setPlaceholder(currentStep.text);
      }
    }
  }, [script, currentStep, isPlaying, cursor, generatedResumes, generatedTraits, generateUserFutureResume, generateUserAlignedResume, generateUserTraits, userResume, userResponses]);

  // Handle user message submission
  const handleSubmit = useCallback(() => {
    if (!currentStep || currentStep.speaker !== 'user' || !draft.trim()) return;
    
    // Store resume if this is step 5 (resume input)
    if (currentStep.id === '5') {
      const resume = draft.trim();
      setUserResume(resume);
      generateResumes(resume);
    }
    
    // Store user responses for trait generation using configured step IDs
    const traitConfig = script?.meta?.traitGeneration?.contextSteps;
    if (traitConfig) {
      if (currentStep.id === traitConfig.goal) {
        setUserResponses(prev => ({ ...prev, goal: draft.trim() }));
      } else if (currentStep.id === traitConfig.deathbed) {
        setUserResponses(prev => ({ ...prev, deathbed: draft.trim() }));
      } else if (currentStep.id === traitConfig.fulfillment) {
        setUserResponses(prev => ({ ...prev, fulfillment: draft.trim() }));
      }
    }
    
    // Add user message
    const userMessage: Message = {
      id: `user-${currentStep.id}`,
      role: 'user',
      text: draft.trim()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setDraft('');
    setCursor(prev => prev + 1);
    setIsPlaying(true);
  }, [currentStep, draft, generateResumes]);

  // Handle choice selection
  const handleChoice = useCallback((choice: string, index: number) => {
    if (!currentStep || !(currentStep.speaker === 'user' && Array.isArray(currentStep.choices) && currentStep.choices.length > 0)) return;
    
    // Add user choice as message
    const userMessage: Message = {
      id: `user-${currentStep.id}`,
      role: 'user',
      text: choice
    };
    
    setMessages(prev => [...prev, userMessage]);
    setCursor(prev => prev + 1);
    setIsPlaying(true);
  }, [currentStep]);

  // Handle restart
  const handleRestart = useCallback(() => {
    setMessages([]);
    setCursor(0);
    setIsPlaying(true);
    setDraft('');
    setUserResume('');
    setGeneratedResumes({});
    setUserResponses({});
    setGeneratedTraits({});
    setIsGeneratingTraits(false);
    setIsGeneratingFuture(false);
    setIsGeneratingAligned(false);
    setTraitGenerationAttempted(false);
    setAlignedGenerationAttempted(false);
    
    if (script) {
      const firstUserStep = script.steps.find(step => step.speaker === 'user');
      setPlaceholder(firstUserStep?.text || '');
    }
  }, [script]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white font-serif flex items-center justify-center">
        <p className="text-black/60 italic">Loading...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-white font-serif flex items-center justify-center">
        <div className="text-center">
          <p className="text-black/80 mb-4">Failed to load script</p>
          <p className="text-black/60 text-sm italic">{error}</p>
        </div>
      </div>
    );
  }

  // Determine if input should be disabled or if we should show replay
  const inputDisabled = !currentStep || currentStep.speaker === 'bot' || cursor >= (script?.steps.length || 0);
  const showReplay = currentStep?.showReplay || cursor >= (script?.steps.length || 0);

  return (
    <>
      <AudioPlayer />
      <ChatFrame>
        <ChatFeed messages={messages} script={script} />
        {showReplay ? (
          <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-black/5">
            <div className="max-w-2xl mx-auto px-6 md:px-8 py-4 text-center">
              <div className="flex gap-4 justify-center">
                <button
                  onClick={handleRestart}
                  className="px-8 py-4 bg-black text-white rounded-lg font-serif text-lg hover:bg-black/80 transition-all duration-200 shadow-lg"
                  aria-label="Replay art piece"
                >
                  Replay
                </button>
                <button
                  onClick={() => setShowArtworkLabel(true)}
                  className="px-8 py-4 bg-white text-black border border-black/20 rounded-lg font-serif text-lg hover:bg-black/5 transition-all duration-200 shadow-lg"
                  aria-label="Show artwork label"
                >
                  Artwork Label
                </button>
              </div>
            </div>
          </div>
        ) : (
          <ChatInput
            value={draft}
            onChange={setDraft}
            onSubmit={handleSubmit}
            placeholder={placeholder}
            disabled={inputDisabled}
            choices={currentStep && currentStep.speaker === 'user' && Array.isArray(currentStep.choices) && currentStep.choices.length > 0 ? currentStep.choices : undefined}
            onChoice={handleChoice}
          />
        )}
      </ChatFrame>
      <ArtworkLabel 
        isVisible={showArtworkLabel} 
        onClose={() => setShowArtworkLabel(false)} 
      />
    </>
  );
}
