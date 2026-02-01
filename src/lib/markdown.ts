export function parseMarkdown(text: string): string {
    if (!text) return '';

    // Escape HTML to prevent XSS
    let html = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

    // Handle markdown bold (**text** or __text__)
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>');
    html = html.replace(/__(.*?)__/g, '<strong class="text-white">$1</strong>');

    // Handle markdown bold (*text* or _text_)
    html = html.replace(/\*(.*?)\*/g, '<em class="text-purple-300">$1</em>');
    html = html.replace(/_(.*?)_/g, '<em class="text-purple-300">$1</em>');

    // Handle markdown links [text](url)
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-purple-400 hover:text-purple-300 underline">$1</a>');

    // Handle numbered lists (1. text)
    html = html.replace(/^(\d+)\.\s+/gm, '<span class="flex items-start gap-2"><span class="text-purple-500 font-bold">$1.</span><span>');

    // Handle bullet lists (- text or • text)
    html = html.replace(/^[-•]\s+/gm, '<div class="flex items-start gap-2"><span class="text-purple-500">•</span><span>');

    // Close list item spans
    html = html.replace(/\n/gm, '</span></div>\n');

    // Clean up double closing tags
    html = html.replace(/<\/span><\/div>\n<span class="flex items-start gap-2"><span class="text-purple-500">(•|-)<\/span><span>/g, '\n<span class="flex items-start gap-2"><span class="text-purple-500">$1</span><span>');

    // Wrap content in container
    html = `<div class="space-y-2">${html}</div>`;

    return html;
}
