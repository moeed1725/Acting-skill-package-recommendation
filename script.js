/* ---------------- Data ---------------- */
const modules = {
  A: { name: "Basisjahr", price: 790, duration: 12 },
  B: { name: "Profijahr", price: 890, duration: 12 },
  C: { name: "Mentorship", price: 220, duration: 12 },
  D: { name: "Bewerbungsmaterial", price: 290, duration: 12 },
};

const rules = {
  basics_noCareer: ["A"],
  basics_unsure: ["A", "B"],
  basics_career: ["A", "B", "D"],
  basics_career_mentorship: ["A", "B", "C", "D"],
  already_basics: ["C", "D"],
};

const questions = [
  {
    id: "experience",
    text: "Do you already have acting experience?",
    options: ["Yes", "No", "Maybe"],
    feedback: {
      Yes: "Nice - you've already got some experience!",
      No: "Cool - let's start with the basics!",
      Maybe: "Interesting - let's explore together!",
    },
  },
  {
    id: "career",
    text: "Do you want to make acting your career?",
    options: ["Yes", "No", "Maybe"],
    feedback: {
      Yes: "Great - let's plan for the long run!",
      No: "Got it - personal growth matters too!",
      Maybe: "Alright - let's keep options open!",
    },
  },
  {
    id: "growth",
    text: "Or is it more about personal growth and improving your skills?",
    options: ["Yes", "No", "Maybe"],
    feedback: {
      Yes: "Perfect - learning is growth!",
      No: "Alright - let's find your path!",
      Maybe: "Sounds good - let's see!",
    },
  },
  {
    id: "mentorship",
    text: "Is long-term mentorship and sustainable guidance important to you?",
    options: ["Yes", "No", "Maybe"],
    feedback: {
      Yes: "Amazing - mentorship can change everything!",
      No: "Got it - let's keep it simple!",
      Maybe: "Alright - we'll consider flexibility!",
    },
  },
];

let step = 0;
let answers = {};
let feedbackTimeout = null;
let recommendedModules = [];
let selectedModules = [];

const appEl = document.getElementById('app');
const resultAppEl = document.getElementById('result-app');

function clearNode(node) {
  if (!node) {
    console.error("Node not found for clearing");
    return;
  }
  while (node.firstChild) node.removeChild(node.firstChild);
}

function calcPercent() {
  return Math.round(((step + 1) / questions.length) * 100);
}

