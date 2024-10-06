from flask import Flask, request, jsonify
from flask_cors import CORS
import wikipedia
import numexpr as ne
import nltk
import speech_recognition as sr
nltk.download('punkt')

app = Flask(__name__)
CORS(app)

# Define a function to generate a greeting response
responses = [
    "I'm doing great, thanks for asking. How can I assist you today?",
    "I'm feeling good, thanks. What's on your mind?",
    "I'm here to help. What do you need assistance with?",
    "I'm doing well, thanks. How about you?",
    "I'm ready to help. What's your question?"
]
def save_response(response):
    with open("chat_log.txt", "a") as file:
        file.write(response + "\n")
def generate_greeting(input_text):
    greetings = ["hello", "hi", "hey", "how are you", "what's up"]
    for greeting in greetings:
        if greeting.lower() in input_text.lower():
            return f"Hello! I'm doing great, thanks for asking. How can I assist you today?"
    return None

# Define a custom response for the query "computation"
def get_custom_response(input_text):
    custom_queries = {
        "computation": "Computation refers to the process of using computers or machines to perform mathematical calculations, data processing, and other tasks that involve information processing and transformation.\n Referred Faculty- Alisha Bhatt\n mail@sample.com",
        "Prime minister india": "Narendra damodardas modi"  
    }
    for query, response in custom_queries.items():
        if query.lower() in input_text.lower():
            return response
    return None


@app.route('/process_input', methods=['POST'])
def process_input():
    try:
        data = request.get_json()
        input_text = data['input_text']

        # Check if the input is a greeting
        greeting_response = generate_greeting(input_text)
        if greeting_response:
            response = greeting_response
        else:
            # Check if the input matches a custom query
            custom_response = get_custom_response(input_text)
            if custom_response:
                response = custom_response
            else:
                # Check if the input is a mathematical expression
                try:
                    result = ne.evaluate(input_text)
                    response = f"The result of the calculation is: {result}"
                except Exception:
                    # If not a mathematical expression, try Wikipedia search
                    wiki_search = wikipedia.search(input_text, results=1)
                    if wiki_search:
                        wiki_page = wikipedia.page(wiki_search[0])
                        # Shorten the Wikipedia summary to 100 characters
                        response = wiki_page.summary[:1000] + "..." #further enhanchable
                    else:
                        response = f"No result found for {input_text}"

        # If speech recognition is enabled, try to recognize the speech
        if 'speech_recognition' in data:
            r = sr.Recognizer()
            with sr.Microphone() as source:
                audio = r.record(source)
                try:
                    speech_text = r.recognize_google(audio, language='en-US')
                    wiki_search = wikipedia.search(speech_text, results=1)
                    if wiki_search:
                        wiki_page = wikipedia.page(wiki_search[0])
                        # Shorten the Wikipedia summary to 100 characters
                        response = wiki_page.summary[:100] + "..."
                    else:
                        response = f"No result found for {speech_text}"
                except sr.UnknownValueError:
                    response = "Sorry, I didn't understand what you said."
                except sr.RequestError:
                    response = "Sorry, there was an error with the speech recognition service."

        return jsonify({'response': response}), 200, {'Access-Control-Allow-Origin': '*'}
    except Exception as e:
        return jsonify({'error': str(e)}), 400, {'Access-Control-Allow-Origin': '*'}

if __name__ == '__main__':
    app.run(debug=True)