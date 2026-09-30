let studentName = "";
let studentLevel = "";
let studentScore = 0;
let previousAnswer = "";
let selectedSubject = "";
let selectedTopic = "";
let adaptiveDifficulty = 1;

function login() {

    const name = document.getElementById("studentName").value.trim();
    const email = document.getElementById("email").value.trim();

    if (name === "") {
        alert("Please enter your name");
        return;
    }

    if (email === "") {
        alert("Please enter your email");
        return;
    }

    studentName = name;

    console.log("LOGIN SUCCESS:", studentName, email);

    const loginPage = document.getElementById("loginPage");
    const homePage = document.getElementById("homePage");

    loginPage.style.setProperty("display", "none", "important");
    homePage.style.setProperty("display", "block", "important");

    document.getElementById("welcomeName").innerText =
        "Welcome, " + studentName + "!";

    console.log("Login Page:", loginPage);
    console.log("Home Page:", homePage);
}

async function startLearning() {

    showOnly("learningPage");

    const learningTitle =
        document.getElementById("learningTitle");

    const learningContent =
        document.getElementById("learningContent");

    const practiceQuestion =
        document.getElementById("practiceQuestion");

    document.getElementById("learningLevel").innerText =
    "Your Level: " + studentLevel;

document.getElementById("learningTopic").innerText =
    "Topic: " + selectedTopic;

    learningTitle.innerText =
        "🤖 AI is preparing your personalized lesson...";

    learningContent.innerText = "";

    practiceQuestion.innerText = "";

    try {

        const response = await fetch(
            "https://pratibhamahajan-personalized-ai-tutor.onrender.com/personalized-learning",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    subject: selectedSubject,
                    topic: selectedTopic,
                    level: studentLevel,
                    language: document.getElementById("languageInput").value



                })
            }
        );

        const data = await response.json();

        if (data.content) {

            learningTitle.innerText =
                data.title;

            learningContent.innerText =
                data.content;

            practiceQuestion.innerText =
                data.practiceQuestion;

        } else {

            learningTitle.innerText =
                "❌ Learning content could not be generated.";

        }

    } catch (error) {

        console.error(error);

        learningTitle.innerText =
            "❌ Unable to connect to AI backend.";

    }
}
async function submitTest() {

    const questions = document.querySelectorAll("#questions .diagnostic-question");
    const answers = [];

    questions.forEach((question, index) => {

        const selected = question.querySelector(
            'input[type="radio"]:checked'
        );

        const textAnswer = question.querySelector("textarea");

        if (selected) {
            answers.push({
                question: index + 1,
                answer: selected.value
            });
        } 
        else if (textAnswer) {
            answers.push({
                question: index + 1,
                answer: textAnswer.value
            });
        }
        else {
            answers.push({
                question: index + 1,
                answer: ""
            });
        }
    });

    if (answers.some(item => item.answer.trim() === "")) {
        alert("Please answer all questions.");
        return;
    }

    document.getElementById("score").innerText =
        "🤖 AI is evaluating your answers...";

    showOnly("resultPage");

    try {

        const response = await fetch(
            "https://pratibhamahajan-personalized-ai-tutor.onrender.com/evaluate-diagnostic",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    subject: selectedSubject,
                    topic: selectedTopic,
                    answers: answers
                })
            }
        );

        const data = await response.json();

        if (data.score !== undefined) {

            studentScore = data.score;
            studentLevel = data.level;

            document.getElementById("score").innerText =
                "Score: " + data.score + "/10";

            document.getElementById("level").innerText =
                "Your Level: " + data.level;

            document.getElementById("recommendation").innerText =
                data.feedback;

        } else {

            document.getElementById("score").innerText =
                "AI evaluation failed.";

        }

    } catch (error) {

        console.error(error);

        document.getElementById("score").innerText =
            "❌ Unable to connect to AI backend.";

    }
}


function goHome() {
    showOnly("homePage");
}


