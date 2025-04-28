(function () {
  let count = 1;
  let quizData = [];
  let currentQuestionIndex = 0;
  let correctAnswers = 0;
  let selectedAnswer = "";
  let timeLeft = 500;
  let timer;

  const form = document.getElementById("quiz-form");
  const addBtn = document.getElementById("add-question");
  const buttonGroup = document.getElementById("button-group");
  const quizContainer = document.getElementById("quiz-container");
  const questionEl = document.getElementById("question");
  const optionsEl = document.getElementById("options");
  const nextBtn = document.getElementById("next-btn");
  const timerEl = document.getElementById("timer");

  addBtn.addEventListener("click", function () {
    count++;
    const template = document.querySelector(".question-block");
    const clone = template.cloneNode(true);
    clone.setAttribute("data-index", count);

    clone.querySelector(
      "label"
    ).firstChild.textContent = `Question ${count}:`;
    clone
      .querySelector('input[name^="question-"]')
      .setAttribute("name", `question-${count}`);

    const radios = clone.querySelectorAll('input[type="radio"]');
    const texts = clone.querySelectorAll('input[type="text"]');
    radios.forEach((r, i) => {
      r.setAttribute("name", `correct-${count}`);
      r.setAttribute("value", i + 1);
      r.checked = false;
    });
    texts.forEach((t, i) => {
      if (i === 0) {
        t.setAttribute("name", `question-${count}`);
      } else {
        t.setAttribute("name", `q${count}-option-${i}`);
      }
      t.value = "";
    });
   form.insertBefore(clone, buttonGroup);
  });

  /////// delete icon 
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

  /////question numbers 
  function updateQuestionNumbers() {
    const questionBlocks = document.querySelectorAll(".question-block");
    questionBlocks.forEach((block, index) => {
      const label = block.querySelector(".question-header label");
      if (label) {
        label.textContent = `Question ${index + 1}:`;
      }
      
      const radios = block.querySelectorAll('input[type="radio"]');
      radios.forEach(radio => {
        radio.name = `q${index + 1}`; 
      });
    });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const setup = document.querySelector(".cont"); 
    setup.style.display = "none";
    /////////////////////////////// quiz data
    //gather qu
    quizData = [];
    for (let i = 1; i <= count; i++) {
      const questionText = form.querySelector(
        `[name="question-${i}"]`
      ).value;

      // gather options
      const options = [
        form.querySelector(`[name="q${i}-option-1"]`).value,
        form.querySelector(`[name="q${i}-option-2"]`).value,
        form.querySelector(`[name="q${i}-option-3"]`).value,
        form.querySelector(`[name="q${i}-option-4"]`).value,
      ];

      // gather corect ans
      const correctOption = form.querySelector(
        `[name="correct-${i}"]:checked`
      ).value;

      quizData.push({
        question: questionText,
        options: options,
        correctAnswer: options[correctOption - 1],
      });
    }
   
    startQuiz();
  });
  /////////////// fun2start
  function startQuiz() {
    form.style.display = "none";
    quizContainer.style.display = "block";
    showQuestion();
    startTimer();
  }
  ///////////////timer
  function startTimer() {
    document.getElementById("timer").style.display = "block";
    timer = setInterval(() => {
      timeLeft--; 
      const minutes = Math.floor(timeLeft / 60); 
      const seconds = timeLeft % 60; 
      timerEl.textContent = `Time: ${minutes}m ${seconds}s`;
      if (timeLeft <= 0) {
        clearInterval(timer);
        endQuiz();
      }
    }, 1000);
  }
  /////////////////SHOW
  function showQuestion() {
    const currentQuestion = quizData[currentQuestionIndex];
    questionEl.textContent = currentQuestion.question;
    optionsEl.innerHTML = "";

    currentQuestion.options.forEach((option) => {
      const button = document.createElement("button");
      button.textContent = option;
      button.onclick = () => {
        selectedAnswer = option;
        Array.from(optionsEl.children).forEach(
          (btn) => (btn.style.backgroundColor = "")
        );
        button.style.backgroundColor = "#a8dadc";
      };
      optionsEl.appendChild(button);
    });
  }

  function nextQuestion() {
    if (selectedAnswer === "") {
      alert("Please select an answer!");
      return;
    }

    if (selectedAnswer === quizData[currentQuestionIndex].correctAnswer) {
      correctAnswers++;
    }

    selectedAnswer = "";
    currentQuestionIndex++;

    if (currentQuestionIndex < quizData.length) {
      showQuestion();
    } else {
      endQuiz();
    }
  }

  function endQuiz() {
    clearInterval(timer);
    quizContainer.style.display = "none";
    timerEl.style.display = "none";

    const resultContainer = document.getElementById("result");
    const scoreEl = document.getElementById("score");

    const totalQuestions = quizData.length;
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);

    scoreEl.innerHTML = `You answered ${correctAnswers} out of ${totalQuestions} questions correctly. <br> Your score: ${percentage}%`;
    resultContainer.style.display = "block";

    const goHomeBtn = document.getElementById("go-home-btn");
    goHomeBtn.style.display = "block";
    goHomeBtn.addEventListener("click", function() {
    window.location.href = "index.html"; 
    });

  }

  nextBtn.addEventListener("click", nextQuestion);
})();
