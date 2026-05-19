import os
import json
import fitz

from flask import Flask, request, jsonify
from datetime import datetime, timedelta
from flask_cors import CORS
from dotenv import load_dotenv
from google import genai
from pymongo import MongoClient
import bcrypt
import jwt
from bson import ObjectId

load_dotenv()

app = Flask(__name__)
CORS(app)

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

mongo_client = MongoClient(os.getenv("MONGO_URI"))
db = mongo_client["prepwise_ai"]
users_collection = db["users"]
resume_collection = db["resume_analyses"]
question_collection = db["question_results"]
profile_collection = db["user_profiles"]
company_question_collection = db["company_question_sessions"]
mock_interview_collection = db["mock_interview_sessions"]

def convert_object_id(record):
    record["_id"] = str(record["_id"])

    if "created_at" in record and isinstance(record["created_at"], datetime):
        record["created_at"] = record["created_at"].isoformat()

    return record

@app.route("/")
def home():
    return "PrepWise AI Backend Running"


@app.route("/generate-questions", methods=["POST"])
def generate_questions():
    data = request.json

    name = data.get("name", "")
    role = data.get("role", "")
    skills = data.get("skills", "")
    projects = data.get("projects", "")
    experience = data.get("experience", "")

    prompt = f"""
    Generate interview questions for this candidate.

    Name: {name}
    Role: {role}
    Skills: {skills}
    Projects: {projects}
    Experience: {experience}

    Generate:
    1. 5 HR interview questions
    2. 5 technical interview questions
    3. 3 project-based questions

    Return ONLY valid JSON in this format:
    {{
      "hr": [],
      "technical": [],
      "project": []
    }}
    """

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )

        cleaned_response = (
            response.text
            .replace("```json", "")
            .replace("```", "")
            .strip()
        )

        questions = json.loads(cleaned_response)
        return jsonify(questions)

    except Exception as e:
        return jsonify({
            "error": str(e),
            "hr": [],
            "technical": [],
            "project": []
        }), 500


@app.route("/analyze-resume", methods=["POST"])
def analyze_resume():
    if "resume" not in request.files:
        return jsonify({"error": "No resume file uploaded"}), 400

    resume_file = request.files["resume"]

    if resume_file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    try:
        pdf_bytes = resume_file.read()

        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        resume_text = ""

        for page in doc:
            resume_text += page.get_text()

        if not resume_text.strip():
            return jsonify({"error": "Could not extract text from resume"}), 400

        prompt = f"""
        Analyze the following resume for job readiness and ATS compatibility.

        Resume Text:
        {resume_text}

        Return ONLY valid JSON in this exact format:

        {{
          "ats_score": 0,
          "summary": "",
          "strengths": [],
          "missing_keywords": [],
          "improvement_tips": []
        }}

        Rules:
        - ats_score should be a number from 0 to 100.
        - strengths should contain 3 to 5 points.
        - missing_keywords should contain 5 to 8 keywords.
        - improvement_tips should contain 4 to 6 practical suggestions.
        - Do not include markdown.
        - Do not include explanation outside JSON.
        """

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )

        cleaned_response = (
            response.text
            .replace("```json", "")
            .replace("```", "")
            .strip()
        )

        analysis = json.loads(cleaned_response)
        user_email = request.form.get("email", "")

        resume_collection.insert_one({
            "email": user_email,
            "file_name": resume_file.filename,
            "resume_text": resume_text,
            "analysis": analysis,
            "created_at": datetime.utcnow()
        })
        return jsonify(analysis)

    except Exception as e:
        return jsonify({
            "error": str(e),
            "ats_score": 0,
            "summary": "",
            "strengths": [],
            "missing_keywords": [],
            "improvement_tips": []
        }), 500

