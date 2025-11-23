import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MapComponent from '../components/MapComponent';
import RouletteControl from '../components/RouletteControl';
import LocationSelector from '../components/LocationSelector';
import { useAppStore } from '../store/useAppStore';

export const Route = createFileRoute('/')({
    component: Index,
})

function Index() {
    const { loadRestaurants, selectedRestaurant } = useAppStore();

    useEffect(() => {
        loadRestaurants();
    }, [loadRestaurants]);

    return (
        <div className="relative w-full h-screen overflow-hidden bg-slate-50">
            {/* Map Background - Full Screen */}
            <div className="absolute inset-0 z-0">
                <MapComponent />
            </div>

            {/* Animated Overlay - Richer Gradient */}
            <div className="absolute inset-0 z-[5] pointer-events-none opacity-30 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 animate-gradient-xy mix-blend-overlay" />

            {/* Floating Particles */}
            <div className="absolute inset-0 z-[6] pointer-events-none overflow-hidden">
                {[...Array(5)].map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{
                            x: Math.random() * window.innerWidth,
                            y: Math.random() * window.innerHeight,
                            opacity: 0
                        }}
                        animate={{
                            y: [null, Math.random() * -100],
                            opacity: [0, 0.5, 0],
                            scale: [0.5, 1.5]
                        }}
                        transition={{
                            duration: 10 + Math.random() * 10,
                            repeat: Infinity,
                            ease: "linear",
                            delay: Math.random() * 5
                        }}
                        className="absolute w-32 h-32 bg-white/10 rounded-full blur-3xl"
                    />
                ))}
            </div>

            {/* Vignette Effect - Stronger for focus */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_20%,rgba(0,0,0,0.4)_100%)] z-[10]" />

            {/* Floating Header - Only show when no restaurant is selected */}
            <AnimatePresence>
                {!selectedRestaurant && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute top-6 left-0 right-0 z-[1000] flex justify-center pointer-events-none"
                    >
                        {/* Gradient Border Wrapper */}
                        <div className="p-[2px] rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shadow-2xl pointer-events-auto transform hover:scale-105 transition-transform duration-300">
                            <div className="bg-white/90 backdrop-blur-2xl rounded-full px-12 py-4 flex flex-col items-center min-w-[320px]">
                                <h1 className="text-3xl font-black bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent tracking-tighter mb-1">
                                    Lunch Roulette
                                </h1>
                                <LocationSelector />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Controls Overlay */}
            <RouletteControl />
        </div>
    )
}
