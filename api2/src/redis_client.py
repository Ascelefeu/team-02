import redis.asyncio as aioredis
from dotenv import load_dotenv
import os

load_dotenv()

REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379")

redis_client: aioredis.Redis = aioredis.from_url(REDIS_URL, decode_responses=True)