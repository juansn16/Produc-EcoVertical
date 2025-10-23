import { useState, useEffect, useRef } from 'react'

const SearchBar = ({
  suggestions = [],
  onSearch = () => {},
  placeholder = "Buscar...",
  onSuggestionSelect = () => {}
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredSuggestions, setFilteredSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [activeSuggestion, setActiveSuggestion] = useState(-1)

  const inputRef = useRef(null)
  const searchBarRef = useRef(null)

  useEffect(() => {
    if (searchTerm.length > 0) {
      const filtered = suggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredSuggestions(filtered)
      setShowSuggestions(filtered.length > 0)
    } else {
      setFilteredSuggestions([])
      setShowSuggestions(false)
    }
    setActiveSuggestion(-1)
  }, [searchTerm])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target)) {
        setIsExpanded(false)
        setShowSuggestions(false)
        setActiveSuggestion(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearchClick = () => {
    setIsExpanded(true)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const handleInputChange = (e) => {
    const value = e.target.value
    setSearchTerm(value)
    onSearch(value)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveSuggestion(prev =>
        prev < filteredSuggestions.length - 1 ? prev + 1 : prev
      )
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveSuggestion(prev => (prev > 0 ? prev - 1 : -1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (activeSuggestion >= 0) {
        selectSuggestion(filteredSuggestions[activeSuggestion])
      } else if (searchTerm.trim()) {
        onSearch(searchTerm)
        setShowSuggestions(false)
      }
    } else if (e.key === 'Escape') {
      setIsExpanded(false)
      setShowSuggestions(false)
      setActiveSuggestion(-1)
    }
  }

  const selectSuggestion = (suggestion) => {
    setSearchTerm(suggestion)
    setShowSuggestions(false)
    setActiveSuggestion(-1)
    onSuggestionSelect(suggestion)
    onSearch(suggestion)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      onSearch(searchTerm)
      setShowSuggestions(false)
    }
  }

  return (
    <div className="relative inline-block w-full max-w-xs" ref={searchBarRef}>
      <div
        className={`flex items-center rounded-full shadow-md transition-all duration-200 bg-white overflow-hidden ${
          isExpanded ? 'w-72 border-2 border-green-600' : 'w-12'
        } h-12`}
      >
        <div
          className="w-12 h-full flex items-center justify-center text-green-600 cursor-pointer"
          onClick={handleSearchClick}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            className="text-green-600"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <form onSubmit={handleSubmit} className={`flex-1 ${isExpanded ? 'block' : 'hidden'}`}>
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full h-full bg-transparent text-sm text-black placeholder-gray-400 focus:outline-none px-2"
          />
        </form>
      </div>

      {showSuggestions && (
        <div className="absolute z-50 w-full bg-white rounded-md shadow-lg mt-2 max-h-60 overflow-y-auto border border-gray-200">
          {filteredSuggestions.map((suggestion, index) => (
            <div
              key={index}
              className={`px-4 py-2 text-sm cursor-pointer transition-colors duration-150 ${
                index === activeSuggestion
                  ? 'bg-green-100 text-green-700'
                  : 'hover:bg-gray-100'
              }`}
              onClick={() => selectSuggestion(suggestion)}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default SearchBar
