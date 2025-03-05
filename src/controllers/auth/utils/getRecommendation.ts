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
    const prompt = `I am looking for a restaurant recommendation based on this description: "${description}". Please provide the following information in this exact format:
    **Restaurant Name:** [name of the restaurant]
    **Description:** [brief description of the restaurant]
    **URL:** [restaurant website or relevant link]
    Each section should be on a new line, and the description should be 20-30 words long.`;

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
    });

    const response = completion.choices[0].message.content?.trim();
    console.log(response);

    if (response) {
      // Use regex to extract the information with the exact format.
      const nameMatch = response.match(/\*\*Restaurant Name:\*\*\s*(.+)/);
      const descriptionMatch = response.match(/\*\*Description:\*\*\s*(.+)/);
      const urlMatch = response.match(/\*\*URL:\*\*\s*\[([^\]]+)\]/);

      const name = nameMatch ? nameMatch[1].trim() : '';
      const description = descriptionMatch ? descriptionMatch[1].trim() : '';
      const url = urlMatch ? urlMatch[1].trim() : undefined;

      return { name, description, url };
    }

    throw new Error(
      "Can't extract restaurant name, description, and URL properly",
    );
  } catch (error) {
    throw error;
  }
};
