import json
import os

import numpy as np
from flask import Flask, jsonify, request
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

app = Flask(__name__)

_data_path = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "..",
    "data",
    "artigos_diversa (2).json",
)

with open(_data_path, "r", encoding="utf-8") as f:
    articles: list[dict] = json.load(f)

_texts = [f"{a['titulo']} {a.get('texto', '')}" for a in articles]

vectorizer = TfidfVectorizer(
    max_features=10000,
    ngram_range=(1, 2),
    sublinear_tf=True,
)
tfidf_matrix = vectorizer.fit_transform(_texts)

print(f"[RAG] {len(articles)} artigos indexados.")


@app.route("/retrieve", methods=["POST"])
def retrieve():
    data = request.get_json(force=True)
    query: str = data.get("query", "").strip()
    top_k: int = int(data.get("top_k", 3))

    if not query:
        return jsonify({"results": []})

    query_vec = vectorizer.transform([query])
    similarities = cosine_similarity(query_vec, tfidf_matrix).flatten()
    top_indices = np.argsort(similarities)[::-1][:top_k]

    results = []
    for idx in top_indices:
        if similarities[idx] < 0.01:
            continue
        article = articles[idx]
        results.append(
            {
                "titulo": article["titulo"],
                "texto": article["texto"][:2000],
                "url": article.get("url", ""),
                "categoria": article.get("categoria", ""),
                "score": float(similarities[idx]),
            }
        )

    return jsonify({"results": results})


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "articles_count": len(articles)})


if __name__ == "__main__":
    port = int(os.environ.get("RAG_PORT", 8000))
    app.run(host="0.0.0.0", port=port, debug=False, threaded=True)
