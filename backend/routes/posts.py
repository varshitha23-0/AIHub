from fastapi import APIRouter
from services.posts_services import (
    get_all_posts,
    create_new_post,
    get_post_by_id,
    update_existing_post,
    delete_existing_post
)

router = APIRouter(
    prefix="/posts",
    tags=["Posts"]
)


@router.get("/")
def get_posts():
    return get_all_posts()


@router.get("/{id}")
def get_post(id: str):
    return get_post_by_id(id)


@router.post("/")
def create_post(post: dict):
    return create_new_post(post)


@router.put("/{id}")
def update_post(id: str, post: dict):
    return update_existing_post(id, post)


@router.delete("/{id}")
def delete_post(id: str):
    return delete_existing_post(id)