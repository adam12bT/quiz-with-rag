

from pypdf import PdfReader

from langchain_community.vectorstores import Chroma
from langchain_huggingface import HuggingFaceEmbeddings

from langchain_text_splitters import RecursiveCharacterTextSplitter

from langchain_ollama import OllamaLLM

from langchain_core.prompts import PromptTemplate

import os
import shutil

# -----------------------------
# STEP 1: Extract text from PDF
# -----------------------------
def extract_text_from_pdf(pdf_path):
    print("📖 Extracting text from PDF...")
    reader = PdfReader(pdf_path)
    text = ""
    for page in reader.pages:
        page_text = page.extract_text()
        if page_text:
            text += page_text + "\n"
    return text

# ---------------------------------
# STEP 2: Create a vectorstore (RAG)
# ---------------------------------
def create_vectorstore(text):
    print("🧩 Creating vector store...")
    splitter = RecursiveCharacterTextSplitter(chunk_size=800, chunk_overlap=200)
    texts = splitter.split_text(text)  # list of strings

    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

    if os.path.exists("./quiz_db"):
        shutil.rmtree("./quiz_db")

    vectorstore = Chroma.from_texts(
        texts,
        embedding=embeddings,
        persist_directory="./quiz_db"
    )
    return vectorstore

# --------------------------------
# STEP 3: Connect to Ollama (Mistral)
# --------------------------------
def make_quiz_system(vectorstore):
    print("🤖 Connecting to Ollama (Mistral)...")
    llm = OllamaLLM(model="mistral")

    prompt = PromptTemplate(
        input_variables=["context", "topic"],
        template="""You are a strict quiz generator AI. 
You MUST output exactly 10 multiple-choice questions, and nothing else.

🧩 Format rules (follow strictly):
Each question MUST be on one single line and follow exactly this format:
<number>|<question>|A) <option>|B) <option>|C) <option>|D) <option>|<correct letter>

⚠️ Important constraints:
- Do NOT include explanations or comments.
- Do NOT add any text before or after the quiz (no introductions or conclusions).
- Do NOT use markdown, quotes, bullets, or line breaks between parts.
- Ensure all 10 questions follow the same single-line structure.

Topic: {topic}
Context: {context}

Now generate exactly 10 questions in the format above."""
    )

    def generate(topic_string):
        # Retrieve top 5 relevant documents
        docs = vectorstore.similarity_search(topic_string, k=5)
        context_text = "\n\n".join([d.page_content for d in docs])

        # Fill prompt
        filled_prompt = prompt.format(context=context_text, topic=topic_string)

        # Generate quiz using Ollama LLM
        llm_output = llm.generate([filled_prompt])  # input must be a list
        quiz_text = llm_output.generations[0][0].text
        return quiz_text

    return generate

# --------------------------------------
# STEP 4: Generate quiz in your format
# --------------------------------------
def generate_quiz(quiz_system, topic):
    print("📝 Generating quiz...")
    quiz_output = quiz_system(topic)
    
    print("\n📋 Quiz Generated:\n")
    print(quiz_output)

    with open("quiz.txt", "w", encoding="utf-8") as f:
        f.write(quiz_output)
    print("\n✅ Quiz saved to quiz.txt")

# ------------------------
# MAIN PROGRAM EXECUTION
# ------------------------
if __name__ == "__main__":
    pdf_path = r"C:\Users\adamb\Downloads\Chapitre 3 - Transport UPDATED Rihab.pdf"
    topic = "network"

    text = extract_text_from_pdf(pdf_path)
    vectorstore = create_vectorstore(text)
    quiz_system = make_quiz_system(vectorstore)
    generate_quiz(quiz_system, topic)
