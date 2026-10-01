const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { GoogleGenAI } = require("@google/genai");

const app = express();

app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

app.get("/", (req, res) => {
    res.send("AI Tutor Backend is working!");
});

app.post("/ask-ai", async (req, res) => {
    try {

        const userQuestion = req.body.question || "";
        const studentAnswer = req.body.answer || "";

        const subject = req.body.subject || "";
        const topic = req.body.topic || "";
        const level = req.body.level || "Beginner";
        const language = req.body.language || "English";
        const conversationHistory = req.body.conversationHistory || "";

        const response = await ai.models.generateContent({

            model: "gemini-3.5-flash-lite",

            contents: `
You are a personalized AI Tutor.

Student Level: ${level}
Subject: ${subject}
Topic: ${topic}
Conversation History:
${conversationHistory}
The student says or asks:
${studentAnswer || userQuestion}

Your job:
- Understand the student's actual question.
- Answer the actual question directly.
- Do not give a generic greeting unless the student is greeting you.
- Teach clearly according to the student's level.
- If the student is confused, explain with a simple example.
- If the student asks for meaning, explain the meaning.
- Do not replace the student's own answer when evaluating learning tasks.
LANGUAGE RULES:

The selected language is: ${language}

IMPORTANT:
Follow ONLY the selected language.

If the selected language is "Marathi":
- Give the entire answer in simple Marathi.
- Do NOT give an English explanation.
- Do NOT repeat the answer in English.
- Keep necessary technical terms in English, such as Programming Language, Computer, Python, Java, etc.
- Explain the meaning of technical terms in Marathi.
- The final answer must be mainly Marathi.

If the selected language is "English":
- Give the entire answer in simple English.
- Do NOT give Marathi translation.
- Do NOT give a Marathi explanation.

If the selected language is "Both":
- Give both English and Marathi.
- First give the English explanation.
- Then give the same explanation in simple Marathi.
- Marathi explanation is compulsory.

Only when the selected language is "Both", use these labels:

English:
[English explanation]

Marathi:
[Marathi explanation]

For Marathi mode, NEVER write "Marathi:" at the beginning.

For English mode, NEVER write "English:" at the beginning.
AFTER EXPLAINING:

If the student asks to learn or understand a concept:
- After the explanation, ask ONE short question to check the student's understanding.
- The question should be related to the same topic.
- Do not immediately give the answer to that question.
- Wait for the student's response.
- Adapt the next explanation based on the student's response.

If the student only says a greeting, thanks, or asks for a simple conversational response:
- Do not ask a learning question.
FACTUAL ACCURACY:

- Give factually accurate information.
- Do not invent facts, articles, dates, names, statistics, or examples.
- For academic topics, use standard and well-established concepts.
- For Indian Constitution and MPSC-related topics, use correct constitutional terminology, Articles, facts, and concepts.
- If the student's statement is incorrect, clearly correct it and explain the correct concept simply.
- If you are uncertain about a fact, do not present an uncertain statement as a confirmed fact.
- Always evaluate the student's answer against the question that was asked.
- If the answer is incorrect, do not change the subject or ask what subject the student wants to study.
- Correct the student's answer and explain the correct concept briefly.
- Continue the same learning conversation unless the student clearly changes the topic.


WHEN THE STUDENT ANSWERS A FOLLOW-UP QUESTION:
IMPORTANT CONVERSATION CONTEXT:

The student's latest message may be an answer to the AI Tutor's previous question.

Before responding to the student's latest message:

1. Look at the AI Tutor's immediately previous question.
2. Treat the student's latest message as the answer to that question unless the student clearly starts a new topic or asks a new question.
3. Do NOT interpret the student's answer as personal information about the student.
4. For example, if the AI asks:
   "Which age group is prohibited from working in factories?"
   and the student answers:
   "16 years"
   understand it as an answer to the question, NOT as the student's age.
5. Evaluate the answer for correctness.
6. If correct, briefly confirm it and ask one related question.
7. If incorrect, clearly say that the answer is incorrect, give the correct answer, explain briefly, and ask one related question.
8. Stay on the same topic and continue the learning conversation.

- Do not repeat or quote the student's complete answer.
- Do not write "The student said:".
- First understand what the student means, even if the answer contains spelling mistakes or speech-to-text errors.
- If the student's answer is correct, briefly confirm that it is correct.
- Do not give a long explanation when the student's answer is already correct.
- Then ask ONE short follow-up question related to the topic.
- If the student's answer is partially correct, mention the missing point briefly and explain it simply.
- If the student's answer is incorrect, explain the mistake and give the correct concept with a simple example.
- Then ask ONE new checking question.
Do not use unnecessary Markdown symbols such as **, *, # or backticks.
`
        });

        res.json({
            answer: response.text
        });

    } catch (error) {

        console.error("ASK AI ERROR:", error);

        res.status(500).json({
            error: "AI response failed"
        });
    }
});
app.post("/generate-diagnostic", async (req, res) => {
    try {

        const subject = req.body.subject;
        const topic = req.body.topic;
        const language = req.body.language;

        const response = await ai.models.generateContent({
            model: "gemini-3.5-flash-lite",

            contents: `You are a personalized AI tutor creating a diagnostic assessment.

Subject: ${subject}
Topic: ${topic}
Language: ${language}

Create a NEW diagnostic test for this student.

IMPORTANT:
Every time this endpoint is called, generate a fresh set of questions.
Do not reuse a fixed question set.
Vary the wording, examples, concepts and application situations while remaining factually correct.

The test must contain EXACTLY:

PART A - MCQ
- Exactly 5 questions.
- Each question carries 1 mark.
- Total MCQ marks = 5.
- Each question must have exactly 4 options: A, B, C, D.
- Include a mixture of basic understanding, conceptual understanding and application-based questions.
- Include the correct answer.
- Do not make all questions from only one small part of the topic.

PART B - DESCRIPTIVE
- Exactly 2 questions.
- Each question carries 2.5 marks.
- Total descriptive marks = 5.
- Questions should require the student to explain the concept in their own words.
- Questions should test understanding rather than simple memorization.

TOTAL MARKS:
5 MCQ marks + 5 descriptive marks = 10 marks.

LANGUAGE RULES:

If language is Marathi:
- Write questions and options in simple Marathi.
- Important technical terms may remain in English in brackets.

If language is English:
- Write everything in simple English.

If language is English + Marathi:
- Write each question in English.
- Give its Marathi translation below it.
- Keep important technical terms in English.

IMPORTANT:
- Return ONLY valid JSON.
- Do not use markdown.
- Do not use code blocks.
- Do not add explanations outside the JSON.
- Generate exactly 5 MCQs and exactly 2 descriptive questions.

Use exactly this JSON structure:

{
  "mcq": [
    {
      "question": "Question",
      "options": {
        "A": "Option A",
        "B": "Option B",
        "C": "Option C",
        "D": "Option D"
      },
      "correctAnswer": "A"
    }
  ],
  "descriptive": [
    {
      "question": "Question"
    }
  ]
}`
        });

        let result = response.text.trim();

        result = result
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

        const questions = JSON.parse(result);

        // Safety check: make sure AI returned exactly 5 MCQs and 2 descriptive questions
        if (
            !questions.mcq ||
            questions.mcq.length !== 5 ||
            !questions.descriptive ||
            questions.descriptive.length !== 2
        ) {
            return res.status(500).json({
                error: "AI did not generate exactly 5 MCQs and 2 descriptive questions."
            });
        }

        res.json({
            questions: questions
        });

    } catch (error) {

        console.error("DIAGNOSTIC GENERATION ERROR:", error);

        res.status(500).json({
            error: "Diagnostic generation failed",
            details: error.message
        });

    }
});
app.post("/adaptive-question", async (req, res) => {
    try {

        const subject = req.body.subject;
        const topic = req.body.topic;
        const level = req.body.level;
        const answer = req.body.answer;
        const difficulty = req.body.difficulty || 1;
        const language = req.body.language || "English";

        let difficultyLevel = "Easy";

        if (difficulty >= 3) {
            difficultyLevel = "Hard";
        } else if (difficulty === 2) {
            difficultyLevel = "Medium";
        }

        const response = await ai.models.generateContent({
            model: "gemini-3.5-flash-lite",

            contents: `You are a personalized adaptive AI tutor.

Subject: ${subject}
Topic: ${topic}
Student level: ${level}

Previous student answer:
${answer}

Current adaptive difficulty:
${difficultyLevel}

Generate ONE practice question specifically about the selected Subject and Topic.

Difficulty rules:
- Easy: basic recall or simple conceptual question.
- Medium: concept understanding and application-based question.
- Hard: challenging analytical or problem-solving question.

The question difficulty MUST match the Current adaptive difficulty.

Rules:
- The question must be related to the selected Subject and Topic.
- Consider the student's previous answer when generating the next question.
- Do not give the answer.
- Do not change the subject or topic.

Language rules:
- If Language is Marathi, write the question only in simple Marathi.
- If Language is English, write the question only in simple English.
- If Language is Both, write the question in English followed by Marathi translation.

Return only ONE question.
Do not give the answer.`
        });

        res.json({
            question: response.text
        });

    } catch (error) {

        console.error("ADAPTIVE QUESTION ERROR:", error);

        res.status(500).json({
            error: "Adaptive question generation failed"
        });
    }
});
app.post("/evaluate-diagnostic", async (req, res) => {
    try {

        const subject = req.body.subject;
        const topic = req.body.topic;
        const language = req.body.language;
        const questions = req.body.questions;
        const answers = req.body.answers;

        if (!questions || !answers) {
            return res.status(400).json({
                error: "Diagnostic questions or answers are missing."
            });
        }

        const response = await ai.models.generateContent({

            model: "gemini-3.5-flash-lite",

            contents: `You are an AI diagnostic evaluator.

Subject: ${subject}
Topic: ${topic}
Selected Language: ${language}



The diagnostic test has exactly 10 marks.

MARKING SCHEME:

PART A - MCQ
- Exactly 5 MCQs.
- Each MCQ = 1 mark.
- Maximum = 5 marks.

PART B - DESCRIPTIVE
- Exactly 2 descriptive questions.
- Each question = 2.5 marks.
- Maximum = 5 marks.

TOTAL = 10 MARKS.

GENERATED DIAGNOSTIC QUESTIONS:
${JSON.stringify(questions)}

STUDENT ANSWERS:
${JSON.stringify(answers)}

IMPORTANT MCQ EVALUATION:

For each MCQ:

1. Look at the generated question.
2. Look at its options.
3. Look at its "correctAnswer".
4. Compare the student's selected answer with the actual correctAnswer.

Scoring:
- Correct MCQ = 1 mark.
- Incorrect MCQ = 0 marks.
- Unanswered MCQ = 0 marks.

IMPORTANT DESCRIPTIVE EVALUATION:

There are exactly 2 descriptive questions.

Each descriptive question has maximum 2.5 marks.

Give marks based on:
- Conceptual correctness
- Understanding
- Completeness
- Relevance to the question

Scoring can be partial:

2.5 = correct and complete
2.0 = mostly correct with a small missing point
1.5 = partially correct
1.0 = limited understanding
0.5 = very little correct information
0 = incorrect, irrelevant or unanswered

Do NOT give marks simply because the answer is long.

Do NOT penalize minor grammar or spelling mistakes if the concept is correct.

IMPORTANT:

- Unanswered questions receive 0 marks.
- Maximum MCQ score = 5.
- Maximum descriptive score = 5.
- Final score must be between 0 and 10.
- Final score = MCQ score + descriptive score.
- Never give more than 10 marks.

LEVEL:

Beginner:
Score below 4

Intermediate:
Score from 4 to 7.49

Advanced:
Score from 7.5 to 10
LANGUAGE RULE FOR FEEDBACK:

Write the feedback in the selected language.

If selected language is Marathi:
- Write feedback in simple Marathi.
- Important technical terms may remain in English.

If selected language is English:
- Write feedback in simple English.

If selected language is English + Marathi:
- Write feedback in English and also provide Marathi explanation.
FEEDBACK:

Give useful feedback including:

1. Overall performance
2. Strengths
3. Weaknesses or areas for improvement
4. Mention unanswered questions if any

Return ONLY valid JSON.

Use exactly this format:

{
    "score": 0,
    "level": "Beginner",
    "feedback": "Short useful feedback"
}

The score must be a number from 0 to 10.`
        });

        let result = response.text.trim();

        result = result
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

        const evaluation = JSON.parse(result);

        let score = Number(evaluation.score);

        if (isNaN(score)) {
            score = 0;
        }

        // Score 0 ते 10 मध्येच ठेवणे
        score = Math.max(0, Math.min(10, score));

        let level;

        if (score < 4) {

            level = "Beginner";

        } else if (score < 7.5) {

            level = "Intermediate";

        } else {

            level = "Advanced";
        }

        res.json({

            score: score,

            level: level,

            feedback:
                evaluation.feedback ||
                "Diagnostic evaluation completed."
        });

    } catch (error) {

        console.error(
            "DIAGNOSTIC EVALUATION ERROR:",
            error
        );

        res.status(500).json({

            error: "Diagnostic evaluation failed",

            details: error.message
        });
    }
});
app.post("/personalized-learning", async (req, res) => {
    try {

        const subject = req.body.subject;
        const topic = req.body.topic;
        const level = req.body.level;
        const language = req.body.language || "English";

        const response = await ai.models.generateContent({
            model: "gemini-3.5-flash-lite",

            contents: `You are a personalized AI tutor.

Subject: ${subject}
Topic: ${topic}
Student Level: ${level}
Language: ${language}

Create a detailed personalized lesson for the student.

Rules according to level:

- Beginner:
  Explain the topic from the very basics.
  Start with a simple definition.
  Explain the concept step-by-step.
  Give at least one easy example.
  Give a real-world example or application when appropriate.
  End with a short summary.
  The explanation should be detailed enough for a beginner to understand the topic properly.

- Intermediate:
  Explain the concept clearly with more depth.
  Include important points, examples, applications and basic reasoning.
  End with a short summary.

- Advanced:
  Give a deeper conceptual explanation.
  Include important details, reasoning, applications and an analytical example.
  End with a short summary.

IMPORTANT LANGUAGE RULES:

- If Language is "Marathi":
  Write the ENTIRE lesson in simple Marathi.
  Do NOT write the explanation in English.
  Important technical terms may remain in English brackets.

- If Language is "English":
  Write the ENTIRE lesson in simple English.
  Do NOT write Marathi.

- If Language is "Both":
  First give the complete explanation in English.
  Then give the complete explanation in Marathi.

The lesson must be specifically about the selected Subject and Topic.

Do not give a generic lesson about another topic.

Return ONLY valid JSON.
Do not use markdown.
Do not use code blocks.

Use exactly this format:

{
  "title": "Selected topic title",
  "content": "Detailed personalized explanation including definition, basic concept, step-by-step explanation, example, application and summary",
  "practiceQuestion": "One practice question based on the selected topic and student level"
}
Return ONLY valid JSON.
Do not use markdown.
Do not use code blocks.

Use exactly this format:

{
  "title": "Short lesson title",
  "content": "Personalized explanation with example",
  "practiceQuestion": "One practice question"
}`
        });

        let result = response.text.trim();

        console.log("AI Learning Response:", result);

        result = result
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

        const lesson = JSON.parse(result);

        res.json(lesson);

    } catch (error) {

        console.error("PERSONALIZED LEARNING ERROR:", error);

        res.status(500).json({
            error: "Personalized learning generation failed",
            details: error.message
        });
    }
});
app.post("/ai-teaching", async (req, res) => {
    try {

        const subject = req.body.subject;
        const topic = req.body.topic;
        const language = req.body.language;

        const response = await ai.models.generateContent({
            model: "gemini-3.5-flash-lite",

            contents: `You are a personalized AI teacher.

Your task is to create a fresh and useful teaching lesson for the student every time this request is made.

Subject: ${subject}
Topic: ${topic}
Selected Language: ${language}

IMPORTANT:
Generate the lesson specifically for the given Subject and Topic.

Each time the student starts AI Teaching, create a fresh lesson.
Do not assume that the student has seen a previous lesson.
Do not repeat a fixed or memorized explanation.
Use natural variation in examples and explanation while keeping the information factually correct.

STRICT LANGUAGE RULE:
- If Selected Language is "English": write ONLY English. Do NOT write Marathi.
- If Selected Language is "Marathi": write ONLY Marathi. Important technical terms may remain in English brackets.
- If Selected Language is "Both": first give the English explanation and then give the Marathi explanation.

Do NOT provide translation unless the selected language is "Both".

TEACHING REQUIREMENTS:

1. Start with a simple and accurate definition.
2. Explain the basic concept step-by-step.
3. Explain important points in a logical order.
4. Give a simple example.
5. Give a real-world example or application when appropriate.
6. Keep the explanation beginner-friendly.
7. Adjust the explanation according to the subject and topic.
8. Do not ask diagnostic or test questions.
9. Do not include MCQs.
10. Do not include descriptive questions.
11. Do not evaluate the student.
12. Do not include unnecessary information unrelated to the selected topic.

The lesson should prepare the student to understand the topic before taking the Diagnostic Test.

Return ONLY valid JSON.
Do not use markdown.
Do not use code blocks.

Use exactly this format:

{
  "title": "Topic title",
  "content": "Complete teaching explanation"
}`
        });

        let result = response.text.trim();

        console.log("Selected Language:", language);
        console.log("AI Teaching Response:", result);

        result = result
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

        const lesson = JSON.parse(result);

        res.json(lesson);

    } catch (error) {

        console.error("AI TEACHING ERROR:", error);

        res.status(500).json({
            error: "AI teaching generation failed",
            details: error.message
        });
    }
});
app.post("/revision-question", async (req, res) => {
    try {

        const subject = req.body.subject;
        const topic = req.body.topic;
        const level = req.body.level;
        const language = req.body.language;

        const response = await ai.models.generateContent({
            model: "gemini-3.5-flash-lite",

            contents: `You are a personalized AI tutor.

Subject: ${subject}
Topic: ${topic}
Student Level: ${level}
Language: ${language}

Create a spaced revision plan for this student.

Generate:
1. Revision 1 - Basic recall
2. Revision 2 - Concept understanding
3. Revision 3 - Application or explanation
4. One Quick Revision Question

The revision activities must be specifically about the selected Subject and Topic.

Difficulty must match the student's level:
- Beginner: simple recall and basic understanding
- Intermediate: conceptual understanding and application
- Advanced: deeper reasoning and application

Language rules:
- If Language is Marathi, write everything only in simple Marathi.
- If Language is English, write everything only in simple English.
- If Language is Both, write English followed by Marathi translation.

Return ONLY valid JSON.
Do not use markdown.
Do not use code blocks.

Use exactly this format:

{
  "revision1": "Basic recall activity",
  "revision2": "Concept understanding activity",
  "revision3": "Application or explanation activity",
  "question": "One quick revision question"
}`
        });

        let result = response.text.trim();

        result = result
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

        const revision = JSON.parse(result);

        res.json(revision);

    } catch (error) {
        console.error("REVISION ERROR:", error);

        res.status(500).json({
            error: "Revision generation failed"
        });
    }
});
const PORT = process.env.PORT|| 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});