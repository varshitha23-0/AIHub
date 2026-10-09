from bson import ObjectId
from datetime import datetime

from database import tools_collection


def serialize_tool(tool):

    return {
        "_id": str(tool["_id"]),

        "tool_name": tool.get("tool_name"),
        # compatibility aliases for frontend
        "name": tool.get("tool_name"),
        "company": tool.get("company"),

        "category": tool.get("category"),

        "description": tool.get("description"),

        "website": tool.get("website"),

        "logo": tool.get("logo"),

        "keywords": tool.get("keywords", []),
        "tags": tool.get("keywords", []),
        "pricing": tool.get("pricing"),

        "primary_task": tool.get("primary_task"),

        "country": tool.get("country"),

        "industry": tool.get("industry"),

        "year_founded": tool.get("year_founded"),

        "release_year": tool.get("release_year"),

        "open_source": tool.get("open_source", False),

        "api_available": tool.get("api_available", False),

        "stars": tool.get("stars", 0),

        "featured": tool.get("featured", False),

        "created_at": tool.get("created_at"),

        "updated_at": tool.get("updated_at")
    }

def get_all_tools(
    search=None,
    category=None,
    page=1,
    limit=30
):

    query = {}

    if search:
        query["$or"] = [
            {
                "tool_name": {
                    "$regex": search,
                    "$options": "i"
                }
            },
            {
                "description": {
                    "$regex": search,
                    "$options": "i"
                }
            }
        ]

    if category:
        query["category"] = category


    skip = (page - 1) * limit


    tools = list(
        tools_collection
        .find(query)
        .sort("tool_name", 1)
        .skip(skip)
        .limit(limit)
    )


    total_count = tools_collection.count_documents(query)


    return {

        "page": page,

        "limit": limit,

        "total_count": total_count,

        "total_pages": (
            total_count + limit - 1
        ) // limit,

        "data": [
            serialize_tool(tool)
            for tool in tools
        ]

    }

def get_tool_by_id(id):

    tool = tools_collection.find_one(
        {
            "_id": ObjectId(id)
        }
    )

    if not tool:

        return {
            "message": "Tool not found"
        }

    return serialize_tool(tool)


def create_tool(tool):

    tool["created_at"] = datetime.utcnow()
    tool["updated_at"] = datetime.utcnow()

    result = tools_collection.insert_one(tool)

    return {
        "message": "Tool added successfully",
        "tool_id": str(result.inserted_id)
    }


def update_tool(id, tool):

    tool["updated_at"] = datetime.utcnow()

    tools_collection.update_one(
        {
            "_id": ObjectId(id)
        },
        {
            "$set": tool
        }
    )

    return {
        "message": "Tool updated successfully"
    }


def delete_tool(id):

    tools_collection.delete_one(
        {
            "_id": ObjectId(id)
        }
    )

    return {
        "message": "Tool deleted successfully"
    }