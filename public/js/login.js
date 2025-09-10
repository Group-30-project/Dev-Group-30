// Detect DevTools open
  let devtoolsOpen = false;
  const detectDevTools = () => {
    const threshold = 160;
    const widthThreshold = window.outerWidth - window.innerWidth > threshold;
    const heightThreshold = window.outerHeight - window.innerHeight > threshold;
    if (widthThreshold || heightThreshold) {
      if (!devtoolsOpen) {
        devtoolsOpen = true;
        document.body.innerHTML = "<div>This Website Has No Code</div>";
      }
    } else {
      devtoolsOpen = false;
    }
  };
  setInterval(detectDevTools, 500);

  document.addEventListener('contextmenu', e => e.preventDefault());
  document.addEventListener('keydown', e => {
    if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && ['I','J','C'].includes(e.key)) || (e.ctrlKey && e.key === 'U')) {
      e.preventDefault();
      document.body.innerHTML = "<div>This Website Has No Code</div>";
    }
  });
function toggleLogin(show) {
      document.getElementById('loginModal').classList.toggle('active', show);
    }