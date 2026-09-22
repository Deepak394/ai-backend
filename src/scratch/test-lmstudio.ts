async function main() {
  const response = await fetch("http://localhost:1234/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "llama-3.2-3b-instruct", // match the exact name from the /v1/models response
      messages: [
        { role: "system", content: "You are a helpful assistant that explains things simply." },
        { role: "user", content: "What is JWT authentication? Explain in 2 sentences." },
      ],
      temperature: 0.3,
    }),
  });

  const data = await response.json();
  console.log(JSON.stringify(data, null, 2));
}

main();