function renderQuestionCard() {
  if (!appEl) {
    console.error("Element with id 'app' not found");
    return;
  }
  console.log("Rendering question card for step", step);
  clearNode(appEl);
  const q = questions[step];
  if (!q) {
    console.error("Question not found for step", step);
    return;
  }
  const totalSteps = questions.length;
  const percent = calcPercent();

  const wrap = document.createElement('div');
  wrap.className = 'd-flex flex-column align-items-center mt-5 min-vh-100 bg-white text-center position-relative w-100 fade-in';

  const backBtn = document.createElement('button');
  backBtn.className = 'btn btncolor shadow rounded-circle position-absolute top-0 start-0 m-3';
  backBtn.style.width = '48px';
  backBtn.style.height = '48px';
  backBtn.textContent = '←';
  backBtn.disabled = step === 0;
  backBtn.onclick = () => {
    if (step > 0) {
      step -= 1;
      renderQuestionCard();
    }
  };
  wrap.appendChild(backBtn);

  const progressWrap = document.createElement('div');
  progressWrap.className = 'position-relative mb-4';
  progressWrap.style.width = '200px';
  progressWrap.style.height = '200px';

  const size = 200;
  const radius = 90;
  const circumference = 2 * Math.PI * radius;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', size);
  svg.setAttribute('height', size);

  const bgCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  bgCircle.setAttribute('cx', size / 2);
  bgCircle.setAttribute('cy', size / 2);
  bgCircle.setAttribute('r', radius);
  bgCircle.setAttribute('stroke', '#e5e7eb');
  bgCircle.setAttribute('stroke-width', '10');
  bgCircle.setAttribute('fill', 'none');

  const fgCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  fgCircle.setAttribute('cx', size / 2);
  fgCircle.setAttribute('cy', size / 2);
  fgCircle.setAttribute('r', radius);
  fgCircle.setAttribute('stroke', '#FB5D5D');
  fgCircle.setAttribute('stroke-width', '10');
  fgCircle.setAttribute('fill', 'none');
  fgCircle.setAttribute('stroke-linecap', 'round');
  fgCircle.setAttribute('stroke-dasharray', String(circumference));
  const offset = circumference * (1 - percent / 100);
  fgCircle.setAttribute('stroke-dashoffset', String(offset));

  svg.appendChild(bgCircle);
  svg.appendChild(fgCircle);
  progressWrap.appendChild(svg);

  const pct = document.createElement('span');
  pct.className = 'position-absolute top-50 start-50 translate-middle customcolor fw-bold fs-3';
  pct.textContent = percent + '%';
  progressWrap.appendChild(pct);

  wrap.appendChild(progressWrap);

  const stepP = document.createElement('p');
  stepP.className = 'text-muted fw-semibold mb-2';
  stepP.textContent = `Step ${step + 1} of ${totalSteps}`;
  wrap.appendChild(stepP);

  const h2 = document.createElement('h2');
  h2.className = 'fw-bold mb-4 text-2xl';
  h2.textContent = q.text;
  wrap.appendChild(h2);

  const optionsWrap = document.createElement('div');
  optionsWrap.className = 'd-flex flex-row gap-3 justify-content-center flex-wrap';
  q.options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'btn btncolor px-4 py-2 shadow option-btn btn-gradient';
    btn.textContent = opt;
    btn.addEventListener('click', () => {
      btn.classList.add('subtle-scale');
      onAnswer(opt, q.feedback?.[opt] || '', feedbackRow);
      setTimeout(() => btn.classList.remove('subtle-scale'), 200);
    });
    optionsWrap.appendChild(btn);
  });
  wrap.appendChild(optionsWrap);

  const feedbackRow = document.createElement('p');
  feedbackRow.id = 'row-feedback';
  feedbackRow.className = 'mt-2 fade-in text-lg';
  feedbackRow.textContent = '';
  wrap.appendChild(feedbackRow);

  appEl.appendChild(wrap);
}

function onAnswer(answer, feedbackText, msgEl) {
  if (!msgEl) {
    console.error("Feedback element not found");
    return;
  }
  const q = questions[step];
  if (!q) {
    console.error("Question not found for step", step);
    return;
  }
  console.log("Answer recorded:", q.id, answer);
  answers[q.id] = answer;
  msgEl.textContent = feedbackText;
  msgEl.classList.add('fade-in');

  clearTimeout(feedbackTimeout);
  feedbackTimeout = setTimeout(() => {
    step += 1;
    if (step >= questions.length) {
      renderResultPage();
    } else {
      renderQuestionCard();
    }
  }, 1200);
}

function calculateResult() {
  const requiredKeys = ['experience', 'career'];
  if (!requiredKeys.every(key => key in answers)) {
    console.error("Incomplete answers:", answers);
    return { name: 'Error', modules: [], totalPrice: 0, duration: 0 };
  }
  let selectedModulesIds = [];
  const a = answers;
  if (a.experience === 'No' && a.career === 'No') {
    selectedModulesIds = rules.basics_noCareer;
  } else if (a.experience === 'No' && a.career === 'Maybe') {
    selectedModulesIds = rules.basics_unsure;
  } else if (a.experience === 'No' && a.career === 'Yes') {
    selectedModulesIds = (a.mentorship === 'Yes') ? rules.basics_career_mentorship : rules.basics_career;
  } else if (a.experience === 'Yes') {
    selectedModulesIds = rules.already_basics;
  }
  const moduleObjects = selectedModulesIds.map(id => modules[id]).filter(Boolean);
  const totalPrice = moduleObjects.reduce((sum, m) => sum + ((m.price || 0) * 12), 0);

  return { name: 'Recommended Package', modules: moduleObjects, totalPrice, duration: 12 };
}

