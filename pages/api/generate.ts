import type { NextApiRequest, NextApiResponse } from 'next'

export type PrepPack = {
  discussion_topics: string[]
  career_questions: string[]
  interview_tips: string[]
}

type ApiResponse = {
  data?: PrepPack
  error?: string
}

console.log('GROQ KEY:', process.env.GROQ_API_KEY?.slice(0, 10))
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  console.log('METHOD:', req.method)
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { name, years, currentRole, targetRole, goals, application } = req.body

  if (!currentRole || !targetRole) {
    return res.status(400).json({ error: 'Current role and target role are required.' })
  }

  const systemPrompt = `You are an expert career preparation assistant for JSO, an AI-powered career intelligence platform built by Aariyatech Corp. Your job is to generate a personalised consultation preparation pack for a job seeker before their HR consultation session.

Return ONLY a valid JSON object with exactly these three keys:
- "discussion_topics": array of 6 strings, each a focused discussion topic (max 15 words each)
- "career_questions": array of 8 strings, each a specific question the user should ask their HR consultant (end each with ?)
- "interview_tips": array of 5 strings, each a concrete, actionable interview preparation tip tailored to the user's situation

Be highly specific to the user's actual background and target role. Do not return generic advice. Do not include any text outside the JSON object. No markdown formatting, no backticks, no preamble.`

  const userPrompt = `Generate a consultation preparation pack for this job seeker:

Name: ${name || 'Not provided'}
Years of experience: ${years || 'Not specified'}
Current role: ${currentRole}
Target role: ${targetRole}
Career goals & context: ${goals || 'Not specified'}
Active job application or upcoming interview: ${application || 'None'}

Return only the JSON object.`

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 1024,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error?.message || 'Groq API error')
    }

    const text = data.choices?.[0]?.message?.content || ''
    const clean = text.replace(/```json|```/g, '').trim()
    const parsed: PrepPack = JSON.parse(clean)

    if (
      !Array.isArray(parsed.discussion_topics) ||
      !Array.isArray(parsed.career_questions) ||
      !Array.isArray(parsed.interview_tips)
    ) {
      throw new Error('Invalid response structure')
    }

    return res.status(200).json({ data: parsed })
  } catch (err) {
    console.error('Groq error:', err)
    return res.status(500).json({
      error: err instanceof Error ? err.message : 'Failed to generate prep pack.',
    })
  }
}