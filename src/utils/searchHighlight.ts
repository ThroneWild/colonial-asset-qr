export const highlightText = (text: string, search: string): string => {
  if (!search.trim()) return text;
  
  const regex = new RegExp(`(${search})`, 'gi');
  return text.replace(regex, '<mark class="bg-primary/20 text-primary font-medium">$1</mark>');
};

export const getSearchSuggestions = (items: string[], search: string, limit: number = 5): string[] => {
  if (!search.trim()) return [];
  
  const filtered = items
    .filter(item => item.toLowerCase().includes(search.toLowerCase()))
    .slice(0, limit);
  
  return filtered;
};