from bson import ObjectId
from datetime import datetime

from database import comments_collection


def serialize_comment(comment):

    return {
        "_id": str(comment["_id"]),
        "post_id": comment.get("post_id"),
        "user_id": comment.get("user_id"),
        "username": comment.get("username"),
        "content": comment.get("content"),
        "created_at": comment.get("created_at"),
        "updated_at": comment.get("updated_at")
    }


def get_all_comments(post_id=None):

    query = {}

    if post_id:
        query["post_id"] = post_id

    comments = list(
        comments_collection.find(query)
        .sort("created_at", -1)
    )

    return [
        serialize_comment(comment)
        for comment in comments
    ]


def get_comment_by_id(id):

    comment = comments_collection.find_one(
        {"_id": ObjectId(id)}
    )

    if not comment:
        return {
            "message": "Comment not found"
        }

    return serialize_comment(comment)


def create_comment(comment):

    document = {
        "post_id": comment.get("post_id"),
        "user_id": comment.get("user_id"),
        "username": comment.get("username"),
        "content": comment.get("content"),
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }

    result = comments_collection.insert_one(
        document
    )

    return {
        "message": "Comment added successfully",
        "comment_id": str(result.inserted_id)
    }


def update_comment(id, comment):

    update_data = {
        "content": comment.get("content"),
        "updated_at": datetime.utcnow()
    }

    comments_collection.update_one(
        {"_id": ObjectId(id)},
        {"$set": update_data}
    )

    return {
        "message": "Comment updated successfully"
    }


def delete_comment(id):

    comments_collection.delete_one(
        {"_id": ObjectId(id)}
    )

    return {
        "message": "Comment deleted successfully"
    }