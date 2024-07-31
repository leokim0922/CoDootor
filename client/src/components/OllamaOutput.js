import React from 'react';

// Ollama output section for UI, this should retrieve generated Ollama output of each question
const OllamaOutput = () => {
  return (
    <div className="ollama-output">
      <h3>Ollama Output</h3>
        <pre>{"Ollama output will be displayed here"}</pre>
    </div>
  );
};

export default OllamaOutput;
