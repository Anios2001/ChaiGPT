var OpenAI = require("openai");
var API_KEY_SERVICE = require("./secretManager.js");
const openai = new OpenAI({
  apiKey: await API_KEY_SERVICE.getKey(),
});
const background = `Dialogue: 200 Rs me 2.5 per kg ke hissab se Raju bhai se mal mangvaya 100 Rs ka discount bhi mila
What is the vendor_name, rate_per_kg, discount, weight and price of the good ?
Completion: {"vendor_name": "Raju Bhai", "rate_per_kg":2.5,"price": 200, "discount": 100, "weight": 80}

Dialogue: 100Rs me 0.5 per kg ke hissab se Hamza Bhai se chai mangvayi hai 20 Rs ka discount lagaya
What is the vendor_name, rate_per_kg, discount, weight and price of the good ?
Completion: {"vendor_name": "Hamza Bhai", "rate_per_kg":0.5, "price":100, "discount":20, "weight": 200}`;

async function getGeneration(user_prompt_text) {
  var prompt_text = `${background}\n
    Dialogue: ${user_prompt_text}\n
    What is the vendor_name, rate_per_kg, discount, weight and price of the good ?
    Completion:`;
  const completion = await openai.chat.completions.create({
    messages: [{ role: "user", content: prompt_text }],
    model: "gpt-3.5-turbo",
  });
  console.log(completion.choices[0].message.content);
  return completion.choices[0].message.content;
}
function getGenerationDummy() {
  return `{"vendor_name":"Chry","rate_per_kg":1.66,"price":10,"discount":10,"weight":24}`;
}
module.exports = { getGeneration, getGenerationDummy };