@app.route("/verify-all-answers", methods=["POST"])
def verify_all_answers():
    data = request.json

    role = data.get("role", "")
    skills = data.get("skills", "")
    answers = data.get("answers", [])

    prompt = f"""
    Evaluate the candidate's interview performance.

    Target Role: {role}
    Candidate Skills: {skills}

    Questions and Answers:
    {json.dumps(answers, indent=2)}

    Return ONLY valid JSON in this exact format:
    {{
      "total_score": 0,
      "hr_score": 0,
      "technical_score": 0,
      "project_score": 0,
      "overall_feedback": "",
      "question_feedback": [
        {{
          "question": "",
          "category": "",
          "feedback": ""
        }}
      ]
    }}

    Rules:
    - total_score should be from 0 to 100.
    - hr_score should be from 0 to 100.
    - technical_score should be from 0 to 100.
    - project_score should be from 0 to 100.
    - If a category has no answered questions, give 0 for that category.
    - Evaluate based on correctness, clarity, completeness, confidence, and role relevance.
    - If answers are empty or weak, reduce the score.
    - question_feedback should include feedback for every question.
    - Do not include markdown.
    - Do not include anything outside JSON.
    """

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )

        cleaned_response = (
            response.text
            .replace("```json", "")
            .replace("```", "")
            .strip()
        )

        result = json.loads(cleaned_response)
        user_email = data.get("email", "")

        question_collection.insert_one({
            "email": user_email,
            "role": role,
            "skills": skills,
            "question_set": answers,
            "result": result,
            "created_at": datetime.utcnow()
        })
        return jsonify(result)

    except Exception as e:
        return jsonify({
            "error": str(e),
            "total_score": 0,
            "hr_score": 0,
            "technical_score": 0,
            "project_score": 0,
            "overall_feedback": "Could not evaluate answers.",
            "question_feedback": []
        }), 500
    
@app.route("/save-result", methods=["POST"])
def save_result():
    try:
        data = request.get_json()

        record = {
            "role": data.get("role"),
            "skills": data.get("skills"),
            "result": data.get("result"),
            "created_at": datetime.utcnow()
        }

        inserted = interview_results_collection.insert_one(record)

        return jsonify({
            "message": "Result saved successfully",
            "id": str(inserted.inserted_id)
        }), 201

    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500
    
@app.route("/history", methods=["GET"])
def get_history():
    try:
        records = interview_results_collection.find().sort("created_at", -1)

        history = [convert_object_id(record) for record in records]

        return jsonify(history), 200

    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500
    
@app.route("/signup", methods=["POST"])
def signup():
    data = request.json

    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not name or not email or not password:
        return jsonify({"error": "All fields are required."}), 400

    existing_user = users_collection.find_one({"email": email})

    if existing_user:
        return jsonify({"error": "User already exists."}), 400

    jwt_secret = os.getenv("JWT_SECRET")

    if not jwt_secret:
        return jsonify({"error": "JWT_SECRET is missing in .env"}), 500

    hashed_password = bcrypt.hashpw(
        password.encode("utf-8"),
        bcrypt.gensalt()
    )

    new_user = {
        "name": name,
        "email": email,
        "password": hashed_password,
        "created_at": datetime.utcnow()
    }

    users_collection.insert_one(new_user)

    token = jwt.encode(
        {
            "email": email,
            "exp": datetime.utcnow() + timedelta(days=7)
        },
        jwt_secret,
        algorithm="HS256"
    )

    return jsonify({
        "message": "Signup successful",
        "token": token,
        "user": {
            "name": name,
            "email": email
        }
    }), 201

@app.route("/login", methods=["POST"])
def login():
    data = request.json

    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"error": "Email and password are required."}), 400

    user = users_collection.find_one({"email": email})

    if not user:
        return jsonify({"error": "Invalid email or password."}), 401

    if not bcrypt.checkpw(password.encode("utf-8"), user["password"]):
        return jsonify({"error": "Invalid email or password."}), 401

    token = jwt.encode(
        {
            "email": email,
            "exp": datetime.utcnow() + timedelta(days=7)
        },
        os.getenv("JWT_SECRET"),
        algorithm="HS256"
    )

    return jsonify({
        "message": "Login successful",
        "token": token,
        "user": {
            "name": user["name"],
            "email": user["email"]
        }
    }), 200

@app.route("/user-resumes/<email>", methods=["GET"])
def get_user_resumes(email):
    resumes = list(
        resume_collection.find({"email": email}).sort("created_at", -1)
    )

    resumes = [convert_object_id(resume) for resume in resumes]

    return jsonify(resumes)

@app.route("/user-question-results/<email>", methods=["GET"])
def get_user_question_results(email):
    records = list(
        question_collection.find({"email": email}).sort("created_at", -1)
    )

    records = [convert_object_id(record) for record in records]

    return jsonify(records)

@app.route("/save-profile", methods=["POST"])
def save_profile():
    data = request.json

    email = data.get("email", "").strip().lower()

    if not email:
        return jsonify({"error": "Email is required"}), 400

    profile_data = {
        "email": email,
        "name": data.get("name", ""),
        "role": data.get("role", ""),
        "skills": data.get("skills", []),
        "projects": data.get("projects", []),
        "experience": data.get("experience", ""),
        "updated_at": datetime.utcnow()
    }

    profile_collection.update_one(
        {"email": email},
        {"$set": profile_data},
        upsert=True
    )

    return jsonify({
        "message": "Profile saved successfully",
        "profile": profile_data
    }), 200