function showProgress() {
    showOnly("progressPage");

    document.getElementById("progressName").innerText = studentName;
    document.getElementById("progressScore").innerText =
        "🎯 Diagnostic Score: " + studentScore + " / 10";

    document.getElementById("progressLevel").innerText =
        "📈 Knowledge Level: " + studentLevel;
}
async function revision() {

    showOnly("revisionPage");

    document.getElementById("revision1").innerText =
        "🤖 AI is preparing Revision 1...";

    document.getElementById("revision2").innerText = "";
    document.getElementById("revision3").innerText = "";
    document.getElementById("revisionQuestion").innerText = "";
    document.getElementById("revisionFeedback").innerText = "";

    try {

        const response = await fetch(
            "https://pratibhamahajan-personalized-ai-tutor.onrender.com/revision-question",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    subject: selectedSubject,
                    topic: selectedTopic,
                    level: studentLevel,
                    language: document.getElementById("languageInput").value
                })
            }
        );

        const data = await response.json();

        console.log("Revision AI Response:", data);

        if (
            data.revision1 &&
            data.revision2 &&
            data.revision3 &&
            data.question
        ) {

            document.getElementById("revision1").innerText =
                data.revision1;

            document.getElementById("revision2").innerText =
                data.revision2;

            document.getElementById("revision3").innerText =
                data.revision3;

            document.getElementById("revisionQuestion").innerText =
                data.question;

        } else {

            document.getElementById("revision1").innerText =
                "❌ Revision could not be generated.";

            console.error("Invalid revision response:", data);
        }

    } catch (error) {

        console.error("Revision frontend error:", error);

        document.getElementById("revision1").innerText =
            "❌ Unable to connect to AI backend.";
    }
}

async function checkAnswer() {
    const answer = document.getElementById("answer").value;
    previousAnswer = answer;
    const feedback = document.getElementById("feedback");

    if (answer.trim() === "") {
        feedback.innerText = "Please write your answer first.";
        return;
    }

    feedback.innerText = "🤖 AI is checking your answer...";

    try {
        const response = await fetch("https://pratibhamahajan-personalized-ai-tutor.onrender.com/ask-ai", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                question: `You are a personalized AI tutor.

The student is learning ${selectedTopic} from ${selectedSubject}.
Student's answer:
"${answer}"

Analyze the answer using the Feynman Technique.

Give feedback in this format:

Simple Feedback:
What is Correct:
One Missing Point:
How to Improve:
Language: ${document.getElementById("languageInput").value}

Language Rule:
- If Language is Marathi, give feedback in simple Marathi.
- If Language is English, give feedback in simple English.
- If Language is Both, give English feedback followed by Marathi feedback.
Keep the explanation simple and student-friendly.`
            })
        });

        const data = await response.json();

        if (data.answer) {
            feedback.innerText = data.answer;
            showAdaptiveQuestion();
        } else {
            feedback.innerText = "AI feedback could not be generated.";
        }

    } catch (error) {
        console.error(error);
        feedback.innerText =
            "Unable to connect to AI backend. Please make sure the server is running.";
    }
}
async function submitAdaptiveAnswer() {
    const answer = document.getElementById("adaptiveAnswer").value;
    const feedback = document.getElementById("adaptiveFeedback");

    if (answer.trim() === "") {
        feedback.innerText = "Please write your answer first.";
        return;
    }

    feedback.innerText = "🤖 AI is evaluating your answer...";

    try {
        const response = await fetch("https://pratibhamahajan-personalized-ai-tutor.onrender.com/ask-ai", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                question: `You are a personalized AI tutor.

Subject: ${selectedSubject}
Topic: ${selectedTopic}
Student level: ${studentLevel}
Language: ${document.getElementById("languageInput").value}

Adaptive practice question:
${document.getElementById("adaptiveQuestion").innerText}

Student's answer:
${answer}

Evaluate the student's answer.

Give feedback in this format:

Simple Feedback:
What is Correct:
What is Missing:
How to Improve:
Language rules:
- If Language is Marathi, give feedback only in simple Marathi.
- If Language is English, give feedback only in simple English.
- If Language is Both, give English feedback followed by Marathi feedback.

Keep the feedback simple and educational.`
            })
        });

        const data = await response.json();

if (data.answer) {

    feedback.innerText = data.answer;

    // AI feedback मध्ये answer correct आहे का ते check करणे
    const aiFeedback = data.answer.toLowerCase();

    if (
        aiFeedback.includes("correct") ||
        aiFeedback.includes("बरोबर") ||
        aiFeedback.includes("योग्य")
    ) {
        // Correct answer → difficulty वाढवा
        adaptiveDifficulty++;

        console.log(
            "✅ Correct answer. Difficulty increased to:",
            adaptiveDifficulty
        );

    } else if (
        aiFeedback.includes("incorrect") ||
        aiFeedback.includes("wrong") ||
        aiFeedback.includes("चुकी") ||
        aiFeedback.includes("अयोग्य")
    ) {
        // Wrong answer → difficulty कमी करा
        adaptiveDifficulty--;

        if (adaptiveDifficulty < 1) {
            adaptiveDifficulty = 1;
        }

        console.log(
            "❌ Incorrect answer. Difficulty decreased to:",
            adaptiveDifficulty
        );
    }

} else {
    feedback.innerText =
        "AI evaluation could not be generated.";
}

    } catch (error) {
        console.error(error);
        feedback.innerText =
            "Unable to connect to AI backend.";
    }
}

