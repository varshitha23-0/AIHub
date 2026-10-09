from fastapi import APIRouter

from schemas.tool_schema import ToolCreate

from services.tools_services import (
    get_all_tools,
    get_tool_by_id,
    create_tool,
    update_tool,
    delete_tool
)

router = APIRouter(
    prefix="/tools",
    tags=["Tools"]
)


@router.get("/")
def get_tools(
    search: str = None,
    category: str = None,
    page: int = 1,
    limit: int = 30
):

    return get_all_tools(
        search,
        category,
        page,
        limit
    )
@router.get("/{id}")
def get_tool(id: str):

    return get_tool_by_id(id)


@router.post("/")
def add_tool(tool: ToolCreate):

    return create_tool(
        tool.model_dump()
    )


@router.put("/{id}")
def edit_tool(
    id: str,
    tool: ToolCreate
):

    return update_tool(
        id,
        tool.model_dump()
    )


@router.delete("/{id}")
def remove_tool(id: str):

    return delete_tool(id)