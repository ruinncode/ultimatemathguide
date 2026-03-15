(function () {
  'use strict';

  // ============================================================
  //  PROGRESS TRACKING + GOOGLE SIGN-IN + PRACTICE RECOMMENDER
  // ============================================================

  const STORAGE_KEY = 'umg_progress';
  const USER_KEY = 'umg_user';

  // ── Skill map (compact) — maps problem prefix to topic area ──
  const TOPIC_MAP = {
    '1.1': 'Number Systems', '1.2': 'Algebra', '1.3': 'Functions', '1.4': 'Trigonometry',
    '2.1': 'Limits', '2.2': 'Epsilon-Delta', '2.3': 'Continuity',
    '3.1': 'Derivative Definition', '3.2': 'Differentiation Rules', '3.3': 'Applications of Derivatives',
    '4.1': 'Antiderivatives', '4.2': 'FTC', '4.3': 'Integration Techniques',
    '5.1': 'Series', '5.2': 'Taylor Series',
    '6.1': 'Parametric', '6.2': 'Polar',
    '7.1': 'Partial Derivatives', '7.2': 'Multiple Integrals', '7.3': 'Vector Calculus',
    '8.1': 'Matrices', '8.2': 'Vector Spaces', '8.3': 'Eigenvalues',
    '9.1': 'First-Order ODE', '9.2': 'Second-Order ODE',
    '10.1': 'Real Numbers', '10.2': 'Sequences (Analysis)',
    '11.1': 'Group Theory',
    '12.1': 'Probability', '12.2': 'Distributions',
    '13.1': 'Calculators', '13.2': 'Desmos', '13.3': 'Wolfram Alpha', '13.4': 'Mental Math',
  };

  const DIFFICULTY_ORDER = { easy: 0, medium: 1, hard: 2, 'ap style': 2, conceptual: 1 };

  // ── Data layer ──

  function loadProgress() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch { return {}; }
  }
  function saveProgress(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
  function recordAnswer(problemId, correct, topic) {
    const data = loadProgress();
    if (!data.answers) data.answers = {};
    if (!data.topics) data.topics = {};
    data.answers[problemId] = { correct, topic, ts: Date.now() };
    if (!data.topics[topic]) data.topics[topic] = { correct: 0, wrong: 0, attempts: [] };
    const t = data.topics[topic];
    if (correct) t.correct++; else t.wrong++;
    t.attempts.push({ id: problemId, correct, ts: Date.now() });
    if (t.attempts.length > 50) t.attempts = t.attempts.slice(-50);
    saveProgress(data);
    updateDashboardBadge();
  }

  function getTopicForProblem(pid) {
    const prefix = pid.replace(/^(\d+\.\d+).*/, '$1');
    return TOPIC_MAP[prefix] || 'General';
  }

  function getStats() {
    const data = loadProgress();
    const topics = data.topics || {};
    const totalCorrect = Object.values(topics).reduce((s, t) => s + t.correct, 0);
    const totalWrong = Object.values(topics).reduce((s, t) => s + t.wrong, 0);
    const total = totalCorrect + totalWrong;
    const weakTopics = Object.entries(topics)
      .map(([name, t]) => ({ name, correct: t.correct, wrong: t.wrong, total: t.correct + t.wrong, pct: t.correct / (t.correct + t.wrong) }))
      .filter(t => t.total >= 1)
      .sort((a, b) => a.pct - b.pct);
    const strongTopics = [...weakTopics].sort((a, b) => b.pct - a.pct);
    return { totalCorrect, totalWrong, total, weakTopics, strongTopics, topics };
  }

  // ── Google Sign-In (Firebase) ──

  let firebaseUser = null;

  function initFirebase() {
    if (!window.umgFirebaseConfig) return;
    if (typeof firebase === 'undefined') return;
    try {
      if (!firebase.apps.length) firebase.initializeApp(window.umgFirebaseConfig);
      firebase.auth().onAuthStateChanged(user => {
        firebaseUser = user;
        if (user) {
          saveUserInfo({ name: user.displayName, email: user.email, photo: user.photoURL, uid: user.uid });
          syncFromCloud(user.uid);
        }
        updateAuthUI();
      });
    } catch (e) { console.warn('Firebase init:', e); }
  }

  function signInWithGoogle() {
    if (typeof firebase === 'undefined') {
      alert('Google Sign-In requires Firebase. See the setup guide in the dashboard.');
      return;
    }
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider).catch(e => console.warn('Sign-in error:', e));
  }

  function signOut() {
    if (typeof firebase !== 'undefined' && firebase.auth) {
      firebase.auth().signOut();
    }
    firebaseUser = null;
    localStorage.removeItem(USER_KEY);
    updateAuthUI();
  }

  function saveUserInfo(info) { localStorage.setItem(USER_KEY, JSON.stringify(info)); }
  function getUserInfo() { try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; } }

  function syncToCloud(uid) {
    if (!uid || typeof firebase === 'undefined') return;
    try {
      firebase.firestore().collection('progress').doc(uid).set(loadProgress(), { merge: true });
    } catch (e) {}
  }
  function syncFromCloud(uid) {
    if (!uid || typeof firebase === 'undefined') return;
    try {
      firebase.firestore().collection('progress').doc(uid).get().then(doc => {
        if (doc.exists) {
          const cloud = doc.data();
          const local = loadProgress();
          const merged = mergeProgress(local, cloud);
          saveProgress(merged);
        }
      });
    } catch (e) {}
  }
  function mergeProgress(a, b) {
    const result = { answers: { ...b.answers, ...a.answers }, topics: {} };
    const allTopics = new Set([...Object.keys(a.topics || {}), ...Object.keys(b.topics || {})]);
    allTopics.forEach(t => {
      const at = (a.topics || {})[t] || { correct: 0, wrong: 0, attempts: [] };
      const bt = (b.topics || {})[t] || { correct: 0, wrong: 0, attempts: [] };
      result.topics[t] = {
        correct: Math.max(at.correct, bt.correct),
        wrong: Math.max(at.wrong, bt.wrong),
        attempts: [...(at.attempts || []), ...(bt.attempts || [])].sort((x, y) => x.ts - y.ts).slice(-50)
      };
    });
    return result;
  }

  // ── Make existing inline MC problems interactive ──

  function makeInlineMCInteractive() {
    document.querySelectorAll('.problem').forEach(problem => {
      if (problem.dataset.mcConverted) return;
      const question = problem.querySelector('.problem-question');
      const solution = problem.querySelector('.problem-solution');
      if (!question || !solution) return;

      const qHTML = question.innerHTML;
      const optionPattern = /\(([A-D])\)\s*/g;
      const matches = [...qHTML.matchAll(optionPattern)];
      if (matches.length < 3) return;

      const solText = solution.textContent;
      const answerMatch = solText.match(/Answer:\s*\(([A-D])\)/i);
      if (!answerMatch) return;
      const correctLetter = answerMatch[1];

      problem.dataset.mcConverted = '1';
      problem.dataset.correctAnswer = correctLetter;

      const allPs = question.querySelectorAll('p');
      const optionPs = [];
      allPs.forEach(p => { if (/\([A-D]\)/.test(p.textContent)) optionPs.push(p); });

      if (optionPs.length === 0) return;

      const optionsDiv = document.createElement('div');
      optionsDiv.className = 'inline-mc-options';

      const letters = [];
      const optTexts = [];
      optionPs.forEach(p => {
        const raw = p.innerHTML;
        const parts = raw.split(/(?=\([A-D]\)\s*)/);
        parts.forEach(part => {
          const m = part.match(/^\(([A-D])\)\s*(.*)/s);
          if (m) { letters.push(m[1]); optTexts.push(m[2].trim()); }
        });
      });

      letters.forEach((letter, i) => {
        const btn = document.createElement('button');
        btn.className = 'inline-mc-btn';
        btn.dataset.letter = letter;
        btn.innerHTML = '<span class="inline-mc-letter">' + letter + '</span><span class="inline-mc-text">' + optTexts[i] + '</span>';
        optionsDiv.appendChild(btn);
      });

      optionPs.forEach(p => p.style.display = 'none');
      question.appendChild(optionsDiv);

      const pid = (problem.querySelector('.problem-number') || {}).textContent || '';
      const showBtn = problem.querySelector('.show-solution-btn');

      optionsDiv.addEventListener('click', (e) => {
        const btn = e.target.closest('.inline-mc-btn');
        if (!btn || problem.classList.contains('inline-mc-answered')) return;

        problem.classList.add('inline-mc-answered');
        const chosen = btn.dataset.letter;
        const isCorrect = chosen === correctLetter;

        btn.classList.add(isCorrect ? 'inline-mc-correct' : 'inline-mc-wrong');
        const correctBtn = optionsDiv.querySelector(`[data-letter="${correctLetter}"]`);
        if (correctBtn) correctBtn.classList.add('inline-mc-correct');

        if (showBtn) { showBtn.click(); }

        const topic = getTopicForProblem(pid);
        recordAnswer(pid, isCorrect, topic);

        if (firebaseUser) syncToCloud(firebaseUser.uid);
      });

      if (typeof renderMathInElement === 'function') {
        renderMathInElement(optionsDiv, {
          delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '$', right: '$', display: false },
          ],
          throwOnError: false
        });
      }
    });
  }

  // ── Hook into MC quiz system (quizzes.js) ──

  function hookMCQuizzes() {
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('mc-check-btn')) {
        setTimeout(() => {
          const quiz = e.target.closest('.mc-quiz');
          if (!quiz) return;
          const chId = quiz.id.replace('mcq-', '');
          quiz.querySelectorAll('.mc-question.mc-answered').forEach(q => {
            const idx = q.dataset.idx;
            const correctIdx = parseInt(q.dataset.correct);
            const selected = q.querySelector('.mc-option.mc-selected');
            const isCorrect = selected && parseInt(selected.dataset.choice) === correctIdx;
            const qText = (q.querySelector('.mc-q-text') || {}).textContent || '';
            const topic = TOPIC_MAP[chId] || inferTopicFromText(qText);
            recordAnswer('mc-' + chId + '-' + idx + '-' + Date.now(), isCorrect, topic);
          });
          if (firebaseUser) syncToCloud(firebaseUser.uid);
        }, 200);
      }
    });
  }

  function inferTopicFromText(text) {
    const t = text.toLowerCase();
    for (const [, topic] of Object.entries(TOPIC_MAP)) {
      if (t.includes(topic.toLowerCase())) return topic;
    }
    return 'General';
  }

  // ── Hook into free-response "Show Solution" ──

  function hookFreeResponse() {
    document.addEventListener('click', (e) => {
      if (!e.target.classList.contains('show-solution-btn')) return;
      const problem = e.target.closest('.problem');
      if (!problem || problem.dataset.mcConverted || problem.dataset.frTracked) return;
      problem.dataset.frTracked = '1';
      const pid = (problem.querySelector('.problem-number') || {}).textContent || '';
      if (!pid) return;
      const topic = getTopicForProblem(pid);
      recordAnswer(pid, true, topic);
      if (firebaseUser) syncToCloud(firebaseUser.uid);
    });
  }

  // ── Dashboard Panel ──

  function createDashboard() {
    const panel = document.createElement('div');
    panel.className = 'progress-panel';
    panel.id = 'progress-panel';
    panel.innerHTML = `
      <div class="progress-panel-header">
        <h3>Your Progress</h3>
        <button class="progress-close" aria-label="Close">&times;</button>
      </div>
      <div class="progress-auth" id="progress-auth"></div>
      <div class="progress-stats" id="progress-stats"></div>
      <div class="progress-weak" id="progress-weak"></div>
      <div class="progress-recommend" id="progress-recommend"></div>
      <div class="progress-actions">
        <button class="progress-btn progress-btn-practice" id="start-practice-btn">Start Personalized Practice</button>
        <button class="progress-btn progress-btn-reset" id="reset-progress-btn">Reset Progress</button>
      </div>
    `;
    document.body.appendChild(panel);

    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'progress-toggle';
    toggleBtn.id = 'progress-toggle';
    toggleBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="12" width="4" height="9" rx="1"/><rect x="10" y="7" width="4" height="14" rx="1"/><rect x="17" y="3" width="4" height="18" rx="1"/></svg>';
    toggleBtn.title = 'Your Progress';
    document.body.appendChild(toggleBtn);

    const badge = document.createElement('span');
    badge.className = 'progress-badge';
    badge.id = 'progress-badge';
    toggleBtn.appendChild(badge);

    toggleBtn.addEventListener('click', () => {
      panel.classList.toggle('open');
      if (panel.classList.contains('open')) renderDashboard();
    });
    panel.querySelector('.progress-close').addEventListener('click', () => panel.classList.remove('open'));

    panel.querySelector('#reset-progress-btn').addEventListener('click', () => {
      if (confirm('Reset all progress? This cannot be undone.')) {
        localStorage.removeItem(STORAGE_KEY);
        renderDashboard();
        updateDashboardBadge();
      }
    });

    panel.querySelector('#start-practice-btn').addEventListener('click', () => {
      panel.classList.remove('open');
      startPersonalizedPractice();
    });
  }

  function updateAuthUI() {
    const authDiv = document.getElementById('progress-auth');
    if (!authDiv) return;
    const user = getUserInfo();
    if (user && firebaseUser) {
      authDiv.innerHTML = `<div class="auth-user"><img src="${user.photo || ''}" class="auth-avatar" onerror="this.style.display='none'"><span>${user.name || user.email}</span><button class="auth-signout" onclick="(${signOut})()">Sign Out</button></div>`;
    } else {
      authDiv.innerHTML = `<button class="auth-google-btn" id="google-signin-btn">
        <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
        Sign in with Google to sync progress
      </button>`;
      const btn = authDiv.querySelector('#google-signin-btn');
      if (btn) btn.addEventListener('click', signInWithGoogle);
    }
  }

  function renderDashboard() {
    const stats = getStats();
    const statsDiv = document.getElementById('progress-stats');
    const weakDiv = document.getElementById('progress-weak');
    const recDiv = document.getElementById('progress-recommend');

    if (stats.total === 0) {
      statsDiv.innerHTML = '<p class="progress-empty">Start answering questions to see your progress here!</p>';
      weakDiv.innerHTML = '';
      recDiv.innerHTML = '';
      return;
    }

    const pct = Math.round((stats.totalCorrect / stats.total) * 100);
    const color = pct >= 80 ? '#34d399' : pct >= 60 ? '#f0b832' : '#f87171';

    statsDiv.innerHTML = `
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value" style="color:${color}">${pct}%</div>
          <div class="stat-label">Accuracy</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${stats.total}</div>
          <div class="stat-label">Answered</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" style="color:#34d399">${stats.totalCorrect}</div>
          <div class="stat-label">Correct</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" style="color:#f87171">${stats.totalWrong}</div>
          <div class="stat-label">Wrong</div>
        </div>
      </div>
    `;

    if (stats.weakTopics.length > 0) {
      let html = '<h4>Topics by Performance</h4><div class="topic-bars">';
      stats.weakTopics.forEach(t => {
        const p = Math.round(t.pct * 100);
        const barColor = p >= 80 ? '#34d399' : p >= 60 ? '#f0b832' : '#f87171';
        html += `<div class="topic-bar-row">
          <span class="topic-bar-name">${t.name}</span>
          <div class="topic-bar-track"><div class="topic-bar-fill" style="width:${p}%;background:${barColor}"></div></div>
          <span class="topic-bar-pct" style="color:${barColor}">${p}% <span class="topic-bar-count">(${t.correct}/${t.total})</span></span>
        </div>`;
      });
      html += '</div>';
      weakDiv.innerHTML = html;
    } else {
      weakDiv.innerHTML = '';
    }

    const needsPractice = stats.weakTopics.filter(t => t.pct < 0.7).slice(0, 3);
    if (needsPractice.length > 0) {
      let html = '<h4>Recommended Practice</h4><div class="recommend-list">';
      needsPractice.forEach(t => {
        html += `<div class="recommend-item">
          <span class="recommend-topic">${t.name}</span>
          <span class="recommend-reason">${t.correct}/${t.total} correct — needs more practice</span>
        </div>`;
      });
      html += '</div>';
      recDiv.innerHTML = html;
    } else if (stats.total >= 5) {
      recDiv.innerHTML = '<div class="recommend-good">Great job! Keep practicing to reinforce your skills.</div>';
    } else {
      recDiv.innerHTML = '';
    }

    updateAuthUI();
  }

  function updateDashboardBadge() {
    const badge = document.getElementById('progress-badge');
    if (!badge) return;
    const stats = getStats();
    if (stats.total > 0) {
      badge.textContent = stats.total;
      badge.style.display = '';
    } else {
      badge.style.display = 'none';
    }
  }

  // ── Personalized Practice Mode ──

  function startPersonalizedPractice() {
    const stats = getStats();
    const data = loadProgress();
    const answers = data.answers || {};

    const wrongProblems = Object.entries(answers)
      .filter(([, v]) => !v.correct && !v.id?.startsWith('mc-'))
      .map(([id]) => id);

    const weakTopicNames = stats.weakTopics.filter(t => t.pct < 0.7).map(t => t.name);

    const allProblems = [];
    document.querySelectorAll('.problem').forEach(p => {
      const numEl = p.querySelector('.problem-number');
      const diffEl = p.querySelector('.difficulty-badge');
      if (!numEl) return;
      const pid = numEl.textContent.trim();
      const diff = (diffEl ? diffEl.textContent.trim().toLowerCase() : 'medium');
      const topic = getTopicForProblem(pid);
      allProblems.push({ pid, diff, topic, el: p });
    });

    let practiceSet = [];

    if (weakTopicNames.length > 0) {
      const weak = allProblems.filter(p => weakTopicNames.includes(p.topic));
      weak.sort((a, b) => (DIFFICULTY_ORDER[a.diff] || 1) - (DIFFICULTY_ORDER[b.diff] || 1));
      practiceSet = weak.slice(0, 10);
    }

    if (practiceSet.length < 5) {
      const unanswered = allProblems.filter(p => !answers[p.pid]);
      unanswered.sort((a, b) => (DIFFICULTY_ORDER[a.diff] || 1) - (DIFFICULTY_ORDER[b.diff] || 1));
      practiceSet = [...practiceSet, ...unanswered.slice(0, 10 - practiceSet.length)];
    }

    if (practiceSet.length === 0) {
      alert('Complete some problems first to get personalized practice!');
      return;
    }

    showPracticeOverlay(practiceSet);
  }

  function showPracticeOverlay(problems) {
    let existing = document.getElementById('practice-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'practice-overlay';
    overlay.id = 'practice-overlay';

    let html = `<div class="practice-overlay-inner">
      <div class="practice-overlay-header">
        <h3>Your Practice Session</h3>
        <span class="practice-overlay-count">${problems.length} questions · Easy → Hard</span>
        <button class="practice-overlay-close">&times;</button>
      </div>
      <div class="practice-overlay-body">`;

    problems.forEach((p, i) => {
      const diffClass = p.diff.replace(' ', '-').toLowerCase();
      html += `<div class="practice-overlay-item" data-pid="${p.pid}">
        <div class="practice-overlay-num">${i + 1}</div>
        <div class="practice-overlay-info">
          <span class="practice-overlay-pid">${p.pid}</span>
          <span class="difficulty-badge difficulty-${diffClass}" style="font-size:0.7rem;padding:2px 6px;">${p.diff}</span>
          <span class="practice-overlay-topic">${p.topic}</span>
        </div>
        <button class="practice-overlay-go" data-chapter="${p.pid.split('.')[0]}">Go →</button>
      </div>`;
    });

    html += '</div></div>';
    overlay.innerHTML = html;
    document.body.appendChild(overlay);

    overlay.querySelector('.practice-overlay-close').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.remove();
    });

    overlay.querySelectorAll('.practice-overlay-go').forEach(btn => {
      btn.addEventListener('click', () => {
        const pid = btn.closest('.practice-overlay-item').dataset.pid;
        overlay.remove();
        navigateToProblem(pid);
      });
    });
  }

  function navigateToProblem(pid) {
    const prefix = pid.split('.').slice(0, 2).join('.');
    const chapterMap = {
      '1': 'precalculus', '2': 'limits', '3': 'derivatives', '4': 'integration',
      '5': 'series', '6': 'parametric-polar', '7': 'multivariable', '8': 'linear-algebra',
      '9': 'diff-eq', '10': 'real-analysis', '11': 'abstract-algebra', '12': 'probability', '13': 'math-tools'
    };
    const ch = chapterMap[pid.split('.')[0]] || 'home';
    window.location.hash = ch;
    setTimeout(() => {
      const problems = document.querySelectorAll('.problem-number');
      problems.forEach(el => {
        if (el.textContent.trim() === pid) {
          el.closest('.problem').scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.closest('.problem').style.outline = '2px solid var(--accent)';
          setTimeout(() => { el.closest('.problem').style.outline = ''; }, 3000);
        }
      });
    }, 500);
  }

  // ── Init ──

  function init() {
    createDashboard();
    makeInlineMCInteractive();
    hookMCQuizzes();
    hookFreeResponse();
    updateDashboardBadge();
    initFirebase();

    const obs = new MutationObserver(() => {
      setTimeout(makeInlineMCInteractive, 300);
    });
    const main = document.querySelector('.main-content') || document.body;
    obs.observe(main, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class'] });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(init, 700));
  } else {
    setTimeout(init, 700);
  }

  window.umgSignOut = signOut;
})();
