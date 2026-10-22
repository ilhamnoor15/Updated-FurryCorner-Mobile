// @ts-nocheck  (page script below is plain JavaScript, same pattern as the other pages)
import { Component } from '@angular/core';
import { LegacyPage } from '../../legacy/legacy-page';
import { HTML, CSS, TITLE, BODY_CLASS } from './rate-us.markup';

@Component({
  selector: 'app-rate-us',
  standalone: true,
  template: '<div class="legacy-root" #host></div>',
  styles: [':host, .legacy-root { display: contents; }'],
})
export class RateUsPage extends LegacyPage {
  protected markup = { html: HTML, css: CSS, title: TITLE, bodyClass: BODY_CLASS };

  protected run(location: any, __onReady: any): void {

const stars = Array.from(document.querySelectorAll('.rate-star'));
const chips = Array.from(document.querySelectorAll('.rate-chip'));
const textarea = document.getElementById('rateFeedback');
const count = document.getElementById('rateCount');
const submit = document.getElementById('rateSubmit');
const backdrop = document.getElementById('rateBackdrop');
const done = document.getElementById('rateDone');

let rating = 0;

function paintStars() {
    stars.forEach(star => {
        const value = Number(star.dataset.value);
        star.classList.toggle('active', value <= rating);
        star.setAttribute('aria-checked', String(value === rating));
    });
    submit.disabled = rating === 0;
}

stars.forEach(star => {
    star.addEventListener('click', () => {
        rating = Number(star.dataset.value);
        paintStars();
    });
});

chips.forEach(chip => {
    chip.addEventListener('click', () => {
        const on = chip.classList.toggle('selected');
        chip.setAttribute('aria-pressed', String(on));
    });
});

textarea.addEventListener('input', () => {
    count.textContent = String(textarea.value.length);
});

submit.addEventListener('click', () => {
    if (!rating) return;

    const feedback = {
        rating,
        likes: chips.filter(c => c.classList.contains('selected')).map(c => c.textContent.trim()),
        comment: textarea.value.trim(),
        submittedAt: new Date().toISOString(),
        userId: localStorage.getItem('loggedInUserId') || null
    };

    // TODO: send `feedback` to your backend / Supabase when a feedback table or endpoint exists.
    try {
        localStorage.setItem('furrycorner_last_feedback', JSON.stringify(feedback));
    } catch (e) {}

    backdrop.classList.add('open');
});

done.addEventListener('click', () => {
    backdrop.classList.remove('open');
    location.href = 'profile.html';
});

backdrop.addEventListener('click', event => {
    if (event.target === backdrop) {
        backdrop.classList.remove('open');
    }
});

  }
}