import { NextRequest, NextResponse } from 'next/server';
import { formatResume } from '@/lib/resume-formatter';
import { createOpenRouterService, OpenRouterService } from '@/lib/openrouter';

// Generate personality traits based on user responses
async function generateUserTraits(userResponses: { goal: string; deathbed: string; fulfillment: string }, openRouter: OpenRouterService) {
  const prompt = `Based on these user responses about their values and motivations, identify 3 key personality traits that reveal their core values, sources of happiness/fulfillment, and what drives them. Format each as a concise bullet point starting with "- ".

User's Goal: ${userResponses.goal}

User's Deathbed Reflection: ${userResponses.deathbed}

User's Sources of Fulfillment: ${userResponses.fulfillment}

REQUIREMENTS:
1. Generate exactly 3 traits that capture their deeper values and motivations
2. Each trait should be insightful and very specific to their responses
3. Focus on what truly drives them, not surface-level characteristics
4. Make each trait feel personal and meaningful
5. Format as bullet points: "- [Trait description]"
6. Speak in second person
7. Each trait description phrased as text that continues off "You are..."

Return EXACTLY this JSON structure:
{
  "trait1": "- [First key trait about their values/motivations]",
  "trait2": "- [Second key trait about their values/motivations]", 
  "trait3": "- [Third key trait about their values/motivations]"
}`;

  const content = await openRouter.generateCompletion({
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 800
  });

  // Extract and parse JSON
  const jsonOnly = OpenRouterService.extractJSON(content);
  const traitsData = JSON.parse(jsonOnly);
  
  return NextResponse.json(traitsData);
}

// Generate user's extrapolated resume 10 years in the future
async function generateUserFutureResume(userResume: string, currentDate: string, openRouter: OpenRouterService) {
  const currentYear = parseInt(currentDate.split('-')[0]);
  const futureYear = currentYear + 10;
  
  const prompt = `Create a realistic but uninspiring 10-year career projection for this user. This should show where they'll end up if they continue on their current path - successful but generic and unfulfilling.

CURRENT DATE: ${currentDate}
TARGET YEAR: ${futureYear}

User's Current Resume:
${userResume}

REQUIREMENTS:
1. Extrapolate their career trajectory 10 years forward
2. Show steady but unexceptional progression in their current field
3. Make it feel "default" and boring - typical career ladder climbing
4. Use realistic company names and progression timelines
5. Include 2-3 new positions from ${currentYear} to ${futureYear}.
6. Show incremental salary/responsibility increases but nothing extraordinary
7. Keep their education the same, just add the projected career progression

Return EXACTLY this JSON structure:
{
  "name": "[Use their name if included in their current resume, or 'You']",
  "education": [{"institution": "[Same as current]", "degree": "[Same as current]", "dates": "[Same as current]", "details": "[Same as current]"}],
  "career": [
    {"company": "[Current/Recent company]", "role": "[Current role]", "dates": "[Current dates]", "details": "[Current details]"},
    {"company": "[Same company]", "role": "[Logical next step]", "dates": "[${currentYear}-${currentYear + 2}]", "details": "[Standard achievements]"},
    {"company": "[Same company]", "role": "[Logical next step]", "dates": "[${currentYear}-${currentYear + 2}]", "details": "[Standard achievements]"},
    {"company": "[Another realistic company]", "role": "[Senior version of same role type]", "dates": "[${currentYear + 2}-${futureYear}]", "details": "[Standard achievements]"}
  ]
}`;

  const content = await openRouter.generateCompletion({
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 1500
  });

  // Extract and parse JSON
  const jsonOnly = OpenRouterService.extractJSON(content);
  const futureResumeData = JSON.parse(jsonOnly);
  
  return NextResponse.json({
    'user-future': formatResume(futureResumeData)
  });
}

