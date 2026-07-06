import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// POST /api/flows/ai-generate - generate workflow from natural language
export async function POST(request: Request) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('account_id')
    .eq('user_id', user.id)
    .single();

  if (!profile?.account_id) {
    return NextResponse.json({ error: 'No account found' }, { status: 403 });
  }

  const body = await request.json();
  const { prompt, model } = body;

  if (!prompt) {
    return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
  }

  try {
    // For demo purposes, we'll generate a basic workflow structure
    // In production, this would call an LLM to generate the full workflow
    const generatedFlow = generateWorkflowFromPrompt(prompt);

    // Log the generation
    await supabase.from('ai_workflow_generations').insert({
      account_id: profile.account_id,
      user_id: user.id,
      prompt: prompt,
      generated_flow: generatedFlow,
      model_used: model || 'claude-sonnet-4-6',
      success: true,
    });

    return NextResponse.json({ flow: generatedFlow });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Generation failed';

    // Log failed generation
    await supabase.from('ai_workflow_generations').insert({
      account_id: profile.account_id,
      user_id: user.id,
      prompt: prompt,
      generated_flow: {},
      model_used: model || 'claude-sonnet-4-6',
      success: false,
      error_message: errorMessage,
    });

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// Simple workflow generator based on keywords in prompt
function generateWorkflowFromPrompt(prompt: string): Record<string, unknown> {
  const lowerPrompt = prompt.toLowerCase();

  // Determine trigger type
  let triggerType = 'manual';
  let triggerConfig: Record<string, unknown> = {};

  if (lowerPrompt.includes('keyword') || lowerPrompt.includes('when someone types')) {
    triggerType = 'keyword';
    const keywords = extractKeywords(prompt);
    triggerConfig = { keywords };
  } else if (lowerPrompt.includes('first message') || lowerPrompt.includes('new contact')) {
    triggerType = 'first_inbound_message';
  } else if (lowerPrompt.includes('schedule') || lowerPrompt.includes('daily') || lowerPrompt.includes('reminder')) {
    triggerType = 'scheduled';
    triggerConfig = { cron: '0 9 * * *' }; // Daily at 9am
  }

  // Build nodes based on prompt content
  const nodes: Record<string, unknown>[] = [
    { node_key: 'start', node_type: 'start', config: {} }
  ];

  // Check for common patterns
  if (lowerPrompt.includes('qualify') || lowerPrompt.includes('lead')) {
    nodes.push(
      { node_key: 'q1', node_type: 'collect_input', config: { question: 'What service are you interested in?', save_to_var: 'service' } },
      { node_key: 'q2', node_type: 'collect_input', config: { question: 'What is your budget?', save_to_var: 'budget' } },
      { node_key: 'condition', node_type: 'condition', config: { subject: 'var:budget', operator: 'contains', value: '500' } },
      { node_key: 'hot', node_type: 'set_tag', config: { tag_name: 'Hot Lead' } },
      { node_key: 'warm', node_type: 'set_tag', config: { tag_name: 'Warm Lead' } }
    );
  }

  if (lowerPrompt.includes('welcome') || lowerPrompt.includes('onboarding')) {
    nodes.push(
      { node_key: 'welcome', node_type: 'send_message', config: { body: 'Welcome! How can we help you today?' } },
      { node_key: 'collect', node_type: 'collect_input', config: { question: 'Please share your details.', save_to_var: 'info' } }
    );
  }

  if (lowerPrompt.includes('support') || lowerPrompt.includes('help')) {
    nodes.push(
      { node_key: 'menu', node_type: 'send_buttons', config: { header: 'How can we help?', buttons: [{ id: 'billing', label: 'Billing' }, { id: 'tech', label: 'Technical' }, { id: 'other', label: 'Other' }] } },
      { node_key: 'route', node_type: 'handoff', config: { note: 'Support request' } }
    );
  }

  // Always add end node
  nodes.push(
    { node_key: 'end', node_type: 'end', config: {} }
  );

  // Build edges
  const edges = buildEdges(nodes);

  return {
    name: extractNameFromPrompt(prompt),
    description: prompt.substring(0, 100),
    trigger_type: triggerType,
    trigger_config: triggerConfig,
    nodes: nodes,
    edges: edges,
  };
}

function extractKeywords(prompt: string): string[] {
  // Extract words after "keyword" or in quotes
  const keywordMatch = prompt.match(/keyword[s]?:?\s*([^\.]+)/i);
  if (keywordMatch) {
    return keywordMatch[1].split(/[,;]/).map(k => k.trim()).filter(Boolean);
  }

  const quoteMatch = prompt.match(/"([^"]+)"/g);
  if (quoteMatch) {
    return quoteMatch.map(q => q.replace(/"/g, ''));
  }

  return ['help'];
}

function extractNameFromPrompt(prompt: string): string {
  const words = prompt.split(' ').slice(0, 4);
  return words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') + ' Flow';
}

function buildEdges(nodes: Record<string, unknown>[]): Record<string, unknown>[] {
  const edges: Record<string, unknown>[] = [];
  let prevKey: string | null = null;

  for (const node of nodes) {
    const key = node.node_key as string;
    if (!key) continue;

    if (prevKey) {
      edges.push({
        id: `e_${prevKey}_${key}`,
        source: prevKey,
        target: key,
      });
    }
    prevKey = key;
  }

  return edges;
}