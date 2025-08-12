document.getElementById('search-form')?.addEventListener('submit', function(event) {
    event.preventDefault();
    const keyword = document.getElementById('job-keyword')?.value.toLowerCase();
    const jobCards = document.querySelectorAll('.job-card');

    if (keyword && jobCards.length) {
        jobCards.forEach(card => {
            const title = card.querySelector('h3')?.textContent.toLowerCase();
            const description = card.querySelector('.description')?.textContent.toLowerCase();
            if (title?.includes(keyword) || description?.includes(keyword)) {
                card.style.display = 'block';
                card.style.transition = 'opacity 0.5s ease';
                card.style.opacity = '1';
            } else {
                card.style.transition = 'opacity 0.5s ease';
                card.style.opacity = '0';
                setTimeout(() => card.style.display = 'none', 500);
            }
        });
    }
});