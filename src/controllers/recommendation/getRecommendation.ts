import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Ask ChatGPT for a restaurant recommendation based on a description.
 * @param description The description of the type of restaurant you're looking for.
 * @returns An object containing the restaurant name, a brief description (20-30 words), and a URL.
 */
export const getRecommendationRestaurant = async (
  description: string,
): Promise<{ name: string; description: string; url?: string }> => {
  try {
    const prompt = `I am looking for a restaurant recommendation based on this description: "${description}". Please respond in JSON format with the following structure:
    {
      "name": "Restaurant Name",
      "description": "A brief description of the restaurant (20-30 words).",
      "url": "Restaurant website or relevant link (if available)"
    }`;

    const messages: { role: 'system' | 'user'; content: string }[] = [
      {
        role: 'system',
        content: 'You are a helpful restaurant recommendation assistant.',
      },
      { role: 'user', content: prompt },
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      response_format: { type: 'json_object' },
    });

    return completion.choices[0].message.content as unknown as {
      name: string;
      description: string;
      url?: string;
    };
  } catch (error) {
    throw error;
  }
};
