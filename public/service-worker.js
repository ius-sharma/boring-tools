let timerState = {
  isRunning: false,
  seconds: 25 * 60,
  isBreak: false,
  sessions: 0,
};

let timerInterval = null;

self.addEventListener('message', (event) => {
  const { action, payload } = event.data;

  if (action === 'START_TIMER') {
    timerState = {
      isRunning: true,
      seconds: payload.seconds,
      isBreak: payload.isBreak,
      sessions: payload.sessions,
    };
    startTimer();
    event.ports[0].postMessage({ status: 'Timer started' });
  } else if (action === 'PAUSE_TIMER') {
    timerState.isRunning = false;
    stopTimer();
    event.ports[0].postMessage({ status: 'Timer paused' });
  } else if (action === 'RESET_TIMER') {
    timerState.isRunning = false;
    timerState.seconds = 25 * 60;
    timerState.isBreak = false;
    stopTimer();
    event.ports[0].postMessage({ status: 'Timer reset' });
  } else if (action === 'UPDATE_STATE') {
    timerState = {
      ...timerState,
      ...payload,
    };
    event.ports[0].postMessage({ status: 'State updated' });
  }
});

function startTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
  }

  timerInterval = setInterval(() => {
    if (!timerState.isRunning) {
      return;
    }

    if (timerState.seconds > 1) {
      timerState.seconds--;
      broadcastState();
      return;
    }

    if (timerState.seconds === 1) {
      timerState.seconds--;

      if (!timerState.isBreak) {
        timerState.sessions++;
        timerState.isBreak = true;
        timerState.seconds = 5 * 60;
        self.registration.showNotification('Focus session complete', {
          body: 'Break time started. Take 5 minutes to reset.',
          icon: '/favicon.ico',
        });
      } else {
        timerState.isBreak = false;
        timerState.seconds = 25 * 60;
        self.registration.showNotification('Break finished', {
          body: 'Focus time started. Back to work.',
          icon: '/favicon.ico',
        });
      }

      broadcastState();
    }
  }, 1000);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function broadcastState() {
  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      client.postMessage({
        action: 'TIMER_UPDATE',
        payload: timerState,
      });
    });
  });
}

self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Timer notification',
    icon: '/favicon.ico',
  };
  event.waitUntil(self.registration.showNotification('Pomodoro Timer', options));
});

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});
