import requests

GOOGLE_BOOKS_URL = "https://www.googleapis.com/books/v1/volumes"

def search_google_books(query: str, max_results: int = 10):
    response = requests.get(GOOGLE_BOOKS_URL, params={
        "q": query,
        "maxResults": max_results
    })

    data = response.json()

    if "items" not in data:
        return []

    results = []

    for item in data["items"]:
        info = item.get("volumeInfo", {})
        images = info.get("imageLinks", {})

        # Pega a melhor imagem disponível
        cover = (
            images.get("large") or
            images.get("medium") or
            images.get("small") or
            images.get("thumbnail")
        )

        # Se for thumbnail com zoom baixo → melhora
        if cover and "zoom=1" in cover:
            cover = cover.replace("zoom=1", "zoom=3")

        # Se for "http" → troca para https (evita warnings)
        if cover and cover.startswith("http://"):
            cover = cover.replace("http://", "https://")

        results.append({
            "title": info.get("title"),
            "author": ", ".join(info.get("authors", [])) if info.get("authors") else None,
            "description": info.get("description"),
            "cover_url": cover,
            "published_year": info.get("publishedDate"),
            "page_count": info.get("pageCount"),
        })

    return results