async function showAdaptiveQuestion() {
    const adaptiveQuestion = document.getElementById("adaptiveQuestion");

    adaptiveQuestion.innerText = "🤖 AI is generating your adaptive question...";

    try {
        const response = await fetch("https://pratibhamahajan-personalized-ai-tutor.onrender.com/adaptive-question", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
           body: JSON.stringify({
    subject: selectedSubject,
    topic: selectedTopic,
    level: studentLevel,
    answer: previousAnswer,
    difficulty: adaptiveDifficulty,
    language: document.getElementById("languageInput").value
})
        });

        const data = await response.json();

        if (data.question) {
            adaptiveQuestion.innerText = data.question;
        } else {
            adaptiveQuestion.innerText =
                "Unable to generate adaptive question.";
        }

    } catch (error) {
        console.error(error);
        adaptiveQuestion.innerText =
            "Unable to connect to AI backend.";
    }
}

function completeRevision() {
    document.getElementById("revisionFeedback").innerText =
        "Excellent! Revision completed successfully. Keep revising the topic at regular intervals.";
}
function showOnly(pageId) {
    document.getElementById("loginPage").style.setProperty("display", "none", "important");
    document.getElementById("homePage").style.setProperty("display", "none", "important");
    document.getElementById("testPage").style.setProperty("display", "none", "important");
    document.getElementById("resultPage").style.setProperty("display", "none", "important");
    document.getElementById("learningPage").style.setProperty("display", "none", "important");
    document.getElementById("progressPage").style.setProperty("display", "none", "important");
    document.getElementById("revisionPage").style.setProperty("display", "none", "important");
document.getElementById("voiceTutorPage").style.setProperty("display", "none", "important");
    document.getElementById(pageId).style.setProperty("display", "block", "important");
}
function openAIConversation() {

    showOnly("voiceTutorPage");

}
async function startDiagnostic() {

    const subject = document.getElementById("subjectInput").value.trim();
    const topic = document.getElementById("topicInput").value.trim();
    const language = document.getElementById("languageInput").value;
    const error = document.getElementById("topicError");

    if (subject === "" || topic === "") {
        error.innerText = "Please enter both Subject and Topic.";
        return;
    }

    selectedSubject = subject;
    selectedTopic = topic;

    error.innerText = "🤖 AI is preparing your diagnostic test...";

    try {

        const response = await fetch(
            "https://pratibhamahajan-personalized-ai-tutor.onrender.com/generate-diagnostic",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    subject: selectedSubject,
                    topic: selectedTopic,
                    language: language
                })
            }
        );

        const data = await response.json();

        if (data.questions) {

            const container = document.getElementById("questions");

            container.innerHTML = "";

            // PART A - MCQ
            const mcqTitle = document.createElement("h2");
            mcqTitle.innerText =
                "Part A - Multiple Choice Questions";

            container.appendChild(mcqTitle);

            data.questions.mcq.forEach((q, index) => {

                const div = document.createElement("div");

                div.className = "diagnostic-question";

                div.innerHTML = `
                    <p>
                        <strong>
                            Q${index + 1}. ${q.question}
                        </strong>
                    </p>

                    <label>
                        <input
                            type="radio"
                            name="q${index}"
                            value="A">
                        A. ${q.options.A}
                    </label><br>

                    <label>
                        <input
                            type="radio"
                            name="q${index}"
                            value="B">
                        B. ${q.options.B}
                    </label><br>

                    <label>
                        <input
                            type="radio"
                            name="q${index}"
                            value="C">
                        C. ${q.options.C}
                    </label><br>

                    <label>
                        <input
                            type="radio"
                            name="q${index}"
                            value="D">
                        D. ${q.options.D}
                    </label>
                `;

                container.appendChild(div);
            });


            // PART B - DESCRIPTIVE
            const descriptiveTitle =
                document.createElement("h2");

            descriptiveTitle.innerText =
                "Part B - Descriptive Questions";

            container.appendChild(descriptiveTitle);


            data.questions.descriptive.forEach((q, index) => {

                const div = document.createElement("div");

                div.className = "diagnostic-question";

                div.innerHTML = `
    <p>
        <strong>
            Q${index + 6}. ${q.question}
        </strong>
    </p>

    <button type="button"
        onclick="startVoiceAnswer(this)">
        🎤 Speak Answer
    </button>

    <button type="button"
        onclick="stopVoiceAnswer()">
        ⏹️ Stop
    </button>

    <p class="voice-status"></p>

    <textarea
        placeholder="Write your answer here or use the microphone..."
        rows="5">
    </textarea>
`;

                container.appendChild(div);
            });


            error.innerText =
                "✅ Diagnostic test generated successfully!";

            showOnly("testPage");

        } else {

            error.innerText =
                "❌ AI could not generate the test.";

        }

    } catch (error) {

        console.error(error);

        document.getElementById("topicError").innerText =
            "❌ Unable to connect to AI backend.";

    }
}
async function startAITeaching() {

    const subject =
        document.getElementById("subjectInput").value.trim();

    const topic =
        document.getElementById("topicInput").value.trim();

    const language =
        document.getElementById("languageInput").value;

    const teachingTitle =
        document.getElementById("teachingTitle");

    const teachingContent =
        document.getElementById("teachingContent");

    if (subject === "" || topic === "") {
        alert("Please enter Subject and Topic first.");
        return;
    }

    teachingTitle.innerText =
        "🤖 AI is preparing your lesson...";

    teachingContent.innerText = "";

    try {

        const response = await fetch(
            "https://pratibhamahajan-personalized-ai-tutor.onrender.com/ai-teaching",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    subject: subject,
                    topic: topic,
                    language: language
                })
            }
        );

        const data = await response.json();

        if (data.title && data.content) {

            teachingTitle.innerText =
                data.title;

            teachingContent.innerText =
                data.content;
                document.getElementById("teachingDiagnosticButton").style.display = "block";

        } else {

            teachingTitle.innerText =
                "❌ AI Teaching failed.";

        }

    } catch (error) {

        console.error(error);

        teachingTitle.innerText =
            "❌ Unable to connect to AI backend.";

    }
}

