let recognition;  // Declare recognition outside for toggle logic
let isRecognizing = false;

document.getElementById("voiceInputBtn").addEventListener("click", function() {
    if (!recognition) {
        recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.lang = "en-US";
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onresult = function(event) {
            const input = document.getElementById("autoCompleteInput");
            input.value = event.results[0][0].transcript;
            input.dispatchEvent(new Event('input'));  // Trigger input event for auto-complete
        };

        recognition.onerror = function(event) {
            alert("Voice input failed: " + event.error);
        };
    }

    if (!isRecognizing) {
        recognition.start();
        isRecognizing = true;
        document.getElementById("voiceInputBtn").innerHTML = '<i class="fas fa-microphone-slash"></i> Stop Voice Input';
    } else {
        recognition.stop();
        isRecognizing = false;
        document.getElementById("voiceInputBtn").innerHTML = '<i class="fas fa-microphone"></i> Voice Input';
    }
});

document.getElementById("toggleThemeBtn").addEventListener("click", function() {
    const body = document.body;
    body.classList.toggle("light-theme");
});

document.getElementById("autoCompleteInput").addEventListener("input", function() {
    const query = this.value.toLowerCase();
    if (query.length === 0) {
        document.getElementById("suggestions").innerHTML = "";
        return;
    }
    fetchSuggestions(query);
});

function fetchSuggestions(query) {
    fetch(`/autocomplete?query=${encodeURIComponent(query)}`)
        .then(response => response.json())
        .then(suggestions => {
            const suggestionList = document.getElementById("suggestions");
            suggestionList.innerHTML = "";

            suggestions.forEach(word => {
                const li = document.createElement("li");
                const highlightedText = `<strong>${query}</strong>${word.slice(query.length)}`;
                li.innerHTML = highlightedText;
                li.classList.add("list-group-item");
                suggestionList.appendChild(li);
            });
        })
        .catch(error => console.error('Error fetching suggestions:', error));
}

document.getElementById("suggestions").addEventListener("click", function(e) {
    if (e.target.tagName === 'LI') {
        const selectedWord = e.target.textContent;
        document.getElementById("autoCompleteInput").value = selectedWord;

        // Send POST request to update word frequency
        fetch('/update_frequency', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ word: selectedWord })
        });
    }
});

document.getElementById("clearBtn").addEventListener("click", function() {
    document.getElementById("autoCompleteInput").value = "";
    document.getElementById("suggestions").innerHTML = "";
});
