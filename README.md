# Resume Parser & Evaluator

## Overview
This project is a **Resume Parser and Evaluator** that extracts structured information from resumes and assesses their quality. It integrates **Natural Language Processing (NLP)**, **Named Entity Recognition (NER)**, and **vector-based semantic search** using **Pinecone**.

## Features
- Extracts **emails, phone numbers, skills, education, work experience, projects, and certifications** from resumes.
- Uses **Named Entity Recognition (NER)** for structured data extraction.
- Evaluates resumes based on **predefined scoring criteria**.
- Provides an **overall score** along with scores for different sections.
- Stores resume embeddings in **Pinecone** for efficient retrieval.
- Enables **semantic search** to find resumes similar to a query.
- **Web Scraping Integration**: Fetches relevant internship opportunities from **Internshala** based on resume content.

## Pinecone Integration (Vector Database)
### **Uploading Resumes to Pinecone**
1. **Resume Parsing**: Extracts structured data (skills, experience, education, etc.) and generates a text summary.
2. **Embedding Generation**: Converts the extracted text into a numerical vector (1024-dimension) using an embedding model.
3. **Data Cleaning**: Removes unnecessary characters (e.g., `\n`, extra spaces) for better metadata storage.
4. **Upsert to Pinecone**: Stores the vector along with structured metadata in Pinecone for future searches.

### **Searching Resumes in Pinecone**
1. **Query Embedding Generation**: Converts the search query into a numerical vector.
2. **Pinecone Query**: Searches the vector database for the most similar resumes.
3. **Filtering Results**: Filters results based on a similarity threshold.
4. **Returning Matches**: Returns the most relevant resumes along with metadata.

## Web Scraping for Internship Recommendations
1. **Extract Resume Skills & Experience**: Identifies key skills, education, and work experience from the resume.
2. **Internship Matching**: Uses web scraping to fetch relevant internships from **Internshala** based on extracted data.
3. **User-Friendly Interface**: Displays matching internships and provides a **one-click redirect** to the Internshala page for easy application.
4. **Real-time Updates**: Ensures users get the latest internship listings tailored to their profile.

This setup ensures **efficient storage and retrieval** of resumes based on their **semantic similarity**, while also providing **personalized internship recommendations** to users in real-time.
