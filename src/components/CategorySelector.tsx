import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import { X, Check, Filter } from 'lucide-react';
import clsx from 'clsx';

interface CategorySelectorProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CategorySelector({ isOpen, onClose }: CategorySelectorProps) {
    const {
        allCategories,
        selectedCategories,
        toggleCategory,
        selectAllCategories,
        deselectAllCategories
    } = useAppStore();

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[2000]"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed inset-0 flex items-center justify-center z-[2001] pointer-events-none p-4"
                    >
                        <div className="bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/50 w-full max-w-sm max-h-[70vh] flex flex-col pointer-events-auto overflow-hidden">
                            {/* Header */}
                            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white/50">
                                <div className="flex items-center gap-2 text-slate-800">
                                    <Filter size={20} className="text-blue-500" />
                                    <h3 className="font-bold text-lg">Filter Categories</h3>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-5 overflow-y-auto custom-scrollbar">
                                <div className="flex gap-2 mb-4">
                                    <button
                                        onClick={selectAllCategories}
                                        className="flex-1 py-2 text-xs font-bold bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors"
                                    >
                                        Select All
                                    </button>
                                    <button
                                        onClick={deselectAllCategories}
                                        className="flex-1 py-2 text-xs font-bold bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
                                    >
                                        Deselect All
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    {allCategories.map((category) => {
                                        const isSelected = selectedCategories.includes(category);
                                        return (
                                            <button
                                                key={category}
                                                onClick={() => toggleCategory(category)}
                                                className={clsx(
                                                    "flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 border",
                                                    isSelected
                                                        ? "bg-blue-500 text-white border-blue-500 shadow-md shadow-blue-500/20"
                                                        : "bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:bg-blue-50/50"
                                                )}
                                            >
                                                <span className="truncate mr-2">{category}</span>
                                                {isSelected && <Check size={14} strokeWidth={3} />}
                                            </button>
                                        );
                                    })}
                                </div>

                                {allCategories.length === 0 && (
                                    <div className="text-center py-8 text-slate-400 text-sm">
                                        No categories found.
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="p-4 border-t border-slate-100 bg-white/50">
                                <button
                                    onClick={onClose}
                                    className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg"
                                >
                                    Done ({selectedCategories.length})
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
