#!/usr/bin/env python3
import os
import shutil
import tempfile
import time
from fastapi import Body, FastAPI, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from pypdf import PdfReader
from langchain_community.vectorstores import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_ollama import OllamaLLM
from langchain_core.prompts import PromptTemplate

app = FastAPI()

# Allow CORS for all origins (adjust later if needed)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Utility functions ---

def extract_text_from_pdf(pdf_path):
    reader = PdfReader(pdf_path)
    text = ""
    for page in reader.pages:
        if page_text := page.extract_text():
            text += page_text + "\n"
    return text


def clear_quiz_db():
    """Delete the Chroma folder safely even if it's locked."""
    db_path = "./quiz_db"
    if os.path.exists(db_path):
        for _ in range(5):
            try:
                shutil.rmtree(db_path, ignore_errors=False)
                return
            except PermissionError:
                time.sleep(0.5)
        # if still locked, just ignore errors (Windows issue)
        shutil.rmtree(db_path, ignore_errors=True)


def create_vectorstore(text):
    clear_quiz_db()

    splitter = RecursiveCharacterTextSplitter(chunk_size=800, chunk_overlap=200)
    texts = splitter.split_text(text)
    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

    vectorstore = Chroma.from_texts(
        texts,
        embedding=embeddings,
        persist_directory="./quiz_db"
    )
    return vectorstore


def make_quiz_system(vectorstore):
    llm = OllamaLLM(model="mistral")
    prompt = PromptTemplate(
        input_variables=["context", "topic"],
        template = """
You are a strict quiz generator AI.

Your task:
Generate EXACTLY 10 multiple-choice questions on the topic: {topic}

Each question MUST:
- Be on ONE line only.
- Follow EXACTLY this format (no extra text, numbering, or explanation):
<number>|<question>|A) <option>|B) <option>|C) <option>|D) <option>|<correct option letter>

Example of format:
1|Which language runs in a browser?|A) Python|B) Java|C) JavaScript|D) C#|C

Rules:
- Do NOT include any intro, explanation, or additional text.
- Do NOT add quotes, code blocks, or Markdown formatting.
- Use clear, concise English.
- Ensure each question has only one correct answer (A, B, C, or D).

Now generate 10 questions in the exact format above.
"""
    )

    def generate(topic_string):
        docs = vectorstore.similarity_search(topic_string, k=5)
        context_text = "\n\n".join([d.page_content for d in docs])
        filled_prompt = prompt.format(context=context_text, topic=topic_string)
        output = llm.generate([filled_prompt])
        return output.generations[0][0].text.strip()

    return generate


# --- Main route ---


@app.post("/update_txt")
async def update_txt(
    content: str = Body(..., embed=True),
    path: str = Body(..., embed=True)
):
 
    try:
        os.makedirs(os.path.dirname(path), exist_ok=True)

        with open(path, "w", encoding="utf-8") as f:
            f.write(content)

        return {"status": "success", "message": f"File updated at {path}"}

    except Exception as e:
        return {"status": "error", "message": str(e)}









@app.post("/generate_quiz")
async def generate_quiz(file: UploadFile, topic: str = Form(...)):
    pdf_path = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            tmp.write(await file.read())
            pdf_path = tmp.name

        text = extract_text_from_pdf(pdf_path)
        vectorstore = create_vectorstore(text)
        quiz_system = make_quiz_system(vectorstore)
        quiz_output = quiz_system(topic)

        return {"quiz": quiz_output}

    except Exception as e:
        return {"error": str(e)}

    finally:
        # Clean up the temp file
        if pdf_path and os.path.exists(pdf_path):
            try:
                os.remove(pdf_path)
            except Exception:
                pass
