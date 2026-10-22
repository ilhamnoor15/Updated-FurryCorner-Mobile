// @ts-nocheck
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { LegacyPage } from '../../legacy/legacy-page';
import { HTML, CSS, TITLE, BODY_CLASS } from './ai-assistant.markup';

const AI_API_URL =
  'https://furrycorner.online/FurryCorner_ESB/api/esb/gateway.php?service=ai&action=chat';

@Component({
  selector: 'app-ai-assistant',
  standalone: true,
  template: '<div class="legacy-root" #host></div>',
  styles: [':host, .legacy-root { display: contents; }']
})
export class AiAssistantPage extends LegacyPage {
  private router = inject(Router);

  protected markup = {
    html: HTML,
    css: CSS,
    title: TITLE,
    bodyClass: BODY_CLASS
  };

  protected run(location: any, __onReady: any): void {
    __onReady(() => {});

    const $ = (id: string) => document.getElementById(id);
    const body = $('aiBody');
    const msgs = $('aiMsgs');
    const form = $('aiForm') as HTMLFormElement;
    const input = $('aiInput') as HTMLInputElement;
    const send = $('aiSend') as HTMLButtonElement;
    const suggestions = $('aiSuggestions');

    const history: { role: 'user' | 'model'; text: string }[] = [];
    let busy = false;

    // Greeting with the first name, if we have it
    try {
      const u = JSON.parse(localStorage.getItem('loggedInUser') || 'null');
      const name = u?.firstName || u?.first_name || '';
      if (name) $('aiHi').textContent = 'Hi ' + name + ',';
    } catch {}

    const scrollDown = () => {
      if (body) body.scrollTop = body.scrollHeight;
    };

    const add = (text: string, cls: string) => {
      const d = document.createElement('div');
      d.className = 'ai-msg ' + cls;
      d.textContent = text; // textContent so model output can never inject HTML
      msgs.appendChild(d);
      scrollDown();
      return d;
    };

    const ask = async (raw: string) => {
      const text = raw.trim();
      if (!text || busy) return;

      busy = true;
      send.disabled = true;
      input.value = '';
      suggestions.hidden = true;
      add(text, 'me');
      const typing = add('Typing…', 'bot');

      try {
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), 30000);

        const res = await fetch(AI_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ message: text, history: history.slice(-10) }),
          signal: ctrl.signal
        });
        clearTimeout(timer);

        let data: any = null;
        try { data = JSON.parse(await res.text()); } catch {}

        if (data && data.success && typeof data.reply === 'string') {
          typing.textContent = data.reply;
          history.push({ role: 'user', text }, { role: 'model', text: data.reply });
        } else {
          typing.textContent =
            (data && data.message) || 'Sorry, something went wrong. Please try again.';
          typing.classList.add('err');
        }
      } catch (err) {
        typing.textContent =
          "Can't reach the assistant. Check your internet connection and try again.";
        typing.classList.add('err');
      } finally {
        busy = false;
        send.disabled = input.value.trim().length === 0;
        scrollDown();
      }
    };

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      ask(input.value);
    });

    input.addEventListener('input', () => {
      send.disabled = busy || input.value.trim().length === 0;
    });

    suggestions.addEventListener('click', (e: any) => {
      const btn = e.target.closest('.ai-suggestion');
      if (btn) ask(btn.textContent || '');
    });

    $('aiBack').addEventListener('click', () => {
      this.router.navigate(['/profile']);
    });
  }
}