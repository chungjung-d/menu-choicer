import { useState, useEffect, useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Restaurant } from '../data/restaurants';
import { motion, AnimatePresence } from 'framer-motion';
import { Utensils, MapPin, Timer, Filter } from 'lucide-react';
import clsx from 'clsx';
import canvasConfetti from 'canvas-confetti';
import CategorySelector from './CategorySelector';

export default function RouletteControl() {
    const {
        restaurants,
        startRoulette,
        stopRoulette,
        isSpinning,
        selectedRestaurant,
        reset,
        maxWalkingTime,
        setMaxWalkingTime,
        isLoading,
        selectedCategories
    } = useAppStore();
    const [displayRestaurant, setDisplayRestaurant] = useState<Restaurant | null>(null);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Filter restaurants based on selected categories
    // Memoize this to prevent the useEffect from re-running on every render (which happens every 50ms during spin)
    const filteredRestaurants = useMemo(() => {
        return restaurants.filter(r => selectedCategories.includes(r.category));
    }, [restaurants, selectedCategories]);

    useEffect(() => {
        let timeoutId: any;
        let intervalId: any;

        if (isSpinning && filteredRestaurants.length > 0) {
            // Shuffle animation
            intervalId = setInterval(() => {
                const randomIndex = Math.floor(Math.random() * filteredRestaurants.length);
                setDisplayRestaurant(filteredRestaurants[randomIndex]);
            }, 50); // Fast shuffle

            // Stop after random time between 2-3 seconds
            const stopTime = 2000 + Math.random() * 1000;

            timeoutId = setTimeout(() => {
                clearInterval(intervalId);

                // Weighted Random Selection
                // User Request: Lower deviation. Formula: log(rating + 20)
                // This makes the probability difference between 3.0 and 5.0 very small.
                const totalWeight = filteredRestaurants.reduce((sum, r) => sum + Math.log((r.rating || 0) + 20), 0);
                let randomValue = Math.random() * totalWeight;
                let winner = filteredRestaurants[filteredRestaurants.length - 1];

                for (const restaurant of filteredRestaurants) {
                    randomValue -= Math.log((restaurant.rating || 0) + 20);
                    if (randomValue <= 0) {
                        winner = restaurant;
                        break;
                    }
                }

                stopRoulette(winner);

                // Trigger confetti
                canvasConfetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 }
                });
            }, stopTime);
        }

        return () => {
            if (timeoutId) clearTimeout(timeoutId);
            if (intervalId) clearInterval(intervalId);
        };
    }, [isSpinning, filteredRestaurants, stopRoulette]);

    const handleStart = () => {
        if (selectedRestaurant) {
            reset();
        } else {
            startRoulette();
        }
    };

    return (
        <>
            <CategorySelector isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} />

            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-[1000] w-full max-w-sm px-4">
                {/* Distance & Filter Selector - Only show when not spinning/selected */}
                <AnimatePresence>
                    {!isSpinning && !selectedRestaurant && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="mb-4 flex gap-2"
                        >
                            {/* Distance Selector */}
                            <div className="flex-1 bg-white/60 backdrop-blur-xl border border-white/40 p-1.5 rounded-2xl shadow-lg flex justify-between items-center">
                                <span className="text-xs font-bold text-slate-600 ml-3 flex items-center gap-1.5 uppercase tracking-wider">
                                    <Timer size={14} className="text-blue-500" /> Max Walk
                                </span>
                                <div className="flex bg-slate-100/50 rounded-xl p-1">
                                    {[5, 10, 15].map((time) => (
                                        <button
                                            key={time}
                                            onClick={() => setMaxWalkingTime(time)}
                                            className={clsx(
                                                "px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-300",
                                                maxWalkingTime === time
                                                    ? "bg-white text-blue-600 shadow-sm scale-105"
                                                    : "text-slate-400 hover:text-slate-600"
                                            )}
                                        >
                                            {time}m
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Filter Button */}
                            <button
                                onClick={() => setIsFilterOpen(true)}
                                className={clsx(
                                    "bg-white/60 backdrop-blur-xl border border-white/40 p-3 rounded-2xl shadow-lg flex items-center justify-center transition-all hover:bg-white/80 active:scale-95",
                                    selectedCategories.length < (useAppStore.getState().allCategories.length || 999)
                                        ? "text-blue-600 ring-2 ring-blue-500/20"
                                        : "text-slate-600"
                                )}
                            >
                                <Filter size={20} className={selectedCategories.length < (useAppStore.getState().allCategories.length || 999) ? "fill-blue-100" : ""} />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence mode="wait">
                    {selectedRestaurant ? (
                        <motion.div
                            initial={{ y: 100, opacity: 0, scale: 0.9 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            exit={{ y: 100, opacity: 0, scale: 0.9 }}
                            transition={{ type: "spring", bounce: 0.4, duration: 0.6 }}
                            className="bg-white/80 backdrop-blur-2xl rounded-3xl shadow-2xl p-6 w-full border border-white/50 relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

                            <div className="text-center pt-2">
                                <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                                    className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-600 text-white rounded-2xl mb-5 shadow-lg shadow-green-500/30 transform -rotate-3"
                                >
                                    <MapPin size={40} strokeWidth={2.5} />
                                </motion.div>

                                <h2 className="text-3xl font-black text-slate-800 mb-2 leading-tight tracking-tight">
                                    {selectedRestaurant.name}
                                </h2>

                                {/* Prominent Rating Badge */}
                                <div className="flex justify-center mb-6">
                                    <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-100 px-4 py-1.5 rounded-full shadow-sm">
                                        <span className="text-amber-500 text-lg">⭐</span>
                                        <span className="text-amber-700 font-black text-xl tracking-tight">{selectedRestaurant.rating}</span>
                                        <span className="text-amber-300 text-sm font-medium ml-1">/ 5.0</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-center gap-3 mb-8">
                                    <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold uppercase tracking-wide border border-blue-100">
                                        {selectedRestaurant.category}
                                    </span>
                                    <span className="text-slate-300">•</span>
                                    <span className="text-slate-500 font-medium text-sm">
                                        {selectedRestaurant.time} min walk
                                    </span>
                                </div>

                                <button
                                    onClick={reset}
                                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl hover:shadow-2xl active:scale-95 flex items-center justify-center gap-2 group"
                                >
                                    <span>Spin Again</span>
                                    <Utensils size={18} className="group-hover:rotate-180 transition-transform duration-500" />
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 50, opacity: 0 }}
                            className="w-full"
                        >
                            <button
                                onClick={handleStart}
                                disabled={isSpinning || isLoading || filteredRestaurants.length === 0}
                                className={clsx(
                                    "w-full py-5 rounded-3xl shadow-2xl text-white font-bold text-xl flex items-center justify-center gap-3 transition-all transform active:scale-95 overflow-hidden relative group",
                                    isSpinning
                                        ? "bg-slate-900 scale-[1.02] shadow-slate-900/40 cursor-default"
                                        : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-blue-600/40 hover:-translate-y-1",
                                    (isLoading || filteredRestaurants.length === 0) && "opacity-50 cursor-not-allowed grayscale"
                                )}
                            >
                                {/* Button Shine Effect */}
                                {!isSpinning && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
                                )}

                                {isLoading ? (
                                    <span className="animate-pulse">Loading places...</span>
                                ) : isSpinning ? (
                                    <div className="flex flex-col items-center justify-center w-full relative z-10 h-8">
                                        {/* Digital Shuffle Animation */}
                                        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                                            <AnimatePresence mode="popLayout">
                                                <motion.span
                                                    key={displayRestaurant?.id || 'loading'}
                                                    initial={{ y: 20, opacity: 0, filter: 'blur(4px)' }}
                                                    animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                                                    exit={{ y: -20, opacity: 0, filter: 'blur(4px)' }}
                                                    transition={{ duration: 0.1 }}
                                                    className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 absolute w-full text-center truncate px-4"
                                                >
                                                    {displayRestaurant?.name || 'Finding...'}
                                                </motion.span>
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <Utensils className="group-hover:rotate-12 transition-transform" />
                                        <span>Find Lunch Spot</span>
                                        <span className="bg-white/20 px-2 py-0.5 rounded-md text-sm">
                                            {filteredRestaurants.length}
                                        </span>
                                    </>
                                )}
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </>
    );
}
