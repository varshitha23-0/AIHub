from datetime import datetime
import bcrypt

from database import users_collection


def register_user(user):

    existing_user = users_collection.find_one(
        {
            "email": user["email"]
        }
    )

    if existing_user:
        return {
            "success": False,
            "message": "Email already exists"
        }

    hashed_password = bcrypt.hashpw(
        user["password"].encode("utf-8"),
        bcrypt.gensalt()
    ).decode("utf-8")

    document = {
        "username": user["username"],
        "email": user["email"],
        "password": hashed_password,
        "role": user.get("role", "user"),
        "created_at": datetime.utcnow()
    }

    users_collection.insert_one(document)

    return {
        "success": True,
        "message": "User registered successfully"
    }


def login_user(user):

    existing_user = users_collection.find_one(
        {
            "email": user["email"]
        }
    )

    if not existing_user:
        return {
            "success": False,
            "message": "User not found"
        }

    password_match = bcrypt.checkpw(
        user["password"].encode("utf-8"),
        existing_user["password"].encode("utf-8")
    )

    if not password_match:
        return {
            "success": False,
            "message": "Invalid password"
        }

    return {
        "success": True,
        "message": "Login successful",
        "user": {
            "id": str(existing_user["_id"]),
            "username": existing_user["username"],
            "email": existing_user["email"],
            "role": existing_user["role"]
        }
    }