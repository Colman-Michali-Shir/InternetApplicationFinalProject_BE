import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Ask ChatGPT for a restaurant rating (strictly 1-5)
 */
export const getRestaurantRating = async (
  restaurantName: string,
  description?: string,
): Promise<number> => {
  try {
    const prompt = `Based on your knowledge, what is the estimated Google customer rating for "${restaurantName}"?
Only respond with a single number 1-5 and nothing else.`;
    const messages: { role: 'system' | 'user'; content: string }[] = [
      {
        role: 'system',
        content: 'You are a helpful restaurant review assistant.',
      },
      { role: 'user', content: prompt },
    ];

    // Only add description if it exists and is a non-empty string
    if (
      description &&
      typeof description === 'string' &&
      description.trim() !== ''
    ) {
      messages.push({ role: 'user', content: description });
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages,
    });

    // Extract the response and ensure it's a number
    const ratingText = completion.choices[0].message.content?.trim();
    console.log(ratingText);
    const rating = parseInt(ratingText || '1');
    // Ensure the rating is within the expected range
    if (rating < 1 || rating > 5) {
      throw new Error('Invalid rating received from ChatGPT');
    }

    return rating;
  } catch (error) {
    throw error;
  }
};