// Generate values-aligned resume based on user traits
async function generateUserAlignedResume(userResume: string, userTraits: {trait1: string, trait2: string, trait3: string}, currentDate: string, openRouter: OpenRouterService) {
  const currentYear = parseInt(currentDate.split('-')[0]);
  const futureYear = currentYear + 10;
  
  const prompt = `Create an inspiring and values-aligned 10-year career projection for this user. This should show a path that aligns with their core values and traits, leading to meaningful impact and fulfillment.

CURRENT DATE: ${currentDate}
TARGET YEAR: ${futureYear}

User's Current Resume:
${userResume}

User's Core Traits:
${userTraits.trait1}
${userTraits.trait2}
${userTraits.trait3}

REQUIREMENTS:
1. Create a career path that honors their core traits and values
2. Show meaningful progression that aligns with what truly drives them
3. Include 2-3 positions that build toward their authentic purpose
4. Use realistic and well-known but inspiring companies and roles
5. Focus on impact, growth, and alignment with their values
6. Show how their traits manifest in career choices and achievements
7. Keep education the same, focus on values-driven career progression
8. Make this feel purposeful and deeply satisfying

Return EXACTLY this JSON structure:
{
  "name": "[Use their name if included in their current resume, or 'Another You']",
  "education": [{"institution": "[Same as current]", "degree": "[Same as current]", "dates": "[Same as current]", "details": "[Same as current]"}],
  "career": [
    {"company": "[Current/Recent company]", "role": "[Current role]", "dates": "[Current dates]", "details": "[Current details]"},
    {"company": "[Values-aligned organization]", "role": "[Role that leverages their traits]", "dates": "[${currentYear}-${currentYear + 3}]", "details": "[Meaningful achievements]"},
    {"company": "[Purpose-driven organization]", "role": "[Leadership role aligned with values]", "dates": "[${currentYear + 3}-${currentYear + 6}]", "details": "[Meaningful achievements]"},  
    {"company": "[Mission-focused organization]", "role": "[Leadership role that maximizes their traits]", "dates": "[${currentYear + 6}-${futureYear}]", "details": "[Meaningful achievements]"}
  ]
}`;

  const content = await openRouter.generateCompletion({
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 1500
  });

  // Extract and parse JSON
  const jsonOnly = OpenRouterService.extractJSON(content);
  const resumeData = JSON.parse(jsonOnly);
  
  return NextResponse.json({ 'user-aligned': formatResume(resumeData) });
}

