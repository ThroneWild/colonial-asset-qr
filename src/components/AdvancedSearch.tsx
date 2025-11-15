import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, X, History } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdvancedSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  suggestions?: string[];
}

const SEARCH_HISTORY_KEY = 'prize-search-history';
const MAX_HISTORY = 5;

export const AdvancedSearch = ({ 
  value, 
  onChange, 
  placeholder = "Buscar ativos...",
  suggestions = []
}: AdvancedSearchProps) => {
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const history = localStorage.getItem(SEARCH_HISTORY_KEY);
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
  }, []);

  const addToHistory = (term: string) => {
    if (!term.trim()) return;
    
    const newHistory = [term, ...searchHistory.filter(h => h !== term)].slice(0, MAX_HISTORY);
    setSearchHistory(newHistory);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
  };

  const handleSearch = (term: string) => {
    onChange(term);
    if (term.trim()) {
      addToHistory(term);
    }
    setShowSuggestions(false);
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem(SEARCH_HISTORY_KEY);
  };

  const filteredSuggestions = suggestions.filter(s => 
    s.toLowerCase().includes(value.toLowerCase()) && s !== value
  ).slice(0, 5);

  const showHistoryPanel = showSuggestions && value.length === 0 && searchHistory.length > 0;
  const showSuggestionsPanel = showSuggestions && value.length > 0 && filteredSuggestions.length > 0;

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder={placeholder}
          className="pl-10 pr-10"
        />
        {value && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSearch('')}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Search History */}
      {showHistoryPanel && (
        <div className="mt-2 w-full glass-light border border-border rounded-lg p-3 shadow-lg animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <History className="h-4 w-4" />
              <span>Buscas recentes</span>
            </div>
            <Button variant="ghost" size="sm" onClick={clearHistory} className="h-6 text-xs">
              Limpar
            </Button>
          </div>
          <div className="space-y-1">
            {searchHistory.map((term, index) => (
              <button
                key={index}
                onClick={() => handleSearch(term)}
                className="w-full text-left px-3 py-2 text-sm rounded hover:bg-muted transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Suggestions */}
      {showSuggestionsPanel && (
        <div className="mt-2 w-full glass-light border border-border rounded-lg p-3 shadow-lg animate-fade-in">
          <div className="text-sm text-muted-foreground mb-2">Sugestões</div>
          <div className="space-y-1">
            {filteredSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSearch(suggestion)}
                className="w-full text-left px-3 py-2 text-sm rounded hover:bg-muted transition-colors"
              >
                <span dangerouslySetInnerHTML={{ 
                  __html: suggestion.replace(
                    new RegExp(`(${value})`, 'gi'),
                    '<mark class="bg-primary/20 text-primary font-medium">$1</mark>'
                  )
                }} />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};