@app.route("/user-profile/<email>", methods=["GET"])
def get_user_profile(email):
    profile = profile_collection.find_one(
        {"email": email.strip().lower()}
    )

    if not profile:
        return jsonify({"profile": None}), 200

    profile = convert_object_id(profile)

    return jsonify({"profile": profile}), 200

@app.route("/generate-company-questions", methods=["POST"])
def generate_company_questions():
    data = request.json

    company = data.get("company", "")
    roles = data.get("roles", [])

    prompt = f"""
    Generate company-specific interview questions.

    Company: {company}
    Target Roles: {roles}

    Generate 10 interview questions total:
    - HR/company-fit questions
    - Technical questions
    - Role-specific questions
    - Project-based questions

    Return ONLY valid JSON in this exact format:
    {{
      "questions": [
        {{
          "category": "",
          "question": ""
        }}
      ]
    }}

    Rules:
    - category should be one of: HR, Technical, Role-Based, Project-Based.
    - Make questions suitable for the company and target role.
    - Do not include markdown.
    - Do not include anything outside JSON.
    """

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )

        cleaned_response = (
            response.text
            .replace("```json", "")
            .replace("```", "")
            .strip()
        )

        questions = json.loads(cleaned_response)
        return jsonify(questions)

    except Exception as e:
        return jsonify({
            "error": str(e),
            "questions": []
        }), 500
    
@app.route("/verify-company-answers", methods=["POST"])
def verify_company_answers():
    data = request.json

    email = data.get("email", "")
    company = data.get("company", "")
    roles = data.get("roles", [])
    answers = data.get("answers", [])

    prompt = f"""
    Evaluate this company-specific interview practice session.

    Company: {company}
    Target Roles: {roles}

    Questions and Answers:
    {json.dumps(answers, indent=2)}

    Return ONLY valid JSON in this exact format:
    {{
      "overall_score": 0,
      "technical_score": 0,
      "communication_score": 0,
      "problem_solving_score": 0,
      "company_fit_score": 0,
      "overall_feedback": "",
      "question_feedback": [
        {{
          "question": "",
          "feedback": ""
        }}
      ]
    }}

    Rules:
    - all scores should be from 0 to 100.
    - reduce score for empty or weak answers.
    - question_feedback should include feedback for every question.
    - Do not include markdown.
    - Do not include anything outside JSON.
    """

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )

        cleaned_response = (
            response.text
            .replace("```json", "")
            .replace("```", "")
            .strip()
        )

        result = json.loads(cleaned_response)

        company_question_collection.insert_one({
            "email": email,
            "company": company,
            "roles": roles,
            "questions": answers,
            "result": result,
            "created_at": datetime.utcnow()
        })

        return jsonify(result)

    except Exception as e:
        return jsonify({
            "error": str(e),
            "overall_score": 0,
            "technical_score": 0,
            "communication_score": 0,
            "problem_solving_score": 0,
            "company_fit_score": 0,
            "overall_feedback": "Could not evaluate answers.",
            "question_feedback": []
        }), 500
    
@app.route("/company-question-history/<email>", methods=["GET"])
def get_company_question_history(email):
    records = list(
        company_question_collection.find(
            {"email": email.strip().lower()}
        ).sort("created_at", -1)
    )

    records = [convert_object_id(record) for record in records]

    return jsonify(records)

