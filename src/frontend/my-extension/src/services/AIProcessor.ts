// @ts-nocheck
const processWithOpenAI = async (text: string): Promise<string> => {
  const response = await fetch('YOUR_OPENAI_ENDPOINT', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_OPENAI_API_KEY'
    },
    body: JSON.stringify({
      model: "gpt-4",
      messages: [{
        role: "user",
        content: `Convert this command to a browser action: ${text}`
      }],
      stream: true
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const reader = response.body?.getReader();
  let result = '';

  if (!reader) {
    throw new Error('Failed to get response reader');
  }

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    // Convert the chunk to text
    const chunk = new TextDecoder().decode(value);
    const lines = chunk.split('\n').filter(line => line.trim() !== '');
    
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') continue;
        
        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices[0]?.delta?.content;
          if (content) result += content;
        } catch (e) {
          console.error('Error parsing streaming response:', e);
        }
      }
    }
  }

  return result.trim();
};

export { processWithOpenAI }; 