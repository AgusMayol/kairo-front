import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'highlight',
  standalone: true
})
export class HighlightPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string, search: string): SafeHtml {
    if (!search || !value) {
      return value;
    }

    // Trim search to avoid matching empty strings
    const trimmedSearch = search.trim();
    if (!trimmedSearch) {
      return value;
    }

    // Escape special regex characters in the search term
    const searchEscaped = trimmedSearch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Create a case-insensitive regex to find all occurrences
    const regex = new RegExp(`(${searchEscaped})`, 'gi');
    
    // Replace matches with highlighted mark element
    const highlighted = value.replace(regex, '<mark class="bg-yellow-200 text-gray-900 rounded px-0.5">$1</mark>');
    
    // Use bypassSecurityTrustHtml since we've already sanitized the search term
    return this.sanitizer.bypassSecurityTrustHtml(highlighted);
  }
}