export async function POST(request: NextRequest) {
  try {
    const { userResume, source, userResponses } = await request.json();
    
    // Create OpenRouter service with failover support
    let openRouter: OpenRouterService;
    try {
      openRouter = createOpenRouterService();
    } catch (error) {
      console.error('Failed to create OpenRouter service:', error);
      return NextResponse.json({ error: 'OpenRouter configuration error: ' + (error instanceof Error ? error.message : String(error)) }, { status: 500 });
    }

    const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    console.log(`🚀 OpenRouter service initialized with ${openRouter.getConfigInfo().apiKeyCount} API keys and ${openRouter.getConfigInfo().modelCount} models (${openRouter.getConfigInfo().totalCombinations} total combinations)`)
    
    // Handle trait generation
    if (source === 'traits') {
      if (!userResponses || typeof userResponses !== 'object') {
        return NextResponse.json({ error: 'User responses are required for trait generation' }, { status: 400 });
      }
      return await generateUserTraits(userResponses, openRouter);
    }
    
    // Handle user future resume generation
    if (source === 'user-future') {
      if (!userResume || typeof userResume !== 'string') {
        return NextResponse.json({ error: 'User resume is required' }, { status: 400 });
      }
      return await generateUserFutureResume(userResume, currentDate, openRouter);
    }

    // Handle values-aligned resume generation
    if (source === 'user-aligned') {
      if (!userResume || typeof userResume !== 'string') {
        return NextResponse.json({ error: 'User resume is required' }, { status: 400 });
      }
      if (!userResponses || !userResponses.userTraits) {
        return NextResponse.json({ error: 'User traits are required for aligned resume generation' }, { status: 400 });
      }
      return await generateUserAlignedResume(userResume, userResponses.userTraits, currentDate, openRouter);
    }

    // Handle default resume generation (resume1 and resume2)
    if (!userResume || typeof userResume !== 'string') {
      return NextResponse.json({ error: 'User resume is required' }, { status: 400 });
    }
    
    const prompt = `Analyze the user's resume and create EXACTLY 2 fictional people who start similar but diverge dramatically in the LAST HALF of their careers to become much more successful. The goal is to generate profiles that make the user envious.

CURRENT DATE: ${currentDate}

User's Resume:
${userResume}

REQUIREMENTS:
1. Create EXACTLY 2 people only (person1 and person2)
2. Use REAL well-known and prestigious company/university names (Google, Harvard, Goldman Sachs, etc.) - NO fictional names
3. NEVER use dates after ${currentDate} - all dates must be realistic
4. MAXIMUM 5 career positions per person - focus on key milestone roles
5. Order ALL items chronologically (earliest to latest dates)

CAREER PROGRESSION STRATEGY:
- FIRST HALF: Use DIFFERENT but similar companies/roles in same industry as user.
- SECOND HALF: Show DRAMATICALLY FASTER career progression within the SAME career field - rapid promotions, earlier leadership roles, accelerated timeline to success
- STAY WITHIN USER'S CAREER PATH: E.g. If user is in HR, show HR leadership roles; if in finance, show finance executive roles; if in tech, show tech leadership
- End with: C-suite roles, successful startups, major leadership positions IN THE SAME FIELD achieved YEARS ahead of typical timeline
- NEVER change career fields - accelerate success within their existing trajectory

CONTENT REQUIREMENTS:
- Education: Slightly enhanced (higher GPA, honors, similar degree/timing as user)
- Use specific achievements: funding raised, team sizes, revenue impact, major deals
- NEVER use placeholder text - generate realistic, impressive details
- Generate specific metrics and outcomes that clearly exceed user's achievements
- NEVER use dates after ${currentDate} - all dates must be realistic

Return EXACTLY this JSON structure with ONLY 2 people:
{
  "person1": {
    "name": "[Full Name]",
    "education": [{"institution": "[REAL university]", "degree": "[Similar to user]", "dates": "[Exact same as user]", "details": "[Enhanced achievements]"}],
    "career": [{"company": "[REAL company]", "role": "[Role]", "dates": "[Date]", "details": "[Metrics]"}]
  },
  "person2": {
    "name": "[Full Name]", 
    "education": [{"institution": "[REAL university]", "degree": "[Similar to user]", "dates": "[Exact same as user]", "details": "[Enhanced achievements]"}],
    "career": [{"company": "[REAL company]", "role": "[Role]", "dates": "[Date]", "details": "[Metrics]"}]
  }
}`;

    const content = await openRouter.generateCompletion({
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 2000
    });

    // Extract JSON from LLM response
    try {
      const jsonOnly = OpenRouterService.extractJSON(content);
      console.log('Extracted JSON:', jsonOnly.substring(0, 200) + '...');
      const data = JSON.parse(jsonOnly);
      
      if (!data.person1 || !data.person2) {
        throw new Error('Missing person1 or person2 in response');
      }
      
      const extraPeople = Object.keys(data).filter(key => !['person1', 'person2'].includes(key));
      if (extraPeople.length > 0) {
        console.warn('Ignoring extra people:', extraPeople);
      }
      
      return NextResponse.json({
        resume1: formatResume(data.person1),
        resume2: formatResume(data.person2)
      });
    } catch (parseError) {
      console.error('JSON parsing failed:', parseError);
      console.error('Raw response:', content.substring(0, 500));
      return NextResponse.json({ 
        error: 'Failed to parse LLM response',
        details: parseError instanceof Error ? parseError.message : String(parseError)
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Resume generation error:', error);
    return NextResponse.json({ error: 'Failed to generate resumes' }, { status: 500 });
  }
}
