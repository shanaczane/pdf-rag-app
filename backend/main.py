from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from supabase import create_client
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_groq import ChatGroq
from langchain_community.document_loaders import PyPDFLoader
from pydantic import BaseModel
import tempfile
import os


# Load your .env file
load_dotenv()

# Create your FastAPI app
app = FastAPI()

# Allow your Next.js frontend to talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Connect to Supabase
supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")
)

# Connect to GROQ API
llm = ChatGroq(
    api_key=os.getenv("GROQ_API_KEY"),
    model="llama-3.3-70b-versatile"
)

class AskRequest(BaseModel):
    question: str
    document_id: str

# Test route 
@app.get("/")
def read_root():
    return {"message": "PDF RAG API is running!"}

# Upload PDF Route
@app.post("/upload-pdf")
async def upload_pdf(file: UploadFile = File(...)):

    # Step 1: Save the uploaded PDF temporarily on the server
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        contents = await file.read()
        tmp.write(contents)
        tmp_path = tmp.name

    # Step 2: Read and extract text from the pdf
    loader = PyPDFLoader(tmp_path)
    pages = loader.load()

    # Step 3: Split the text into chunks
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50
    )
    chunks = splitter.split_documents(pages)

    # Step 4: Save info to Supabase
    doc_response = supabase.schema("project1").table("documents").insert({
        "name": file.filename,
        "file_url": tmp_path
    }).execute()

    document_id = doc_response.data[0]["id"]

    # Step 5: Save all chunks in one bulk insert instead of one call per chunk
    supabase.schema("project1").table("document_chunks").insert([
        {"document_id": document_id, "content": chunk.page_content}
        for chunk in chunks
    ]).execute()

    # Cleanup temp file
    os.unlink(tmp_path)

    return {
        "message": "PDF uploaded successfully",
        "document_id": document_id,
        "chunks_created": len(chunks)
    }

# Ask Route
@app.post("/ask")
async def ask(request: AskRequest):

    # Step 1: Fetch only 5 chunks from Supabase — limit at the database level
    response = supabase.schema("project1").table("document_chunks").select("content").eq("document_id", request.document_id).limit(5).execute()

    # Step 2: Combine all chunks into one block of context
    chunks = response.data
    context= "\n\n".join([chunk["content"] for chunk in chunks])

    # Step 3: Send question and context to Groq
    prompt = f""" You are a helpful assistant. Use the context below to answer the question

Context:
{context}

Question:
{request.question}

Answer:"""
    
    answer=llm.invoke(prompt)

    # Step 4: Returning the answer
    return {
        "answer":  answer.content
    }