# run these commands before using the file locally 
# 8GB + 32GB of configuration is minimal config to run this file 
# pip install --upgrade pip
# pip install --disable-pip-version-check \ torch==2.13.1 \ torchdata==0.5.1 --queit
# pip install \ transformers==4.27.2 \ datasets==2.11.1
# pip install -U datasets --> run this for caching support
from transformers import AutoModelForSeq2SeqLM
from transformers import GenerationConfig
from transformers import AutoTokenizer
from datasets import load_dataset
# the libraries would take some time to import 
# once done you can use the hugging face models, datasets in your own projects
# we want a dialogsumdataset to summarise natural language conversation
hugging_face_dataset_name= "knkarthick/dialogsum"
# the string literal above is from hugging_face.com
# load the above dataset
dataset = load_dataset(hugging_face_dataset_name)
# will take some time depending on the connection speed
# once it is donloaded the caching would kick in and you would not require to load it again and again
# we would use google's flan-t5 model for our niche purpose
model_name = "google/flan-t5-base"
# from hugging face site
model= AutoModelForSeq2SeqLM.from_pretrained(model_name)
# download the model size is 990 MB  
tokenizer= AutoTokenizer.from_pretrained(model_name)
# download the model's tokenizer --> "I"== tokenizer == [12]
def getGeneration(promtText):
    # let's indicate the expected output for some examples 
    summary=f''' {{vendor_name: "Raju Bhai", rate_per_kg:2.5,price: 200, discount: 100, weight: 80}}'''
    summary2= f'''{{vendor_name: "Hamza Bhai", rate_per_kg:0.5, price:100, discount:20, weight: 200}}'''
    # test summary output 
    summary3= f'''{{vendor_name: "Jay Bhai", rate_per_kg:0.5, price:400, discount:12,weight: 800}}'''
    prompt= f"""
    Extract the data: 

    Dialogue: 200 Rs me 2.5 per kg ke hissab se Raju bhai se mal mangvaya 100 Rs ka discount bhi mila
    What is the vendor_name, rate_per_kg, discount, weight and price of the good ?
    Completion: {summary}

    Dialogue: 100Rs me 0.5 per kg ke hissab se Hamza Bhai se chai mangvayi hai 20 Rs ka discount lagaya
    What is the vendor_name, rate_per_kg, discount, weight and price of the good ?
    Completion: {summary2}

    Dialogue: {promtText}
    What is the vendor_name, rate_per_kg, discount, weight and price of the good ?
        """
    inputs = tokenizer(prompt, return_tensors='pt')
    # returns tensor representation of the prompt
    # below max_new_tokens is the limit on the tokens to generate 
    outputs= tokenizer.decode(
        model.generate(inputs['input_ids'],
                    max_new_tokens=50)[0],
                    skip_special_tokens=true,
    )
    return outputs
# local_runnable_command
# text = input("Enter your prompt:")
# print(getGeneration(text))