function renderResultPage() {
  showPage('result');
  if (!resultAppEl) {
    console.error("Element with id 'result-app' not found");
    return;
  }

  console.log("Answers:", answers);
  const result = calculateResult();
  console.log("Result:", result);
  recommendedModules = result.modules.map(m => m.name);
  clearNode(resultAppEl);

  const page = document.createElement('div');
  page.className = 'd-flex justify-content-center align-items-center min-vh-100 w-100 bg-light fade-in';

  const card = document.createElement('div');
  card.className = 'card shadow-lg border-0 p-4 text-center';
  card.style.maxWidth = '500px';
  card.style.width = '100%';
  card.style.borderRadius = '15px';

  const title = document.createElement('h2');
  title.className = 'h4 fw-bold colordark mb-3';
  title.textContent = result.name;

  const expl = document.createElement('p');
  expl.className = 'mb-4 customcolor text-lg';
  expl.textContent = 'We recommend this package based on your answers:';

  const list = document.createElement('ul');
  list.className = 'list-group list-group-flush mb-4';
  result.modules.forEach(m => {
    const li = document.createElement('li');
    li.className = 'list-group-item colordark';
    li.innerHTML = `<strong>${m.name}</strong> <span class="customcolor">– CHF ${m.price}/month</span>`;
    list.appendChild(li);
  });

  const total = document.createElement('p');
  total.className = 'fw-bold fs-5 customcolor';
  total.innerHTML = `<strong>Total:</strong> CHF ${result.totalPrice} for ${result.duration} months`;

  const btnGroup = document.createElement('div');
  btnGroup.className = 'd-flex justify-content-center gap-3 mt-4';

  const proceedBtn = document.createElement('button');
  proceedBtn.className = 'btn btncolor px-4 fw-semibold btn-gradient';
  proceedBtn.textContent = 'Select Package';
  proceedBtn.onclick = () => {
    proceedBtn.classList.add('subtle-scale');
    proceedToPackages();
    setTimeout(() => proceedBtn.classList.remove('subtle-scale'), 200);
  };

  const restart = document.createElement('button');
  restart.className = 'btn btncolor px-4 fw-semibold btn-secondary';
  restart.textContent = 'Restart';
  restart.onclick = () => {
    restart.classList.add('subtle-scale');
    restartQuiz();
    setTimeout(() => restart.classList.remove('subtle-scale'), 200);
  };

  btnGroup.appendChild(proceedBtn);
  btnGroup.appendChild(restart);

  card.appendChild(title);
  card.appendChild(expl);
  card.appendChild(list);
  card.appendChild(total);
  card.appendChild(btnGroup);

  page.appendChild(card);
  resultAppEl.appendChild(page);
}

function proceedToPackages() {
  showPage('packages');
  recommendedModules.forEach(modName => {
    const modId = Object.keys(modules).find(key => modules[key].name === modName);
    if (modId) {
      document.getElementById(`module${modId}`).checked = true;
    }
  });
}

