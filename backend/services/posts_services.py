from bson import ObjectId
from datetime import datetime

from database import posts_collection


def serialize_post(post):

    return {
        "_id": str(post["_id"]),
        "user_id": post.get("user_id"),
        # compatibility aliases for frontend
        "author": post.get("author") or post.get("user_id"),
        "likes": post.get("likes", 0),
        "comments": post.get("comments", []),
        "title": post.get("title"),
        "content": post.get("content"),
        "media": post.get("media", []),
        "created_at": post.get("created_at"),
        "updated_at": post.get("updated_at")
    }


def get_all_posts():

    posts = list(
        posts_collection.find()
        .sort("created_at", -1)
    )

    return [
        serialize_post(post)
        for post in posts
    ]


def create_new_post(post):

    document = {
        "user_id": post.get("user_id"),
        "title": post.get("title"),
        "content": post.get("content"),
        "media": post.get("media", []),
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }

    result = posts_collection.insert_one(document)
    # fetch the created document and return serialized post for frontend convenience
    created = posts_collection.find_one({"_id": result.inserted_id})

    return {
        "message": "Post created successfully",
        "post_id": str(result.inserted_id),
        "post": serialize_post(created) if created else None
    }


def update_existing_post(id, post):

    update_data = {
        "title": post.get("title"),
        "content": post.get("content"),
        "media": post.get("media", []),
        "updated_at": datetime.utcnow()
    }

    posts_collection.update_one(
        {"_id": ObjectId(id)},
        {"$set": update_data}
    )

    return {
        "message": "Post updated successfully"
    }


def delete_existing_post(id):

    posts_collection.delete_one(
        {"_id": ObjectId(id)}
    )

    return {
        "message": "Post deleted successfully"
    }


def get_post_by_id(id):

    post = posts_collection.find_one(
        {"_id": ObjectId(id)}
    )

    if not post:
        return {
            "message": "Post not found"
        }

    return serialize_post(post)