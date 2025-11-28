import httpx
from fastapi import HTTPException

GOOGLE_BOOKS_URL = "https://www.googleapis.com/books/v1/volumes"

async def search_books(query: str):
    params = {"q": query, "maxResults": 10, "printType": "books"}

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(GOOGLE_BOOKS_URL, params=params)

        if response.status_code != 200:
            raise HTTPException(status_code=500, detail="Erro ao consultar Google Books")

        data = response.json()

        results = []
        for item in data.get("items", []):
            info = item.get("volumeInfo", {})

            results.append({
                "title": info.get("title"),
                "authors": info.get("authors", []),
                "description": info.get("description"),
                "cover_url": info.get("imageLinks", {}).get("thumbnail"),
                "published_year": info.get("publishedDate"),
                "page_count": info.get("pageCount"),
            })

        return results

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