function proceedToSummary() {
  selectedModules = [];
  Object.keys(modules).forEach(key => {
    const checkbox = document.getElementById(`module${key}`);
    if (checkbox && checkbox.checked) {
      selectedModules.push(modules[key]);
    }
  });

  if (selectedModules.length === 0) {
    alert('Please select at least one package.');
    return;
  }

  showPage('summary');
  const listEl = document.getElementById('selected-packages-list');
  clearNode(listEl);
  selectedModules.forEach(m => {
    const li = document.createElement('li');
    li.className = 'list-group-item listback rounded-xl mb-2 p-2';
    li.textContent = `${m.name} – CHF ${m.price}/month`;
    listEl.appendChild(li);
  });

  const totalPrice = selectedModules.reduce((sum, m) => sum + ((m.price || 0) * 12), 0);
  document.getElementById('total-price').textContent = `Total: CHF ${totalPrice} for 12 months`;

  const pdfBtn = document.querySelector('#contact-form .btn-gradient:nth-child(1)');
  const emailBtn = document.querySelector('#contact-form .btn-gradient:nth-child(2)');
  pdfBtn.addEventListener('click', () => {
    pdfBtn.classList.add('subtle-scale');
    generatePDF();
    setTimeout(() => pdfBtn.classList.remove('subtle-scale'), 200);
  });
  emailBtn.addEventListener('click', () => {
    emailBtn.classList.add('subtle-scale');
    sendEmail();
    setTimeout(() => emailBtn.classList.remove('subtle-scale'), 200);
  });

  const restartBtn = document.querySelector('#summary .btn-secondary');
  if (restartBtn) {
    restartBtn.addEventListener('click', () => {
      restartBtn.classList.add('subtle-scale');
      restartQuiz();
      setTimeout(() => restartBtn.classList.remove('subtle-scale'), 200);
    });
  }
}
async function generatePDF(button) {
  console.log("Generating PDF...");
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const phone = document.getElementById('phone').value;

  if (!name || !email || !phone) {
    alert('Please fill in all contact fields.');
    return;
  }

  // Initialize jsPDF
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Load and scale logo
  const logo = new Image();
  logo.src = "./images/logo.jpeg";
  await new Promise(resolve => { logo.onload = resolve; });

  const pageWidth = doc.internal.pageSize.getWidth();
  const maxWidth = 80; // max logo width in points
  const imgWidth = Math.min(maxWidth, logo.width);
  const imgHeight = (logo.height * imgWidth) / logo.width;
  const x = (pageWidth - imgWidth) / 2; // center horizontally

  doc.addImage(logo, "JPEG", x, 10, imgWidth, imgHeight);

  // Title
  doc.setFont(' Roboto Slab', 'bold'); // Roboto Slab may not be available
  doc.setFontSize(16);
  doc.text('Acting Factory Summary', 10, imgHeight + 25);

  // Contact info
  doc.setFont(' Roboto Slab', 'normal');
  doc.setFontSize(12);
  let y = imgHeight + 35;
  doc.text(`Name: ${name}`, 10, y);
  doc.text(`E-Mail: ${email}`, 10, y + 10);
  doc.text(`Phone: ${phone}`, 10, y + 20);

  // Selected packages
  y += 35;
  doc.text('Selected packages:', 10, y);

  y += 10;
  let totalPrice = 0;
  selectedModules.forEach(m => {
    doc.text(`${m.name} – CHF ${m.price}/month`, 10, y);
    totalPrice += m.price * 12;
    y += 10;
  });

  doc.text(`Total: CHF ${totalPrice} for 12 months`, 10, y);

  // Trigger download
  doc.save('Summary.pdf');

  // Apply subtle-scale animation to the PDF button
  // const pdfBtn = document.querySelector('#contact-form .btn-gradient:nth-child(1)');
  button.classList.add('subtle-scale');
  setTimeout(() => button.classList.remove('subtle-scale'), 200);
}

function sendEmail() {
  console.log("Sending email...");
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const phoneInput = document.getElementById('phone');

  if (!nameInput || !emailInput || !phoneInput) {
    console.error("Form inputs not found:", {
      name: !!nameInput,
      email: !!emailInput,
      phone: !!phoneInput,
    });
    alert("Error: Form fields not found.");
    return;
  }

  const name = nameInput.value;
  const email = emailInput.value;
  const phone = phoneInput.value;

  if (!name || !email || !phone) {
    alert('Please fill out all contact fields.');
    return;
  }

  if (!Array.isArray(selectedModules) || selectedModules.length === 0) {
    console.warn("No selected modules:", selectedModules);
    alert("Bitte wähle mindestens ein Paket aus.");
    return;
  }

  const form = document.getElementById('contact-form');
  if (!form) {
    console.error("Form #contact-form not found.");
    alert("Error: Form not found.");
    return;
  }

  form.action = './backend.php';
  form.method = "post";
  // document.getElementById('action').value = 'email';
  // document.getElementById('selectedModules').value = JSON.stringify(selectedModules);
  console.log("Form data:", { name, email, phone, selectedModules });

  const emailBtn = document.querySelector('#contact-form .btn-gradient:nth-child(2)');
  if (emailBtn) {
    emailBtn.disabled = true;
    emailBtn.classList.add('subtle-scale');
    form.submit();
    setTimeout(() => {
      emailBtn.classList.remove('subtle-scale');
      emailBtn.disabled = false;
    }, 200);
  } else {
    console.warn("Email button not found.");
    form.submit();
  }
}

function showPage(id) {
  console.log("Showing page:", id);
  document.querySelectorAll('.page').forEach(p => {
    p.classList.remove('active', 'fade-in');
  });
  const page = document.getElementById(id);
  if (page) {
    page.classList.add('active', 'fade-in');
  } else {
    console.error("Page not found:", id);
  }
}

function startQuiz() {
  console.log("startQuiz called");
  step = 0;
  answers = {};
  showPage('questions');
  renderQuestionCard();
}

function restartQuiz() {
  console.log("restartQuiz called");
  step = 0;
  answers = {};
  recommendedModules = [];
  selectedModules = [];
  showPage('front');
}

// Initialize
showPage('front');