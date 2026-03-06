// Chatbot Configuration
// Instant Response

export const CHATBOT_CONFIG = {
  HF_TOKEN: 'hf_REDACTED',
  ENABLED: true,
  BOT_NAME: 'LearnFlow Assistant',
  WELCOME_MESSAGE: "Hello! I'm your LearnFlow assistant. How can I help you today?",
};

export const callChatbotAPISimple = async (message) => {
  console.log("Question:", message);
  
  // Instant FAQ responses
  const msg = message.toLowerCase();
  
  if (msg.includes('html')) return "HTML is the standard language for creating web pages!";
  if (msg.includes('css')) return "CSS styles web pages with colors, fonts, layouts!";
  if (msg.includes('javascript') || msg.includes(' js')) return "JavaScript makes websites interactive!";
  if (msg.includes('python')) return "Python is a beginner-friendly programming language for web, AI, data science!";
  if (msg.includes('java')) return "Java is used for web apps, Android development, enterprise software!";
  if (msg.includes('react')) return "React is a JavaScript library for building user interfaces!";
  if (msg.includes('django')) return "Django is a Python web framework!";
  if (msg.includes('flask')) return "Flask is a lightweight Python web framework!";
  if (msg.includes('.net')) return ".NET is a Microsoft framework for building applications!";
  if (msg.includes('php')) return "PHP is a server-side scripting language for web development!";
  if (msg.includes('ai')) return "AI (Artificial Intelligence) enables machines to mimic human intelligence!";
  if (msg.includes('ml')) return "Machine Learning is AI where computers learn from data!";
  if (msg.includes('function')) return "A function is a reusable block of code that performs a specific task!";
  if (msg.includes('variable')) return "A variable stores data values like numbers, text, true/false!";
  if (msg.includes('loop')) return "A loop repeats code multiple times - for loop and while loop!";
  if (msg.includes('array')) return "An array stores multiple values in a single variable!";
  if (msg.includes('stack')) return "Stack is a LIFO (Last In First Out) data structure!";
  if (msg.includes('queue')) return "Queue is a FIFO (First In First Out) data structure!";
  if (msg.includes('dsa')) return "DSA (Data Structures & Algorithms) teaches efficient data organization!";
  if (msg.includes('datatype')) return "Datatype defines what type of data a variable can hold - string, number, boolean!";
  if (msg.includes('program') || msg.includes('coding')) return "Programming is giving instructions to a computer to perform tasks!";
  if (msg.includes('course') || msg.includes('learn')) return "We offer: Python, Java, JavaScript, HTML, CSS, Django, Flask - all free!";
  if (msg.includes('freedom') || msg.includes('independent')) return "India got independence on August 15, 1947!";
  if (msg.includes('hey') || msg.includes('hi') || msg.includes('hello')) return "Hello! How can I help you today?";
  if (msg.includes('thank')) return "You're welcome! Happy to help!";
  
  // Try AI for unknown questions - quick timeout
  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/google/flan-t5-small",
      {
        method: "POST",
        headers: {
          "Authorization": "Bearer hf_REDACTED",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inputs: `Q: ${message} A:`,
          parameters: { max_new_tokens: 50 }
        }),
        signal: AbortSignal.timeout(5000)
      }
    );

    if (response.ok) {
      const data = await response.json();
      if (data && data[0] && data[0].generated_text) {
        return data[0].generated_text.trim();
      }
    }
  } catch (e) {
    console.log("AI timeout");
  }

  return "Hello! Ask me about HTML, CSS, JavaScript, Python, Java, React, Django, Flask, or our free courses!";
};
