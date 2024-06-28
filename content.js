(async () => {
  const canCreate = await window.ai.canCreateTextSession();

  if (canCreate !== "no") {
    const session = await window.ai.createTextSession();

    // Function to correct text and measure latency
    async function correctText(input) {
      const prompt = `remove grammatical errors and spelling errors, if everything is correct, retunr the same: "${input}". Provide only the corrected text without any additional formatting.`;
      const startTime = performance.now();
      const result = await session.prompt(prompt);
      const endTime = performance.now();
      const latency = endTime - startTime;
      displayLatency(latency);

      if (result && result.trim().length > 0) {
        // Extract the corrected text
        const correctedText = result.replace(/.*Corrected Text:/i, '').trim();
        return correctedText;
      } else {
        return input; // Return original input if the result is not valid
      }
    }

    // Debounce function to limit the rate at which the model is queried
    function debounce(func, delay) {
      let timeoutId;
      return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          func.apply(null, args);
        }, delay);
      };
    }

    // Function to display model latency
    function displayLatency(latency) {
      let latencyDiv = document.getElementById('latency-display');
      if (!latencyDiv) {
        latencyDiv = document.createElement('div');
        latencyDiv.id = 'latency-display';
        latencyDiv.style.position = 'fixed';
        latencyDiv.style.bottom = '10px';
        latencyDiv.style.right = '10px';
        latencyDiv.style.padding = '5px 10px';
        latencyDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        latencyDiv.style.color = 'white';
        latencyDiv.style.fontSize = '14px';
        latencyDiv.style.borderRadius = '5px';
        document.body.appendChild(latencyDiv);
      }
      latencyDiv.innerText = `Model Latency: ${latency.toFixed(2)} ms`;
    }

    // Function to handle input events with context tracking
    const handleInput = debounce(async (event) => {
      if (event.target.tagName === 'TEXTAREA' || event.target.tagName === 'INPUT') {
        const inputText = event.target.value;
        const correctedText = await correctText(inputText);
        if (event.target.value !== correctedText) {
          event.target.value = correctedText;
          // Move cursor to the end
          event.target.selectionStart = event.target.selectionEnd = correctedText.length;
        }
      }
    }, 1000); // Adjust delay as needed (1000ms in this case)

    // Add event listener for text input fields
    document.addEventListener('input', handleInput);

  } else {
    console.log("Gemini Nano model is not available.");
  }
})();