let recognition = null;
let currentVoiceTextarea = null;

function startVoiceAnswer(button) {

    const questionBox = button.closest(".diagnostic-question");

    if (!questionBox) {
        alert("Question box not found.");
        return;
    }

    currentVoiceTextarea =
        questionBox.querySelector("textarea");

    if (!currentVoiceTextarea) {
        alert("Answer box not found.");
        return;
    }

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        alert("Voice recognition is not supported. Please use Google Chrome.");
        return;
    }

    recognition = new SpeechRecognition();

    const language =
        document.getElementById("languageInput").value;

    if (language === "Marathi") {
        recognition.lang = "mr-IN";
    } else {
        recognition.lang = "en-IN";
    }

    recognition.continuous = true;
    recognition.interimResults = false;

    const status =
        questionBox.querySelector(".voice-status");

    status.innerText =
        "🎤 Listening... Speak your answer.";

    recognition.onresult = function(event) {

        let text = "";

        for (
            let i = event.resultIndex;
            i < event.results.length;
            i++
        ) {

            if (event.results[i].isFinal) {

                text +=
                    event.results[i][0].transcript + " ";
            }
        }

        if (text.trim() !== "") {

            currentVoiceTextarea.value += text;
        }
    };

    recognition.onerror = function(event) {

        console.error(
            "Voice recognition error:",
            event.error
        );

        status.innerText =
            "❌ Voice error: " + event.error;
    };

    recognition.onend = function() {

        status.innerText =
            "🎤 Voice input stopped.";
    };

    recognition.start();
}


