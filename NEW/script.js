const sendBtn = document.getElementById('send-btn');
const speechRecognitionButton = document.getElementById('sr-btn');
const chatLogList = document.getElementById('chat-log-list');
const ttsbtn = document.getElementById('tts-btn');



const inputText = document.getElementById('input-text');

// document.getElementById('tts-btn').addEventListener('click', speakText());

// function speakText() {
//     const inputText = document.getElementById('input-text');
//     const text = inputText.value;
//     const speech = new SpeechSynthesisUtterance(text);
//     speech.lang = 'en-US';
//     speech.volume = 10;
//     speech.rate = 1;
//     speech.pitch = 1;
//     window.speechSynthesis.speak(speech);
// }
// Function to save response to a text file
function saveResponse(response) {
    
    fetch('http://127.0.0.1:5000/save_response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response: response })
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
    })
    .catch(error => {
        console.error(error);
    });
}


sendBtn.addEventListener('click', () => {
    const userInput = inputText.value;
    inputText.value = '';

    const chatLogListItem = document.createElement('LI');
    chatLogListItem.textContent = `You: ${userInput}`;
    chatLogList.appendChild(chatLogListItem);

    fetch('http://127.0.0.1:5000/process_input', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input_text: userInput })
    })
    .then(response => response.json())
    .then(data => {
        const chatLogListItemResponse = document.createElement('LI');
        chatLogListItemResponse.textContent = `LUNA: ${data.response}`;
        chatLogList.appendChild(chatLogListItemResponse);
        saveResponse(data.response); // Call the saveResponse function here
    })
    .catch(error => {
        const chatLogListItemError = document.createElement('LI');
        chatLogListItemError.textContent = ` Error - ${error.message}`;
        chatLogList.appendChild(chatLogListItemError);
    });
});

speechRecognitionButton.addEventListener('click', () => {
  // Create a new speech recognition object
  const recognition = new webkitSpeechRecognition();
  recognition.lang = 'en-US';
  recognition.maxResults = 10;
  recognition.interimResults = false;

  try {
    // Start the speech recognition process
    recognition.start();
  } catch (error) {
    console.error('Error starting speech recognition:', error);
  }

  // Listen for speech recognition events
  recognition.onresult = event => {
    console.log('Speech recognition result:', event);
    for (const result of event.results) {
      const text = result[0].transcript;
      if (result.isFinal) {
        console.log(`You said: ${text}`);
        const chatLogItem = document.createElement('li');
        chatLogItem.textContent = `User: ${text}`;
        chatLogList.appendChild(chatLogItem);

        fetch('http://127.0.0.1:5000/process_input', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ input_text: text })
        })
        .then(response => response.json())
        .then(data => {
          const responseLogItem = document.createElement('li');
          responseLogItem.textContent = `LUNA: ${data.response}`;
          chatLogList.appendChild(responseLogItem);
          saveResponse(data.response); // Call the saveResponse function here
        })
        .catch(error => {
          console.error(error);
        });
      }
    }
  };

  recognition.onerror = event => {
    console.error(`Error occurred: ${event.error}`);
  };

  recognition.onstart = () => {
    console.log('Speech recognition started');
  };

  recognition.onend = () => {
    console.log('Speech recognition ended');
  };

  recognition.onaudiostart = () => {
    console.log('Audio started');
  };

  recognition.onaudioend = () => {
    console.log('Audio ended');
  };

  recognition.onsoundstart = () => {
    console.log('Sound started');
  };

  recognition.onsoundend = () => {
    console.log('Sound ended');
  };

  recognition.onspeechstart = () => {
    console.log('Speech started');
  };

  recognition.onspeechend = () => {
    console.log('Speech ended');
  };
});