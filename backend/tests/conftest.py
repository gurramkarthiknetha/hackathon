"""
Test configuration for FastAPI backend
"""

import pytest
import asyncio
from httpx import AsyncClient
from app.main import app

@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.fixture
async def client():
    """Create test client"""
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac

@pytest.fixture
def sample_image_data():
    """Sample image data for testing"""
    # Create a simple test image
    import numpy as np
    import cv2
    
    # Create a simple 100x100 test image
    img = np.zeros((100, 100, 3), dtype=np.uint8)
    cv2.rectangle(img, (20, 20), (80, 80), (255, 255, 255), -1)
    
    # Encode as JPEG
    _, buffer = cv2.imencode('.jpg', img)
    return buffer.tobytes()
