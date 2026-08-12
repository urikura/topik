// TOPIK 1671 Flashcard & Quiz Application Logic

document.addEventListener('DOMContentLoaded', () => {
  // Ensure data is loaded
  const dataset = window.TOPIK_DATA || [];
  if (dataset.length === 0) {
    alert('単語データの読み込みに失敗しました。');
    return;
  }

  // --- App State ---
  const state = {
    allWords: dataset,
    activeTab: 'quiz', // 'quiz', 'card', 'search'
    
    // Quiz Config
    mode: 'jp-to-kr', // 'jp-to-kr', 'kr-to-jp', 'mix'
    countSetting: '10', // '10', '20', '50', '100', 'all'
    autoAudio: true,
    soundFx: true,
    
    // Active Quiz Session
    quizQuestions: [],
    currentIndex: 0,
    score: 0,
    streak: 0,
    maxStreak: 0,
    userAnswers: [],
    isAnswered: false,

    // Flashcard Session
    fcList: [...dataset],
    fcIndex: 0,
    fcFlipped: false,

    // Dictionary Session
    searchQuery: ''
  };

  // --- DOM Elements ---
  const el = {
    // Nav Tabs
    tabQuizBtn: document.getElementById('tabQuizBtn'),
    tabCardBtn: document.getElementById('tabCardBtn'),
    tabSearchBtn: document.getElementById('tabSearchBtn'),
    logoBtn: document.getElementById('logoBtn'),
    soundToggleBtn: document.getElementById('soundToggleBtn'),
    soundIcon: document.getElementById('soundIcon'),

    // Sections
    setupSection: document.getElementById('setupSection'),
    quizSection: document.getElementById('quizSection'),
    resultsSection: document.getElementById('resultsSection'),
    flashcardSection: document.getElementById('flashcardSection'),
    searchSection: document.getElementById('searchSection'),

    // Setup Form Controls
    modeCards: document.querySelectorAll('.mode-card'),
    countBtns: document.querySelectorAll('.count-btn'),
    autoAudioToggle: document.getElementById('autoAudioToggle'),
    startQuizBtn: document.getElementById('startQuizBtn'),
    startFlashcardBtn: document.getElementById('startFlashcardBtn'),

    // Quiz UI
    quizProgressText: document.getElementById('quizProgressText'),
    quizProgressFill: document.getElementById('quizProgressFill'),
    scoreBadge: document.getElementById('scoreBadge'),
    streakBadge: document.getElementById('streakBadge'),
    streakCount: document.getElementById('streakCount'),
    promptWord: document.getElementById('promptWord'),
    promptRomaji: document.getElementById('promptRomaji'),
    playAudioBtn: document.getElementById('playAudioBtn'),
    optionsGrid: document.getElementById('optionsGrid'),
    feedbackBanner: document.getElementById('feedbackBanner'),
    feedbackIcon: document.getElementById('feedbackIcon'),
    feedbackMsg: document.getElementById('feedbackMsg'),
    feedbackText: document.getElementById('feedbackText'),
    nextQuestionBtn: document.getElementById('nextQuestionBtn'),

    // Results UI
    resultGrade: document.getElementById('resultGrade'),
    resultPercent: document.getElementById('resultPercent'),
    resultTitle: document.getElementById('resultTitle'),
    resultSubtitle: document.getElementById('resultSubtitle'),
    resCorrectCount: document.getElementById('resCorrectCount'),
    resScore: document.getElementById('resScore'),
    resMaxStreak: document.getElementById('resMaxStreak'),
    reviewList: document.getElementById('reviewList'),
    retryQuizBtn: document.getElementById('retryQuizBtn'),
    backToHomeBtn: document.getElementById('backToHomeBtn'),

    // Flashcard UI
    fcIndexText: document.getElementById('fcIndexText'),
    flashcardWrapper: document.getElementById('flashcardWrapper'),
    fcHangul: document.getElementById('fcHangul'),
    fcJapanese: document.getElementById('fcJapanese'),
    fcRomaji: document.getElementById('fcRomaji'),
    fcAudioBtnFront: document.getElementById('fcAudioBtnFront'),
    fcAudioBtnBack: document.getElementById('fcAudioBtnBack'),
    prevCardBtn: document.getElementById('prevCardBtn'),
    nextCardBtn: document.getElementById('nextCardBtn'),
    flipCardBtn: document.getElementById('flipCardBtn'),
    shuffleCardsBtn: document.getElementById('shuffleCardsBtn'),

    // Search UI
    dictSearchInput: document.getElementById('dictSearchInput'),
    dictTableBody: document.getElementById('dictTableBody')
  };

  // --- Audio Synthesis (Web Speech API & Web Audio FX) ---
  function speakKorean(text) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ko-KR';
    utterance.rate = 0.88; // clear speech pace
    
    // Pulse animation on play buttons
    const btns = [el.playAudioBtn, el.fcAudioBtnFront, el.fcAudioBtnBack];
    btns.forEach(b => b && b.classList.add('speaking'));

    utterance.onend = () => btns.forEach(b => b && b.classList.remove('speaking'));
    utterance.onerror = () => btns.forEach(b => b && b.classList.remove('speaking'));

    window.speechSynthesis.speak(utterance);
  }

  function playSoundFx(type) {
    if (!state.soundFx) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'correct') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.12); // G5
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
      } else if (type === 'wrong') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, ctx.currentTime); // A3
        osc.frequency.setValueAtTime(164.81, ctx.currentTime + 0.1); // E3
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.35);
      }
    } catch (e) {
      console.warn('Audio Context FX error:', e);
    }
  }

  // --- View Switching Utility ---
  function showSection(target) {
    [el.setupSection, el.quizSection, el.resultsSection, el.flashcardSection, el.searchSection].forEach(sec => {
      sec.classList.add('hidden');
    });
    target.classList.remove('hidden');

    // Update active tab styles
    [el.tabQuizBtn, el.tabCardBtn, el.tabSearchBtn].forEach(btn => btn.classList.remove('active'));
    if (target === el.setupSection || target === el.quizSection || target === el.resultsSection) {
      el.tabQuizBtn.classList.add('active');
    } else if (target === el.flashcardSection) {
      el.tabCardBtn.classList.add('active');
    } else if (target === el.searchSection) {
      el.tabSearchBtn.classList.add('active');
    }
  }

  // --- Setup Screen Event Handlers ---
  el.modeCards.forEach(card => {
    card.addEventListener('click', () => {
      el.modeCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      state.mode = card.dataset.mode;
    });
  });

  el.countBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      el.countBtns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      state.countSetting = btn.dataset.count;
    });
  });

  el.autoAudioToggle.addEventListener('change', (e) => {
    state.autoAudio = e.target.checked;
  });

  el.soundToggleBtn.addEventListener('click', () => {
    state.soundFx = !state.soundFx;
    el.soundIcon.textContent = state.soundFx ? '🔊' : '🔇';
  });

  // Navigation Tab Buttons
  el.tabQuizBtn.addEventListener('click', () => showSection(el.setupSection));
  el.logoBtn.addEventListener('click', () => showSection(el.setupSection));
  el.tabCardBtn.addEventListener('click', () => {
    initFlashcardSession();
    showSection(el.flashcardSection);
  });
  el.tabSearchBtn.addEventListener('click', () => {
    renderDictionary();
    showSection(el.searchSection);
  });

  el.startFlashcardBtn.addEventListener('click', () => {
    initFlashcardSession();
    showSection(el.flashcardSection);
  });

  // --- Quiz Generator Engine ---
  el.startQuizBtn.addEventListener('click', startNewQuiz);
  el.retryQuizBtn.addEventListener('click', startNewQuiz);
  el.backToHomeBtn.addEventListener('click', () => showSection(el.setupSection));

  function shuffleArray(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function startNewQuiz() {
    let totalQ = 10;
    if (state.countSetting === 'all') {
      totalQ = state.allWords.length;
    } else {
      totalQ = parseInt(state.countSetting, 10) || 10;
    }

    // Pick random sample of words for quiz
    const sampledWords = shuffleArray(state.allWords).slice(0, totalQ);

    state.quizQuestions = sampledWords.map(wordItem => {
      // Determine mode for this specific question
      let currentQMode = state.mode;
      if (currentQMode === 'mix') {
        currentQMode = Math.random() < 0.5 ? 'jp-to-kr' : 'kr-to-jp';
      }

      // Generate 3 distractors
      const pool = state.allWords.filter(w => w.id !== wordItem.id);
      const distractors = shuffleArray(pool).slice(0, 3);

      let targetPrompt = '';
      let targetRomaji = '';
      let correctOptionText = '';
      let choices = [];

      if (currentQMode === 'jp-to-kr') {
        targetPrompt = wordItem.japanese;
        targetRomaji = `(読み方: ${wordItem.romaji})`;
        correctOptionText = wordItem.hangul;

        choices = shuffleArray([wordItem, ...distractors]).map(item => ({
          text: item.hangul,
          romaji: item.romaji,
          isCorrect: item.id === wordItem.id,
          rawItem: item
        }));
      } else { // kr-to-jp
        targetPrompt = wordItem.hangul;
        targetRomaji = `(alphabet: ${wordItem.romaji})`;
        correctOptionText = wordItem.japanese;

        choices = shuffleArray([wordItem, ...distractors]).map(item => ({
          text: item.japanese,
          romaji: item.romaji,
          isCorrect: item.id === wordItem.id,
          rawItem: item
        }));
      }

      return {
        wordItem,
        mode: currentQMode,
        prompt: targetPrompt,
        romajiHint: targetRomaji,
        correctOptionText,
        choices
      };
    });

    state.currentIndex = 0;
    state.score = 0;
    state.streak = 0;
    state.maxStreak = 0;
    state.userAnswers = [];
    state.isAnswered = false;

    showSection(el.quizSection);
    renderQuestion();
  }

  function renderQuestion() {
    state.isAnswered = false;
    const q = state.quizQuestions[state.currentIndex];
    const total = state.quizQuestions.length;

    // Header info & progress
    el.quizProgressText.textContent = `第 ${state.currentIndex + 1} / ${total} 問`;
    const progressPercent = Math.round(((state.currentIndex) / total) * 100);
    el.quizProgressFill.style.width = `${progressPercent}%`;

    el.scoreBadge.textContent = `⭐ Score: ${state.score}`;
    el.streakCount.textContent = state.streak;

    // Prompt Card
    el.promptWord.textContent = q.prompt;
    el.promptRomaji.textContent = q.romajiHint;

    // Audio Play Button binding
    el.playAudioBtn.onclick = () => speakKorean(q.wordItem.hangul);

    // Auto audio playback if enabled
    if (state.autoAudio) {
      speakKorean(q.wordItem.hangul);
    }

    // Hide feedback banner
    el.feedbackBanner.classList.add('hidden');

    // Render 4 choices
    el.optionsGrid.innerHTML = '';
    const keys = ['A', 'B', 'C', 'D'];

    q.choices.forEach((choice, idx) => {
      const card = document.createElement('div');
      card.className = 'option-card';
      card.innerHTML = `
        <span class="option-key">${keys[idx]}</span>
        <span class="option-text">${choice.text}</span>
        <span class="option-status-icon"></span>
      `;

      card.addEventListener('click', () => handleOptionSelect(idx, card, choice, q));
      el.optionsGrid.appendChild(card);
    });
  }

  function handleOptionSelect(selectedIndex, selectedCard, selectedChoice, q) {
    if (state.isAnswered) return;
    state.isAnswered = true;

    const allCards = el.optionsGrid.querySelectorAll('.option-card');
    allCards.forEach(c => c.classList.add('disabled'));

    const isCorrect = selectedChoice.isCorrect;

    if (isCorrect) {
      selectedCard.classList.add('correct');
      selectedCard.querySelector('.option-status-icon').textContent = '✓';
      playSoundFx('correct');

      state.score += 10 + (state.streak * 2);
      state.streak += 1;
      if (state.streak > state.maxStreak) state.maxStreak = state.streak;

      el.feedbackText.className = 'feedback-text is-correct';
      el.feedbackIcon.textContent = '🎉';
      el.feedbackMsg.textContent = '正解です！';
    } else {
      selectedCard.classList.add('wrong');
      selectedCard.querySelector('.option-status-icon').textContent = '✕';
      playSoundFx('wrong');

      // Highlight correct card
      q.choices.forEach((ch, i) => {
        if (ch.isCorrect) {
          allCards[i].classList.add('correct');
          allCards[i].querySelector('.option-status-icon').textContent = '✓';
        }
      });

      state.streak = 0;
      el.feedbackText.className = 'feedback-text is-wrong';
      el.feedbackIcon.textContent = '❌';
      el.feedbackMsg.textContent = `不正解！ 正解: ${q.correctOptionText}`;
    }

    // Save answer record
    state.userAnswers.push({
      question: q,
      selectedChoice,
      isCorrect
    });

    // Update badges
    el.scoreBadge.textContent = `⭐ Score: ${state.score}`;
    el.streakCount.textContent = state.streak;

    // Show feedback banner
    el.feedbackBanner.classList.remove('hidden');
  }

  el.nextQuestionBtn.addEventListener('click', () => {
    state.currentIndex += 1;
    if (state.currentIndex < state.quizQuestions.length) {
      renderQuestion();
    } else {
      renderResults();
    }
  });

  // Keyboard shortcut listener for options 1-4 & Next
  document.addEventListener('keydown', (e) => {
    if (el.quizSection.classList.contains('hidden')) return;

    if (['1', '2', '3', '4'].includes(e.key) && !state.isAnswered) {
      const idx = parseInt(e.key, 10) - 1;
      const cards = el.optionsGrid.querySelectorAll('.option-card');
      if (cards[idx]) cards[idx].click();
    } else if ((e.key === 'Enter' || e.key === ' ') && state.isAnswered) {
      e.preventDefault();
      el.nextQuestionBtn.click();
    }
  });

  // --- Results Engine ---
  function renderResults() {
    showSection(el.resultsSection);

    const total = state.quizQuestions.length;
    const correctCount = state.userAnswers.filter(a => a.isCorrect).length;
    const accuracy = Math.round((correctCount / total) * 100);

    el.resCorrectCount.textContent = `${correctCount} / ${total}`;
    el.resScore.textContent = `${state.score} pts`;
    el.resMaxStreak.textContent = `${state.maxStreak} 回`;
    el.resultPercent.textContent = `${accuracy}%`;

    // Grade calculation
    let grade = 'C';
    let title = 'もう少し練習しましょう！';
    let subtitle = '反復練習でTOPIK単語を着実に暗記しましょう。';

    if (accuracy === 100) {
      grade = 'S';
      title = '🎉 パーフェクト全問正解！';
      subtitle = '素晴らしい成果です！TOPIK単語はバッチリです。';
    } else if (accuracy >= 80) {
      grade = 'A';
      title = '👏 大変素晴らしい成績です！';
      subtitle = '高い理解度を持っています。この調子で続けましょう！';
    } else if (accuracy >= 60) {
      grade = 'B';
      title = '👍 グッドチャレンジ！';
      subtitle = '間違えた単語を復習して、さらに高得点を目指しましょう。';
    }

    el.resultGrade.textContent = grade;
    el.resultTitle.textContent = title;
    el.resultSubtitle.textContent = subtitle;

    // Render Answer Review List
    el.reviewList.innerHTML = '';
    state.userAnswers.forEach((ans, idx) => {
      const q = ans.question;
      const item = document.createElement('div');
      item.className = `review-item ${ans.isCorrect ? 'is-correct-item' : 'is-wrong-item'}`;

      item.innerHTML = `
        <div class="review-word-info">
          <span style="font-weight: 700;">#${idx + 1}</span>
          <span class="review-hangul">${q.wordItem.hangul}</span>
          <span class="review-jp">${q.wordItem.japanese}</span>
          <span class="review-romaji">(${q.wordItem.romaji})</span>
        </div>
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <span>${ans.isCorrect ? '✅ 正解' : '❌ 不正解'}</span>
          <button class="small-audio-btn" title="音声再生">🔊</button>
        </div>
      `;

      item.querySelector('.small-audio-btn').onclick = (e) => {
        e.stopPropagation();
        speakKorean(q.wordItem.hangul);
      };

      el.reviewList.appendChild(item);
    });
  }

  // --- Flashcard Viewer Engine ---
  function initFlashcardSession() {
    state.fcIndex = 0;
    state.fcFlipped = false;
    renderFlashcard();
  }

  function renderFlashcard() {
    const item = state.fcList[state.fcIndex];
    if (!item) return;

    el.fcIndexText.textContent = `${state.fcIndex + 1} / ${state.fcList.length}`;
    el.fcHangul.textContent = item.hangul;
    el.fcJapanese.textContent = item.japanese;
    el.fcRomaji.textContent = `alphabet: ${item.romaji}`;

    el.flashcardWrapper.classList.remove('flipped');
    state.fcFlipped = false;
  }

  function toggleFlipCard() {
    state.fcFlipped = !state.fcFlipped;
    if (state.fcFlipped) {
      el.flashcardWrapper.classList.add('flipped');
    } else {
      el.flashcardWrapper.classList.remove('flipped');
    }
  }

  el.flashcardWrapper.addEventListener('click', toggleFlipCard);
  el.flipCardBtn.addEventListener('click', toggleFlipCard);

  el.fcAudioBtnFront.addEventListener('click', (e) => {
    e.stopPropagation();
    speakKorean(state.fcList[state.fcIndex].hangul);
  });

  el.fcAudioBtnBack.addEventListener('click', (e) => {
    e.stopPropagation();
    speakKorean(state.fcList[state.fcIndex].hangul);
  });

  el.nextCardBtn.addEventListener('click', () => {
    state.fcIndex = (state.fcIndex + 1) % state.fcList.length;
    renderFlashcard();
  });

  el.prevCardBtn.addEventListener('click', () => {
    state.fcIndex = (state.fcIndex - 1 + state.fcList.length) % state.fcList.length;
    renderFlashcard();
  });

  el.shuffleCardsBtn.addEventListener('click', () => {
    state.fcList = shuffleArray(state.fcList);
    state.fcIndex = 0;
    renderFlashcard();
  });

  // --- Dictionary / Search Engine ---
  function renderDictionary() {
    const query = state.searchQuery.trim().toLowerCase();
    const filtered = state.allWords.filter(item => {
      if (!query) return true;
      return item.hangul.toLowerCase().includes(query) ||
             item.japanese.toLowerCase().includes(query) ||
             item.romaji.toLowerCase().includes(query);
    });

    // Render up to 150 rows at a time for optimal performance
    const renderItems = filtered.slice(0, 150);

    el.dictTableBody.innerHTML = '';
    renderItems.forEach(item => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="color: var(--text-muted);">${item.id}</td>
        <td class="dict-hangul">${item.hangul}</td>
        <td>${item.japanese}</td>
        <td style="color: #a5b4fc;">${item.romaji}</td>
        <td>
          <button class="small-audio-btn" title="発音を聞く">🔊</button>
        </td>
      `;

      tr.querySelector('.small-audio-btn').onclick = () => speakKorean(item.hangul);
      el.dictTableBody.appendChild(tr);
    });
  }

  el.dictSearchInput.addEventListener('input', (e) => {
    state.searchQuery = e.target.value;
    renderDictionary();
  });

});
