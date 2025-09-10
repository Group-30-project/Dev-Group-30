// ====== Detect DevTools ======
let devtoolsOpen = false;
function detectDevTools() {
  const threshold = 160;
  if (
    window.outerWidth - window.innerWidth > threshold ||
    window.outerHeight - window.innerHeight > threshold
  ) {
    if (!devtoolsOpen) {
      devtoolsOpen = true;
      document.body.innerHTML = "<div style='text-align:center;margin-top:50px;font-size:24px;'>Access Denied 🚫</div>";
    }
  } else {
    devtoolsOpen = false;
  }
}
setInterval(detectDevTools, 500);

// ====== Disable Right Click ======
document.addEventListener('contextmenu', e => e.preventDefault());

// ====== Disable Certain Keys ======
document.addEventListener('keydown', e => {
  if (
    e.key === 'F12' ||
    (e.ctrlKey && e.shiftKey && ['I','J','C'].includes(e.key)) ||
    (e.ctrlKey && e.key === 'U')
  ) {
    e.preventDefault();
    document.body.innerHTML = "<div style='text-align:center;margin-top:50px;font-size:24px;'>Access Denied 🚫</div>";
  }
});

// ====== Star Rating System ======
document.querySelectorAll('.rating button').forEach(button => {
  button.addEventListener('click', async function (e) {
    e.preventDefault();
    const form = this.closest('form');
    const jobId = form.querySelector('input[name="job_id"]').value;
    const rating = form.querySelector('input[name="rating"]').value;

    // Send rating request via fetch
    const res = await fetch('/rate-job', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ job_id: jobId, rating: rating })
    });

    if (res.ok) {
      // Update UI instantly
      const stars = form.parentElement.querySelectorAll('button');
      stars.forEach((star, idx) => {
        star.classList.toggle('filled', idx < rating);
      });
    }
  });
});