function stopVoiceAnswer() {

    if (recognition) {

        recognition.stop();

        recognition = null;
    }
}
function startGeneralVoiceAnswer(textareaId, statusId) {

    const textarea = document.getElementById(textareaId);
    const status = document.getElementById(statusId);

    if (!textarea) {
        alert("Answer box not found.");
        return;
    }

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        alert("Voice recognition is not supported. Please use Google Chrome.");
        return;
    }

    // Stop any previous voice recognition
    if (recognition) {
        try {
            recognition.stop();
        } catch (error) {
            console.log("Previous recognition already stopped.");
        }
    }

    recognition = new SpeechRecognition();

    const language =
        document.getElementById("languageInput").value;

    if (language === "Marathi") {
        recognition.lang = "mr-IN";
    } else {
        recognition.lang = "en-IN";
    }

    recognition.continuous = true;
    recognition.interimResults = false;

    status.innerText =
        "🎤 Listening... Speak your answer.";

    recognition.onresult = function(event) {

        console.log("VOICE RESULT:", event);

        let spokenText = "";

        for (let i = 0; i < event.results.length; i++) {

            if (event.results[i].isFinal) {

                spokenText +=
                    event.results[i][0].transcript;
            }
        }

        console.log("SPOKEN TEXT:", spokenText);

        if (spokenText.trim() !== "") {

            if (textarea.value.trim() !== "") {
                textarea.value += " ";
            }

            textarea.value += spokenText;

            status.innerText =
                "✅ Voice converted to text.";
        }
    };

    recognition.onerror = function(event) {

        console.error(
            "VOICE ERROR:",
            event.error
        );

        status.innerText =
            "❌ Voice error: " + event.error;
    };

    recognition.onend = function() {

        console.log("VOICE RECOGNITION ENDED");

        if (
            status.innerText ===
            "🎤 Listening... Speak your answer."
        ) {
            status.innerText =
                "🎤 Voice input stopped.";
        }
    };

    try {

        recognition.start();

        console.log(
            "Voice recognition started for:",
            textareaId
        );

    } catch (error) {

        console.error(
            "VOICE START ERROR:",
            error
        );

        status.innerText =
            "❌ Could not start voice recognition.";
    }
}
function startConversationVoice() {

    const textarea =
        document.getElementById("voiceStudentAnswer");

    const status =
        document.getElementById("conversationVoiceStatus");

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        alert("Voice recognition is not supported. Please use Google Chrome.");
        return;
    }

    if (recognition) {
        try {
            recognition.stop();
        } catch (error) {
            console.log("Previous recognition already stopped.");
        }
    }

    recognition = new SpeechRecognition();

    const language =
        document.getElementById("languageInput").value;

    if (language === "Marathi") {
        recognition.lang = "mr-IN";
    } else {
        recognition.lang = "en-IN";
    }

    recognition.continuous = true;
    recognition.interimResults = false;

    status.innerText =
        "🎤 Listening... Speak to your AI Tutor.";

    recognition.onresult = function(event) {

        let spokenText = "";

        for (
            let i = event.resultIndex;
            i < event.results.length;
            i++
        ) {

            if (event.results[i].isFinal) {

                spokenText +=
                    event.results[i][0].transcript;
            }
        }

        if (spokenText.trim() !== "") {

            if (textarea.value.trim() !== "") {
                textarea.value += " ";
            }

            textarea.value += spokenText;

            status.innerText =
                "✅ Voice converted to text.";
        }
    };

    recognition.onerror = function(event) {

        console.error(
            "CONVERSATION VOICE ERROR:",
            event.error
        );

        status.innerText =
            "❌ Voice error: " + event.error;
    };

    recognition.onend = function() {

    console.log("Conversation voice ended.");

    if (recognition) {
        status.innerText =
            "⏹️ Voice input stopped.";
    }
};

    try {

        recognition.start();

    } catch (error) {

        console.error(
            "VOICE START ERROR:",
            error
        );

        status.innerText =
            "❌ Could not start voice recognition.";
    }
}
async function sendConversationMessage() {

    const textarea =
        document.getElementById("voiceStudentAnswer");

    const conversationBox =
        document.getElementById("conversationBox");

    const message =
        textarea.value.trim();

    if (message === "") {
        alert("Please type or speak something first.");
        return;
    }

    // Previous conversation AI ला context म्हणून पाठवण्यासाठी
    const previousConversation =
        conversationBox.innerText;

    // Student message show करा
    const studentMessage =
        document.createElement("div");

    studentMessage.className = "student-message";

    studentMessage.innerHTML = `
        <strong>👤 You:</strong>
        <p>${message}</p>
    `;

    conversationBox.appendChild(studentMessage);

    // Input clear
    textarea.value = "";

    // AI thinking message
    const aiMessage =
        document.createElement("div");

    aiMessage.className = "ai-message";

    aiMessage.innerHTML = `
        <strong>🤖 AI Tutor:</strong>
        <p>AI is thinking...</p>
    `;

    conversationBox.appendChild(aiMessage);

    try {

        const response = await fetch(
            "https://pratibhamahajan-personalized-ai-tutor.onrender.com/ask-ai",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    subject:
                        document.getElementById("subjectInput").value,

                    topic:
                        document.getElementById("topicInput").value,

                    level:
                        studentLevel || "Beginner",

                    language:
                        document.getElementById("languageInput").value,

                    answer: message,

                    conversationHistory:
                        previousConversation,

                    question:
`You are the student's AI Tutor.

Previous conversation:
${previousConversation}

The student's latest message is:
"${message}"

IMPORTANT:
The latest student message may be an answer to the AI Tutor's previous question.

First understand the previous question and the student's latest answer.

If the student is answering the previous question:
- Evaluate that answer.
- Do not treat the answer as unrelated personal information.
- Stay on the same topic.
- If correct, briefly confirm it.
- If incorrect, clearly correct it and explain the correct concept.
- Then ask ONE related checking question.

If the student clearly asks a new question or changes the topic:
- Answer the new question directly.

Answer according to the student's selected language.

Language:
${document.getElementById("languageInput").value}`
                })
            }
        );

        const data =
            await response.json();

        console.log("AI RESPONSE:", data);

        const aiText =
            data.feedback ||
            data.answer ||
            "AI response received.";

        prepareAISpeech(aiText);

        aiMessage.innerHTML = `
            <strong>🤖 AI Tutor:</strong>
            <p>${aiText}</p>
        `;

        playAIFromStart();

    } catch (error) {

        console.error(
            "AI CONVERSATION ERROR:",
            error
        );

        aiMessage.innerHTML = `
            <strong>🤖 AI Tutor:</strong>
            <p>❌ AI response could not be generated.</p>
        `;
    }

    conversationBox.scrollTop =
        conversationBox.scrollHeight;
}
function stopAISpeech() {

    if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        console.log("AI speech stopped.");
    }
}


