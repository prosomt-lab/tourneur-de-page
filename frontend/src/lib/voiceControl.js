/**
 * Voice Control for Le Tourneur de Page
 * Uses Web Speech API (free, native browser)
 */

export function initVoiceControl(callbacks) {
  if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
    console.warn("Speech Recognition not supported");
    return null;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  recognition.continuous = true;
  recognition.interimResults = false;
  recognition.lang = "fr-CA";

  const commands = {
    "page suivante": () => callbacks.nextPage?.(),
    "suivante": () => callbacks.nextPage?.(),
    "next": () => callbacks.nextPage?.(),
    "page precedente": () => callbacks.prevPage?.(),
    "precedente": () => callbacks.prevPage?.(),
    "previous": () => callbacks.prevPage?.(),
    "debut": () => callbacks.goToPage?.(0),
    "premiere page": () => callbacks.goToPage?.(0),
    "derniere page": () => callbacks.lastPage?.(),
  };

  recognition.onresult = (event) => {
    const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
    console.log(`Voice: "${transcript}"`);

    // Check exact commands
    if (commands[transcript]) {
      commands[transcript]();
      return;
    }

    // Check "page X" pattern
    const pageMatch = transcript.match(/page (\d+)/);
    if (pageMatch) {
      callbacks.goToPage?.(parseInt(pageMatch[1]) - 1);
      return;
    }

    // Check "chapitre X" pattern
    const chapterMatch = transcript.match(/chapitre (\d+)/);
    if (chapterMatch) {
      callbacks.goToChapter?.(parseInt(chapterMatch[1]));
    }
  };

  recognition.onerror = (event) => {
    console.error("Voice error:", event.error);
  };

  return {
    start: () => recognition.start(),
    stop: () => recognition.stop(),
  };
}
