(function () {
  let count = 1;
  let quizData = [];
  let currentQuestionIndex = 0;
  let correctAnswers = 0;
  let selectedAnswer = "";
  let selectedAnswers = []; 
  let timeLeft = 480; 
  let timer;

  const form = document.getElementById("quiz-form");
  const addBtn = document.getElementById("add-question");
  const buttonGroup = document.getElementById("button-group");
  const quizContainer = document.getElementById("quiz-container");
  const questionEl = document.getElementById("question");
  const optionsEl = document.getElementById("options");
  const prevBtn = document.getElementById("prev-btn");
  const nextBtn = document.getElementById("next-btn");
  const submitBtn = document.getElementById("submit-btn");
  const timerEl = document.getElementById("timer");

  addBtn.addEventListener("click", function () {
    count++;
    const template = document.querySelector(".question-block");
    const clone = template.cloneNode(true);
    clone.setAttribute("data-index", count);

    const questionLabel = clone.querySelector(".question-header label");
    questionLabel.firstChild.textContent = `Question ${count}:`;
    const questionInput = clone.querySelector('input[name^="question-"]');
    questionInput.setAttribute("name", `question-${count}`);
    questionInput.value = "";

    const radios = clone.querySelectorAll('.options input[type="radio"]');
    const optionInputs = clone.querySelectorAll('.options input[type="text"]');
    radios.forEach((radio, i) => {
      radio.setAttribute("name", `correct-${count}`);
      radio.setAttribute("value", i + 1);
      radio.checked = false;
    });
    optionInputs.forEach((input, i) => {
      input.setAttribute("name", `q${count}-option-${i + 1}`);
      input.value = "";
    });

    form.insertBefore(clone, buttonGroup);
    console.log(`Added question block ${count}`); 
  });

  form.addEventListener("click", function (e) {
    if (e.target.classList.contains("delete-btn")) {
      e.preventDefault();
      const questionBlock = e.target.closest(".question-block");
      const allBlocks = document.querySelectorAll(".question-block");

      if (allBlocks.length > 1) {
        questionBlock.remove();
      } else {
        const inputs = questionBlock.querySelectorAll('input[type="text"], input[type="radio"]');
        inputs.forEach(input => {
          if (input.type === "text") {
            input.value = "";
          } else if (input.type === "radio") {
            input.checked = false;
          }
        });
      }
      updateQuestionNumbers();
      count = document.querySelectorAll(".question-block").length;
    }
  });

  function updateQuestionNumbers() {
    const questionBlocks = document.querySelectorAll(".question-block");
    questionBlocks.forEach((block, index) => {
      const newIndex = index + 1;
      block.setAttribute("data-index", newIndex);
      const label = block.querySelector(".question-header label");
      if (label) {
        label.firstChild.textContent = `Question ${newIndex}:`;
      }

      const questionInput = block.querySelector('input[type="text"][name^="question-"]');
      if (questionInput) {
        questionInput.setAttribute("name", `question-${newIndex}`);
      }

      const radios = block.querySelectorAll('input[type="radio"]');
      radios.forEach(radio => {
        radio.setAttribute("name", `correct-${newIndex}`);
      });

      const optionInputs = block.querySelectorAll('.options input[type="text"]');
      optionInputs.forEach((input, i) => {
        input.setAttribute("name", `q${newIndex}-option-${i + 1}`);
      });
    });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const setup = document.querySelector(".cont");
    setup.style.display = "none";
    // Gather quiz data
    quizData = [];
    for (let i = 1; i <= count; i++) {
      const questionText = form.querySelector(
        `[name="question-${i}"]`
      ).value;

      // Gather options
      const options = [
        form.querySelector(`[name="q${i}-option-1"]`).value,
        form.querySelector(`[name="q${i}-option-2"]`).value,
        form.querySelector(`[name="q${i}-option-3"]`).value,
        form.querySelector(`[name="q${i}-option-4"]`).value,
      ];

      // collect correct answer
      const correctOption = form.querySelector(
        `[name="correct-${i}"]:checked`
      ).value;

      quizData.push({
        question: questionText,
        options: options,
        correctAnswer: options[correctOption - 1],
      });
    }

    selectedAnswers = new Array(quizData.length).fill("");
    startQuiz();
  });

  // Function to start quiz
  function startQuiz() {
    form.style.display = "none";
    quizContainer.style.display = "block";
    updateButtonStates();
    showQuestion();
    startTimer();
  }

  // Timer
  function startTimer() {
    timer = setInterval(() => {
      timeLeft--;
      timerEl.textContent = `Time Left: ${Math.floor(timeLeft / 60)}m ${timeLeft % 60}s`;
      if (timeLeft <= 0) {
        clearInterval(timer);
        endQuiz();
      }
    }, 1000);
  }

  function showQuestion() {
    const currentQuestion = quizData[currentQuestionIndex];
    questionEl.textContent = currentQuestion.question;
    optionsEl.innerHTML = "";

    currentQuestion.options.forEach((option) => {
      const button = document.createElement("button");
      button.textContent = option;
      button.onclick = () => {
        selectedAnswer = option;
        selectedAnswers[currentQuestionIndex] = option;
        Array.from(optionsEl.children).forEach(
          (btn) => (btn.style.backgroundColor = "")
        );
        button.style.backgroundColor = "#a8dadc";
        updateButtonStates();
      };
      if (option === selectedAnswers[currentQuestionIndex]) {
        button.style.backgroundColor = "#a8dadc";
      }
      optionsEl.appendChild(button);
    });

    updateButtonStates();
  }

  function updateButtonStates() {
    prevBtn.disabled = currentQuestionIndex === 0;
    nextBtn.disabled = currentQuestionIndex === quizData.length - 1 && selectedAnswers[currentQuestionIndex] === "";
    submitBtn.disabled = selectedAnswers.includes("");
  }

  function prevQuestion() {
    if (currentQuestionIndex > 0) {
      selectedAnswers[currentQuestionIndex] = selectedAnswer;
      currentQuestionIndex--;
      selectedAnswer = selectedAnswers[currentQuestionIndex] || "";
      showQuestion();
    }
  }

  function nextQuestion() {
    if (selectedAnswer === "" && selectedAnswers[currentQuestionIndex] === "") {
      alert("Please select an answer!");
      return;
    }

    selectedAnswers[currentQuestionIndex] = selectedAnswer;

    if (currentQuestionIndex < quizData.length - 1) {
      currentQuestionIndex++;
      selectedAnswer = selectedAnswers[currentQuestionIndex] || "";
      showQuestion();
    } else {
      endQuiz();
    }
  }

  function submitQuiz() {
    if (selectedAnswers.includes("")) {
      alert("Please answer all questions before submitting!");
      return;
    }
    endQuiz();
  }

  function endQuiz() {
    clearInterval(timer);
    quizContainer.style.display = "none";

    const resultContainer = document.getElementById("result");
    const scoreEl = document.getElementById("score");

    correctAnswers = 0;
    selectedAnswers.forEach((answer, index) => {
      if (answer === quizData[index].correctAnswer) {
        correctAnswers++;
      }
    });

    const totalQuestions = quizData.length;
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);

    scoreEl.innerHTML = `You answered ${correctAnswers} out of ${totalQuestions} questions correctly. <br> Your score: ${percentage}%`;
    resultContainer.style.display = "block";
  }

  prevBtn.addEventListener("click", prevQuestion);
  nextBtn.addEventListener("click", nextQuestion);
  submitBtn.addEventListener("click", submitQuiz);
})();