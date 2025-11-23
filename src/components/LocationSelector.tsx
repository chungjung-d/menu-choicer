import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { searchAddress, LocationResult } from '../services/geocoding';
import { MapPin, Search, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LocationSelector() {
    const { center, setCenter } = useAppStore();
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<LocationResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setIsSearching(true);
        const locations = await searchAddress(query);
        setResults(locations);
        setIsSearching(false);
    };

    const handleSelect = (location: LocationResult) => {
        setCenter(location);
        setIsOpen(false);
        setQuery('');
        setResults([]);
    };

    return (
        <div className="relative z-[2000]">
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-blue-600 transition-colors mt-0.5 group"
            >
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse group-hover:bg-blue-500" />
                <span className="truncate max-w-[200px]">{center.address.split(',')[0]}</span>
                <MapPin size={10} className="ml-0.5 opacity-50 group-hover:opacity-100" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[2001]"
                        />

                        {/* Modal */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -20 }}
                            className="absolute top-8 left-1/2 -translate-x-1/2 w-[320px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[2002]"
                        >
                            <div className="p-3 border-b border-gray-100 flex items-center gap-2">
                                <Search size={16} className="text-gray-400" />
                                <form onSubmit={handleSearch} className="flex-1">
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        placeholder="Search location (e.g. Gangnam)"
                                        className="w-full text-sm outline-none text-gray-700 placeholder:text-gray-400"
                                    />
                                </form>
                                {isSearching ? (
                                    <Loader2 size={16} className="animate-spin text-blue-500" />
                                ) : (
                                    <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                                        <X size={16} />
                                    </button>
                                )}
                            </div>

                            <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                                {results.length > 0 ? (
                                    <div className="py-1">
                                        {results.map((result, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => handleSelect(result)}
                                                className="w-full text-left px-4 py-2.5 hover:bg-blue-50 transition-colors flex items-start gap-3 group"
                                            >
                                                <MapPin size={16} className="mt-0.5 text-gray-400 group-hover:text-blue-500 shrink-0" />
                                                <div>
                                                    <div className="text-sm font-medium text-gray-700 group-hover:text-blue-700">
                                                        {result.address.split(',')[0]}
                                                    </div>
                                                    <div className="text-[10px] text-gray-400 line-clamp-1">
                                                        {result.address}
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                ) : query && !isSearching ? (
                                    <div className="p-8 text-center text-gray-400 text-xs">
                                        No results found
                                    </div>
                                ) : (
                                    <div className="p-2">
                                        <div className="text-[10px] font-semibold text-gray-400 px-2 py-1 uppercase tracking-wider">
                                            Current Location
                                        </div>
                                        <div className="px-2 py-1.5 text-xs text-gray-600 flex items-center gap-2">
                                            <MapPin size={12} className="text-green-500" />
                                            {center.address}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
