(() => {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const progress = document.querySelector(".reading-progress");
  const revealElements = document.querySelectorAll(".reveal");

  function updateReadingProgress() {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const amount = scrollable > 0 ? window.scrollY / scrollable : 0;
    progress.style.transform = `scaleX(${amount})`;
  }

  window.addEventListener("scroll", updateReadingProgress, { passive: true });
  window.addEventListener("resize", updateReadingProgress);
  updateReadingProgress();

  // These concise examples keep fact, interpretation, and belief distinct but discussable.
  const statements = [
    {
      context: "A meeting ends early",
      text: "The meeting ended at 3:00 p.m.",
      answer: "Fact",
      explanation: "This is a checkable claim about when the meeting ended. A reliable record could confirm or contradict it.",
    },
    {
      context: "A meeting ends early",
      text: "The meeting ended too soon.",
      answer: "Interpretation",
      explanation: "“Too soon” judges the timing against an expectation. People can agree on the time and disagree about what it means.",
    },
    {
      context: "A meeting ends early",
      text: "Meetings should always leave time for every voice.",
      answer: "Belief",
      explanation: "This expresses a principle about how meetings ought to work, rather than reporting an observable event.",
    },
  ];
  let questionIndex = 0;
  const statement = document.querySelector("#statement");
  const context = document.querySelector(".quiz-meta .small-label");
  const questionNumber = document.querySelector("#current-question");
  const feedback = document.querySelector("#feedback");
  const nextQuestion = document.querySelector("#next-question");
  const answerButtons = [...document.querySelectorAll(".answer-button")];

  function renderQuestion() {
    const question = statements[questionIndex];
    statement.textContent = question.text;
    context.textContent = question.context;
    questionNumber.textContent = String(questionIndex + 1).padStart(2, "0");
    feedback.textContent = "Choose one to see how the claim is framed.";
    feedback.classList.remove("is-correct");
    nextQuestion.hidden = true;
    answerButtons.forEach((button) => {
      button.disabled = false;
      button.setAttribute("aria-pressed", "false");
    });
  }

  answerButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const question = statements[questionIndex];
      const isCorrect = button.dataset.answer === question.answer;
      feedback.textContent = `${isCorrect ? "A strong fit." : `A reasonable thought, though ${question.answer.toLowerCase()} fits best here.`} ${question.explanation}`;
      feedback.classList.toggle("is-correct", isCorrect);
      answerButtons.forEach((option) => {
        option.disabled = true;
        option.setAttribute("aria-pressed", String(option === button));
      });
      nextQuestion.hidden = false;
      nextQuestion.innerHTML = questionIndex === statements.length - 1
        ? 'Start again <span aria-hidden="true">↺</span>'
        : 'Next statement <span aria-hidden="true">→</span>';
    });
  });

  nextQuestion.addEventListener("click", () => {
    questionIndex = (questionIndex + 1) % statements.length;
    renderQuestion();
  });

  const perspectiveCopy = {
    passenger: "The delay meant a missed interview—and an opportunity lost.",
    sister: "The delay meant a few more minutes together before a goodbye.",
    observer: "The train arrived twelve minutes late. The schedule can confirm that.",
  };
  const perspectiveResult = document.querySelector("#perspective-result");
  const perspectiveButtons = [...document.querySelectorAll(".perspective-button")];

  perspectiveButtons.forEach((button) => {
    button.addEventListener("click", () => {
      perspectiveButtons.forEach((option) => {
        option.setAttribute("aria-pressed", String(option === button));
      });
      perspectiveResult.textContent = perspectiveCopy[button.dataset.perspective];
    });
  });

  if (window.gsap && window.ScrollTrigger && window.ScrollSmoother && !prefersReducedMotion) {
    gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
    ScrollSmoother.create({
      wrapper: "#smooth-wrapper",
      content: "#smooth-content",
      smooth: 1.7,
      smoothTouch: 0.08,
      effects: false,
      normalizeScroll: true,
      onUpdate: updateReadingProgress,
    });

    gsap.utils.toArray(".reveal:not(h2):not(.definition-row)").forEach((element) => {
      gsap.fromTo(element, { autoAlpha: 0, y: 14 }, {
        autoAlpha: 1,
        y: 0,
        duration: 0.65,
        ease: "power2.out",
        scrollTrigger: {
          trigger: element,
          start: "top 88%",
          once: true,
        },
      });
    });

    const definitionRows = gsap.utils.toArray(".definition-row");
    gsap.set(definitionRows, { autoAlpha: 0, y: 18 });
    const definitionFadeDuration = 0.2;
    const definitionStep = 1;
    const definitionSequence = gsap.timeline({
      scrollTrigger: {
        trigger: ".definition-stage",
        start: "center center",
        end: () => `+=${window.innerHeight * definitionRows.length}`,
        pin: true,
        pinSpacing: true,
        scrub: 1.2,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });
    definitionRows.forEach((row, index) => {
      const start = index * definitionStep;
      definitionSequence.to(row, {
        autoAlpha: 1,
        y: 0,
        duration: definitionFadeDuration,
        ease: "none",
      }, start);
      definitionSequence.to(row, {
        autoAlpha: 0,
        y: -10,
        duration: definitionFadeDuration,
        ease: "none",
      }, start + definitionStep - definitionFadeDuration);
    });

    gsap.utils.toArray("h2.reveal").forEach((heading) => {
      gsap.fromTo(heading, { autoAlpha: 0.35, y: 22 }, {
        autoAlpha: 1,
        y: 0,
        ease: "none",
        scrollTrigger: {
          trigger: heading,
          start: "top 88%",
          end: "top 48%",
          scrub: 1.5,
          invalidateOnRefresh: true,
        },
      });
    });

    const definitionLinePaths = gsap.utils.toArray(".definition-lines path");
    definitionLinePaths.forEach((path) => {
      const length = path.getTotalLength();
      gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
    });
    const lineDrawing = gsap.timeline({
      scrollTrigger: {
        trigger: ".definition-lines",
        start: "top 65%",
        end: "bottom 30%",
        scrub: 1,
        invalidateOnRefresh: true,
      },
    });
    definitionLinePaths.forEach((path, index) => {
      lineDrawing.to(path, {
        strokeDashoffset: 0,
        duration: 1 + index * 0.025,
        ease: "none",
      }, 0);
    });

    gsap.fromTo(".tension-art path",
      { x: -180, autoAlpha: 0 },
      {
        x: 0,
        autoAlpha: 1,
        ease: "none",
        stagger: 0.025,
        scrollTrigger: {
          trigger: ".tension",
          start: "top 65%",
          end: "center 32%",
          scrub: 1,
        },
      },
    );

    gsap.to(".opening-orbit", {
      yPercent: 12,
      ease: "none",
      scrollTrigger: {
        trigger: ".opening",
        start: "top top",
        end: "bottom top",
        scrub: 0.8,
      },
    });

    gsap.fromTo(".tension-copy",
      { "--panel-opacity": 0.18 },
      {
        "--panel-opacity": 0.94,
        ease: "none",
        scrollTrigger: {
          trigger: ".tension",
          start: "top 88%",
          end: "center 52%",
          scrub: 1.2,
        },
        immediateRender: false,
      },
    );

  } else {
    revealElements.forEach((element) => {
      element.style.opacity = "1";
      element.style.transform = "none";
    });
  }
})();
