import os
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from file_processor import process_file
from ai_extractor import extract_data
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
from dotenv import load_dotenv
import certifi

load_dotenv(override=True) # Force override so Uvicorn reload picks up new passwords

app = FastAPI(title="AI Document Intelligence API")

# Setup CORS for the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For dev, allow all
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB Configuration
MONGO_URI = os.environ.get("MONGO_URI", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGO_URI, tlsCAFile=certifi.where())
db = client.ai_doc_intelligence
collection = db.documents

@app.get("/")
def read_root():
    return {"status": "Backend is running flawlessly. Enterprise mode active."}

@app.get("/api/documents")
@app.get("/documents")
async def get_documents():
    """Fetch all processed documents from the database."""
    docs = []
    # Fetch all documents, newest first
    cursor = collection.find().sort("created_at", -1)
    async for document in cursor:
        document["_id"] = str(document["_id"])  # Convert ObjectId to string
        docs.append(document)
    return docs

@app.post("/api/upload")
@app.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    document_type: str = Form("Auto-detect")
):
    try:
        # Read file bytes
        file_bytes = await file.read()
        
        # 1. Process the file (convert to image or text)
        try:
            processed_data = process_file(file_bytes, file.filename, file.content_type)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"File Processing Error: {str(e)}")

        # 2. Extract Data via AI
        try:
            extracted_json = extract_data(processed_data, document_type)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"AI Extraction Error: {str(e)}")

        # 3. Save to MongoDB
        document_record = {
            "filename": file.filename,
            "document_type_hint": document_type,
            "extracted_data": extracted_json,
            "created_at": datetime.utcnow().isoformat()
        }
        await collection.insert_one(document_record)
        document_record["_id"] = str(document_record["_id"]) # Make JSON serializable

        return {
            "status": "success",
            "filename": file.filename,
            "extracted_data": extracted_json,
            "record_id": document_record["_id"]
        }

    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