@app.route("/start-mock-interview", methods=["POST"])
def start_mock_interview():
    try:
        email = request.form.get("email", "")
        company = request.form.get("company", "")
        roles = json.loads(request.form.get("roles", "[]"))
        resume_id = request.form.get("resume_id", "")

        resume_text = ""

        if resume_id:
            resume_record = resume_collection.find_one({"_id": ObjectId(resume_id)})

            if resume_record:
                resume_text = resume_record.get("resume_text", "")

        elif "resume" in request.files:
            resume_file = request.files["resume"]
            pdf_bytes = resume_file.read()

            doc = fitz.open(stream=pdf_bytes, filetype="pdf")

            for page in doc:
                resume_text += page.get_text()

        prompt = f"""
        You are an AI interviewer.

        Start a mock interview for this candidate.

        Company: {company}
        Target Roles: {roles}
        Candidate Resume:
        {resume_text}

        Generate ONLY the first interview question.

        Return ONLY valid JSON in this format:
        {{
          "question": "",
          "category": ""
        }}

        Rules:
        - category should be one of: HR, Technical, Project-Based, Company-Fit.
        - Ask only one question.
        - Make it suitable for the company, role, and resume.
        """

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )

        cleaned_response = (
            response.text
            .replace("```json", "")
            .replace("```", "")
            .strip()
        )

        first_question = json.loads(cleaned_response)

        session = {
            "email": email,
            "company": company,
            "roles": roles,
            "resume_text": resume_text,
            "conversation": [
                {
                    "question": first_question.get("question", ""),
                    "category": first_question.get("category", "")
                }
            ],
            "status": "in_progress",
            "created_at": datetime.utcnow()
        }

        inserted = mock_interview_collection.insert_one(session)

        return jsonify({
            "session_id": str(inserted.inserted_id),
            "question": first_question.get("question", ""),
            "category": first_question.get("category", "")
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route("/next-mock-question", methods=["POST"])
def next_mock_question():
    try:
        data = request.json

        session_id = data.get("session_id", "")
        user_answer = data.get("answer", "")

        session = mock_interview_collection.find_one(
            {"_id": ObjectId(session_id)}
        )

        if not session:
            return jsonify({"error": "Session not found"}), 404

        conversation = session.get("conversation", [])

        if conversation:
            conversation[-1]["answer"] = user_answer

        prompt = f"""
        You are an AI interviewer.

        Continue this mock interview.

        Company: {session.get("company")}
        Target Roles: {session.get("roles")}
        Resume:
        {session.get("resume_text")}

        Conversation so far:
        {json.dumps(conversation, indent=2)}

        Return ONLY valid JSON in this format:
        {{
          "feedback": "",
          "next_question": "",
          "next_category": ""
        }}

        Rules:
        - feedback should briefly evaluate the user's latest answer.
        - next_question should be a logical follow-up or next interview question.
        - next_category should be one of: HR, Technical, Project-Based, Company-Fit.
        - Ask only one next question.
        - Do not include markdown.
        """

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )

        cleaned_response = (
            response.text
            .replace("```json", "")
            .replace("```", "")
            .strip()
        )

        ai_response = json.loads(cleaned_response)

        conversation.append({
            "question": ai_response.get("next_question", ""),
            "category": ai_response.get("next_category", "")
        })

        mock_interview_collection.update_one(
            {"_id": ObjectId(session_id)},
            {
                "$set": {
                    "conversation": conversation,
                    "updated_at": datetime.utcnow()
                }
            }
        )

        return jsonify({
            "feedback": ai_response.get("feedback", ""),
            "question": ai_response.get("next_question", ""),
            "category": ai_response.get("next_category", ""),
            "question_count": len(conversation)
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route("/finish-mock-interview", methods=["POST"])
def finish_mock_interview():
    try:
        data = request.json
        session_id = data.get("session_id", "")

        session = mock_interview_collection.find_one(
            {"_id": ObjectId(session_id)}
        )

        if not session:
            return jsonify({"error": "Session not found"}), 404

        conversation = session.get("conversation", [])

        prompt = f"""
        You are an expert AI interview evaluator.

        Evaluate this full mock interview.

        Company: {session.get("company")}
        Target Roles: {session.get("roles")}

        Conversation:
        {json.dumps(conversation, indent=2)}

        Return ONLY valid JSON in this exact format:
        {{
          "overall_score": 0,
          "confidence_score": 0,
          "communication_score": 0,
          "clarity_score": 0,
          "technical_depth_score": 0,
          "problem_solving_score": 0,
          "company_fit_score": 0,
          "overall_feedback": "",
          "strengths": [],
          "weaknesses": [],
          "improvement_tips": []
        }}

        Rules:
        - All scores must be from 0 to 100.
        - Evaluate based on answers, clarity, technical depth, confidence, and company fit.
        - If answers are weak or empty, reduce score.
        - Do not include markdown.
        - Do not include anything outside JSON.
        """

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )

        cleaned_response = (
            response.text
            .replace("```json", "")
            .replace("```", "")
            .strip()
        )

        evaluation = json.loads(cleaned_response)

        mock_interview_collection.update_one(
            {"_id": ObjectId(session_id)},
            {
                "$set": {
                    "evaluation": evaluation,
                    "status": "completed",
                    "completed_at": datetime.utcnow()
                }
            }
        )

        return jsonify(evaluation)

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route("/mock-interview-history/<email>", methods=["GET"])
def get_mock_interview_history(email):
    try:
        records = list(
            mock_interview_collection.find(
                {"email": email.strip().lower()}
            ).sort("created_at", -1)
        )

        records = [convert_object_id(record) for record in records]

        return jsonify(records)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)