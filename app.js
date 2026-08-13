// TOPIK Flashcard & Quiz Application Logic (Beginner & Intermediate Levels)

document.addEventListener('DOMContentLoaded', () => {
  // Load datasets (beginner: 1,671 words, intermediate: 2,662 words)
  const rawDatasets = window.TOPIK_DATASETS || {
    beginner: window.TOPIK_DATA || [],
    intermediate: []
  };

  if (!rawDatasets.beginner || rawDatasets.beginner.length === 0) {
    alert('単語データの読み込みに失敗しました。');
    return;
  }

  // --- App State ---
  const state = {
    datasets: rawDatasets,
    level: 'beginner', // 'beginner' (初級: 1671) or 'intermediate' (中級: 2662)
    allWords: rawDatasets.beginner,
    activeTab: 'quiz', // 'quiz', 'card', 'search'
    
    // Quiz Config
    mode: 'jp-to-kr', // 'jp-to-kr', 'kr-to-jp', 'mix'
    source: 'all', // 'all' or 'wrong'
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

    // Wrong Words Session
    wrongLevel: 'beginner',

    // Flashcard Session
    fcLevel: 'beginner',
    fcList: [...rawDatasets.beginner],
    fcIndex: 0,
    fcFlipped: false,

    // Dictionary Session
    dictLevel: 'beginner',
    searchQuery: ''
  };

  // --- DOM Elements ---
  const el = {
    // Nav Tabs
    tabQuizBtn: document.getElementById('tabQuizBtn'),
    tabWrongBtn: document.getElementById('tabWrongBtn'),
    navWrongBadge: document.getElementById('navWrongBadge'),
    tabCardBtn: document.getElementById('tabCardBtn'),
    tabSearchBtn: document.getElementById('tabSearchBtn'),
    logoBtn: document.getElementById('logoBtn'),
    soundToggleBtn: document.getElementById('soundToggleBtn'),
    soundIcon: document.getElementById('soundIcon'),

    // Sections
    setupSection: document.getElementById('setupSection'),
    quizSection: document.getElementById('quizSection'),
    resultsSection: document.getElementById('resultsSection'),
    wrongSection: document.getElementById('wrongSection'),
    flashcardSection: document.getElementById('flashcardSection'),
    searchSection: document.getElementById('searchSection'),

    // Setup Controls
    levelCards: document.querySelectorAll('.level-card'),
    modeCards: document.querySelectorAll('.mode-card'),
    sourceAllCard: document.getElementById('sourceAllCard'),
    sourceWrongCard: document.getElementById('sourceWrongCard'),
    sourceAllDesc: document.getElementById('sourceAllDesc'),
    sourceWrongDesc: document.getElementById('sourceWrongDesc'),
    countBtns: document.querySelectorAll('.count-btn'),
    countAllBtn: document.getElementById('countAllBtn'),
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
    retryWrongBtn: document.getElementById('retryWrongBtn'),
    retryQuizBtn: document.getElementById('retryQuizBtn'),
    backToHomeBtn: document.getElementById('backToHomeBtn'),

    // Wrong Section UI
    wrongLevelBeginner: document.getElementById('wrongLevelBeginner'),
    wrongLevelIntermediate: document.getElementById('wrongLevelIntermediate'),
    wrongTotalText: document.getElementById('wrongTotalText'),
    startWrongQuizBtn: document.getElementById('startWrongQuizBtn'),
    startWrongFcBtn: document.getElementById('startWrongFcBtn'),
    clearWrongBtn: document.getElementById('clearWrongBtn'),
    wrongList: document.getElementById('wrongList'),

    // Flashcard UI
    fcLevelBeginner: document.getElementById('fcLevelBeginner'),
    fcLevelIntermediate: document.getElementById('fcLevelIntermediate'),
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
    dictSubtitle: document.getElementById('dictSubtitle'),
    dictLevelBeginner: document.getElementById('dictLevelBeginner'),
    dictLevelIntermediate: document.getElementById('dictLevelIntermediate'),
    dictSearchInput: document.getElementById('dictSearchInput'),
    dictTableBody: document.getElementById('dictTableBody')
  };

  // --- Audio Synthesis (Web Speech API & Web Audio FX) ---
  function speakKorean(text) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ko-KR';
    utterance.rate = 0.88;
    
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
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
      } else if (type === 'wrong') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.setValueAtTime(164.81, ctx.currentTime + 0.1);
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
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    [el.setupSection, el.quizSection, el.resultsSection, el.wrongSection, el.flashcardSection, el.searchSection].forEach(sec => {
      if (sec) sec.classList.add('hidden');
    });
    if (target) target.classList.remove('hidden');

    [el.tabQuizBtn, el.tabWrongBtn, el.tabCardBtn, el.tabSearchBtn].forEach(btn => btn && btn.classList.remove('active'));
    if (target === el.setupSection || target === el.quizSection || target === el.resultsSection) {
      if (el.tabQuizBtn) el.tabQuizBtn.classList.add('active');
    } else if (target === el.wrongSection) {
      if (el.tabWrongBtn) el.tabWrongBtn.classList.add('active');
    } else if (target === el.flashcardSection) {
      if (el.tabCardBtn) el.tabCardBtn.classList.add('active');
    } else if (target === el.searchSection) {
      if (el.tabSearchBtn) el.tabSearchBtn.classList.add('active');
    }
  }

  // --- LocalStorage Manager for Wrong Words ---
  const WRONG_STORAGE_KEY = 'topik_wrong_words_v1';

  function getWrongData() {
    try {
      const raw = localStorage.getItem(WRONG_STORAGE_KEY);
      if (!raw) return { beginner: [], intermediate: [] };
      const parsed = JSON.parse(raw);
      return {
        beginner: Array.isArray(parsed.beginner) ? parsed.beginner : [],
        intermediate: Array.isArray(parsed.intermediate) ? parsed.intermediate : []
      };
    } catch (e) {
      console.warn('LocalStorage error:', e);
      return { beginner: [], intermediate: [] };
    }
  }

  function saveWrongData(data) {
    try {
      localStorage.setItem(WRONG_STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }

  function addWrongWord(level, wordId) {
    const data = getWrongData();
    const list = data[level] || [];
    if (!list.includes(wordId)) {
      list.push(wordId);
      data[level] = list;
      saveWrongData(data);
    }
    updateWrongUI();
  }

  function removeWrongWord(level, wordId) {
    const data = getWrongData();
    let list = data[level] || [];
    if (list.includes(wordId)) {
      data[level] = list.filter(id => id !== wordId);
      saveWrongData(data);
    }
    updateWrongUI();
  }

  function clearWrongWords(level) {
    const data = getWrongData();
    data[level] = [];
    saveWrongData(data);
    updateWrongUI();
  }

  function updateWrongUI() {
    const data = getWrongData();
    const currentLevelWrongCount = (data[state.level] || []).length;
    const totalWrongCount = (data.beginner || []).length + (data.intermediate || []).length;

    // Update Nav Tab Badge
    if (el.navWrongBadge) {
      if (totalWrongCount > 0) {
        el.navWrongBadge.textContent = totalWrongCount;
        el.navWrongBadge.classList.remove('hidden');
      } else {
        el.navWrongBadge.classList.add('hidden');
      }
    }

    // Update Setup Source Cards
    if (el.sourceWrongDesc) {
      el.sourceWrongDesc.textContent = `誤答リスト (${currentLevelWrongCount}件) から集中出題`;
    }
    if (el.sourceWrongCard) {
      if (currentLevelWrongCount === 0) {
        el.sourceWrongCard.classList.add('disabled');
        if (state.source === 'wrong') {
          state.source = 'all';
          if (el.sourceAllCard) el.sourceAllCard.classList.add('selected');
          el.sourceWrongCard.classList.remove('selected');
        }
      } else {
        el.sourceWrongCard.classList.remove('disabled');
      }
    }

    // If wrongSection is visible, render its list
    if (el.wrongSection && !el.wrongSection.classList.contains('hidden')) {
      renderWrongSection();
    }
  }

  // Helper to update question count button label
  function updateSetupCountLabel() {
    if (el.countAllBtn) {
      const count = state.allWords ? state.allWords.length : 1671;
      el.countAllBtn.textContent = `全 ${count.toLocaleString()} 問`;
    }
  }

  // --- Setup Level & Mode Event Handlers ---
  el.levelCards.forEach(card => {
    card.addEventListener('click', () => {
      el.levelCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      state.level = card.dataset.level;
      state.allWords = state.datasets[state.level] || state.datasets.beginner;
      state.fcLevel = state.level;
      state.dictLevel = state.level;
      updateSetupCountLabel();
      updateWrongUI();
    });
  });

  el.modeCards.forEach(card => {
    card.addEventListener('click', () => {
      el.modeCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      state.mode = card.dataset.mode;
    });
  });

  [el.sourceAllCard, el.sourceWrongCard].forEach(card => {
    if (!card) return;
    card.addEventListener('click', () => {
      const src = card.dataset.source;
      if (src === 'wrong') {
        const data = getWrongData();
        const currentCount = (data[state.level] || []).length;
        if (currentCount === 0) {
          const otherLevel = state.level === 'beginner' ? 'intermediate' : 'beginner';
          const otherCount = (data[otherLevel] || []).length;
          const currentLabel = state.level === 'beginner' ? '初級' : '中級';
          const otherLabel = otherLevel === 'beginner' ? '初級' : '中級';
          if (otherCount > 0) {
            alert(`【${currentLabel}】にはまだ誤答データがありません。\n（${otherLabel}には ${otherCount} 件の誤答があります。難易度を【${otherLabel}】に切り替えてお試しください！）`);
          } else {
            alert('現在、誤答ノートは空です！\nまずは「全単語から出題」でクイズに挑戦し、間違えた問題を自動記録させましょう！');
          }
          return;
        }
      }
      [el.sourceAllCard, el.sourceWrongCard].forEach(c => c && c.classList.remove('selected'));
      card.classList.add('selected');
      state.source = src;
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

  // Nav Tab Listeners
  if (el.tabQuizBtn) el.tabQuizBtn.addEventListener('click', () => showSection(el.setupSection));
  if (el.logoBtn) el.logoBtn.addEventListener('click', () => showSection(el.setupSection));
  if (el.tabWrongBtn) el.tabWrongBtn.addEventListener('click', () => {
    state.wrongLevel = state.level;
    updateWrongLevelButtons();
    renderWrongSection();
    showSection(el.wrongSection);
  });
  if (el.tabCardBtn) el.tabCardBtn.addEventListener('click', () => {
    initFlashcardSession(state.level);
    showSection(el.flashcardSection);
  });
  if (el.tabSearchBtn) el.tabSearchBtn.addEventListener('click', () => {
    state.dictLevel = state.level;
    updateDictLevelButtons();
    renderDictionary();
    showSection(el.searchSection);
  });

  if (el.startFlashcardBtn) el.startFlashcardBtn.addEventListener('click', () => {
    initFlashcardSession(state.level);
    showSection(el.flashcardSection);
  });

  // Initial setup call
  updateSetupCountLabel();
  updateWrongUI();

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
    state.allWords = state.datasets[state.level] || state.datasets.beginner;

    let candidatePool = [...state.allWords];
    if (state.source === 'wrong') {
      const wrongIds = getWrongData()[state.level] || [];
      candidatePool = state.allWords.filter(w => wrongIds.includes(w.id));
      if (candidatePool.length === 0) {
        alert('現在保存されている誤答単語がありません。全単語モードで出題します。');
        state.source = 'all';
        candidatePool = [...state.allWords];
        if (el.sourceAllCard) el.sourceAllCard.classList.add('selected');
        if (el.sourceWrongCard) el.sourceWrongCard.classList.remove('selected');
      }
    }

    let totalQ = 10;
    if (state.countSetting === 'all') {
      totalQ = candidatePool.length;
    } else {
      totalQ = Math.min(parseInt(state.countSetting, 10) || 10, candidatePool.length);
    }

    const sampledWords = shuffleArray(candidatePool).slice(0, totalQ);

    state.quizQuestions = sampledWords.map(wordItem => {
      let currentQMode = state.mode;
      if (currentQMode === 'mix') {
        currentQMode = Math.random() < 0.5 ? 'jp-to-kr' : 'kr-to-jp';
      }

      // Filter pool to guarantee unique option texts
      const pool = state.allWords.filter(w => {
        if (w.id === wordItem.id) return false;
        if (currentQMode === 'jp-to-kr') {
          return w.hangul.trim() !== wordItem.hangul.trim() && w.japanese.trim() !== wordItem.japanese.trim();
        } else {
          return w.japanese.trim() !== wordItem.japanese.trim() && w.hangul.trim() !== wordItem.hangul.trim();
        }
      });

      const shuffledPool = shuffleArray(pool);
      const chosenDistractors = [];
      const usedChoiceTexts = new Set();
      const targetText = currentQMode === 'jp-to-kr' ? wordItem.hangul.trim() : wordItem.japanese.trim();
      usedChoiceTexts.add(targetText);

      for (const d of shuffledPool) {
        const textVal = currentQMode === 'jp-to-kr' ? d.hangul.trim() : d.japanese.trim();
        if (!usedChoiceTexts.has(textVal)) {
          usedChoiceTexts.add(textVal);
          chosenDistractors.push(d);
          if (chosenDistractors.length === 3) break;
        }
      }

      let targetPrompt = '';
      let targetRomaji = '';
      let correctOptionText = '';
      let choices = [];

      if (currentQMode === 'jp-to-kr') {
        targetPrompt = wordItem.japanese;
        targetRomaji = `(読み方: ${wordItem.romaji})`;
        correctOptionText = wordItem.hangul;

        choices = shuffleArray([wordItem, ...chosenDistractors]).map(item => ({
          text: item.hangul,
          romaji: item.romaji,
          isCorrect: item.id === wordItem.id,
          rawItem: item
        }));
      } else {
        targetPrompt = wordItem.hangul;
        targetRomaji = `(alphabet: ${wordItem.romaji})`;
        correctOptionText = wordItem.japanese;

        choices = shuffleArray([wordItem, ...chosenDistractors]).map(item => ({
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

    el.quizProgressText.textContent = `第 ${state.currentIndex + 1} / ${total} 問`;
    const progressPercent = Math.round(((state.currentIndex) / total) * 100);
    el.quizProgressFill.style.width = `${progressPercent}%`;

    el.scoreBadge.textContent = `⭐ Score: ${state.score}`;
    el.streakCount.textContent = state.streak;

    el.promptWord.textContent = q.prompt;
    el.promptRomaji.textContent = q.romajiHint;

    el.playAudioBtn.onclick = () => speakKorean(q.wordItem.hangul);

    if (state.autoAudio) {
      speakKorean(q.wordItem.hangul);
    }

    el.feedbackBanner.classList.add('hidden');

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

      // If answering in wrong mode and correct, remove from wrong list (overcome!)
      if (state.source === 'wrong') {
        removeWrongWord(state.level, q.wordItem.id);
      }

      el.feedbackText.className = 'feedback-text is-correct';
      el.feedbackIcon.textContent = '🎉';
      el.feedbackMsg.textContent = '正解です！';
    } else {
      selectedCard.classList.add('wrong');
      selectedCard.querySelector('.option-status-icon').textContent = '✕';
      playSoundFx('wrong');

      // Record wrong answer in LocalStorage!
      addWrongWord(state.level, q.wordItem.id);

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

    state.userAnswers.push({
      question: q,
      selectedChoice,
      isCorrect
    });

    el.scoreBadge.textContent = `⭐ Score: ${state.score}`;
    el.streakCount.textContent = state.streak;

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

  document.addEventListener('keydown', (e) => {
    if (el.quizSection.classList.contains('hidden')) return;
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;

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

    // Retry Wrong Questions Button Handler
    const wrongAnswersInSession = state.userAnswers.filter(a => !a.isCorrect);
    if (el.retryWrongBtn) {
      if (wrongAnswersInSession.length > 0) {
        el.retryWrongBtn.classList.remove('hidden');
        el.retryWrongBtn.textContent = `⚠️ 今回間違えた ${wrongAnswersInSession.length} 問だけで再挑戦`;
        el.retryWrongBtn.onclick = () => {
          state.source = 'wrong';
          startNewQuiz();
        };
      } else {
        el.retryWrongBtn.classList.add('hidden');
      }
    }

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

  // --- Wrong Review Engine ---
  function updateWrongLevelButtons() {
    if (state.wrongLevel === 'beginner') {
      if (el.wrongLevelBeginner) el.wrongLevelBeginner.classList.add('active');
      if (el.wrongLevelIntermediate) el.wrongLevelIntermediate.classList.remove('active');
    } else {
      if (el.wrongLevelBeginner) el.wrongLevelBeginner.classList.remove('active');
      if (el.wrongLevelIntermediate) el.wrongLevelIntermediate.classList.add('active');
    }
  }

  if (el.wrongLevelBeginner) {
    el.wrongLevelBeginner.addEventListener('click', () => {
      state.wrongLevel = 'beginner';
      updateWrongLevelButtons();
      renderWrongSection();
    });
  }

  if (el.wrongLevelIntermediate) {
    el.wrongLevelIntermediate.addEventListener('click', () => {
      state.wrongLevel = 'intermediate';
      updateWrongLevelButtons();
      renderWrongSection();
    });
  }

  function renderWrongSection() {
    const wrongIds = getWrongData()[state.wrongLevel] || [];
    const allWords = state.datasets[state.wrongLevel] || state.datasets.beginner;
    const wrongWords = allWords.filter(w => wrongIds.includes(w.id));

    if (el.wrongTotalText) {
      const levelLabel = state.wrongLevel === 'beginner' ? '初級' : '中級';
      el.wrongTotalText.textContent = `${levelLabel} 保存中の誤答: ${wrongWords.length} 件`;
    }

    if (el.wrongList) {
      el.wrongList.innerHTML = '';
      if (wrongWords.length === 0) {
        el.wrongList.innerHTML = `
          <div class="wrong-empty-state">
            <div class="wrong-empty-icon">🎉</div>
            <div class="wrong-empty-title">誤答ノートは空です！</div>
            <p style="margin-bottom: 1.25rem;">クイズで間違えた問題がここに自動記録されます。</p>
            <button class="btn-primary" id="wrongEmptyStartBtn" style="padding: 0.65rem 1.25rem; font-size: 0.95rem;">
              <span>✏️</span> クイズを開始して単語をテストする
            </button>
          </div>
        `;
        const emptyBtn = document.getElementById('wrongEmptyStartBtn');
        if (emptyBtn) {
          emptyBtn.onclick = () => showSection(el.setupSection);
        }
        return;
      }

      wrongWords.forEach(item => {
        const div = document.createElement('div');
        div.className = 'wrong-item';
        div.innerHTML = `
          <div class="wrong-word-main">
            <span style="color: var(--text-muted); font-size: 0.85rem; font-weight: 700;">#${item.id}</span>
            <span class="wrong-hangul">${item.hangul}</span>
            <span class="wrong-japanese">${item.japanese}</span>
            <span class="wrong-romaji">(${item.romaji})</span>
          </div>
          <div class="wrong-actions">
            <button class="small-audio-btn" title="発音を聞く">🔊</button>
            <button class="wrong-overcome-btn">✓ 克服 (削除)</button>
          </div>
        `;

        div.querySelector('.small-audio-btn').onclick = (e) => {
          e.stopPropagation();
          speakKorean(item.hangul);
        };

        div.querySelector('.wrong-overcome-btn').onclick = (e) => {
          e.stopPropagation();
          removeWrongWord(state.wrongLevel, item.id);
        };

        el.wrongList.appendChild(div);
      });
    }
  }

  if (el.startWrongQuizBtn) {
    el.startWrongQuizBtn.addEventListener('click', () => {
      const wrongIds = getWrongData()[state.wrongLevel] || [];
      if (wrongIds.length === 0) {
        alert(`【${state.wrongLevel === 'beginner' ? '初級' : '中級'}】には保存された誤答単語がありません。\nまずは全単語クイズで単語テストを行いましょう！`);
        return;
      }
      state.level = state.wrongLevel;
      state.source = 'wrong';
      el.levelCards.forEach(c => {
        c.classList.toggle('selected', c.dataset.level === state.level);
      });
      startNewQuiz();
    });
  }

  if (el.startWrongFcBtn) {
    el.startWrongFcBtn.addEventListener('click', () => {
      const wrongIds = getWrongData()[state.wrongLevel] || [];
      const allWords = state.datasets[state.wrongLevel] || state.datasets.beginner;
      const wrongWords = allWords.filter(w => wrongIds.includes(w.id));
      if (wrongWords.length === 0) {
        alert(`【${state.wrongLevel === 'beginner' ? '初級' : '中級'}】には復習対象の誤答単語がありません。`);
        return;
      }
      state.fcLevel = state.wrongLevel;
      state.fcList = wrongWords;
      state.fcIndex = 0;
      state.fcFlipped = false;
      updateFcLevelButtons();
      renderFlashcard();
      showSection(el.flashcardSection);
    });
  }

  if (el.clearWrongBtn) {
    el.clearWrongBtn.addEventListener('click', () => {
      const wrongIds = getWrongData()[state.wrongLevel] || [];
      if (wrongIds.length === 0) {
        alert(`【${state.wrongLevel === 'beginner' ? '初級' : '中級'}】の誤答ノートはすでに空です。`);
        return;
      }
      if (confirm(`【${state.wrongLevel === 'beginner' ? '初級' : '中級'}】の誤答ノート（${wrongIds.length}件）を一括クリアしますか？`)) {
        clearWrongWords(state.wrongLevel);
      }
    });
  }

  // --- Flashcard Viewer Engine ---
  function updateFcLevelButtons() {
    if (state.fcLevel === 'beginner') {
      el.fcLevelBeginner.classList.add('active');
      el.fcLevelIntermediate.classList.remove('active');
    } else {
      el.fcLevelBeginner.classList.remove('active');
      el.fcLevelIntermediate.classList.add('active');
    }
  }

  function initFlashcardSession(targetLevel = 'beginner') {
    state.fcLevel = targetLevel;
    state.fcList = [...(state.datasets[targetLevel] || state.datasets.beginner)];
    state.fcIndex = 0;
    state.fcFlipped = false;
    updateFcLevelButtons();
    renderFlashcard();
  }

  el.fcLevelBeginner.addEventListener('click', () => initFlashcardSession('beginner'));
  el.fcLevelIntermediate.addEventListener('click', () => initFlashcardSession('intermediate'));

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
  function updateDictLevelButtons() {
    if (state.dictLevel === 'beginner') {
      el.dictLevelBeginner.classList.add('active');
      el.dictLevelIntermediate.classList.remove('active');
      if (el.dictSubtitle) el.dictSubtitle.textContent = '初級単語（全1,671語）を検索・音声再生できます';
    } else {
      el.dictLevelBeginner.classList.remove('active');
      el.dictLevelIntermediate.classList.add('active');
      if (el.dictSubtitle) el.dictSubtitle.textContent = '中級単語（全2,662語）を検索・音声再生できます';
    }
  }

  el.dictLevelBeginner.addEventListener('click', () => {
    state.dictLevel = 'beginner';
    updateDictLevelButtons();
    renderDictionary();
  });

  el.dictLevelIntermediate.addEventListener('click', () => {
    state.dictLevel = 'intermediate';
    updateDictLevelButtons();
    renderDictionary();
  });

  function renderDictionary() {
    const list = state.datasets[state.dictLevel] || state.datasets.beginner;
    const query = state.searchQuery.trim().toLowerCase();
    const filtered = list.filter(item => {
      if (!query) return true;
      return item.hangul.toLowerCase().includes(query) ||
             item.japanese.toLowerCase().includes(query) ||
             item.romaji.toLowerCase().includes(query);
    });

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
