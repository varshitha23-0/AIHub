from fastapi import APIRouter

from services.news_services import (
    get_all_news,
    get_news_by_id,
    create_news,
    update_news,
    delete_news
)

router = APIRouter(
    prefix="/news",
    tags=["News"]
)


@router.get("/")
def get_news(keyword: str = None):
    return get_all_news(keyword)


@router.get("/{id}")
def get_article(id: str):
    return get_news_by_id(id)


@router.post("/")
def add_article(article: dict):
    return create_news(article)


@router.put("/{id}")
def edit_article(id: str, article: dict):
    return update_news(id, article)


@router.delete("/{id}")
def remove_article(id: str):
    return delete_news(id)