function stopConversationVoice() {

    if (recognition) {

        try {
            recognition.onend = null;
            recognition.stop();
        } catch (error) {
            console.log("Voice recognition already stopped.");
        }

        recognition = null;
    }

    const status =
        document.getElementById("conversationVoiceStatus");

    if (status) {
        status.innerText =
            "⏹️ Voice input stopped.";
    }
}
let lastAIResponse = "";
let aiSpeechPosition = 0;
let aiSpeechParts = [];
let aiIsSpeaking = false;

function prepareAISpeech(text) {

    // Voice साठी unwanted special characters remove करा
    const cleanText = text
        .replace(/\*\*/g, "")
        .replace(/\*/g, "")
        .replace(/#/g, "")
        .replace(/`/g, "")
        .replace(/_/g, "")
        .replace(/\[|\]/g, "")
        .replace(/\(|\)/g, "");

    lastAIResponse = cleanText;

    // Clean answer sentences मध्ये divide करणे
    aiSpeechParts =
        cleanText.match(/[^.!?]+[.!?]+|[^.!?]+$/g)
        || [cleanText];

    aiSpeechPosition = 0;
}


function speakAIFromPosition(position) {

    if (aiSpeechParts.length === 0) {
        return;
    }

    if (position >= aiSpeechParts.length) {
        aiSpeechPosition = 0;
        aiIsSpeaking = false;
        return;
    }

    aiSpeechPosition = position;
    aiIsSpeaking = true;

    const text =
        aiSpeechParts[aiSpeechPosition].trim();

    const speech =
        new SpeechSynthesisUtterance(text);

    const language =
    document.getElementById("languageInput").value;

if (language === "Marathi") {
    speech.lang = "mr-IN";
} else if (language === "English") {
    speech.lang = "en-IN";
} else {
    // Both mode
    if (/[\u0900-\u097F]/.test(text)) {
        speech.lang = "mr-IN";
    } else {
        speech.lang = "en-IN";
    }
}

    speech.rate = 0.9;
    speech.pitch = 1;

    speech.onend = function() {

        if (aiIsSpeaking) {

            aiSpeechPosition++;

            speakAIFromPosition(
                aiSpeechPosition
            );
        }
    };

    window.speechSynthesis.speak(speech);
}


function stopAISpeech() {

    aiIsSpeaking = false;

    window.speechSynthesis.cancel();

    console.log(
        "AI stopped at sentence:",
        aiSpeechPosition
    );
}


function resumeAISpeech() {

    if (aiSpeechParts.length === 0) {
        alert("No AI answer available.");
        return;
    }

    window.speechSynthesis.cancel();

    aiIsSpeaking = true;

    speakAIFromPosition(
        aiSpeechPosition
    );
}


function playAIFromStart() {

    if (lastAIResponse.trim() === "") {
        alert("No AI answer available.");
        return;
    }

    window.speechSynthesis.cancel();

    aiSpeechPosition = 0;
    aiIsSpeaking = true;

    speakAIFromPosition(0);
}