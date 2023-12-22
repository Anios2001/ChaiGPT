
var OpenAI= require('openai');
const openai= new OpenAI({
    apiKey: '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'
});
const background= `Dialogue: 200 Rs me 2.5 per kg ke hissab se Raju bhai se mal mangvaya 100 Rs ka discount bhi mila
What is the vendor_name, rate_per_kg, discount, weight and price of the good ?
Completion: {vendor_name: "Raju Bhai", rate_per_kg:2.5,price: 200, discount: 100, weight: 80}

Dialogue: 100Rs me 0.5 per kg ke hissab se Hamza Bhai se chai mangvayi hai 20 Rs ka discount lagaya
What is the vendor_name, rate_per_kg, discount, weight and price of the good ?
Completion: {vendor_name: "Hamza Bhai", rate_per_kg:0.5, price:100, discount:20, weight: 200}`;

async function getGeneration(user_prompt_text){
    var prompt_text= `Dialogue: ${user_prompt_text}
    What is the vendor_name, rate_per_kg, discount, weight and price of the good ?
    Completion:`;
    const completion = await openai.chat.completions.create({
        messages: [{ role: "system", content: background },
                   {role:"user", content:prompt_text}],
        model: "gpt-3.5-turbo",
      });
    return completion.choices[0].message.content;
}
getGeneration('Jay bhai se 300Rs mein 0.4 per kg ke hisab se mal mangvaya aur 20Rs ka discount bhi mila').then(response=>{
    console.log(response);
});