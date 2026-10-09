from fastapi import APIRouter

from services.comments_services import (
    get_all_comments,
    get_comment_by_id,
    create_comment,
    update_comment,
    delete_comment
)

router = APIRouter(
    prefix="/comments",
    tags=["Comments"]
)


@router.get("/")
def get_comments(post_id: str = None):
    return get_all_comments(post_id)


@router.get("/{id}")
def get_comment(id: str):
    return get_comment_by_id(id)


@router.post("/")
def add_comment(comment: dict):
    return create_comment(comment)


@router.put("/{id}")
def edit_comment(id: str, comment: dict):
    return update_comment(id, comment)


@router.delete("/{id}")
def remove_comment(id: str):
    return delete_comment(id)