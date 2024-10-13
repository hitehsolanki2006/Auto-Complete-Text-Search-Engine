from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

# Load words from the words.dic file
with open('words.dic', 'r') as f:
    words_list = [line.strip() for line in f.readlines()]

class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_end_of_word = False
        self.frequency = 0  # Track word usage frequency

class Trie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word):
        node = self.root
        for char in word:
            if char not in node.children:
                node.children[char] = TrieNode()
            node = node.children[char]
        node.is_end_of_word = True
        node.frequency += 1  # Increment frequency count

    def search_prefix(self, prefix):
        node = self.root
        for char in prefix:
            if char not in node.children:
                return None
            node = node.children[char]
        return node

    def dfs(self, node, prefix, results):
        if node.is_end_of_word:
            results.append((prefix, node.frequency))
        for char, child_node in node.children.items():
            self.dfs(child_node, prefix + char, results)

    def autocomplete(self, prefix):
        results = []
        node = self.search_prefix(prefix)
        if node:
            self.dfs(node, prefix, results)
        results.sort(key=lambda x: -x[1])  # Sort by frequency
        return [word for word, freq in results][:10]  # Return top 10 results

# Initialize the Trie and insert words
trie = Trie()
for word in words_list:
    trie.insert(word)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/autocomplete', methods=['GET'])
def autocomplete():
    query = request.args.get('query', '')
    suggestions = trie.autocomplete(query)[:10]  # Return top 10 results
    return jsonify(suggestions)

@app.route('/update_frequency', methods=['POST'])
def update_frequency():
    word = request.json['word']
    trie.insert(word)  # This will increment the frequency of the selected word
    return jsonify({"message": "Frequency updated"}), 200

if __name__ == '__main__':
    app.run(debug=True)
    