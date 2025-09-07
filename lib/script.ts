export type Step = {
  id: string;
  speaker: "bot" | "user" | "system";
  text: string;
  delayMs?: number; // Optional per-step delay override
  animationDuration?: number; // Optional per-step animation duration (in seconds)
  choices?: string[]; // Optional array of choice labels for user steps
  displayType?: "normal" | "side-by-side" | "centered-box"; // How to display this step
  groupId?: string; // Groups steps with same groupId for side-by-side display
  videoFile?: string; // Optional video file name for [Show video] messages
  showReplay?: boolean; // Optional flag to show replay button instead of chat input
  dynamicContent?: {
    type: "generated-resume" | string; // Type of dynamic content
    source: string; // Source identifier for the content
  };
};

export type Script = {
  meta?: {
    title?: string;
    defaultDelayMs?: number;
    defaultAnimationDuration?: number; // Default animation duration in seconds
    traitGeneration?: {
      contextSteps: {
        goal: string;
        deathbed: string;
        fulfillment: string;
      };
    };
  };
  steps: Step[];
};

export async function loadScript(path = "/scripts/demo.json"): Promise<Script> {
  try {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Failed to load script: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Simple runtime validation
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid script format: expected object');
    }
    
    if (!Array.isArray(data.steps)) {
      throw new Error('Invalid script format: steps must be an array');
    }
    
    // Validate each step
    data.steps.forEach((step: any, index: number) => {
      if (!step.id || typeof step.id !== 'string') {
        throw new Error(`Invalid step ${index}: id must be a string`);
      }
      if (!step.speaker || !['bot', 'user', 'system'].includes(step.speaker)) {
        throw new Error(`Invalid step ${index}: speaker must be "bot", "user", or "system"`);
      }
      if (!step.text || typeof step.text !== 'string') {
        throw new Error(`Invalid step ${index}: text must be a string`);
      }
    });
    
    return data as Script;
  } catch (error) {
    console.error('Error loading script:', error);
    throw error;
  }
}


// Message extends Step but with runtime-specific role typing
export interface Message extends Omit<Step, 'speaker'> {
  role: 'bot' | 'user'; // Runtime equivalent of Step.speaker
}
