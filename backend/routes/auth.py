from fastapi import APIRouter

from services.auth_services import (
    register_user,
    login_user
)

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post("/register")
def register(user: dict):

    return register_user(user)


@router.post("/login")
def login(user: dict):

    return login_user(user)