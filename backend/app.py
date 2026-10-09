from contextlib import asynccontextmanager
from threading import Thread

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from apscheduler.schedulers.background import BackgroundScheduler

from routes.auth import router as auth_router
from routes.posts import router as posts_router
from routes.comments import router as comments_router
from routes.tools import router as tools_router
from routes.news import router as news_router

from pipeline.run_pipeline import run_pipeline
from pipeline.pipeline_showcase import router as pipeline_showcase_router

# ---------------- Scheduler ---------------- #

scheduler = BackgroundScheduler()


@asynccontextmanager
async def lifespan(app: FastAPI):

    print("Starting Scheduler...")

    # Run pipeline once in the background
    Thread(
        target=run_pipeline,
        daemon=True
    ).start()

    # Schedule pipeline every 2 hours
    scheduler.add_job(
        func=run_pipeline,
        trigger="interval",
        hours=2,
        id="news_pipeline",
        replace_existing=True
    )

    scheduler.start()

    yield

    print("Stopping Scheduler...")

    scheduler.shutdown()


app = FastAPI(
    title="AI Hub API",
    description="AI News, Tools and Community Platform",
    version="1.0.0",
    lifespan=lifespan
)


# ---------------- CORS ---------------- #

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------- Routes ---------------- #

app.include_router(auth_router)
app.include_router(posts_router)
app.include_router(comments_router)
app.include_router(tools_router)
app.include_router(news_router)
app.include_router(pipeline_showcase_router)

# ---------------- Home ---------------- #

@app.get("/")
def home():

    return {
        "message": "AI Hub Backend Running Successfully"
    }