import json
import os

from flask import Flask, jsonify, request
from sentence_transformers import SentenceTransformer, util
import torch

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

print("[RAG] Carregando o modelo de embeddings (all-MiniLM-L6-v2)...")
model = SentenceTransformer('all-MiniLM-L6-v2')

print("[RAG] Calculando embeddings para os artigos...")
document_embeddings = model.encode(_texts, convert_to_tensor=True)
print(f"[RAG] {len(articles)} artigos indexados via Busca Semantica.")

@app.route("/retrieve", methods=["POST"])
def retrieve():
    data = request.get_json(force=True)
    query: str = data.get("query", "").strip()
    top_k: int = int(data.get("top_k", 3))

    if not query:
        return jsonify({"results": []})

    query_embedding = model.encode(query, convert_to_tensor=True)
    
    # cos_sim retorna uma matriz [1, num_docs]
    cos_scores = util.cos_sim(query_embedding, document_embeddings)[0]
    
    top_results = torch.topk(cos_scores, k=min(top_k, len(articles)))

    results = []
    for score, idx in zip(top_results[0], top_results[1]):
        score_val = float(score)
        if score_val < 0.05:
            continue
        article = articles[int(idx)]
        results.append(
            {
                "titulo": article["titulo"],
                "texto": article["texto"][:2000],
                "url": article.get("url", ""),
                "categoria": article.get("categoria", ""),
                "score": score_val,
            }
        )

    return jsonify({"results": results})


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "articles_count": len(articles)})


if __name__ == "__main__":
    port = int(os.environ.get("RAG_PORT", 8000))
    app.run(host="0.0.0.0", port=port, debug=False, threaded=True)
